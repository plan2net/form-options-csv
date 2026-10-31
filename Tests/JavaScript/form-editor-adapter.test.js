import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeChoices } from '../../Resources/Public/JavaScript/form-editor-adapter.js';

function formElement(properties) {
  const data = { ...properties };
  return {
    get: key => data[key],
    set: (key, value) => { data[key] = value; },
  };
}

test('stored rows are written back as they are, each one only once', () => {
  const first = { _label: 'Same', _value: 'same', _orig__label: { hmac: 'first' } };
  const second = { _label: 'Same', _value: 'same', _orig__label: { hmac: 'second' } };
  const element = formElement({ 'properties.options': [first, second] });

  writeChoices(element, {
    options: [{ label: 'Same', value: 'same' }, { label: 'Same', value: 'same' }, { label: 'New', value: 5 }],
    defaultValue: 5,
  });

  const [writtenFirst, writtenSecond, writtenNew] = element.get('properties.options');
  assert.equal(writtenFirst, first);
  assert.equal(writtenSecond, second);
  assert.deepEqual(writtenNew, { _label: 'New', _value: 5 });
  assert.equal(element.get('defaultValue'), 5);
});
