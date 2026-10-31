import { html, LitElement } from 'lit';

export class OptionsImportElement extends LitElement {
  static properties = {
    labels: { type: Object },
  };

  createRenderRoot() {
    return this;
  }

  render() {
    return html`<div class="form-options-csv-drop-area" tabindex="0">${this.labels.dropArea}</div>`;
  }
}

customElements.define('form-options-csv-import', OptionsImportElement);
