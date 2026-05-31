/**
 * Resolve Java item/block models with parent chain (merge elements, textures, display).
 */

import { parseItemModelJson } from './javaModelEngine'

function norm(p) {
  return String(p || '').replace(/\\/g, '/')
}

function findModelFile(modelRef, files) {
  if (!modelRef) return null
  const ref = modelRef.replace(/^minecraft:/, '')
  const candidates = [
    ref.endsWith('.json') ? ref : `${ref}.json`,
    `assets/${ref}.json`,
    ref,
  ]
  for (const c of candidates) {
    const n = norm(c).toLowerCase()
    const hit = files.find(f => norm(f.rel).toLowerCase().endsWith(n) || norm(f.rel).toLowerCase().includes(`/${n}`))
    if (hit) return hit
  }
  return null
}

function parentToPath(parent) {
  if (!parent) return null
  const ref = parent.replace(/^minecraft:/, '')
  return ref.endsWith('.json') ? ref : `assets/minecraft/models/${ref}.json`
}

export function isUnsupportedParent(parent) {
  if (!parent) return true
  const p = parent.replace(/^minecraft:/, '')
  if (p.startsWith('block/') || p === 'builtin/entity') return true
  return false
}

/**
 * @returns {Promise<{ elements, textures, display, generated, modelFile, parentChain }>}
 */
export async function resolveMergedModel(modelRef, files, readText) {
  const chain = []
  const mergedTextures = {}
  let mergedDisplay = {}
  let elements = null
  let generated = false
  let depth = 0
  let currentRef = modelRef

  while (currentRef && depth < 12) {
    const file = findModelFile(currentRef, files)
    if (!file) break
    if (chain.some(c => c.path === file.path)) break

    const text = await readText(file.path)
    const model = parseItemModelJson(text)
    if (!model) break

    chain.push({ path: file.path, rel: file.rel, model })

    if (model.textures) {
      for (const [k, v] of Object.entries(model.textures)) {
        if (!mergedTextures[k]) mergedTextures[k] = v
      }
    }
    if (model.display) {
      mergedDisplay = { ...model.display, ...mergedDisplay }
    }
    if (model.elements?.length) elements = model.elements

    const parent = model.parent
    if (parent?.includes('generated')) generated = true
    if (elements && Object.keys(mergedTextures).length > 0) break
    if (!parent || isUnsupportedParent(parent)) break
    currentRef = parentToPath(parent)
    depth += 1
  }

  if (!elements?.length && Object.keys(mergedTextures).length > 0) {
    generated = true
  }

  return {
    elements,
    textures: mergedTextures,
    display: mergedDisplay,
    generated,
    modelFile: chain[0] || null,
    parentChain: chain,
  }
}

/** Map override model path → CMD from base item files */
export async function buildModelToCmdMap(files, readText) {
  const map = new Map()
  const modelFiles = files.filter(f => {
    const r = norm(f.rel).toLowerCase()
    return r.endsWith('.json') && r.includes('/models/item/')
  })

  for (const mf of modelFiles) {
    const text = await readText(mf.path)
    const model = parseItemModelJson(text)
    if (!model?.overrides) continue
    const base = mf.rel.split('/').pop().replace('.json', '').toUpperCase()

    for (const ov of model.overrides) {
      const cmd = ov.predicate?.custom_model_data
      if (cmd == null || !ov.model) continue
      const modelKey = ov.model.replace(/^minecraft:/, '')
      map.set(modelKey, {
        customModelData: cmd,
        javaItem: `minecraft:${base.toLowerCase()}`,
        material: base,
        modelPath: ov.model,
      })
    }
  }
  return map
}

export function findModelForItem(item, files) {
  const id = item.id
  const hints = [
    item.modelPath,
    `item/${id}`,
    `${item.namespace}/item/${id}`,
    `${item.namespace}/${id}`,
  ].filter(Boolean)

  for (const h of hints) {
    const f = findModelFile(h, files)
    if (f) return { modelRef: h, file: f }
  }

  const hit = files.find(f => {
    const r = norm(f.rel).toLowerCase()
    return r.endsWith(`/${id}.json`) && r.includes('/models/')
  })
  if (hit) return { modelRef: hit.rel, file: hit }
  return null
}
