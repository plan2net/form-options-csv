import type { Choice, Choices, DefaultValue, OptionValue } from './types'
import type { EditorHtml, FormElement } from './FormEditor'

interface StoredOption {
  _label: string
  _value: OptionValue
}

// TYPO3 12 and 13 pass jQuery objects, TYPO3 14 passes plain elements.
export function toElement(editorHtml: EditorHtml): HTMLElement {
  return 'jquery' in editorHtml ? editorHtml.get(0) : editorHtml
}

export function readChoices(formElement: FormElement): Choices {
  return {
    options: storedOptions(formElement).map(option => ({ label: option._label, value: option._value })),
    defaultValue: formElement.get('defaultValue'),
  }
}

// Loaded rows carry signed original values, so they are kept as they are.
export function writeChoices(formElement: FormElement, { options, defaultValue }: { options: Choice[], defaultValue: DefaultValue }): void {
  const unusedStoredOptions = [...storedOptions(formElement)]
  formElement.set('properties.options', options.map(option => {
    const index = unusedStoredOptions.findIndex(stored => stored._value === option.value && stored._label === option.label)
    if (index === -1) {
      return { _label: option.label, _value: option.value }
    }
    return unusedStoredOptions.splice(index, 1)[0]
  }))
  formElement.set('defaultValue', defaultValue)
}

function storedOptions(formElement: FormElement): StoredOption[] {
  const options = formElement.get('properties.options')
  return Array.isArray(options) ? options : []
}
