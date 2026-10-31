export function decodeFile(bytes) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}

export function parseRows(text, { source, hasHeader = false }) {
  const separator = source === 'file' ? detectFileSeparator(text) : detectPasteSeparator(text);
  const { records, quoteStartIndex } = readRecords(text, separator);
  if (quoteStartIndex !== null) {
    return { rows: [], error: { reason: 'unclosedQuote', line: lineAt(text, quoteStartIndex) } };
  }
  return {
    rows: records.filter(isFilled).slice(hasHeader ? 1 : 0).map(toRow),
    error: null,
  };
}

function detectPasteSeparator(text) {
  return readRecords(text, '\t').records.some(fields => fields.length > 1) ? '\t' : ';';
}

function detectFileSeparator(text) {
  const separatorCount = candidate => (readRecords(text, candidate).records.find(isFilled)?.length ?? 1) - 1;
  return ['\t', ';', ','].reduce((best, candidate) =>
    separatorCount(candidate) > separatorCount(best) ? candidate : best);
}

function isFilled(fields) {
  return fields.join('').replace(/[\s;,]/g, '') !== '';
}

function lineAt(text, index) {
  return 1 + (text.slice(0, index).match(/\r\n|\r|\n/g) ?? []).length;
}

function readRecords(text, separator) {
  const records = [];
  let fields = [];
  let field = '';
  let quoteStartIndex = null;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (quoteStartIndex !== null) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index++;
      } else if (character === '"') {
        quoteStartIndex = null;
      } else {
        field += character;
      }
    } else if (character === '"' && field === '') {
      quoteStartIndex = index;
    } else if (character === separator) {
      fields.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') {
        index++;
      }
      records.push([...fields, field]);
      fields = [];
      field = '';
    } else {
      field += character;
    }
  }
  records.push([...fields, field]);
  return { records, quoteStartIndex };
}

function toRow(fields) {
  const [label, value = '', isDefault = ''] = fields
    .slice(0, 3)
    .map(field => field.replace(/[ \t]*(\r\n|\r|\n)\s*/g, ' '));
  const row = {
    label,
    value: toValue(value === '' ? label : value),
    isDefault: isDefault.trim() !== '' && isDefault.trim() !== '0',
  };
  return label.trim() === '' ? { ...row, skipReason: 'noLabel' } : row;
}

function toValue(value) {
  return /^(0|-?[1-9][0-9]*)$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : value;
}
