import { html, LitElement } from 'lit';
import { decodeFile, parseRows, planImport } from './csv.js';

const settingsKey = 'form-options-csv:settings';
const spreadsheetExtensions = ['xlsx', 'xls', 'ods', 'numbers'];

export class OptionsImportElement extends LitElement {
  static properties = {
    labels: { type: Object },
    existing: { type: Object },
    singleValue: { type: Boolean },
    text: { state: true },
    source: { state: true },
    hasHeader: { state: true },
    replace: { state: true },
    spreadsheetFile: { state: true },
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
    const { plan, error } = this.parse();
    const importedCount = plan?.importedCount ?? 0;
    return html`
      <div class="form-options-csv-drop-area" tabindex="0" role="button"
        @click=${this.chooseFile}
        @keydown=${event => (event.key === 'Enter' || event.key === ' ') && this.chooseFile(event)}
        @dragover=${event => event.preventDefault()}
        @drop=${this.handleDrop}>${this.labels.dropArea}</div>
      <input type="file" accept=".csv,.txt,.tsv,text/csv,text/plain" hidden @change=${event => this.readFile(event.target.files[0])}>
      ${this.spreadsheetFile ? html`<div class="alert alert-warning" role="alert">${this.labels.spreadsheetFile}</div>` : ''}
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="form-options-csv-header" .checked=${this.hasHeader} @change=${event => this.changeSetting('hasHeader', event.target.checked)}>
        <label class="form-check-label" for="form-options-csv-header">${this.labels.hasHeader}</label>
      </div>
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="form-options-csv-replace" .checked=${this.replace} @change=${event => this.changeSetting('replace', event.target.checked)}>
        <label class="form-check-label" for="form-options-csv-replace">${this.labels.replace}</label>
      </div>
      ${error ? html`<div class="alert alert-danger" role="alert">${this.labels.unclosedQuote.replace('%d', String(error.line))}</div>` : ''}
      ${plan ? this.renderPreview(plan) : ''}
      <button type="button" class="btn btn-primary" ?disabled=${importedCount === 0} @click=${() => this.apply(plan)}>${this.applyLabel(importedCount)}</button>
    `;
  }

  renderPreview(plan) {
    return html`
      <table class="table table-sm">
        <thead><tr><th>${this.labels.columnLabel}</th><th>${this.labels.columnValue}</th><th>${this.labels.columnDefault}</th><th></th></tr></thead>
        <tbody>
          ${plan.preview.map(row => html`
            <tr class=${row.skipReason ? 'text-body-secondary' : ''}>
              <td>${row.label}</td>
              <td>${row.value}</td>
              <td>${row.isDefault && !row.note ? '✔' : ''}</td>
              <td>${this.labels[row.skipReason ?? row.note] ?? ''}</td>
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }

  parse() {
    if (this.text === undefined) {
      return { plan: null, error: null };
    }
    const { rows, error } = parseRows(this.text, { source: this.source, hasHeader: this.hasHeader });
    if (error) {
      return { plan: null, error };
    }
    return { plan: planImport(rows, this.existing, { replace: this.replace, singleValue: this.singleValue }), error: null };
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
    this.useText(event.clipboardData.getData('text/plain'), 'paste');
  }

  chooseFile(event) {
    event.preventDefault();
    this.querySelector('input[type="file"]').click();
  }

  handleDrop(event) {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) {
      this.readFile(event.dataTransfer.files[0]);
    }
  }

  async readFile(file) {
    if (!file) {
      return;
    }
    if (isSpreadsheetFile(file)) {
      this.text = undefined;
      this.spreadsheetFile = true;
      return;
    }
    this.useText(decodeFile(new Uint8Array(await file.arrayBuffer())), 'file');
  }

  useText(text, source) {
    this.spreadsheetFile = false;
    this.text = text;
    this.source = source;
  }
}

// Windows reports plain CSV files as application/vnd.ms-excel, so the extension decides first.
function isSpreadsheetFile(file) {
  const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
  if (extension !== '') {
    return spreadsheetExtensions.includes(extension);
  }
  return file.type !== '' && !file.type.startsWith('text/');
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
