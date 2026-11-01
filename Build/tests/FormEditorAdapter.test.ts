import { describe, expect, it } from 'vitest'
import { readChoices, toElement, writeChoices } from '@/FormEditorAdapter'
import type { FormElement } from '@/FormEditor'

function formElement(properties: Record<string, unknown>): FormElement {
  const data = { ...properties }
  return {
    get: key => data[key],
    set: (key, value) => { data[key] = value },
  }
}

describe('FormEditorAdapter', () => {
  it('reads options and the default value', () => {
    const element = formElement({ 'properties.options': [{ _label: 'One', _value: 1 }], defaultValue: 1 })
    expect(readChoices(element)).toEqual({ options: [{ label: 'One', value: 1 }], defaultValue: 1 })
    expect(readChoices(formElement({})).options).toEqual([])
  })

  it('writes stored rows back as they are, each one only once', () => {
    const first = { _label: 'Same', _value: 'same', _orig__label: { hmac: 'first' } }
    const second = { _label: 'Same', _value: 'same', _orig__label: { hmac: 'second' } }
    const element = formElement({ 'properties.options': [first, second] })

    writeChoices(element, {
      options: [{ label: 'Same', value: 'same' }, { label: 'Same', value: 'same' }, { label: 'New', value: 5 }],
      defaultValue: 5,
    })

    const [writtenFirst, writtenSecond, writtenNew] = element.get('properties.options') as unknown[]
    expect(writtenFirst).toBe(first)
    expect(writtenSecond).toBe(second)
    expect(writtenNew).toEqual({ _label: 'New', _value: 5 })
    expect(element.get('defaultValue')).toBe(5)
  })

  it('accepts plain elements and jQuery objects', () => {
    const element = document.createElement('div')
    expect(toElement(element)).toBe(element)
    expect(toElement({ jquery: '3.7.1', get: () => element })).toBe(element)
  })
})
