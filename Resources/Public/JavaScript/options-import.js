import Modal from '@typo3/backend/modal.js';
import { readChoices, toElement } from './form-editor-adapter.js';
import './options-import-modal.js';

const singleValueTypes = ['SingleSelect', 'RadioButton'];

export function bootstrap(formEditorApp) {
  formEditorApp.getPublisherSubscriber().subscribe('view/inspector/editor/insert/perform', (topic, [editorConfiguration, editorHtml]) => {
    if (editorConfiguration.templateName !== 'Inspector-OptionsImportEditor') {
      return;
    }
    const button = toElement(editorHtml).querySelector('button');
    button.textContent = editorConfiguration.label;
    button.addEventListener('click', () => openModal(formEditorApp, editorConfiguration));
  });
}

function openModal(formEditorApp, editorConfiguration) {
  const formElement = formEditorApp.getCurrentlySelectedFormElement();
  const importElement = document.createElement('form-options-csv-import');
  importElement.labels = editorConfiguration.labels;
  importElement.existing = readChoices(formElement);
  importElement.singleValue = singleValueTypes.includes(formElement.get('type'));
  Modal.advanced({
    title: editorConfiguration.label,
    content: importElement,
    size: Modal.sizes.large,
  });
}
