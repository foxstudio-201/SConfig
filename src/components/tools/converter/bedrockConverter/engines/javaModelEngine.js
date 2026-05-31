/**
 * Java item model parser — inspired by java2bedrock predicate / parent chain logic (simplified).
 */

function norm(p) {
  return String(p || '').replace(/\\/g, '/')
}

export function parseItemModelJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function extractTexturesFromModel(model) {
  if (!model) return []
  const out = []
  if (model.textures) {
    for (const v of Object.values(model.textures)) {
      if (typeof v === 'string') out.push(v.replace(/^minecraft:/, ''))
    }
  }
  return out
}

export function is3DModel(model) {
  if (!model) return false
  if (Array.isArray(model.elements) && model.elements.length > 0) return true
  const parent = String(model.parent || '')
  return parent.includes('builtin/entity') || parent.includes('block/')
}

/**
 * Scan minecraft item model overrides for custom_model_data values.
 * @param {Array<{rel:string, path:string}>} files
 * @param {function} readText
 */
export async function buildCmdIndexFromOverrides(files, readText) {
  const cmdByKey = new Map()
  const modelFiles = files.filter(f => {
    const r = norm(f.rel).toLowerCase()
    return r.endsWith('.json') && r.includes('/models/item/')
  })

  for (const mf of modelFiles.slice(0, 400)) {
    const text = await readText(mf.path)
    if (!text) continue
    const model = parseItemModelJson(text)
    if (!model?.overrides) continue
    const baseItem = mf.rel.split('/').pop().replace('.json', '').toUpperCase()

    for (const ov of model.overrides) {
      const cmd = ov.predicate?.custom_model_data
      if (cmd == null) continue
      const modelPath = typeof ov.model === 'string' ? ov.model : null
      const key = `${baseItem}:${cmd}`
      cmdByKey.set(key, {
        javaItem: `minecraft:${baseItem.toLowerCase()}`,
        customModelData: cmd,
        modelPath,
        sourceFile: mf.rel,
      })
      if (modelPath) {
        cmdByKey.set(modelPath.replace(/^minecraft:/, ''), {
          javaItem: `minecraft:${baseItem.toLowerCase()}`,
          customModelData: cmd,
          modelPath,
          sourceFile: mf.rel,
        })
      }
    }
  }
  return cmdByKey
}

/**
 * Resolve namespace item model file → texture paths
 */
export async function resolveModelTextureChain(modelRel, files, readText, depth = 0) {
  if (depth > 8) return { textures: [], is3d: false }
  const hit = files.find(f => norm(f.rel).endsWith(norm(modelRel)) || norm(f.rel).includes(norm(modelRel)))
  if (!hit) return { textures: [], is3d: false }
  const text = await readText(hit.path)
  const model = parseItemModelJson(text)
  if (!model) return { textures: [], is3d: false }

  const is3d = is3DModel(model)
  let textures = extractTexturesFromModel(model)

  if (model.parent && textures.length === 0) {
    const parentPath = model.parent.replace(/^minecraft:/, 'assets/minecraft/models/') + '.json'
    const parentAlt = model.parent.replace(/^minecraft:/, '') + '.json'
    const sub = await resolveModelTextureChain(parentPath, files, readText, depth + 1)
    const sub2 = textures.length ? null : await resolveModelTextureChain(parentAlt, files, readText, depth + 1)
    const merged = sub?.textures?.length ? sub : sub2
    if (merged?.textures?.length) textures = merged.textures
    if (merged?.is3d) return { textures, is3d: true }
  }

  return { textures, is3d }
}
