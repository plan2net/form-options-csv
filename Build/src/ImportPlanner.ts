import type { Choice, Choices, ImportPlan, ImportRow, ImportSettings, OptionValue, PreviewRow, SkipReason } from './types'

type OptionsPlan = Omit<ImportPlan, 'defaultValue'>

export function planImport(rows: ImportRow[], existing: Choices, { replace, singleValue }: ImportSettings): ImportPlan {
  const plan = planOptions(rows, existing, replace)
  const optionValues = valueSet(plan.options)
  // A default without its option is broken, so it is dropped.
  const keptDefaults = currentDefaults(existing.defaultValue).filter(value => optionValues.has(String(value)))
  const markedRows = plan.preview.filter(row => !row.skipReason && row.isDefault)
  if (singleValue) {
    const [firstMarked, ...laterMarked] = markedRows
    const laterMarkedRows = new Set(laterMarked)
    return {
      ...plan,
      preview: plan.preview.map(row => laterMarkedRows.has(row) ? { ...row, note: 'onlyOneDefault' } : row),
      defaultValue: firstMarked?.value ?? keptDefaults[0] ?? '',
    }
  }
  const markedValues = markedRows.map(row => row.value)
  return {
    ...plan,
    defaultValue: replace && markedValues.length > 0 ? markedValues : [...keptDefaults, ...markedValues],
  }
}

function planOptions(rows: ImportRow[], existing: Choices, replace: boolean): OptionsPlan {
  const keptOptions = replace ? [] : existing.options
  const existingValues = valueSet(keptOptions)
  const pastedValues = new Set<string>()
  const skipReasonFor = (row: ImportRow): SkipReason | null => {
    if (row.skipReason) {
      return row.skipReason
    }
    if (existingValues.has(String(row.value))) {
      return 'valueExists'
    }
    if (pastedValues.has(String(row.value))) {
      return 'valueRepeated'
    }
    return null
  }
  const preview = rows.map((row): PreviewRow => {
    const skipReason = skipReasonFor(row)
    if (skipReason) {
      return { ...row, skipReason }
    }
    pastedValues.add(String(row.value))
    return row
  })
  const imported = preview.filter(row => !row.skipReason).map(({ label, value }) => ({ label, value }))
  return {
    options: [...keptOptions, ...imported],
    preview,
    importedCount: imported.length,
  }
}

function currentDefaults(defaultValue: unknown): OptionValue[] {
  return [defaultValue ?? []].flat().filter((value): value is OptionValue => typeof value === 'string' || typeof value === 'number')
}

function valueSet(options: Choice[]): Set<string> {
  return new Set(options.map(option => String(option.value)))
}
