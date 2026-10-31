export function decodeFile(bytes) {
  const data = new Uint8Array(bytes);
  if (data[0] === 0xff && data[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(data);
  }
  if (data[0] === 0xfe && data[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(data);
  }
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
    rows: records.filter(isFilled).map(toRow).map((row, index) => hasHeader && index === 0 ? { ...row, skipReason: 'header' } : row),
    error: null,
  };
}

export function planImport(rows, existing, { replace, singleValue }) {
  const plan = planOptions(rows, existing, replace);
  const optionValues = valueSet(plan.options);
  // A default without its option is broken, so it is dropped.
  const keptDefaults = [existing.defaultValue ?? []].flat().filter(value => optionValues.has(String(value)));
  const markedRows = plan.preview.filter(row => !row.skipReason && row.isDefault);
  if (singleValue) {
    const [firstMarked, ...laterMarked] = markedRows;
    return {
      ...plan,
      preview: plan.preview.map(row => laterMarked.includes(row) ? { ...row, note: 'onlyOneDefault' } : row),
      defaultValue: firstMarked?.value ?? keptDefaults[0] ?? '',
    };
  }
  const markedValues = markedRows.map(row => row.value);
  return {
    ...plan,
    defaultValue: replace && markedValues.length > 0 ? markedValues : [...keptDefaults, ...markedValues],
  };
}

function planOptions(rows, existing, replace) {
  const keptOptions = replace ? [] : existing.options;
  const existingValues = valueSet(keptOptions);
  const pastedValues = new Set();
  const skipReasonFor = row => {
    if (row.skipReason) {
      return row.skipReason;
    }
    if (existingValues.has(String(row.value))) {
      return 'valueExists';
    }
    if (pastedValues.has(String(row.value))) {
      return 'valueRepeated';
    }
    return null;
  };
  const preview = rows.map(row => {
    const skipReason = skipReasonFor(row);
    if (skipReason) {
      return { ...row, skipReason };
    }
    pastedValues.add(String(row.value));
    return row;
  });
  const imported = preview.filter(row => !row.skipReason).map(({ label, value }) => ({ label, value }));
  return {
    options: [...keptOptions, ...imported],
    preview,
    importedCount: imported.length,
  };
}

function valueSet(options) {
  return new Set(options.map(option => String(option.value)));
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
