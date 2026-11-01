import { describe, expect, it } from 'vitest'
import { maxRows, maxTextLength, parseRows } from '@/CsvReader'

const paste = (text: string, hasHeader = false) => parseRows(text, { source: 'paste', hasHeader })
const file = (text: string) => parseRows(text, { source: 'file', hasHeader: false })

describe('parseRows', () => {
  it('turns a pasted label;value;default line into one row', () => {
    expect(paste('Label 1;1;1')).toEqual({
      rows: [{ label: 'Label 1', value: 1, isDefault: true }],
      error: null,
    })
  })

  it('makes each line a row and falls back to the label for a missing value', () => {
    expect(paste('Label 2;2\nLabel 3\nLabel 4;;1').rows).toEqual([
      { label: 'Label 2', value: 2, isDefault: false },
      { label: 'Label 3', value: 'Label 3', isDefault: false },
      { label: 'Label 4', value: 'Label 4', isDefault: true },
    ])
  })

  it('keeps the separator and doubled quotes inside a quoted field', () => {
    expect(paste('"Label with ; and ""quotes""";5;1').rows).toEqual([
      { label: 'Label with ; and "quotes"', value: 5, isDefault: true },
    ])
  })

  it('splits rows on windows and old mac line breaks and skips blank lines', () => {
    expect(paste('A;a\r\n\r\n  \rB;b;1\r\n').rows).toEqual([
      { label: 'A', value: 'a', isDefault: false },
      { label: 'B', value: 'b', isDefault: true },
    ])
  })

  it('splits pasted spreadsheet cells on tabs for the whole paste', () => {
    expect(paste('Vienna; Austria\tvie\t1\nGraz;Styria').rows).toEqual([
      { label: 'Vienna; Austria', value: 'vie', isDefault: true },
      { label: 'Graz;Styria', value: 'Graz;Styria', isDefault: false },
    ])
  })

  it('turns a line break inside a quoted cell into one space', () => {
    expect(paste('"First line \r\n  second line"\tv\nNext\tn').rows).toEqual([
      { label: 'First line second line', value: 'v', isDefault: false },
      { label: 'Next', value: 'n', isDefault: false },
    ])
  })

  it('turns a lone carriage return inside a quoted value into one space', () => {
    expect(paste('A;"x\ry"').rows).toEqual([{ label: 'A', value: 'x y', isDefault: false }])
  })

  it('blocks the import on an unclosed quote and reports the line it started on', () => {
    expect(paste('A;a\nB;b\n"Broken;c\nD;d')).toEqual({
      rows: [],
      error: { reason: 'unclosedQuote', line: 3 },
    })
  })

  it('counts windows line breaks and quoted line breaks once for the unclosed quote line', () => {
    expect(paste('A;a\r\nB;b\r\n"x').error).toEqual({ reason: 'unclosedQuote', line: 3 })
    expect(file('"a\r\nb";1\n"x').error).toEqual({ reason: 'unclosedQuote', line: 3 })
    expect(paste('"').error).toEqual({ reason: 'unclosedQuote', line: 1 })
  })

  it('blocks the import on text after a closing quote instead of merging rows', () => {
    expect(paste('"abc"def;1\n"Next";2')).toEqual({
      rows: [],
      error: { reason: 'unclosedQuote', line: 1 },
    })
  })

  it('stops at the row limit even when the text has many empty lines', () => {
    expect(paste(`${'\n'.repeat(1_000_000)}A;a`).rows).toEqual([{ label: 'A', value: 'a', isDefault: false }])
  })

  it('marks a row without a label as skipped', () => {
    expect(paste('  ;a;1').rows).toEqual([
      { label: '  ', value: 'a', isDefault: true, skipReason: 'noLabel' },
    ])
  })

  it('uses the separator that appears most often outside quotes in the first line of a file', () => {
    expect(file('\n"Vienna, Austria",vie,1\nGraz;Styria,grz').rows).toEqual([
      { label: 'Vienna, Austria', value: 'vie', isDefault: true },
      { label: 'Graz;Styria', value: 'grz', isDefault: false },
    ])
  })

  it('prefers tab, then semicolon, when separators appear equally often in a file', () => {
    expect(file('a;b\tc').rows[0].label).toBe('a;b')
    expect(file('a;b,c').rows[0].label).toBe('a')
  })

  it('splits a tab separated file on tabs', () => {
    expect(file('Vienna, Austria\tvie').rows).toEqual([
      { label: 'Vienna, Austria', value: 'vie', isDefault: false },
    ])
  })

  it('never splits pasted text on commas', () => {
    expect(paste('Vienna, Austria').rows[0].label).toBe('Vienna, Austria')
  })

  it('does not treat a paste as tab separated when the tab is inside quotes', () => {
    expect(paste('"a\tb";1').rows).toEqual([{ label: 'a\tb', value: 1, isDefault: false }])
  })

  it('returns no rows and no error for empty input', () => {
    expect(paste('')).toEqual({ rows: [], error: null })
  })

  it('marks the first non-empty row as skipped header', () => {
    expect(paste('\nLabel\tValue\nVienna\tvie', true).rows).toEqual([
      { label: 'Label', value: 'Value', isDefault: false, skipReason: 'header' },
      { label: 'Vienna', value: 'vie', isDefault: false },
    ])
  })

  it('marks the header row as header even when its first cell is empty', () => {
    expect(paste(';Value\nA;a', true).rows).toEqual([
      { label: '', value: 'Value', isDefault: false, skipReason: 'header' },
      { label: 'A', value: 'a', isDefault: false },
    ])
  })

  it('ignores columns after the third', () => {
    expect(paste('Label;value;1;extra;more').rows).toEqual([
      { label: 'Label', value: 'value', isDefault: true },
    ])
  })

  it('keeps whitespace around columns', () => {
    expect(paste('  Label ; 1 ').rows).toEqual([
      { label: '  Label ', value: ' 1 ', isDefault: false },
    ])
  })

  it('turns only plain safe integers into numbers', () => {
    const values = paste('a;5\nb;-12\nc;0\nd;007\ne;+5\nf;5.0\ng;-0\nh;9007199254740993').rows.map(row => row.value)
    expect(values).toEqual([5, -12, 0, '007', '+5', '5.0', '-0', '9007199254740993'])
  })

  it('applies the integer rule to a value taken from the label', () => {
    expect(paste('5').rows).toEqual([{ label: '5', value: 5, isDefault: false }])
  })

  it('does not let a quote in the middle of a pasted cell hide the tabs after it', () => {
    expect(paste('Size 5" pipe\t5\nB\t1').rows).toEqual([
      { label: 'Size 5" pipe', value: 5, isDefault: false },
      { label: 'B', value: 1, isDefault: false },
    ])
  })

  it('does not let a quote in the middle of a file cell hide the separators after it', () => {
    expect(file('12" ruler;1\nB;2').rows).toEqual([
      { label: '12" ruler', value: 1, isDefault: false },
      { label: 'B', value: 2, isDefault: false },
    ])
  })

  it('skips rows of empty cells before detecting the separator of a file', () => {
    expect(file(';;\nA,1\nB,2').rows.map(row => row.label)).toEqual(['A', 'B'])
  })

  it('stays fast for a cell with a very long run of spaces', () => {
    const started = performance.now()
    const rows = paste(`"${' '.repeat(200_000)}x";1`).rows
    expect(performance.now() - started).toBeLessThan(1000)
    expect(rows[0].label.trim()).toBe('x')
  })

  it('refuses more rows than can be imported at once', () => {
    const lines = (count: number) => Array.from({ length: count }, (_, index) => `Row ${index}`).join('\n')
    expect(paste(lines(maxRows)).error).toBeNull()
    expect(paste(lines(maxRows + 1))).toEqual({ rows: [], error: { reason: 'tooManyRows', limit: maxRows } })
  })

  it('refuses text that is too large', () => {
    expect(paste('x'.repeat(maxTextLength + 1))).toEqual({ rows: [], error: { reason: 'tooLarge' } })
  })

  it('ignores spaces around the default column', () => {
    expect(paste('A;a;0 \nB;b; \nC;c;x').rows.map(row => row.isDefault)).toEqual([false, false, true])
  })
})
