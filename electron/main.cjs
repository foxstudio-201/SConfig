const { app, BrowserWindow, ipcMain, dialog, shell, session, Tray, Menu, nativeImage, protocol, net } = require('electron')
const path = require('path')
const fs = require('fs')
const { pathToFileURL } = require('url')
const { runBootstrap, checkForUpdates } = require('./bootstrap.cjs')
const bedrockPipeline = require('./bedrockPipeline.cjs')
const textureCache = require('./textureCache.cjs')

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'mc-texture',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
])

const pkg = require('../package.json')

const isDev = process.env.NODE_ENV === 'development'

// ── Allowed external origins for AI API calls ─────────────────────────────────
const AI_ORIGINS = [
  'https://api.openai.com',
  'https://generativelanguage.googleapis.com',
  'https://openrouter.ai',
]

let mainWindow
let updateWindow = null
let tray = null
let appIsQuitting = false

const ICON_PATH = path.join(__dirname, '../public/icon.ico')

function resolveTrayIcon() {
  try {
    if (fs.existsSync(ICON_PATH)) return nativeImage.createFromPath(ICON_PATH)
  } catch { /* ignore */ }
  return nativeImage.createEmpty()
}

function trayLabels() {
  const store = loadStore()
  const locale = store.appLanguage === 'vi' ? 'vi' : 'en'
  const map = {
    en: { open: 'Open SConfig', check: 'Check for updates', quit: 'Quit' },
    vi: { open: 'Mở SConfig', check: 'Kiểm tra cập nhật', quit: 'Thoát' },
  }
  return map[locale]
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow()
    return
  }
  if (!mainWindow.isVisible()) mainWindow.show()
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.focus()
}

function createUpdateWindow() {
  if (updateWindow && !updateWindow.isDestroyed()) {
    updateWindow.show()
    updateWindow.focus()
    return
  }

  updateWindow = new BrowserWindow({
    width: 400,
    height: 520,
    minWidth: 360,
    minHeight: 480,
    resizable: true,
    maximizable: false,
    minimizable: true,
    fullscreenable: false,
    frame: false,
    transparent: true,
    title: 'SConfig — Updates',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: ICON_PATH,
    show: false,
  })

  if (isDev) {
    updateWindow.loadURL('http://localhost:5174/update.html')
  } else {
    updateWindow.loadFile(path.join(__dirname, '../dist/update.html'))
  }

  updateWindow.once('ready-to-show', () => {
    if (updateWindow && !updateWindow.isDestroyed()) updateWindow.show()
  })

  updateWindow.on('closed', () => {
    updateWindow = null
  })
}

function buildTrayMenu() {
  const labels = trayLabels()
  return Menu.buildFromTemplate([
    { label: labels.open, click: () => showMainWindow() },
    { label: labels.check, click: () => createUpdateWindow() },
    { type: 'separator' },
    {
      label: labels.quit,
      click: () => {
        appIsQuitting = true
        app.quit()
      },
    },
  ])
}

function createTray() {
  if (tray) return
  tray = new Tray(resolveTrayIcon())
  tray.setToolTip('SConfig')
  tray.setContextMenu(buildTrayMenu())
  tray.on('double-click', () => showMainWindow())
}

function refreshTrayMenu() {
  if (tray) tray.setContextMenu(buildTrayMenu())
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: ICON_PATH,
    show: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5174')
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show()
  })

  mainWindow.on('close', (e) => {
    if (!appIsQuitting && tray) {
      e.preventDefault()
      mainWindow.hide()
    }
  })
}

app.whenReady().then(() => {
  textureCache.init(app.getPath('userData'))

  protocol.handle('mc-texture', async (request) => {
    const filePath = textureCache.resolveFileFromUrl(request.url)
    if (!filePath) return new Response(null, { status: 404 })
    try {
      return net.fetch(pathToFileURL(filePath).href)
    } catch {
      return new Response(null, { status: 500 })
    }
  })

  // ── CSP: allow AI API endpoints, block everything else external ─────────────
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: mc-texture: https://assets.mcasset.cloud https://cdn.jsdelivr.net",
            "font-src 'self' data:",
            "worker-src 'self' blob:",
            `connect-src 'self' ${AI_ORIGINS.join(' ')}`,
          ].join('; '),
        ],
      },
    })
  })

  createTray()
  createWindow()
})

app.on('before-quit', () => {
  appIsQuitting = true
})

app.on('window-all-closed', () => {
  // Keep running in tray when main/update windows are closed
  if (appIsQuitting) app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// ── Window controls ──────────────────────────────────────────────────────────
ipcMain.on('minimize-window', () => mainWindow?.minimize())
ipcMain.on('maximize-window', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('close-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close()
})

ipcMain.on('minimize-update-window', () => {
  if (updateWindow && !updateWindow.isDestroyed()) updateWindow.minimize()
})

ipcMain.on('close-update-window', () => {
  if (updateWindow && !updateWindow.isDestroyed()) updateWindow.close()
})

ipcMain.on('open-update-window', () => createUpdateWindow())

ipcMain.handle('check-app-updates', async () => checkForUpdates(pkg.version))

ipcMain.handle('open-external', async (_, url) => {
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
    await shell.openExternal(url)
    return true
  }
  return false
})

// ── Download installer & auto-run ─────────────────────────────────────────────
ipcMain.handle('download-installer', async (_, { url, fileName }) => {
  if (!url || !/^https?:\/\//i.test(url)) {
    return { ok: false, error: 'Invalid URL' }
  }

  const os = require('os')
  const destPath = path.join(os.tmpdir(), fileName || 'SConfig-Setup.exe')

  try {
    // Stream download via Electron net module
    const response = await net.fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const totalBytes = parseInt(response.headers.get('content-length') || '0', 10)
    let downloaded = 0
    const chunks = []

    const reader = response.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      downloaded += value.length
      // Send progress to update window
      if (updateWindow && !updateWindow.isDestroyed()) {
        updateWindow.webContents.send('download-progress', {
          downloaded,
          total: totalBytes,
          percent: totalBytes > 0 ? Math.round((downloaded / totalBytes) * 100) : -1,
        })
      }
    }

    // Write to temp file
    const buffer = Buffer.concat(chunks.map(c => Buffer.from(c)))
    fs.writeFileSync(destPath, buffer)

    return { ok: true, path: destPath }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('run-installer', async (_, filePath) => {
  try {
    const { spawn } = require('child_process')
    if (process.platform === 'win32') {
      // Run NSIS installer — /S for silent is optional, omit so user sees installer UI
      spawn(filePath, [], { detached: true, stdio: 'ignore' }).unref()
    } else if (process.platform === 'linux') {
      // Make AppImage executable then run
      fs.chmodSync(filePath, 0o755)
      spawn(filePath, [], { detached: true, stdio: 'ignore' }).unref()
    }
    // Quit app so installer can replace files
    setTimeout(() => app.quit(), 500)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// ── File system helpers ───────────────────────────────────────────────────────
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Server Folder',
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('select-file', async (_, filters) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters || [{ name: 'All Files', extensions: ['*'] }],
    title: 'Select File',
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('read-file', async (_, filePath) => {
  try {
    return { ok: true, data: fs.readFileSync(filePath, 'utf-8') }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('write-file', async (_, filePath, content) => {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, content, 'utf-8')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('list-dir', async (_, dirPath) => {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    return {
      ok: true,
      entries: entries.map(e => ({
        name: e.name,
        isDir: e.isDirectory(),
        path: path.join(dirPath, e.name),
      })),
    }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

const SKIP_DIR_NAMES = new Set(['node_modules', '.git', '.svn', '__pycache__'])

function walkDir(dirPath, basePath, files, limit) {
  if (files.length >= limit) return
  let entries
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    if (files.length >= limit) break
    const full = path.join(dirPath, e.name)
    if (e.isDirectory()) {
      if (SKIP_DIR_NAMES.has(e.name)) continue
      walkDir(full, basePath, files, limit)
    } else {
      files.push({
        name: e.name,
        path: full,
        rel: path.relative(basePath, full).replace(/\\/g, '/'),
      })
    }
  }
}

ipcMain.handle('list-dir-recursive', async (_, dirPath, maxFiles = 25000) => {
  try {
    const limit = Math.min(Math.max(Number(maxFiles) || 25000, 100), 50000)
    const files = []
    walkDir(dirPath, dirPath, files, limit)
    return { ok: true, files, truncated: files.length >= limit }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('read-file-binary', async (_, filePath) => {
  try {
    const buf = fs.readFileSync(filePath)
    return { ok: true, data: buf.toString('base64'), size: buf.length }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('write-file-binary', async (_, filePath, base64) => {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('save-file-dialog', async (_, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save file',
    defaultPath: defaultName || 'geyser_export.zip',
    filters: [
      { name: 'ZIP export bundle', extensions: ['zip'] },
      { name: 'Minecraft Pack', extensions: ['mcpack', 'mcaddon'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })
  return result.canceled ? null : result.filePath
})

ipcMain.handle('open-in-explorer', async (_, filePath) => {
  shell.showItemInFolder(filePath)
})

// ── Config store (simple JSON) ────────────────────────────────────────────────
const configPath = path.join(app.getPath('userData'), 'sconfig-data.json')

function loadStore() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch {
    return {}
  }
}

function saveStore(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8')
}

ipcMain.handle('store-get', async (_, key) => {
  const store = loadStore()
  return store[key] ?? null
})

ipcMain.handle('store-set', async (_, key, value) => {
  const store = loadStore()
  store[key] = value
  saveStore(store)
  if (key === 'appLanguage') refreshTrayMenu()
  return true
})

ipcMain.handle('get-app-info', async () => ({
  version: pkg.version,
  name: pkg.productName || pkg.name,
  description: pkg.description,
  author: pkg.author,
}))

ipcMain.handle('start-bootstrap', async (event) => {
  const sendProgress = (data) => {
    if (!event.sender.isDestroyed()) event.sender.send('bootstrap-progress', data)
  }
  return runBootstrap({
    app,
    configPath,
    userDataPath: app.getPath('userData'),
    version: pkg.version,
    sendProgress,
  })
})

ipcMain.handle('mc-texture-ensure', async (_, { material, urls }) => {
  return textureCache.ensure(material, urls)
})

ipcMain.handle('mc-texture-cache-info', async () => textureCache.getInfo())

ipcMain.handle('mc-texture-clear-cache', async () => textureCache.clearCache())

ipcMain.handle('bedrock-check-tools', async () => {
  return bedrockPipeline.checkTools(app.getPath('userData'))
})

ipcMain.handle('bedrock-install-converter', async (event, key) => {
  const send = msg => {
    if (!event.sender.isDestroyed()) event.sender.send('bedrock-pipeline-log', { msg })
  }
  return bedrockPipeline.ensureConverter(key, app.getPath('userData'), send)
})

ipcMain.handle('bedrock-run-external', async (event, { rootPath, flags }) => {
  const logs = []
  const onLog = msg => {
    logs.push(msg)
    if (!event.sender.isDestroyed()) event.sender.send('bedrock-pipeline-log', { msg })
  }
  try {
    const result = await bedrockPipeline.runFullExternalPipeline({
      rootPath,
      userDataPath: app.getPath('userData'),
      flags: flags || {},
      onLog,
    })
    return { ok: true, ...result, logs }
  } catch (e) {
    return { ok: false, error: e.message, logs }
  }
})

ipcMain.handle('bedrock-open-github-issue', async () => {
  const url = 'https://github.com/Kas-tle/java2bedrock.sh/issues/new?labels=conversion&template=pack-conversion.yml&title=%5BPack%5D%3A+'
  await shell.openExternal(url)
  return true
})

ipcMain.handle('luckperms-request', async (_, { baseUrl, apiKey, method, path, body }) => {
  try {
    const url = `${String(baseUrl || '').replace(/\/$/, '')}${path}`
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' }
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`
    const res = await fetch(url, {
      method: method || 'GET',
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    let data = null
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    return {
      ok: res.ok,
      status: res.status,
      data,
      error: res.ok ? null : (typeof data === 'object' && data?.message ? data.message : text || res.statusText),
    }
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e.message }
  }
})
