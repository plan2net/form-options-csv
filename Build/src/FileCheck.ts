import type { FileProblem } from './types'

export const maxFileSize = 5 * 1024 * 1024

const textExtensions = ['csv', 'tsv', 'txt']
const spreadsheetExtensions = ['xlsx', 'xls', 'ods', 'numbers']

export function fileProblem(file: File): FileProblem | null {
  const typeProblem = fileTypeProblem(file)
  if (typeProblem) {
    return typeProblem
  }
  return file.size > maxFileSize ? 'tooLarge' : null
}

// Windows marks CSV files as Excel files, so the extension counts first.
function fileTypeProblem(file: File): FileProblem | null {
  const extension = file.name.includes('.') ? (file.name.split('.').pop() ?? '').toLowerCase() : ''
  if (textExtensions.includes(extension)) {
    return null
  }
  if (spreadsheetExtensions.includes(extension)) {
    return 'spreadsheetFile'
  }
  if (extension === '' && (file.type === '' || file.type.startsWith('text/'))) {
    return null
  }
  return 'unsupportedFile'
}
