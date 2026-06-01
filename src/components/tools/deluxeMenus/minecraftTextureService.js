import { getMaterialTextureUrls } from './minecraftItemTexture'

const isElectron = typeof window !== 'undefined' && window.sconfigAPI?.mcTextureEnsure

/** Dedupe concurrent ensure calls only — no image data stored */
const inflight = new Map()

/**
 * Resolve img src for a material.
 * Electron: disk cache in userData + mc-texture:// protocol (no RAM blob cache).
 * Browser dev: first CDN URL (browser HTTP cache).
 */
export async function ensureMaterialTextureSrc(material) {
  const key = String(material || '').trim().toUpperCase()
  if (!key) return null

  if (isElectron) {
    if (inflight.has(key)) return inflight.get(key)
    const task = window.sconfigAPI
      .mcTextureEnsure({ material: key, urls: getMaterialTextureUrls(key) })
      .then(res => (res?.ok && res.src ? res.src : null))
      .finally(() => inflight.delete(key))
    inflight.set(key, task)
    return task
  }

  const urls = getMaterialTextureUrls(key)
  return urls[0] || null
}

/** Browser-only: next CDN fallback when img onError */
export function getCdnFallbackSrc(material, triedIndex = 0) {
  const urls = getMaterialTextureUrls(material)
  return urls[triedIndex + 1] || null
}

export function isDiskTextureCache() {
  return Boolean(isElectron)
}
