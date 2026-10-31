import { toElement } from './form-editor-adapter.js';

export function bootstrap(formEditorApp) {
  formEditorApp.getPublisherSubscriber().subscribe('view/inspector/editor/insert/perform', (topic, [editorConfiguration, editorHtml]) => {
    if (editorConfiguration.templateName !== 'Inspector-OptionsImportEditor') {
      return;
    }
    toElement(editorHtml).querySelector('button').textContent = editorConfiguration.label;
  });
}
