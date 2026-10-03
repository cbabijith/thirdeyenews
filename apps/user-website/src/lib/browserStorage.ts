export function readStorage(storage: 'localStorage' | 'sessionStorage', key: string): string | null {
  try { return typeof window === 'undefined' ? null : window[storage].getItem(key) } catch { return null }
}

export function writeStorage(storage: 'localStorage' | 'sessionStorage', key: string, value: string): void {
  try { if (typeof window !== 'undefined') window[storage].setItem(key, value) } catch { /* Reading remains available when storage is blocked. */ }
}
