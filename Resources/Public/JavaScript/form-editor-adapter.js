// TYPO3 12 and 13 hand inspector editors over as jQuery objects, TYPO3 14 as DOM elements.
export function toElement(editorHtml) {
  return editorHtml.jquery ? editorHtml.get(0) : editorHtml;
}
