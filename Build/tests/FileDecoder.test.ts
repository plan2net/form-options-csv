import { describe, expect, it } from 'vitest'
import { decodeFile } from '@/FileDecoder'

describe('decodeFile', () => {
  it('drops the byte order mark of a UTF-8 file', () => {
    expect(decodeFile(new Uint8Array([0xef, 0xbb, 0xbf, 0xc3, 0x84, 0x3b, 0x31]))).toBe('Ä;1')
  })

  it('reads UTF-16 files from the Excel "Unicode Text" export', () => {
    expect(decodeFile(new Uint8Array([0xff, 0xfe, 0xc4, 0x00, 0x09, 0x00, 0x31, 0x00]))).toBe('Ä\t1')
    expect(decodeFile(new Uint8Array([0xfe, 0xff, 0x00, 0xc4, 0x00, 0x09, 0x00, 0x31]))).toBe('Ä\t1')
  })

  it('returns an empty text for a file with only a byte order mark', () => {
    expect(decodeFile(new Uint8Array([0xef, 0xbb, 0xbf]).buffer)).toBe('')
  })

  it('reads a file that is not valid UTF-8 as windows-1252', () => {
    expect(decodeFile(new Uint8Array([0xc4, 0x3b, 0x80]))).toBe('Ä;€')
  })
})
