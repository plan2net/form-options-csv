import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadHasHeader, saveHasHeader } from '@/ImportSettings'

describe('ImportSettings', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('remembers the header switch', () => {
    expect(loadHasHeader()).toBe(false)
    saveHasHeader(true)
    expect(loadHasHeader()).toBe(true)
  })

  it('treats broken stored settings as not set', () => {
    for (const stored of ['not json', 'null', '"text"', '{"hasHeader":"yes"}']) {
      localStorage.setItem('form-options-csv:settings', stored)
      expect(loadHasHeader()).toBe(false)
    }
  })

  it('keeps working when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    expect(() => saveHasHeader(true)).not.toThrow()
    expect(loadHasHeader()).toBe(false)
  })
})
