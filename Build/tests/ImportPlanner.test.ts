import { describe, expect, it } from 'vitest'
import { planImport } from '@/ImportPlanner'
import type { Choices, ImportRow, OptionValue } from '@/types'

const row = (value: OptionValue, isDefault = false): ImportRow => ({ label: `Label ${value}`, value, isDefault })
const options = (...values: OptionValue[]) => values.map(value => ({ label: `Label ${value}`, value }))
const choices = (values: OptionValue[], defaultValue: unknown): Choices => ({ options: options(...values), defaultValue })

const addSingle = { replace: false, singleValue: true }
const addMulti = { replace: false, singleValue: false }
const replaceSingle = { replace: true, singleValue: true }
const replaceMulti = { replace: true, singleValue: false }

describe('planImport', () => {
  describe('options', () => {
    it('puts the pasted rows below the existing options when adding', () => {
      const plan = planImport([row('new')], choices(['old'], ''), addSingle)
      expect(plan.options).toEqual(options('old', 'new'))
      expect(plan.importedCount).toBe(1)
    })

    it('drops the existing options when replacing', () => {
      expect(planImport([row('new')], choices(['old'], ''), replaceSingle).options).toEqual(options('new'))
    })

    it('keeps the options when adding nothing and empties them when replacing with nothing', () => {
      expect(planImport([], choices(['a'], ''), addSingle).options).toEqual(options('a'))
      expect(planImport([], choices(['a'], ''), replaceSingle).options).toEqual([])
      expect(planImport([], choices(['a'], ''), replaceSingle).importedCount).toBe(0)
    })

    it('skips rows without label, existing values and repeated values with a reason', () => {
      const rows: ImportRow[] = [
        { label: ' ', value: 'blank', isDefault: false, skipReason: 'noLabel' },
        { label: 'Again old', value: 'old', isDefault: false },
        { label: 'Five', value: '5', isDefault: false },
        { label: 'X', value: 'x', isDefault: false },
        { label: 'X again', value: 'x', isDefault: false },
      ]
      const plan = planImport(rows, { options: [{ label: 'Old', value: 'old' }, { label: 'Number', value: 5 }], defaultValue: '' }, addSingle)
      expect(plan.preview.map(previewRow => previewRow.skipReason ?? null)).toEqual(['noLabel', 'valueExists', 'valueExists', null, 'valueRepeated'])
      expect(plan.options.map(option => option.value)).toEqual(['old', 5, 'x'])
      expect(plan.importedCount).toBe(1)
    })

    it('treats numbers and number-like text as the same value', () => {
      const plan = planImport([row(5), row('5')], choices([], ''), replaceSingle)
      expect(plan.preview.map(previewRow => previewRow.skipReason ?? null)).toEqual([null, 'valueRepeated'])
      expect(planImport([], { options: [{ label: 'Five', value: '5' }], defaultValue: 5 }, addSingle).defaultValue).toBe(5)
    })

    it('does not let a row without label block a later row with the same value', () => {
      const plan = planImport([{ ...row('a'), skipReason: 'noLabel' }, row('a')], choices([], ''), addSingle)
      expect(plan.preview.map(previewRow => previewRow.skipReason ?? null)).toEqual(['noLabel', null])
    })
  })

  describe('defaults of single value elements', () => {
    it('replaces the current default with the first pasted one and notes later marks', () => {
      const plan = planImport([row('b', true), row('c', true)], choices(['a'], 'a'), addSingle)
      expect(plan.defaultValue).toBe('b')
      expect(plan.preview.map(previewRow => previewRow.note ?? null)).toEqual([null, 'onlyOneDefault'])
      expect(plan.importedCount).toBe(2)
    })

    it('keeps the current default when nothing is marked', () => {
      expect(planImport([row('b')], choices(['a'], 'a'), addSingle).defaultValue).toBe('a')
    })

    it('keeps the current default when replacing only if its value is still there', () => {
      expect(planImport([row('a'), row('b')], choices(['a'], 'a'), replaceSingle).defaultValue).toBe('a')
      expect(planImport([row('b')], choices(['a'], 'a'), replaceSingle).defaultValue).toBe('')
    })

    it('uses the first pasted default when replacing', () => {
      expect(planImport([row('b'), row('c', true)], choices(['a'], 'a'), replaceSingle).defaultValue).toBe('c')
    })

    it('never makes a skipped row the default and gives it no note', () => {
      expect(planImport([row('a', true), row('b')], choices(['a'], ''), addSingle).defaultValue).toBe('')
      const plan = planImport([row('a', true), row('b', true)], choices(['a'], ''), addSingle)
      expect(plan.preview.map(previewRow => previewRow.note ?? null)).toEqual([null, null])
      expect(plan.defaultValue).toBe('b')
    })
  })

  describe('defaults of multi value elements', () => {
    it('adds pasted defaults to the current ones', () => {
      expect(planImport([row('b', true), row('c')], choices(['a'], ['a']), addMulti).defaultValue).toEqual(['a', 'b'])
    })

    it('keeps only the pasted defaults when replacing with marks', () => {
      expect(planImport([row('b', true), row('c', true)], choices(['a'], ['a']), replaceMulti).defaultValue).toEqual(['b', 'c'])
    })

    it('keeps current defaults whose values are still there when replacing without marks', () => {
      expect(planImport([row('b'), row('c')], choices(['a', 'b'], ['a', 'b']), replaceMulti).defaultValue).toEqual(['b'])
    })

    it('never makes a skipped marked row a default', () => {
      const rows = [row('a', true), { ...row('x', true), skipReason: 'noLabel' as const }, row('b')]
      expect(planImport(rows, choices(['a'], []), addMulti).defaultValue).toEqual([])
    })
  })

  describe('current defaults', () => {
    it('drops a default whose option no longer exists', () => {
      expect(planImport([row('b')], choices(['a'], 'gone'), addSingle).defaultValue).toBe('')
      expect(planImport([row('b')], choices(['a'], ['gone', 'a']), addMulti).defaultValue).toEqual(['a'])
    })

    it('handles missing or wrongly shaped current defaults', () => {
      expect(planImport([], choices(['a'], undefined), addSingle).defaultValue).toBe('')
      expect(planImport([], choices(['a'], null), addSingle).defaultValue).toBe('')
      expect(planImport([], choices(['a'], []), addMulti).defaultValue).toEqual([])
      expect(planImport([], choices(['a'], 'a'), addMulti).defaultValue).toEqual(['a'])
      expect(planImport([], choices(['a'], ['a']), addSingle).defaultValue).toBe('a')
    })
  })
})
