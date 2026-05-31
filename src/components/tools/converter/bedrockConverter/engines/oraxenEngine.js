/**
 * Oraxen-specific enrichment — pack/textures + items/*.yml
 */

import { parseOraxenConfig } from './yamlParser'
import { sanitizeBedrockId } from '../bedrockConverterData'

export async function enrichOraxen({ files, readText, namespacePrefix }) {
  const itemYmls = files.filter(f => {
    const low = f.rel.toLowerCase()
    return (low.endsWith('.yml') || low.endsWith('.yaml')) && low.includes('/items/')
  })

  const items = []
  for (const yf of itemYmls.slice(0, 80)) {
    const text = await readText(yf.path)
    if (!text) continue
    const { items: parsed } = parseOraxenConfig(text, yf.rel)
    for (const it of parsed) {
      const tex = it.textures?.[0]?.replace(/\.png$/i, '') || it.id
      items.push({
        ...it,
        bedrockKey: sanitizeBedrockId(`${namespacePrefix}_oraxen_${it.id}`),
        textureHint: tex,
      })
    }
  }
  return { items }
}
