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
