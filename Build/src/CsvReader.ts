import Papa from 'papaparse'
import type { ImportRow, OptionValue } from './types'

export const maxRows = 5000
export const maxTextLength = 5_000_000

export type Source = 'paste' | 'file'

export interface ParseOptions {
  source: Source
  hasHeader: boolean
}

export type ParseError =
  | { reason: 'unclosedQuote', line: number }
  | { reason: 'tooManyRows', limit: number }
  | { reason: 'tooLarge' }

export interface ParseResult {
  rows: ImportRow[]
  error: ParseError | null
}

type Fields = string[]

export function parseRows(text: string, { source, hasHeader }: ParseOptions): ParseResult {
  if (text.length > maxTextLength) {
    return { rows: [], error: { reason: 'tooLarge' } }
  }
  // Line breaks inside cells become a space anyway, so one line break style is enough.
  const normalizedText = text.replace(/\r\n?/g, '\n')
  const separator = source === 'file' ? detectFileSeparator(normalizedText) : detectPasteSeparator(normalizedText)
  const records: Fields[] = []
  let error: ParseError | null = null
  readRecords(normalizedText, separator, (fields, quoteErrorIndex) => {
    if (quoteErrorIndex !== null) {
      error = { reason: 'unclosedQuote', line: lineAt(normalizedText, quoteErrorIndex) }
      return false
    }
    if (isFilled(fields)) {
      records.push(fields)
    }
    if (records.length > maxRows) {
      error = { reason: 'tooManyRows', limit: maxRows }
      return false
    }
    return true
  })
  if (error) {
    return { rows: [], error }
  }
  return {
    rows: records.map((fields, index) => hasHeader && index === 0 ? { ...toRow(fields), skipReason: 'header' } : toRow(fields)),
    error: null,
  }
}

// Calls onRecord for each record until it returns false. Text after a closing quote counts as a quote error,
// because the parser would otherwise merge the following rows into this one.
function readRecords(text: string, separator: string, onRecord: (fields: Fields, quoteErrorIndex: number | null) => boolean): void {
  Papa.parse<Fields>(text, {
    delimiter: separator,
    newline: '\n',
    step: (result, parser) => {
      const quoteError = result.errors.find(error => error.code === 'MissingQuotes' || error.code === 'InvalidQuotes')
      if (!onRecord(result.data, quoteError ? quoteError.index ?? 0 : null)) {
        parser.abort()
      }
    },
  })
}

function detectPasteSeparator(text: string): string {
  let hasTabs = false
  readRecords(text, '\t', fields => {
    hasTabs = fields.length > 1
    return !hasTabs
  })
  return hasTabs ? '\t' : ';'
}

function detectFileSeparator(text: string): string {
  const separatorCount = (candidate: string): number => {
    let count = 0
    readRecords(text, candidate, fields => {
      if (!isFilled(fields)) {
        return true
      }
      count = fields.length - 1
      return false
    })
    return count
  }
  const counts = new Map(['\t', ';', ','].map(candidate => [candidate, separatorCount(candidate)]))
  return [...counts.keys()].reduce((best, candidate) => (counts.get(candidate) ?? 0) > (counts.get(best) ?? 0) ? candidate : best)
}

function isFilled(fields: Fields): boolean {
  return fields.join('').replace(/[\s;,]/g, '') !== ''
}

function toRow(fields: Fields): ImportRow {
  const [label, value = '', isDefault = ''] = fields.slice(0, 3).map(joinLines)
  const row: ImportRow = {
    label,
    value: toValue(value === '' ? label : value),
    isDefault: isDefault.trim() !== '' && isDefault.trim() !== '0',
  }
  return label.trim() === '' ? { ...row, skipReason: 'noLabel' } : row
}

// Joins the lines of a cell with one space. Split and trim instead of one regex, which is quadratic on long runs of spaces.
function joinLines(field: string): string {
  if (!field.includes('\n')) {
    return field
  }
  const lines = field.split('\n')
  const lastIndex = lines.length - 1
  return lines
    .map((line, index) => index === 0 ? line : line.trimStart())
    .map((line, index) => index === lastIndex ? line : line.trimEnd())
    .filter((line, index) => index === 0 || index === lastIndex || line !== '')
    .join(' ')
}

function toValue(value: string): OptionValue {
  return /^(0|-?[1-9][0-9]*)$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : value
}

function lineAt(text: string, index: number): number {
  return 1 + (text.slice(0, index).match(/\n/g) ?? []).length
}
