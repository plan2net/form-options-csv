declare module '@typo3/backend/modal.js' {
  export interface ModalElement extends HTMLElement {
    hideModal(): void
  }

  interface ModalConfiguration {
    title: string
    content: HTMLElement
    size?: string
  }

  const Modal: {
    sizes: { large: string }
    advanced(configuration: ModalConfiguration): ModalElement
  }

  export default Modal
}
