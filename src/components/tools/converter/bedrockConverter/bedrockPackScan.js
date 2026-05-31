/**
 * Scan server folder / resource pack for ItemsAdder, Oraxen, Nova, Java RP assets.
 */

function norm(p) {
  return String(p || '').replace(/\\/g, '/').toLowerCase()
}

export function detectSourceType(rootPath, files) {
  const rels = files.map(f => norm(f.rel))
  const has = marker => rels.some(r => r.includes(marker))

  if (has('plugins/itemsadder/contents') || has('itemsadder/contents')) return 'itemsadder'
  if (has('plugins/oraxen/pack') || has('oraxen/pack')) return 'oraxen'
  if (files.some(f => norm(f.rel) === 'pack.mcmeta')) return 'java_rp'
  if (rels.some(r => r.includes('/assets/') && (r.endsWith('.png') || r.endsWith('.json')))) {
    if (has('src/main/resources/assets')) return 'nova'
    if (rels.some(r => r.includes('/textures/'))) return 'java_rp'
  }
  return 'unknown'
}

function parseItemsAdderYaml(text) {
  const items = []
  let namespace = null
  const nsMatch = text.match(/^\s*namespace:\s*['"]?([a-z0-9_-]+)/im)
  if (nsMatch) namespace = nsMatch[1]

  const infoNs = text.match(/info:\s*[\s\S]*?namespace:\s*['"]?([a-z0-9_-]+)/i)
  if (infoNs) namespace = infoNs[1]

  const itemsIdx = text.search(/^\s*items:\s*$/im)
  if (itemsIdx >= 0) {
    const block = text.slice(itemsIdx)
    const lines = block.split('\n')
    for (let i = 1; i < lines.length; i += 1) {
      const line = lines[i]
      if (/^\S/.test(line) && !/^\s*#/.test(line)) break
      const m = line.match(/^\s{2,}([a-z0-9_-]+):\s*$/)
      if (m) items.push({ id: m[1], namespace })
    }
  }
  return { namespace, items }
}

function parseOraxenItemYaml(text, fileName) {
  const items = []
  const lines = text.split('\n')
  for (const line of lines) {
    const m = line.match(/^([a-z0-9_-]+):\s*$/i)
    if (m && !['Pack', 'Mechanics', 'Components', 'lore', 'displayname'].includes(m[1])) {
      items.push({ id: m[1], sourceFile: fileName })
    }
  }
  return items
}

export async function scanPackSource({ rootPath, sourceType, api, readText }) {
  const listRes = await api.listDirRecursive(rootPath)
  if (!listRes.ok) throw new Error(listRes.error || 'Cannot read folder')

  const files = listRes.files || []
  const detected = sourceType === 'auto' ? detectSourceType(rootPath, files) : sourceType
  const textures = []
  const models = []
  const configs = []
  const items = []
  const warnings = []

  if (listRes.truncated) {
    warnings.push(`File list truncated at ${files.length} files — very large packs may be incomplete.`)
  }

  for (const f of files) {
    const rel = f.rel
    const low = norm(rel)
    if (low.endsWith('.png') && (low.includes('/textures/') || low.includes('/texture/'))) {
      textures.push(f)
    } else if (low.endsWith('.json') && low.includes('/models/')) {
      models.push(f)
    } else if (low.endsWith('.yml') || low.endsWith('.yaml')) {
      if (low.includes('/configs/') || low.includes('/items/') || low.includes('/contents/')) {
        configs.push(f)
      }
    }
  }

  if (detected === 'itemsadder') {
    const configFiles = configs.filter(c => norm(c.rel).includes('/configs/'))
    for (const cf of configFiles.slice(0, 80)) {
      const text = await readText(cf.path)
      if (!text) continue
      const parsed = parseItemsAdderYaml(text)
      for (const it of parsed.items) {
        items.push({
          id: it.id,
          namespace: parsed.namespace || 'itemsadder',
          plugin: 'itemsadder',
          configPath: cf.rel,
        })
      }
    }
    if (!configFiles.length) {
      warnings.push('No ItemsAdder configs/ YAML found — will export textures only.')
    }
  } else if (detected === 'oraxen') {
    const itemYmls = files.filter(f => {
      const low = norm(f.rel)
      return (low.endsWith('.yml') || low.endsWith('.yaml')) && low.includes('/items/')
    })
    for (const yf of itemYmls.slice(0, 60)) {
      const text = await readText(yf.path)
      if (!text) continue
      const parsed = parseOraxenItemYaml(text, yf.rel)
      for (const it of parsed) {
        items.push({ id: it.id, namespace: 'oraxen', plugin: 'oraxen', configPath: yf.rel })
      }
    }
  } else if (detected === 'nova') {
    warnings.push('Nova uses packet-level items — export textures/models for Bedrock RP; link items in Geyser mappings manually.')
  } else if (detected === 'java_rp') {
    warnings.push('Java RP detected — use Quick 2D for simple textures or java2bedrock.sh for custom model items.')
  } else {
    warnings.push('Could not detect plugin type — exporting textures under /textures/ paths only.')
  }

  const textureEntries = textures.map(t => {
    const base = t.name.replace(/\.png$/i, '')
    const parts = norm(t.rel).split('/')
    const texIdx = parts.lastIndexOf('textures')
    const subPath = texIdx >= 0 ? parts.slice(texIdx + 1).join('/') : t.rel
    return {
      ...t,
      bedrockId: base,
      subPath,
      category: subPath.includes('/block/') ? 'block' : 'item',
    }
  })

  const modelCount3d = models.filter(m => {
    const low = norm(m.rel)
    return low.includes('armor') || low.includes('furniture') || low.includes('custom/')
  }).length

  if (modelCount3d > 0) {
    warnings.push(`${modelCount3d} complex model(s) detected — 3D/armor/furniture need java2bedrock.sh or ItemsAdder Bedrock converter.`)
  }

  return {
    detected,
    rootPath,
    fileCount: files.length,
    rawFiles: files,
    textures: textureEntries,
    models,
    configs,
    items,
    warnings,
  }
}
