/** Bukkit MATERIAL → minecraft:item_id for Shopkeepers YAML */
export function materialToMcId(material) {
  if (!material?.trim()) return 'minecraft:stone'
  const m = material.trim()
  if (m.includes(':')) return m.toLowerCase()
  return `minecraft:${m.toLowerCase()}`
}

export function mcIdToMaterial(id) {
  if (!id) return 'STONE'
  const s = String(id)
  if (s.startsWith('minecraft:')) return s.slice(10).toUpperCase()
  return s.toUpperCase()
}

export function formatMcPrice(n) {
  if (n == null || n < 0) return '—'
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function linesToArr(text) {
  return text.split('\n').map(s => s.trim()).filter(Boolean)
}

export function arrToLines(arr) {
  return (arr || []).join('\n')
}

export function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function yamlQuote(str) {
  if (str == null) return '""'
  return `"${String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

export function yamlBool(v) {
  return v ? 'true' : 'false'
}

export function yamlList(key, items, indent = 0) {
  const pad = ' '.repeat(indent)
  if (!items?.length) return [`${pad}${key}: []`]
  const out = [`${pad}${key}:`]
  items.forEach(item => {
    out.push(`${pad}  - ${typeof item === 'string' ? yamlQuote(item) : item}`)
  })
  return out
}

export function formatLogTime(date) {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
