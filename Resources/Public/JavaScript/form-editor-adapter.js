// TYPO3 12 and 13 hand inspector editors over as jQuery objects, TYPO3 14 as DOM elements.
export function toElement(editorHtml) {
  return editorHtml.jquery ? editorHtml.get(0) : editorHtml;
}

export function readChoices(formElement) {
  return {
    options: (formElement.get('properties.options') ?? []).map(option => ({ label: option._label, value: option._value })),
    defaultValue: formElement.get('defaultValue'),
  };
}

// Rows loaded from the form carry signed original values, so they are written back untouched.
export function writeChoices(formElement, { options, defaultValue }) {
  const unusedStoredOptions = [...(formElement.get('properties.options') ?? [])];
  formElement.set('properties.options', options.map(option => {
    const index = unusedStoredOptions.findIndex(stored => stored._value === option.value && stored._label === option.label);
    if (index === -1) {
      return { _label: option.label, _value: option.value };
    }
    return unusedStoredOptions.splice(index, 1)[0];
  }));
  formElement.set('defaultValue', defaultValue);
}
