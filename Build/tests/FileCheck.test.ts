import { describe, expect, it } from 'vitest'
import { fileProblem, maxFileSize } from '@/FileCheck'

const file = (name: string, type = '') => new File([''], name, { type })

describe('fileProblem', () => {
  it('accepts CSV, TSV and text files, even when Windows reports them as Excel files', () => {
    expect(fileProblem(file('cities.csv', 'application/vnd.ms-excel'))).toBeNull()
    expect(fileProblem(file('cities.TSV'))).toBeNull()
    expect(fileProblem(file('cities.txt', 'text/plain'))).toBeNull()
  })

  it('asks for CSV instead of a spreadsheet workbook', () => {
    for (const name of ['cities.xlsx', 'cities.xls', 'cities.ods', 'cities.numbers']) {
      expect(fileProblem(file(name))).toBe('spreadsheetFile')
    }
  })

  it('accepts a file without extension only when it looks like text', () => {
    expect(fileProblem(file('cities'))).toBeNull()
    expect(fileProblem(file('cities', 'text/csv'))).toBeNull()
    expect(fileProblem(file('cities', 'image/png'))).toBe('unsupportedFile')
  })

  it('refuses a file that is too large before reading it', () => {
    const large = file('cities.csv')
    Object.defineProperty(large, 'size', { value: maxFileSize + 1 })
    expect(fileProblem(large)).toBe('tooLarge')
  })

  it('refuses any other file', () => {
    expect(fileProblem(file('logo.png', 'image/png'))).toBe('unsupportedFile')
    expect(fileProblem(file('report.pdf'))).toBe('unsupportedFile')
  })
})
