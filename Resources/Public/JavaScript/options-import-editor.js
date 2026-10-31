export function bootstrap(formEditorApp) {
  formEditorApp.getPublisherSubscriber().subscribe('view/inspector/editor/insert/perform', (topic, [editorConfiguration, editorHtml]) => {
    if (editorConfiguration.propertyPath !== 'properties.options_import') {
      return;
    }
    const textarea = editorHtml.querySelector('textarea');
    if (!textarea) {
      return;
    }
    textarea.rows = 12;
    // TYPO3 14 writes a missing property value into the textarea as the text "undefined".
    if (formEditorApp.getCurrentlySelectedFormElement().get('properties.options_import') === undefined) {
      textarea.value = '';
    }
  });
}
