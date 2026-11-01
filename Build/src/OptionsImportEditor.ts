import Modal from '@typo3/backend/modal.js'
import type { EditorConfiguration, FormEditorApp } from './FormEditor'
import { readChoices, toElement, writeChoices } from './FormEditorAdapter'
import { applyEvent, cancelEvent, OptionsImportElement } from './OptionsImportElement'
import type { ImportPlan } from './types'

const singleValueTypes = ['SingleSelect', 'RadioButton']

export function bootstrap(formEditorApp: FormEditorApp): void {
  formEditorApp.getPublisherSubscriber().subscribe('view/inspector/editor/insert/perform', (_topic, [editorConfiguration, editorHtml]) => {
    if (editorConfiguration.templateName !== 'Inspector-OptionsImportEditor') {
      return
    }
    const button = toElement(editorHtml).querySelector('button')
    if (!button) {
      return
    }
    button.textContent = editorConfiguration.label
    button.addEventListener('click', () => openModal(formEditorApp, editorConfiguration))
  })
}

function openModal(formEditorApp: FormEditorApp, editorConfiguration: EditorConfiguration): void {
  if (!editorConfiguration.labels) {
    return
  }
  const formElement = formEditorApp.getCurrentlySelectedFormElement()
  const importElement = new OptionsImportElement()
  importElement.labels = editorConfiguration.labels
  importElement.existing = readChoices(formElement)
  importElement.singleValue = singleValueTypes.includes(String(formElement.get('type')))
  const modal = Modal.advanced({
    title: editorConfiguration.label,
    content: importElement,
    size: Modal.sizes.large,
  })
  // TYPO3 does not focus the modal content, but Ctrl+V should work right away.
  modal.addEventListener('typo3-modal-shown', () => {
    modal.ownerDocument.defaultView?.focus()
    importElement.querySelector<HTMLElement>('.form-options-csv-drop-area')?.focus()
  })
  modal.addEventListener('paste', event => importElement.handlePaste(event))
  importElement.addEventListener(cancelEvent, () => modal.hideModal())
  importElement.addEventListener(applyEvent, event => {
    applyPlan(formEditorApp, (event as CustomEvent<ImportPlan>).detail)
    modal.hideModal()
  }, { once: true })
}

function applyPlan(formEditorApp: FormEditorApp, plan: ImportPlan): void {
  formEditorApp.saveApplicationState()
  // Saving the state swaps the form data, so the element must be fetched again.
  const formElement = formEditorApp.getRepository().findFormElement(formEditorApp.getCurrentlySelectedFormElement())
  writeChoices(formElement, plan)
  formEditorApp.getViewModel().renderInspectorEditors()
  formEditorApp.getViewModel().renderUndoRedo()
}
