import { html, LitElement } from 'lit';
import { parseRows, planImport } from './csv.js';

export class OptionsImportElement extends LitElement {
  static properties = {
    labels: { type: Object },
    existing: { type: Object },
    singleValue: { type: Boolean },
    plan: { state: true },
  };

  createRenderRoot() {
    return this;
  }

  render() {
    const importedCount = this.plan?.importedCount ?? 0;
    return html`
      <div class="form-options-csv-drop-area" tabindex="0">${this.labels.dropArea}</div>
      ${this.plan ? this.renderPreview() : ''}
      <button type="button" class="btn btn-primary" ?disabled=${importedCount === 0} @click=${this.apply}>${this.applyLabel(importedCount)}</button>
    `;
  }

  renderPreview() {
    return html`
      <table class="table table-sm">
        <thead><tr><th>${this.labels.columnLabel}</th><th>${this.labels.columnValue}</th><th>${this.labels.columnDefault}</th></tr></thead>
        <tbody>
          ${this.plan.preview.map(row => html`<tr><td>${row.label}</td><td>${row.value}</td><td>${row.isDefault ? '✔' : ''}</td></tr>`)}
        </tbody>
      </table>
    `;
  }

  applyLabel(importedCount) {
    return importedCount === 1 ? this.labels.addOne : this.labels.addMany.replace('%d', String(importedCount));
  }

  apply() {
    this.dispatchEvent(new CustomEvent('options-import-apply', { detail: this.plan }));
  }

  handlePaste(event) {
    event.preventDefault();
    const { rows, error } = parseRows(event.clipboardData.getData('text/plain'), { source: 'paste' });
    if (error) {
      return;
    }
    this.plan = planImport(rows, this.existing, { replace: false, singleValue: this.singleValue });
  }
}

if (!customElements.get('form-options-csv-import')) {
  customElements.define('form-options-csv-import', OptionsImportElement);
}
