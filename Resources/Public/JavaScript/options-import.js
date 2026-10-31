import Modal from '@typo3/backend/modal.js';
import { readChoices, toElement, writeChoices } from './form-editor-adapter.js';
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
  const modal = Modal.advanced({
    title: editorConfiguration.label,
    content: importElement,
    size: Modal.sizes.large,
  });
  // TYPO3 12 and 13 leave focus in the editor frame, TYPO3 14 puts it on the close button.
  modal.addEventListener('typo3-modal-shown', () => {
    modal.ownerDocument.defaultView.focus();
    importElement.querySelector('.form-options-csv-drop-area').focus();
  });
  modal.addEventListener('paste', event => importElement.handlePaste(event));
  importElement.addEventListener('options-import-cancel', () => modal.hideModal());
  importElement.addEventListener('options-import-apply', event => {
    applyPlan(formEditorApp, event.detail);
    modal.hideModal();
  }, { once: true });
}

function applyPlan(formEditorApp, plan) {
  formEditorApp.saveApplicationState();
  // Saving the state replaces the live form definition, so the element must be looked up again.
  const formElement = formEditorApp.getRepository().findFormElement(formEditorApp.getCurrentlySelectedFormElement());
  writeChoices(formElement, plan);
  formEditorApp.getViewModel().renderInspectorEditors();
  formEditorApp.getViewModel().renderUndoRedo();
}
