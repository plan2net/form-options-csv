// The parts of the TYPO3 form editor API this extension uses, the same on TYPO3 12, 13 and 14.
import type { ImportLabels } from './types'

export interface FormElement {
  get(key: string): unknown
  set(key: string, value: unknown): void
}

export interface EditorConfiguration {
  templateName: string
  label: string
  labels?: ImportLabels
}

interface JQueryLike {
  jquery: string
  get(index: number): HTMLElement
}

export type EditorHtml = HTMLElement | JQueryLike

type Subscriber = (topic: string, parameters: [EditorConfiguration, EditorHtml, ...unknown[]]) => void

export interface FormEditorApp {
  getPublisherSubscriber(): { subscribe(topic: string, subscriber: Subscriber): void }
  getCurrentlySelectedFormElement(): FormElement
  getRepository(): { findFormElement(formElement: FormElement): FormElement }
  getViewModel(): { renderInspectorEditors(): void, renderUndoRedo(): void }
  saveApplicationState(): void
}
