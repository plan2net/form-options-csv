import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeFile, parseRows } from '../../Resources/Public/JavaScript/csv.js';

test('a UTF-8 file loses its byte order mark', () => {
  assert.equal(decodeFile(new Uint8Array([0xef, 0xbb, 0xbf, 0xc3, 0x84, 0x3b, 0x31])), 'Ä;1');
});

test('a UTF-16 file from Excel "Unicode Text" is read', () => {
  const littleEndian = new Uint8Array([0xff, 0xfe, 0xc4, 0x00, 0x09, 0x00, 0x31, 0x00]);
  const bigEndian = new Uint8Array([0xfe, 0xff, 0x00, 0xc4, 0x00, 0x09, 0x00, 0x31]);
  assert.equal(decodeFile(littleEndian), 'Ä\t1');
  assert.equal(decodeFile(bigEndian), 'Ä\t1');
});

test('a file with only a byte order mark is empty', () => {
  assert.equal(decodeFile(new Uint8Array([0xef, 0xbb, 0xbf]).buffer), '');
});

test('a file that is not valid UTF-8 is read as windows-1252', () => {
  assert.equal(decodeFile(new Uint8Array([0xc4, 0x3b, 0x80])), 'Ä;€');
});

test('a pasted label;value;default line becomes one row', () => {
  assert.deepEqual(parseRows('Label 1;1;1', { source: 'paste' }), {
    rows: [{ label: 'Label 1', value: 1, isDefault: true }],
    error: null,
  });
});

test('each line is a row and a missing value falls back to the label', () => {
  assert.deepEqual(parseRows('Label 2;2\nLabel 3\nLabel 4;;1', { source: 'paste' }).rows, [
    { label: 'Label 2', value: 2, isDefault: false },
    { label: 'Label 3', value: 'Label 3', isDefault: false },
    { label: 'Label 4', value: 'Label 4', isDefault: true },
  ]);
});

test('a quoted field keeps its separator and doubled quotes', () => {
  assert.deepEqual(parseRows('"Label with ; and ""quotes""";5;1', { source: 'paste' }).rows, [
    { label: 'Label with ; and "quotes"', value: 5, isDefault: true },
  ]);
});

test('windows and old mac line breaks split rows and blank lines are skipped', () => {
  assert.deepEqual(parseRows('A;a\r\n\r\n  \rB;b;1\r\n', { source: 'paste' }).rows, [
    { label: 'A', value: 'a', isDefault: false },
    { label: 'B', value: 'b', isDefault: true },
  ]);
});

test('pasted spreadsheet cells are split on tabs for the whole paste', () => {
  assert.deepEqual(parseRows('Vienna; Austria\tvie\t1\nGraz;Styria', { source: 'paste' }).rows, [
    { label: 'Vienna; Austria', value: 'vie', isDefault: true },
    { label: 'Graz;Styria', value: 'Graz;Styria', isDefault: false },
  ]);
});

test('a line break inside a quoted cell becomes one space', () => {
  assert.deepEqual(parseRows('"First line \r\n  second line"\tv\nNext\tn', { source: 'paste' }).rows, [
    { label: 'First line second line', value: 'v', isDefault: false },
    { label: 'Next', value: 'n', isDefault: false },
  ]);
});

test('an unclosed quote blocks the import and reports the line it started on', () => {
  assert.deepEqual(parseRows('A;a\nB;b\n"Broken;c\nD;d', { source: 'paste' }), {
    rows: [],
    error: { reason: 'unclosedQuote', line: 3 },
  });
});

test('a row without a label is marked as skipped', () => {
  assert.deepEqual(parseRows('  ;a;1', { source: 'paste' }).rows, [
    { label: '  ', value: 'a', isDefault: true, skipReason: 'noLabel' },
  ]);
});

test('a file uses the separator that appears most often outside quotes in its first line', () => {
  assert.deepEqual(parseRows('\n"Vienna, Austria",vie,1\nGraz;Styria,grz', { source: 'file' }).rows, [
    { label: 'Vienna, Austria', value: 'vie', isDefault: true },
    { label: 'Graz;Styria', value: 'grz', isDefault: false },
  ]);
});

test('a file prefers tab, then semicolon, when separators appear equally often', () => {
  assert.equal(parseRows('a;b\tc', { source: 'file' }).rows[0].label, 'a;b');
  assert.equal(parseRows('a;b,c', { source: 'file' }).rows[0].label, 'a');
});

test('a tab separated file is split on tabs', () => {
  assert.deepEqual(parseRows('Vienna, Austria\tvie', { source: 'file' }).rows, [
    { label: 'Vienna, Austria', value: 'vie', isDefault: false },
  ]);
});

test('pasted text is never split on commas', () => {
  assert.equal(parseRows('Vienna, Austria', { source: 'paste' }).rows[0].label, 'Vienna, Austria');
});

test('a tab inside quotes does not make the paste tab separated', () => {
  assert.deepEqual(parseRows('"a\tb";1', { source: 'paste' }).rows, [{ label: 'a\tb', value: 1, isDefault: false }]);
});

test('empty input gives no rows and no error', () => {
  assert.deepEqual(parseRows('', { source: 'paste' }), { rows: [], error: null });
});

test('the header row is skipped as header even when its first cell is empty', () => {
  assert.deepEqual(parseRows(';Value\nA;a', { source: 'paste', hasHeader: true }).rows, [
    { label: '', value: 'Value', isDefault: false, skipReason: 'header' },
    { label: 'A', value: 'a', isDefault: false },
  ]);
});

test('the unclosed quote line counts windows line breaks and quoted line breaks once', () => {
  assert.equal(parseRows('A;a\r\nB;b\r\n"x', { source: 'paste' }).error.line, 3);
  assert.equal(parseRows('"a\r\nb";1\n"x', { source: 'file' }).error.line, 3);
  assert.equal(parseRows('"', { source: 'paste' }).error.line, 1);
});

test('a lone carriage return inside a quoted value becomes one space', () => {
  assert.deepEqual(parseRows('A;"x\ry"', { source: 'paste' }).rows, [{ label: 'A', value: 'x y', isDefault: false }]);
});

test('the header option marks the first non-empty row as skipped header', () => {
  assert.deepEqual(parseRows('\nLabel\tValue\nVienna\tvie', { source: 'paste', hasHeader: true }).rows, [
    { label: 'Label', value: 'Value', isDefault: false, skipReason: 'header' },
    { label: 'Vienna', value: 'vie', isDefault: false },
  ]);
});

test('columns after the third are ignored', () => {
  assert.deepEqual(parseRows('Label;value;1;extra;more', { source: 'paste' }).rows, [
    { label: 'Label', value: 'value', isDefault: true },
  ]);
});

test('whitespace around columns is kept', () => {
  assert.deepEqual(parseRows('  Label ; 1 ', { source: 'paste' }).rows, [
    { label: '  Label ', value: ' 1 ', isDefault: false },
  ]);
});

test('only plain safe integers become numbers', () => {
  const values = parseRows('a;5\nb;-12\nc;0\nd;007\ne;+5\nf;5.0\ng;-0\nh;9007199254740993', { source: 'paste' })
    .rows.map(row => row.value);
  assert.deepEqual(values, [5, -12, 0, '007', '+5', '5.0', '-0', '9007199254740993']);
});

test('a quote in the middle of a pasted cell does not hide the tabs after it', () => {
  assert.deepEqual(parseRows('Size 5" pipe\t5\nB\t1', { source: 'paste' }).rows, [
    { label: 'Size 5" pipe', value: 5, isDefault: false },
    { label: 'B', value: 1, isDefault: false },
  ]);
});

test('a quote in the middle of a file cell does not hide the separators after it', () => {
  assert.deepEqual(parseRows('12" ruler;1\nB;2', { source: 'file' }).rows, [
    { label: '12" ruler', value: 1, isDefault: false },
    { label: 'B', value: 2, isDefault: false },
  ]);
});

test('a file skips rows of empty cells before detecting the separator', () => {
  assert.deepEqual(parseRows(';;\nA,1\nB,2', { source: 'file' }).rows.map(row => row.label), ['A', 'B']);
});

test('a value taken from the label follows the integer rule', () => {
  assert.deepEqual(parseRows('5', { source: 'paste' }).rows, [{ label: '5', value: 5, isDefault: false }]);
});

test('the default column ignores surrounding spaces', () => {
  assert.deepEqual(parseRows('A;a;0 \nB;b; \nC;c;x', { source: 'paste' }).rows.map(row => row.isDefault), [
    false,
    false,
    true,
  ]);
});
