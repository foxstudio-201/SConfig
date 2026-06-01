/**
 * Minecraft item texture disk cache (Electron main process)
 * Stored under: {userData}/minecraft-textures/{version}/
 */
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const VERSION = '1.21'
let cacheRoot = ''

function init(userDataPath) {
  cacheRoot = path.join(userDataPath, 'minecraft-textures', VERSION)
  fs.mkdirSync(cacheRoot, { recursive: true })
}

function safeKey(material) {
  return String(material || '').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')
}

function pngPath(material) {
  return path.join(cacheRoot, `${safeKey(material)}.png`)
}

function missPath(material) {
  return path.join(cacheRoot, `${safeKey(material)}.miss`)
}

function manifestFile() {
  return path.join(cacheRoot, 'manifest.json')
}

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(manifestFile(), 'utf8'))
  } catch {
    return { version: VERSION, updatedAt: null, items: {} }
  }
}

function saveManifest(data) {
  data.updatedAt = new Date().toISOString()
  fs.writeFileSync(manifestFile(), JSON.stringify(data, null, 2), 'utf8')
}

function textureSrc(material) {
  return `mc-texture://cache/${encodeURIComponent(safeKey(material))}`
}

function downloadUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    const req = lib.get(url, { headers: { 'User-Agent': 'SConfig/1.0 (Minecraft texture cache)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadUrl(res.headers.location).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`))
        res.resume()
        return
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    })
    req.on('error', reject)
    req.setTimeout(20000, () => {
      req.destroy()
      reject(new Error('timeout'))
    })
  })
}

function isPng(buf) {
  return buf && buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
}

async function ensure(material, urls = []) {
  const key = safeKey(material)
  if (!key) return { ok: false, error: 'invalid material' }

  const file = pngPath(key)
  if (fs.existsSync(file)) {
    return { ok: true, material: key, cached: true, src: textureSrc(key) }
  }

  const miss = missPath(key)
  if (fs.existsSync(miss)) {
    return { ok: false, miss: true, material: key }
  }

  const list = Array.isArray(urls) ? urls : []
  for (const url of list) {
    try {
      const buf = await downloadUrl(url)
      if (!isPng(buf)) continue
      fs.writeFileSync(file, buf)
      if (fs.existsSync(miss)) fs.unlinkSync(miss)
      const manifest = loadManifest()
      manifest.items[key] = {
        sourceUrl: url,
        cachedAt: new Date().toISOString(),
        size: buf.length,
      }
      saveManifest(manifest)
      return { ok: true, material: key, cached: false, src: textureSrc(key) }
    } catch {
      /* try next CDN URL */
    }
  }

  try {
    fs.writeFileSync(miss, new Date().toISOString(), 'utf8')
  } catch { /* ignore */ }

  return { ok: false, miss: true, material: key }
}

function resolveFileFromUrl(requestUrl) {
  try {
    const u = new URL(requestUrl)
    const material = decodeURIComponent(u.pathname.replace(/^\//, ''))
    const file = pngPath(material)
    if (!fs.existsSync(file)) return null
    return file
  } catch {
    return null
  }
}

function getInfo() {
  let count = 0
  let bytes = 0
  let misses = 0
  try {
    for (const name of fs.readdirSync(cacheRoot)) {
      const full = path.join(cacheRoot, name)
      if (name.endsWith('.png')) {
        count++
        bytes += fs.statSync(full).size
      } else if (name.endsWith('.miss')) {
        misses++
      }
    }
  } catch { /* ignore */ }
  return {
    version: VERSION,
    dir: cacheRoot,
    count,
    bytes,
    misses,
  }
}

function clearCache() {
  try {
    if (fs.existsSync(cacheRoot)) {
      fs.rmSync(cacheRoot, { recursive: true, force: true })
    }
    fs.mkdirSync(cacheRoot, { recursive: true })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

module.exports = {
  VERSION,
  init,
  ensure,
  resolveFileFromUrl,
  getInfo,
  clearCache,
  textureSrc,
}
