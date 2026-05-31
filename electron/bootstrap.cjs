const fs = require('fs')

const path = require('path')



const UPDATE_REPO = process.env.SCONFIG_UPDATE_REPO || 'FoxStudio/Sconfig'

const UPDATE_TIMEOUT_MS = 8000



function sleep(ms) {

  return new Promise(resolve => setTimeout(resolve, ms))

}



function parseVersion(v) {

  return String(v || '0').replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0)

}



function compareVersions(a, b) {

  const pa = parseVersion(a)

  const pb = parseVersion(b)

  const len = Math.max(pa.length, pb.length)

  for (let i = 0; i < len; i++) {

    const diff = (pa[i] || 0) - (pb[i] || 0)

    if (diff !== 0) return diff

  }

  return 0

}



async function checkForUpdates(currentVersion) {

  const controller = new AbortController()

  const timer = setTimeout(() => controller.abort(), UPDATE_TIMEOUT_MS)

  try {

    const res = await fetch(`https://api.github.com/repos/${UPDATE_REPO}/releases/latest`, {

      signal: controller.signal,

      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'SConfig-Bootstrap' },

    })

    if (!res.ok) {

      return { status: 'skipped', message: 'Release feed unavailable', currentVersion }

    }

    const data = await res.json()

    const latest = String(data.tag_name || '').replace(/^v/i, '')

    if (latest && compareVersions(latest, currentVersion) > 0) {

      return {

        status: 'available',

        currentVersion,

        latestVersion: latest,

        url: data.html_url || null,

        message: `Update v${latest} available`,

      }

    }

    return { status: 'current', currentVersion, latestVersion: latest || currentVersion, message: 'You are up to date' }

  } catch {

    return { status: 'offline', currentVersion, message: 'Update check skipped (offline)' }

  } finally {

    clearTimeout(timer)

  }

}



function ensureUserData(userDataPath) {

  fs.mkdirSync(userDataPath, { recursive: true })

  const probe = path.join(userDataPath, '.write-test')

  fs.writeFileSync(probe, 'ok', 'utf-8')

  fs.unlinkSync(probe)

}



function loadStoreData(configPath) {

  try {

    const raw = fs.readFileSync(configPath, 'utf-8')

    return JSON.parse(raw)

  } catch {

    return {}

  }

}



async function runBootstrap({ app, configPath, userDataPath, version, sendProgress }) {

  let progress = 0

  const bump = (amount, labelKey, extra = {}) => {

    progress = Math.min(100, progress + amount)

    sendProgress({ progress, labelKey, ...extra })

  }



  bump(8, 'bootstrap.init')

  ensureUserData(userDataPath)

  await sleep(120)



  bump(18, 'bootstrap.loadingConfig')

  const store = loadStoreData(configPath)

  const storeKeys = Object.keys(store).length

  await sleep(100)



  bump(22, 'bootstrap.loadingServers')

  const servers = Array.isArray(store.servers) ? store.servers : []

  const plugins = Array.isArray(store.plugins) ? store.plugins : []

  const hasAi = !!store.aiConfig

  await sleep(120)



  bump(24, 'bootstrap.checkingUpdates')

  const updateInfo = await checkForUpdates(version)

  const updateLabelKey = updateInfo.status === 'available'

    ? 'bootstrap.updateFound'

    : updateInfo.status === 'current'

      ? 'bootstrap.latestVersion'

      : 'bootstrap.updateCheckDone'

  const labelVars = updateInfo.status === 'available'

    ? { version: updateInfo.latestVersion }

    : undefined

  bump(10, updateLabelKey, { updateInfo, labelVars })

  await sleep(160)



  bump(18, 'bootstrap.preparingUi')

  await sleep(140)



  sendProgress({ progress: 100, labelKey: 'bootstrap.ready', updateInfo, done: true })



  return {

    ok: true,

    version,

    storeKeys,

    servers: servers.length,

    plugins: plugins.length,

    hasAi,

    updateInfo,

  }

}



module.exports = { runBootstrap, checkForUpdates }

