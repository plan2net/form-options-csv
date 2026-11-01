const settingsKey = 'form-options-csv:settings'

export function loadHasHeader(): boolean {
  try {
    const settings: unknown = JSON.parse(localStorage.getItem(settingsKey) ?? '{}')
    return typeof settings === 'object' && settings !== null && 'hasHeader' in settings && settings.hasHeader === true
  } catch {
    return false
  }
}

export function saveHasHeader(hasHeader: boolean): void {
  try {
    localStorage.setItem(settingsKey, JSON.stringify({ hasHeader }))
  } catch {
    // Storage is blocked, so the switch is just not remembered.
  }
}
