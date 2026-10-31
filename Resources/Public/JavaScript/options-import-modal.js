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
    return html`
      <div class="form-options-csv-drop-area" tabindex="0" @paste=${this.handlePaste}>${this.labels.dropArea}</div>
      ${this.plan ? this.renderPreview() : ''}
      <button type="button" class="btn btn-primary" ?disabled=${!this.plan?.importedCount}>${this.applyLabel()}</button>
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

  applyLabel() {
    const count = this.plan?.importedCount ?? 0;
    return count === 1 ? this.labels.addOne : this.labels.addMany.replace('%d', String(count));
  }

  handlePaste(event) {
    event.preventDefault();
    const { rows } = parseRows(event.clipboardData.getData('text/plain'), { source: 'paste' });
    this.plan = planImport(rows, this.existing, { replace: false, singleValue: this.singleValue });
  }
}

customElements.define('form-options-csv-import', OptionsImportElement);
