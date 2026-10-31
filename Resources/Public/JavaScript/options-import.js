import Modal from '@typo3/backend/modal.js';
import { toElement } from './form-editor-adapter.js';
import './options-import-modal.js';

export function bootstrap(formEditorApp) {
  formEditorApp.getPublisherSubscriber().subscribe('view/inspector/editor/insert/perform', (topic, [editorConfiguration, editorHtml]) => {
    if (editorConfiguration.templateName !== 'Inspector-OptionsImportEditor') {
      return;
    }
    const button = toElement(editorHtml).querySelector('button');
    button.textContent = editorConfiguration.label;
    button.addEventListener('click', () => openModal(editorConfiguration));
  });
}

function openModal(editorConfiguration) {
  const importElement = document.createElement('form-options-csv-import');
  importElement.labels = editorConfiguration.labels;
  Modal.advanced({
    title: editorConfiguration.label,
    content: importElement,
    size: Modal.sizes.large,
  });
}
