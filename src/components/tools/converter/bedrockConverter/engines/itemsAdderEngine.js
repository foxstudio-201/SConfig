/**
 * ItemsAdder-specific enrichment — patterns from EaseCation IA→Bedrock converter & IA wiki.
 */

import { parseItemsAdderConfig } from './yamlParser'
import { sanitizeBedrockId } from '../bedrockConverterData'

export function findItemsAdderContentsRoot(files) {
  const hit = files.find(f => f.rel.toLowerCase().includes('itemsadder/contents'))
  if (!hit) return null
  const parts = hit.rel.replace(/\\/g, '/').split('/')
  const idx = parts.findIndex((p, i) => p.toLowerCase() === 'itemsadder' && parts[i + 1]?.toLowerCase() === 'contents')
  if (idx < 0) return null
  return parts.slice(0, idx + 2).join('/')
}

export async function enrichItemsAdder({ files, readText, namespacePrefix }) {
  const configFiles = files.filter(f => {
    const low = f.rel.toLowerCase()
    return (low.endsWith('.yml') || low.endsWith('.yaml')) && low.includes('/configs/')
  })

  const items = []
  const behaviorHints = []

  for (const cf of configFiles.slice(0, 120)) {
    const text = await readText(cf.path)
    if (!text) continue
    const { namespace, items: parsed } = parseItemsAdderConfig(text, cf.rel)
    for (const it of parsed) {
      const bedrockKey = sanitizeBedrockId(`${namespacePrefix}_${namespace || 'ia'}_${it.id}`)
      items.push({
        ...it,
        bedrockKey,
        textureHint: typeof it.texture === 'string' ? it.texture : null,
      })
      if (it.isBlock) {
        behaviorHints.push({
          type: 'itemsadder_block',
          id: it.id,
          namespace,
          note: 'REAL_NOTE / furniture may need EaseCation behavior pack converter output.',
        })
      }
    }
  }

  return { items, behaviorHints }
}
