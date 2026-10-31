import { html, LitElement } from 'lit';
import { parseRows, planImport } from './csv.js';

const settingsKey = 'form-options-csv:settings';

export class OptionsImportElement extends LitElement {
  static properties = {
    labels: { type: Object },
    existing: { type: Object },
    singleValue: { type: Boolean },
    text: { state: true },
    source: { state: true },
    hasHeader: { state: true },
    replace: { state: true },
  };

  constructor() {
    super();
    const settings = loadSettings();
    this.hasHeader = settings.hasHeader ?? false;
    this.replace = settings.replace ?? false;
  }

  createRenderRoot() {
    return this;
  }

  render() {
    const plan = this.plan();
    const importedCount = plan?.importedCount ?? 0;
    return html`
      <div class="form-options-csv-drop-area" tabindex="0">${this.labels.dropArea}</div>
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="form-options-csv-header" .checked=${this.hasHeader} @change=${event => this.changeSetting('hasHeader', event.target.checked)}>
        <label class="form-check-label" for="form-options-csv-header">${this.labels.hasHeader}</label>
      </div>
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="form-options-csv-replace" .checked=${this.replace} @change=${event => this.changeSetting('replace', event.target.checked)}>
        <label class="form-check-label" for="form-options-csv-replace">${this.labels.replace}</label>
      </div>
      ${plan ? this.renderPreview(plan) : ''}
      <button type="button" class="btn btn-primary" ?disabled=${importedCount === 0} @click=${() => this.apply(plan)}>${this.applyLabel(importedCount)}</button>
    `;
  }

  renderPreview(plan) {
    return html`
      <table class="table table-sm">
        <thead><tr><th>${this.labels.columnLabel}</th><th>${this.labels.columnValue}</th><th>${this.labels.columnDefault}</th></tr></thead>
        <tbody>
          ${plan.preview.map(row => html`<tr><td>${row.label}</td><td>${row.value}</td><td>${row.isDefault ? '✔' : ''}</td></tr>`)}
        </tbody>
      </table>
    `;
  }

  plan() {
    if (this.text === undefined) {
      return null;
    }
    const { rows, error } = parseRows(this.text, { source: this.source, hasHeader: this.hasHeader });
    if (error) {
      return null;
    }
    return planImport(rows, this.existing, { replace: this.replace, singleValue: this.singleValue });
  }

  applyLabel(importedCount) {
    const [one, many] = this.replace ? [this.labels.replaceOne, this.labels.replaceMany] : [this.labels.addOne, this.labels.addMany];
    return importedCount === 1 ? one : many.replace('%d', String(importedCount));
  }

  changeSetting(name, value) {
    this[name] = value;
    saveSettings({ hasHeader: this.hasHeader, replace: this.replace });
  }

  apply(plan) {
    this.dispatchEvent(new CustomEvent('options-import-apply', { detail: plan }));
  }

  handlePaste(event) {
    event.preventDefault();
    this.text = event.clipboardData.getData('text/plain');
    this.source = 'paste';
  }
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(settingsKey) ?? '{}');
  } catch {
    return {};
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  } catch {
    // Private browsing or blocked storage: the switches then just start off next time.
  }
}

if (!customElements.get('form-options-csv-import')) {
  customElements.define('form-options-csv-import', OptionsImportElement);
}
