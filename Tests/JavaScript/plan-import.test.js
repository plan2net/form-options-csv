import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planImport } from '../../Resources/Public/JavaScript/csv.js';

const existing = { options: [{ label: 'Old', value: 'old' }], defaultValue: '' };

test('add mode puts the pasted rows below the existing options', () => {
  const plan = planImport([{ label: 'New', value: 'new', isDefault: false }], existing, {
    replace: false,
    singleValue: true,
  });
  assert.deepEqual(plan.options, [
    { label: 'Old', value: 'old' },
    { label: 'New', value: 'new' },
  ]);
  assert.equal(plan.importedCount, 1);
});

test('rows without label, existing values and repeated values are skipped with a reason', () => {
  const rows = [
    { label: ' ', value: 'blank', isDefault: false, skipReason: 'noLabel' },
    { label: 'Again old', value: 'old', isDefault: false },
    { label: 'Five', value: '5', isDefault: false },
    { label: 'X', value: 'x', isDefault: false },
    { label: 'X again', value: 'x', isDefault: false },
  ];
  const plan = planImport(rows, { options: [{ label: 'Old', value: 'old' }, { label: 'Number', value: 5 }], defaultValue: '' }, {
    replace: false,
    singleValue: true,
  });
  assert.deepEqual(plan.preview.map(row => row.skipReason ?? null), [
    'noLabel',
    'valueExists',
    'valueExists',
    null,
    'valueRepeated',
  ]);
  assert.deepEqual(plan.options.map(option => option.value), ['old', 5, 'x']);
  assert.equal(plan.importedCount, 1);
});

const row = (value, isDefault = false) => ({ label: `Label ${value}`, value, isDefault });
const options = (...values) => values.map(value => ({ label: `Label ${value}`, value }));

test('single value, add: the first pasted default replaces the current default and later marks get a note', () => {
  const plan = planImport([row('b', true), row('c', true)], { options: options('a'), defaultValue: 'a' }, {
    replace: false,
    singleValue: true,
  });
  assert.equal(plan.defaultValue, 'b');
  assert.deepEqual(plan.preview.map(previewRow => previewRow.note ?? null), [null, 'onlyOneDefault']);
  assert.equal(plan.importedCount, 2);
});

test('single value, add, nothing marked: the current default stays', () => {
  const plan = planImport([row('b')], { options: options('a'), defaultValue: 'a' }, { replace: false, singleValue: true });
  assert.equal(plan.defaultValue, 'a');
});

test('single value, replace, nothing marked: the current default stays only if its value is still there', () => {
  const settings = { replace: true, singleValue: true };
  assert.equal(planImport([row('a'), row('b')], { options: options('a'), defaultValue: 'a' }, settings).defaultValue, 'a');
  assert.equal(planImport([row('b')], { options: options('a'), defaultValue: 'a' }, settings).defaultValue, '');
});

test('single value, replace: the first pasted default wins', () => {
  const plan = planImport([row('b'), row('c', true)], { options: options('a'), defaultValue: 'a' }, {
    replace: true,
    singleValue: true,
  });
  assert.equal(plan.defaultValue, 'c');
});

test('multi value, add: pasted defaults are added to the current ones without repeats', () => {
  const plan = planImport([row('b', true), row('c')], { options: options('a'), defaultValue: ['a'] }, {
    replace: false,
    singleValue: false,
  });
  assert.deepEqual(plan.defaultValue, ['a', 'b']);
});

test('multi value, replace with marks: only the pasted defaults remain', () => {
  const plan = planImport([row('b', true), row('c', true)], { options: options('a'), defaultValue: ['a'] }, {
    replace: true,
    singleValue: false,
  });
  assert.deepEqual(plan.defaultValue, ['b', 'c']);
});

test('multi value, replace without marks: current defaults stay when their values are still there', () => {
  const plan = planImport([row('b'), row('c')], { options: options('a', 'b'), defaultValue: ['a', 'b'] }, {
    replace: true,
    singleValue: false,
  });
  assert.deepEqual(plan.defaultValue, ['b']);
});

test('a skipped row never becomes the default', () => {
  const plan = planImport([row('a', true), row('b')], { options: options('a'), defaultValue: '' }, {
    replace: false,
    singleValue: true,
  });
  assert.equal(plan.defaultValue, '');
});

test('a default whose option no longer exists is dropped', () => {
  assert.equal(planImport([row('b')], { options: options('a'), defaultValue: 'gone' }, { replace: false, singleValue: true }).defaultValue, '');
  assert.deepEqual(
    planImport([row('b')], { options: options('a'), defaultValue: ['gone', 'a'] }, { replace: false, singleValue: false }).defaultValue,
    ['a'],
  );
});

test('a skipped marked row never becomes a default on multi value elements', () => {
  const rows = [row('a', true), { ...row('x', true), skipReason: 'noLabel' }, row('b')];
  const plan = planImport(rows, { options: options('a'), defaultValue: [] }, { replace: false, singleValue: false });
  assert.deepEqual(plan.defaultValue, []);
});

test('missing or wrongly shaped current defaults are handled', () => {
  const add = { replace: false };
  assert.equal(planImport([], { options: options('a'), defaultValue: undefined }, { ...add, singleValue: true }).defaultValue, '');
  assert.equal(planImport([], { options: options('a'), defaultValue: null }, { ...add, singleValue: true }).defaultValue, '');
  assert.deepEqual(planImport([], { options: options('a'), defaultValue: [] }, { ...add, singleValue: false }).defaultValue, []);
  assert.deepEqual(planImport([], { options: options('a'), defaultValue: 'a' }, { ...add, singleValue: false }).defaultValue, ['a']);
  assert.equal(planImport([], { options: options('a'), defaultValue: ['a'] }, { ...add, singleValue: true }).defaultValue, 'a');
});

test('numbers and number-like text are the same value', () => {
  const plan = planImport([row(5), row('5')], { options: [], defaultValue: '' }, { replace: true, singleValue: true });
  assert.deepEqual(plan.preview.map(previewRow => previewRow.skipReason ?? null), [null, 'valueRepeated']);
  assert.equal(planImport([], { options: [{ label: 'Five', value: '5' }], defaultValue: 5 }, { replace: false, singleValue: true }).defaultValue, 5);
});

test('a row without label does not block a later row with the same value', () => {
  const plan = planImport([{ ...row('a'), skipReason: 'noLabel' }, row('a')], { options: [], defaultValue: '' }, {
    replace: false,
    singleValue: true,
  });
  assert.deepEqual(plan.preview.map(previewRow => previewRow.skipReason ?? null), ['noLabel', null]);
});

test('a skipped marked row gets no note', () => {
  const plan = planImport([row('a', true), row('b', true)], { options: options('a'), defaultValue: '' }, {
    replace: false,
    singleValue: true,
  });
  assert.deepEqual(plan.preview.map(previewRow => previewRow.note ?? null), [null, null]);
  assert.equal(plan.defaultValue, 'b');
});

test('no rows keeps the options in add mode and empties them in replace mode', () => {
  const current = { options: options('a'), defaultValue: '' };
  assert.deepEqual(planImport([], current, { replace: false, singleValue: true }).options, options('a'));
  assert.deepEqual(planImport([], current, { replace: true, singleValue: true }).options, []);
  assert.equal(planImport([], current, { replace: true, singleValue: true }).importedCount, 0);
});

test('replace mode drops the existing options', () => {
  const plan = planImport([{ label: 'New', value: 'new', isDefault: false }], existing, {
    replace: true,
    singleValue: true,
  });
  assert.deepEqual(plan.options, [{ label: 'New', value: 'new' }]);
});
