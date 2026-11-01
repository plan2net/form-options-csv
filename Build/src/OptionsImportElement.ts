import { html, LitElement, type TemplateResult } from 'lit'
import { parseRows, type ParseError, type ParseResult, type Source } from './CsvReader'
import { fileProblem } from './FileCheck'
import { decodeFile } from './FileDecoder'
import { planImport } from './ImportPlanner'
import { loadHasHeader, saveHasHeader } from './ImportSettings'
import type { Choices, FileProblem, ImportLabels, ImportPlan, PreviewRow } from './types'

export const applyEvent = 'options-import-apply'
export const cancelEvent = 'options-import-cancel'

interface Parsed {
  plan: ImportPlan | null
  error: ParseError | null
}

export class OptionsImportElement extends LitElement {
  static properties = {
    labels: { attribute: false },
    existing: { attribute: false },
    singleValue: { attribute: false },
    text: { state: true },
    source: { state: true },
    fileProblem: { state: true },
    hasHeader: { state: true },
    replace: { state: true },
  }

  declare labels: ImportLabels
  declare existing: Choices
  declare singleValue: boolean
  declare text: string | undefined
  declare source: Source
  declare fileProblem: FileProblem | null
  declare hasHeader: boolean
  declare replace: boolean

  private fileReadCount = 0
  private parsedRows: { key: string, text: string, result: ParseResult } | null = null

  constructor() {
    super()
    this.source = 'paste'
    this.fileProblem = null
    this.hasHeader = loadHasHeader()
    this.replace = false
    // A drop next to the paste area would otherwise open the file in the browser.
    this.addEventListener('dragover', event => event.preventDefault())
    this.addEventListener('drop', event => this.handleDrop(event))
  }

  protected override createRenderRoot(): HTMLElement {
    return this
  }

  protected override render(): TemplateResult {
    const { plan, error } = this.parse()
    const importedCount = plan?.importedCount ?? 0
    return html`
      <style>
        .form-options-csv-drop-area { border: 2px dashed currentColor; border-radius: .5rem; padding: 2rem 1rem; margin-bottom: 1rem; text-align: center; cursor: pointer; opacity: .85; }
        .form-options-csv-drop-area:hover, .form-options-csv-drop-area:focus-visible { opacity: 1; }
        .form-options-csv-preview { max-height: 45vh; overflow-y: auto; margin-bottom: 1rem; }
      </style>
      <div class="form-options-csv-drop-area" tabindex="0" role="button" @click=${this.chooseFile} @keydown=${this.handleDropAreaKey}>${this.labels.dropArea}</div>
      <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" hidden @change=${this.handleFileChange}>
      ${this.fileProblem ? html`<div class="alert alert-warning" role="alert">${this.labels[this.fileProblem]}</div>` : ''}
      ${this.renderSwitch('form-options-csv-header', this.labels.hasHeader, this.hasHeader, checked => this.changeHeader(checked))}
      ${this.renderSwitch('form-options-csv-replace', this.labels.replace, this.replace, checked => { this.replace = checked })}
      ${error ? html`<div class="alert alert-danger" role="alert">${this.errorMessage(error)}</div>` : ''}
      ${plan ? this.renderPreview(plan) : ''}
      <div class="d-flex justify-content-end gap-2" aria-live="polite">
        <button type="button" class="btn btn-default" @click=${this.cancel}>${this.labels.cancel}</button>
        <button type="button" class="btn btn-primary" ?disabled=${plan === null || importedCount === 0} @click=${() => plan && this.apply(plan)}>${this.applyLabel(importedCount)}</button>
      </div>
    `
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault()
    this.fileReadCount++
    this.useInput({ text: event.clipboardData?.getData('text/plain') ?? '', source: 'paste' })
  }

  private parse(): Parsed {
    if (this.text === undefined) {
      return { plan: null, error: null }
    }
    const { rows, error } = this.cachedParseRows(this.text)
    if (error) {
      return { plan: null, error }
    }
    return { plan: planImport(rows, this.existing, { replace: this.replace, singleValue: this.singleValue }), error: null }
  }

  // Switching "replace" only needs a new plan, not a new parse of the whole text.
  private cachedParseRows(text: string): ParseResult {
    const key = `${this.source}|${this.hasHeader}`
    if (this.parsedRows?.key !== key || this.parsedRows.text !== text) {
      this.parsedRows = { key, text, result: parseRows(text, { source: this.source, hasHeader: this.hasHeader }) }
    }
    return this.parsedRows.result
  }

  private errorMessage(error: ParseError): string {
    switch (error.reason) {
      case 'unclosedQuote':
        return this.labels.unclosedQuote.replace('%d', String(error.line))
      case 'tooManyRows':
        return this.labels.tooManyRows.replace('%d', String(error.limit))
      case 'tooLarge':
        return this.labels.tooLarge
    }
  }

  private chooseFile(event: Event): void {
    event.preventDefault()
    this.querySelector<HTMLInputElement>('input[type="file"]')?.click()
  }

  private handleDropAreaKey(event: KeyboardEvent): void {
    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
      this.chooseFile(event)
    }
  }

  private handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement
    void this.readFile(input.files?.[0])
    // Otherwise picking the same file again does nothing.
    input.value = ''
  }

  private renderSwitch(id: string, label: string, checked: boolean, onChange: (checked: boolean) => void): TemplateResult {
    return html`
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id=${id} .checked=${checked} @change=${(event: Event) => onChange((event.target as HTMLInputElement).checked)}>
        <label class="form-check-label" for=${id}>${label}</label>
      </div>
    `
  }

  private changeHeader(checked: boolean): void {
    this.hasHeader = checked
    saveHasHeader(checked)
  }

  private renderPreview(plan: ImportPlan): TemplateResult {
    return html`
      <div class="form-options-csv-preview">
        <table class="table table-sm">
          <thead><tr><th>${this.labels.columnLabel}</th><th>${this.labels.columnValue}</th><th>${this.labels.columnDefault}</th><th>${this.labels.columnNote}</th></tr></thead>
          <tbody>
            ${plan.preview.map(row => this.renderRow(row))}
          </tbody>
        </table>
      </div>
    `
  }

  private renderRow(row: PreviewRow): TemplateResult {
    const message = row.skipReason ?? row.note
    const isMarkedDefault = row.isDefault && !row.skipReason && !row.note
    return html`
      <tr class=${row.skipReason ? 'text-body-secondary' : ''}>
        <td>${row.label}</td>
        <td>${row.value}</td>
        <td>${isMarkedDefault ? html`<span title=${this.labels.columnDefault}>✔</span>` : ''}</td>
        <td>${message ? this.labels[message] : ''}</td>
      </tr>
    `
  }

  private cancel(): void {
    this.dispatchEvent(new CustomEvent(cancelEvent))
  }

  private applyLabel(importedCount: number): string {
    const [one, many] = this.replace ? [this.labels.replaceOne, this.labels.replaceMany] : [this.labels.addOne, this.labels.addMany]
    return importedCount === 1 ? one : many.replace('%d', String(importedCount))
  }

  private apply(plan: ImportPlan): void {
    this.dispatchEvent(new CustomEvent<ImportPlan>(applyEvent, { detail: plan }))
  }

  private handleDrop(event: DragEvent): void {
    event.preventDefault()
    void this.readFile(event.dataTransfer?.files[0])
  }

  private async readFile(file: File | undefined): Promise<void> {
    if (!file) {
      return
    }
    const readNumber = ++this.fileReadCount
    const problem = fileProblem(file)
    if (problem) {
      this.useInput({ fileProblem: problem })
      return
    }
    try {
      const text = decodeFile(await file.arrayBuffer())
      if (readNumber === this.fileReadCount) {
        this.useInput({ text, source: 'file' })
      }
    } catch {
      if (readNumber === this.fileReadCount) {
        this.useInput({ fileProblem: 'unsupportedFile' })
      }
    }
  }

  private useInput({ text, source = 'paste', fileProblem = null }: { text?: string, source?: Source, fileProblem?: FileProblem | null }): void {
    this.text = text
    this.source = source
    this.fileProblem = fileProblem
  }
}

if (!customElements.get('form-options-csv-import')) {
  customElements.define('form-options-csv-import', OptionsImportElement)
}
