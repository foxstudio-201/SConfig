/**
 * Bedrock conversion — external tool runner (java2bedrock, ItemsAdder Bedrock CLI).
 * SConfig internal engine runs in renderer; this module handles git/node/bash tooling.
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

const CONVERTERS = {
  java2bedrock: {
    repo: 'https://github.com/Kas-tle/java2bedrock.sh.git',
    dir: 'java2bedrock.sh',
  },
  iaBedrock: {
    repo: 'https://github.com/EaseCation/itemsadder-bedrock-convertor.git',
    dir: 'itemsadder-bedrock-convertor',
  },
}

function convertersRoot(userDataPath) {
  return path.join(userDataPath, 'converters')
}

function runCmd(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, {
      cwd: opts.cwd,
      shell: opts.shell ?? false,
      env: { ...process.env, ...opts.env },
    })
    let stdout = ''
    let stderr = ''
    proc.stdout?.on('data', d => { stdout += d.toString() })
    proc.stderr?.on('data', d => { stderr += d.toString() })
    proc.on('close', code => resolve({ code, stdout, stderr }))
    proc.on('error', err => resolve({ code: -1, stdout, stderr: err.message }))
  })
}

function findGitBash() {
  if (process.platform !== 'win32') return '/bin/bash'
  const candidates = [
    'C:\\Program Files\\Git\\bin\\bash.exe',
    'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
  ]
  return candidates.find(p => fs.existsSync(p)) || null
}

async function gitClone(repoUrl, dest, onLog) {
  if (fs.existsSync(path.join(dest, '.git'))) {
    onLog?.('Repository exists, pulling…')
    return runCmd('git', ['-C', dest, 'pull', '--ff-only'])
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  onLog?.(`Cloning ${repoUrl}…`)
  return runCmd('git', ['clone', '--depth', '1', repoUrl, dest])
}

async function ensureConverter(key, userDataPath, onLog) {
  const meta = CONVERTERS[key]
  if (!meta) return { ok: false, error: 'Unknown converter' }
  const dest = path.join(convertersRoot(userDataPath), meta.dir)
  const git = await runCmd('git', ['--version'])
  if (git.code !== 0) return { ok: false, error: 'Git is required to install converters.' }
  const clone = await gitClone(meta.repo, dest, onLog)
  if (clone.code !== 0) return { ok: false, error: clone.stderr || 'Git clone failed', path: dest }
  return { ok: true, path: dest }
}

async function checkTools(userDataPath) {
  const root = convertersRoot(userDataPath)
  const gitBash = findGitBash()
  const node = await runCmd('node', ['--version'])
  const git = await runCmd('git', ['--version'])
  return {
    node: node.code === 0 ? node.stdout.trim() : null,
    git: git.code === 0 ? git.stdout.trim() : null,
    bash: gitBash || (process.platform !== 'win32' ? '/bin/bash' : null),
    converters: {
      java2bedrock: fs.existsSync(path.join(root, CONVERTERS.java2bedrock.dir)),
      iaBedrock: fs.existsSync(path.join(root, CONVERTERS.iaBedrock.dir)),
    },
  }
}

async function zipDirectory(sourceDir, zipPath) {
  if (process.platform === 'win32') {
    const ps = `Compress-Archive -Path "${sourceDir.replace(/"/g, '`"')}\\*" -DestinationPath "${zipPath.replace(/"/g, '`"')}" -Force`
    return runCmd('powershell', ['-NoProfile', '-Command', ps], { shell: true })
  }
  return runCmd('zip', ['-r', zipPath, '.'], { cwd: sourceDir })
}

async function runJava2Bedrock({ inputZip, workDir, userDataPath, onLog }) {
  const ensured = await ensureConverter('java2bedrock', userDataPath, onLog)
  if (!ensured.ok) return ensured

  const bash = findGitBash()
  if (!bash) {
    return {
      ok: false,
      error: 'bash not found (install Git for Windows). Use GitHub Actions: java2bedrock issue template.',
      issueUrl: 'https://github.com/Kas-tle/java2bedrock.sh/issues/new?labels=conversion&template=pack-conversion.yml',
    }
  }

  const script = path.join(ensured.path, 'converter.sh')
  if (!fs.existsSync(script)) return { ok: false, error: 'converter.sh not found in cloned repo' }

  fs.mkdirSync(workDir, { recursive: true })
  const packName = path.basename(inputZip)
  const destPack = path.join(workDir, packName)
  fs.copyFileSync(inputZip, destPack)

  onLog?.('Running java2bedrock.sh (may take several minutes)…')
  const res = await runCmd(bash, [script, packName], { cwd: workDir })
  onLog?.(res.stdout?.slice(-2000) || '')
  if (res.code !== 0) {
    return { ok: false, error: res.stderr || 'java2bedrock failed', stdout: res.stdout }
  }

  const outDir = workDir
  const outputs = fs.readdirSync(outDir).filter(n => n.endsWith('.zip') || n.endsWith('.mcpack'))
  return { ok: true, outputDir: outDir, outputs }
}

async function runIABedrock({ inputPath, outputDir, userDataPath, namespace, onLog }) {
  const ensured = await ensureConverter('iaBedrock', userDataPath, onLog)
  if (!ensured.ok) return ensured

  const distIndex = path.join(ensured.path, 'dist', 'index.js')
  if (!fs.existsSync(distIndex)) {
    onLog?.('Building ItemsAdder Bedrock converter (npm install + build)…')
    let res = await runCmd('npm', ['install'], { cwd: ensured.path, shell: true })
    if (res.code !== 0) return { ok: false, error: res.stderr || 'npm install failed' }
    res = await runCmd('npm', ['run', 'build'], { cwd: ensured.path, shell: true })
    if (res.code !== 0) return { ok: false, error: res.stderr || 'npm run build failed' }
  }

  fs.mkdirSync(outputDir, { recursive: true })
  const resPath = path.join(outputDir, 'resource')
  const behPath = path.join(outputDir, 'behavior')
  const ns = namespace || 'sconfig'

  const args = [
    distIndex,
    '--input-path', inputPath,
    '--namespace', ns,
    '--output-resource', resPath,
    '--output-behavior', behPath,
    '--zip-output-resource', path.join(outputDir, 'resource_pack.zip'),
    '--zip-output-behavior', path.join(outputDir, 'behavior_pack.zip'),
    '--furniture-force-entity=true',
    '--furniture-production=true',
  ]

  onLog?.('Running ItemsAdder → Bedrock CLI…')
  const res = await runCmd('node', args, { cwd: ensured.path })
  onLog?.(res.stdout?.slice(-1500) || '')
  if (res.code !== 0) return { ok: false, error: res.stderr || 'IA converter failed' }

  return { ok: true, outputDir, resourceZip: path.join(outputDir, 'resource_pack.zip'), behaviorZip: path.join(outputDir, 'behavior_pack.zip') }
}

/**
 * Prepare Java RP zip from folder for java2bedrock
 */
function findResourcePackRoot(rootPath) {
  const candidates = [
    path.join(rootPath, 'plugins', 'Oraxen', 'pack'),
    path.join(rootPath, 'plugins', 'ItemsAdder', 'data', 'resource_pack'),
    rootPath,
  ]
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'pack.mcmeta')) || fs.existsSync(path.join(c, 'assets'))) return c
  }
  return rootPath
}

async function prepareJavaPackZip(rootPath, workDir, onLog) {
  fs.mkdirSync(workDir, { recursive: true })
  const rpRoot = findResourcePackRoot(rootPath)
  const zipPath = path.join(workDir, 'java_input.zip')

  if (process.platform === 'win32') {
    const ps = `Compress-Archive -Path "${rpRoot.replace(/"/g, '`"')}\\*" -DestinationPath "${zipPath.replace(/"/g, '`"')}" -Force`
    const res = await runCmd('powershell', ['-NoProfile', '-Command', ps], { shell: true })
    if (res.code !== 0) return { ok: false, error: 'Failed to zip Java pack' }
  } else {
    const res = await runCmd('zip', ['-r', zipPath, '.'], { cwd: rpRoot })
    if (res.code !== 0) return { ok: false, error: 'Failed to zip Java pack' }
  }
  onLog?.(`Java pack zipped: ${zipPath}`)
  return { ok: true, zipPath, rpRoot }
}

async function runFullExternalPipeline({ rootPath, userDataPath, flags, onLog }) {
  const workDir = path.join(os.tmpdir(), `sconfig-bedrock-${Date.now()}`)
  fs.mkdirSync(workDir, { recursive: true })
  const results = { workDir, java2bedrock: null, iaBedrock: null }

  if (flags.runIABedrock) {
    let iaInput = rootPath
    const contents = path.join(rootPath, 'plugins', 'ItemsAdder', 'contents')
    if (fs.existsSync(contents)) iaInput = contents
    results.iaBedrock = await runIABedrock({
      inputPath: iaInput,
      outputDir: path.join(workDir, 'ia-out'),
      userDataPath,
      namespace: flags.namespace || 'sconfig',
      onLog,
    })
  }

  if (flags.runJava2Bedrock) {
    const zipPrep = await prepareJavaPackZip(rootPath, path.join(workDir, 'j2b-in'), onLog)
    if (!zipPrep.ok) results.java2bedrock = zipPrep
    else {
      results.java2bedrock = await runJava2Bedrock({
        inputZip: zipPrep.zipPath,
        workDir: path.join(workDir, 'j2b-out'),
        userDataPath,
        onLog,
      })
    }
  }

  return { ok: true, results }
}

module.exports = {
  checkTools,
  ensureConverter,
  runJava2Bedrock,
  runIABedrock,
  runFullExternalPipeline,
  findGitBash,
  CONVERTERS,
}
