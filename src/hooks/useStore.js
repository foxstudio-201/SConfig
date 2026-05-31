// Simple wrapper around the Electron store IPC
const isElectron = typeof window !== 'undefined' && window.sconfigAPI

export async function storeGet(key, fallback = null) {
  if (!isElectron) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
  }
  const val = await window.sconfigAPI.storeGet(key)
  return val ?? fallback
}

export async function storeSet(key, value) {
  if (!isElectron) {
    localStorage.setItem(key, JSON.stringify(value))
    return
  }
  await window.sconfigAPI.storeSet(key, value)
}
