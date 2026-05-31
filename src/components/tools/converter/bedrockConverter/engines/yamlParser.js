/**
 * Lightweight YAML block parser (no dependency) for ItemsAdder / Oraxen configs.
 */

function stripQuotes(s) {
  const t = String(s).trim()
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1)
  }
  return t
}

/** @returns {Record<string, unknown>} */
export function parseYamlBlocks(text) {
  const root = {}
  const stack = [{ indent: -1, obj: root }]
  const lines = String(text || '').split(/\r?\n/)

  for (const raw of lines) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue
    const indent = raw.search(/\S/)
    const line = raw.trimEnd()
    const ci = line.search(/:\s*/)
    if (ci < 0) continue

    const key = line.slice(0, ci).trim()
    const rest = line.slice(ci + 1).trim()

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop()
    }

    const parent = stack[stack.length - 1].obj

    if (rest === '' || rest === '|' || rest === '>') {
      const child = {}
      parent[key] = child
      stack.push({ indent, obj: child })
    } else if (rest.startsWith('[') && rest.endsWith(']')) {
      parent[key] = rest.slice(1, -1).split(',').map(s => stripQuotes(s.trim())).filter(Boolean)
    } else {
      parent[key] = stripQuotes(rest)
    }
  }
  return root
}

export function parseItemsAdderConfig(text, fileRel) {
  const doc = parseYamlBlocks(text)
  const info = doc.info || {}
  const namespace = info.namespace || doc.namespace || null
  const itemsRoot = doc.items || {}
  const items = []

  for (const [id, block] of Object.entries(itemsRoot)) {
    if (!block || typeof block !== 'object') continue
    const resource = block.resource || {}
    const behaviours = block.behaviours || block.behaviors || {}
    items.push({
      id,
      namespace: namespace || 'itemsadder',
      plugin: 'itemsadder',
      configPath: fileRel,
      displayName: block.display_name || block.displayName || id,
      material: (resource.material || resource.item || 'PAPER').toString().toUpperCase(),
      texture: resource.texture || resource.textures || null,
      modelPath: resource.model_path || resource.model || null,
      generate: resource.generate === true || resource.generate === 'true',
      isBlock: !!(behaviours.block || resource.generate),
      customModelData: resource.custom_model_data != null ? Number(resource.custom_model_data) : null,
    })
  }
  return { namespace, items }
}

export function parseOraxenConfig(text, fileRel) {
  const doc = parseYamlBlocks(text)
  const items = []
  const skip = new Set(['settings', 'oraxen', 'armors', 'blocks', 'tools', 'weapons'])

  for (const [id, block] of Object.entries(doc)) {
    if (skip.has(id) || !block || typeof block !== 'object') continue
    if (!block.material && !block.Pack && !block.pack) continue
    const pack = block.Pack || block.pack || {}
    const textures = pack.textures || pack.texture || []
    const texList = Array.isArray(textures) ? textures : [textures].filter(Boolean)
    items.push({
      id,
      namespace: 'oraxen',
      plugin: 'oraxen',
      configPath: fileRel,
      displayName: block.displayname || block.display_name || id,
      material: (block.material || 'PAPER').toString().toUpperCase(),
      textures: texList,
      parentModel: pack.parent_model || pack.parentModel || 'item/generated',
      generateModel: pack.generate_model === true || pack.generate_model === 'true',
      customModelData: block.custom_model_data != null ? Number(block.custom_model_data) : null,
    })
  }
  return { items }
}
