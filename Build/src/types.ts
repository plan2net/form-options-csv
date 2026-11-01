export type OptionValue = string | number

export interface Choice {
  label: string
  value: OptionValue
}

export interface Choices {
  options: Choice[]
  defaultValue: unknown
}

export type SkipReason = 'header' | 'noLabel' | 'valueExists' | 'valueRepeated'

export interface ImportRow extends Choice {
  isDefault: boolean
  skipReason?: SkipReason
}

export type Note = 'onlyOneDefault'

export interface PreviewRow extends ImportRow {
  note?: Note
}

export type DefaultValue = OptionValue | OptionValue[]

export interface ImportPlan {
  options: Choice[]
  defaultValue: DefaultValue
  preview: PreviewRow[]
  importedCount: number
}

export interface ImportSettings {
  replace: boolean
  singleValue: boolean
}

export type FileProblem = 'spreadsheetFile' | 'unsupportedFile' | 'tooLarge'

export interface ImportLabels {
  dropArea: string
  columnLabel: string
  columnValue: string
  columnDefault: string
  columnNote: string
  cancel: string
  addOne: string
  addMany: string
  replaceOne: string
  replaceMany: string
  hasHeader: string
  replace: string
  header: string
  noLabel: string
  valueExists: string
  valueRepeated: string
  onlyOneDefault: string
  unclosedQuote: string
  tooManyRows: string
  tooLarge: string
  spreadsheetFile: string
  unsupportedFile: string
}
