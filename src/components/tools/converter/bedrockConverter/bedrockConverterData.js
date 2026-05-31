/** Bedrock pack converter — constants & default state */

export const SOURCE_TYPES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'itemsadder', label: 'ItemsAdder' },
  { value: 'oraxen', label: 'Oraxen' },
  { value: 'nova', label: 'Nova (XenonDev)' },
  { value: 'java_rp', label: 'Java resource pack' },
]

export const CONVERT_MODES = [
  {
    value: 'full',
    label: 'Full (Geyser server)',
    desc: 'Textures + custom_mappings JSON + 3D attachables/animations (java2bedrock-style). For Geyser proxy.',
  },
  {
    value: 'quick_2d',
    label: 'Quick 2D only',
    desc: 'Textures + item_texture.json only (no Geyser JSON).',
  },
  {
    value: 'guided',
    label: 'Max + external merge',
    desc: 'Higher limits; run external converters from panel then merge output.',
  },
]

export const ENGINE_STAGES = [
  { id: 'sconfig', name: 'SConfig Engine', builtin: true },
  { id: 'java2bedrock', name: 'java2bedrock.sh', builtin: false },
  { id: 'ia-bedrock', name: 'ItemsAdder Bedrock CLI', builtin: false },
]

export const EXTERNAL_PIPELINES = [
  {
    id: 'java2bedrock',
    name: 'java2bedrock.sh (Geyser)',
    url: 'https://github.com/Kas-tle/java2bedrock.sh',
    issueUrl: 'https://github.com/Kas-tle/java2bedrock.sh/issues/new?labels=conversion&template=pack-conversion.yml',
    desc: 'Converts Java custom model predicates → Bedrock attachables + Geyser mappings. Use for Oraxen/ItemsAdder 3D items & armor.',
  },
  {
    id: 'ia-bedrock',
    name: 'ItemsAdder → Bedrock (EaseCation)',
    url: 'https://github.com/EaseCation/itemsadder-bedrock-convertor',
    desc: 'Node CLI: reads ItemsAdder contents/, outputs behavior + resource packs (blocks/furniture).',
  },
  {
    id: 'java-texture',
    name: 'Java texture pack → Bedrock',
    url: 'https://modifiedcommand.github.io/ConvertJavaTextureToBedrock/',
    desc: 'Web tool for vanilla-style Java RP (blocks, items, entities). Not for custom-model plugins alone.',
  },
]

export const DEFAULT_PACK_META = {
  name: 'Converted Pack',
  description: 'Converted with SConfig Bedrock Pack Converter',
  version: [1, 0, 0],
  minEngine: [1, 20, 0],
}

export function createConverterState() {
  return {
    sourceType: 'auto',
    convertMode: 'full',
    packMeta: { ...DEFAULT_PACK_META },
    namespacePrefix: 'geyser_custom',
    includeBlocks: true,
    includeItems: true,
    generateGeyserReadme: true,
    generateAttachables: true,
    generateGeyserMappings: true,
    runJava2Bedrock: false,
    runIABedrock: false,
  }
}

export function uuidV4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function sanitizeBedrockId(s) {
  return String(s || 'item')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48) || 'item'
}
