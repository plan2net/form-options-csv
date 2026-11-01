export function decodeFile(bytes: ArrayBuffer | Uint8Array): string {
  const data = new Uint8Array(bytes)
  if (data[0] === 0xff && data[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(data)
  }
  if (data[0] === 0xfe && data[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(data)
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(data)
  } catch {
    return new TextDecoder('windows-1252').decode(data)
  }
}
