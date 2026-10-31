import { html, LitElement } from 'lit';
import { decodeFile, parseRows, planImport } from './csv.js';

const settingsKey = 'form-options-csv:settings';
const textExtensions = ['csv', 'tsv', 'txt'];
const spreadsheetExtensions = ['xlsx', 'xls', 'ods', 'numbers'];

export class OptionsImportElement extends LitElement {
  static properties = {
    labels: { type: Object },
    existing: { type: Object },
    singleValue: { type: Boolean },
    text: { state: true },
    source: { state: true },
    fileProblem: { state: true },
    hasHeader: { state: true },
    replace: { state: true },
  };

  fileReadCount = 0;

  constructor() {
    super();
    this.hasHeader = loadSettings().hasHeader === true;
    this.replace = false;
    // A drop next to the paste area would otherwise open the file in the browser.
    this.addEventListener('dragover', event => event.preventDefault());
    this.addEventListener('drop', event => this.handleDrop(event));
  }

  createRenderRoot() {
    return this;
  }

  render() {
    const { plan, error } = this.parse();
    const importedCount = plan?.importedCount ?? 0;
    return html`
      <style>
        .form-options-csv-drop-area { border: 2px dashed currentColor; border-radius: .5rem; padding: 2rem 1rem; margin-bottom: 1rem; text-align: center; cursor: pointer; opacity: .85; }
        .form-options-csv-drop-area:hover, .form-options-csv-drop-area:focus-visible { opacity: 1; }
      </style>
      <div class="form-options-csv-drop-area" tabindex="0" role="button" @click=${this.chooseFile} @keydown=${this.handleDropAreaKey}>${this.labels.dropArea}</div>
      <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" hidden @change=${this.handleFileChange}>
      ${this.fileProblem ? html`<div class="alert alert-warning" role="alert">${this.labels[this.fileProblem]}</div>` : ''}
      ${this.renderSwitch('form-options-csv-header', this.labels.hasHeader, this.hasHeader, checked => this.changeHeader(checked))}
      ${this.renderSwitch('form-options-csv-replace', this.labels.replace, this.replace, checked => { this.replace = checked; })}
      ${error ? html`<div class="alert alert-danger" role="alert">${this.labels.unclosedQuote.replace('%d', String(error.line))}</div>` : ''}
      ${plan ? this.renderPreview(plan) : ''}
      <div class="d-flex justify-content-end gap-2" aria-live="polite">
        <button type="button" class="btn btn-default" @click=${() => this.dispatchEvent(new CustomEvent('options-import-cancel'))}>${this.labels.cancel}</button>
        <button type="button" class="btn btn-primary" ?disabled=${importedCount === 0} @click=${() => this.apply(plan)}>${this.applyLabel(importedCount)}</button>
      </div>
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

  chooseFile(event) {
    event.preventDefault();
    this.querySelector('input[type="file"]').click();
  }

  handleDropAreaKey(event) {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
      this.chooseFile(event);
    }
  }

  handleFileChange(event) {
    this.readFile(event.target.files[0]);
    // Otherwise picking the same file again does nothing.
    event.target.value = '';
  }

  renderSwitch(id, label, checked, onChange) {
    return html`
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id=${id} .checked=${checked} @change=${event => onChange(event.target.checked)}>
        <label class="form-check-label" for=${id}>${label}</label>
      </div>
    `;
  }

  changeHeader(checked) {
    this.hasHeader = checked;
    saveSettings({ hasHeader: checked });
  }

  renderPreview(plan) {
    return html`
      <table class="table table-sm">
        <thead><tr><th>${this.labels.columnLabel}</th><th>${this.labels.columnValue}</th><th>${this.labels.columnDefault}</th><th>${this.labels.columnNote}</th></tr></thead>
        <tbody>
          ${plan.preview.map(row => this.renderRow(row))}
        </tbody>
      </table>
    `;
  }

  renderRow(row) {
    const message = row.skipReason ?? row.note;
    const isMarkedDefault = row.isDefault && !row.skipReason && !row.note;
    return html`
      <tr class=${row.skipReason ? 'text-body-secondary' : ''}>
        <td>${row.label}</td>
        <td>${row.value}</td>
        <td>${isMarkedDefault ? html`<span title=${this.labels.columnDefault}>✔</span>` : ''}</td>
        <td>${message ? this.labels[message] : ''}</td>
      </tr>
    `;
  }

  applyLabel(importedCount) {
    const [one, many] = this.replace ? [this.labels.replaceOne, this.labels.replaceMany] : [this.labels.addOne, this.labels.addMany];
    return importedCount === 1 ? one : many.replace('%d', String(importedCount));
  }

  apply(plan) {
    this.dispatchEvent(new CustomEvent('options-import-apply', { detail: plan }));
  }

  handlePaste(event) {
    event.preventDefault();
    this.fileReadCount++;
    this.useInput({ text: event.clipboardData.getData('text/plain'), source: 'paste' });
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
    const readNumber = ++this.fileReadCount;
    const problem = fileProblem(file);
    if (problem) {
      this.useInput({ fileProblem: problem });
      return;
    }
    try {
      const text = decodeFile(new Uint8Array(await file.arrayBuffer()));
      if (readNumber === this.fileReadCount) {
        this.useInput({ text, source: 'file' });
      }
    } catch {
      this.useInput({ fileProblem: 'unsupportedFile' });
    }
  }

  useInput({ text = undefined, source = undefined, fileProblem = null }) {
    this.text = text;
    this.source = source;
    this.fileProblem = fileProblem;
  }
}

// Windows marks CSV files as Excel files, so the extension counts first.
function fileProblem(file) {
  const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
  if (textExtensions.includes(extension)) {
    return null;
  }
  if (spreadsheetExtensions.includes(extension)) {
    return 'spreadsheetFile';
  }
  if (extension === '' && (file.type === '' || file.type.startsWith('text/'))) {
    return null;
  }
  return 'unsupportedFile';
}

function loadSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem(settingsKey) ?? '{}');
    return typeof settings === 'object' && settings !== null ? settings : {};
  } catch {
    return {};
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  } catch {
    // Storage is blocked, so the switch is just not remembered.
  }
}

if (!customElements.get('form-options-csv-import')) {
  customElements.define('form-options-csv-import', OptionsImportElement);
}
