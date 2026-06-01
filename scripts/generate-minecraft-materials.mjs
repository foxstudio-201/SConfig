/**
 * Generate minecraftMaterials.js from InventivetalentDev/minecraft-assets (1.21)
 * Run: node scripts/generate-minecraft-materials.mjs
 */
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const VERSION = '1.21'
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../src/components/tools/deluxeMenus/minecraftMaterials.js')

async function listDir(path) {
  const url = `https://api.github.com/repos/InventivetalentDev/minecraft-assets/contents/assets/minecraft/textures/${path}?ref=${VERSION}`
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'SConfig' } })
  if (!res.ok) throw new Error(`GitHub API ${path}: ${res.status}`)
  const data = await res.json()
  return data.filter(f => f.name?.endsWith('.png')).map(f => f.name.replace(/\.png$/, ''))
}

function toMaterial(slug) {
  return slug.toUpperCase()
}

async function main() {
  const [items, blocks] = await Promise.all([listDir('item'), listDir('block')])
  const set = new Set()
  items.forEach(s => set.add(toMaterial(s)))
  blocks.forEach(s => set.add(toMaterial(s)))
  const materials = [...set].sort()
  const body = `/** Auto-generated Spigot-style material names from MC ${VERSION} textures */\nexport default ${JSON.stringify(materials, null, 2)}\n`
  writeFileSync(OUT, body, 'utf8')
  console.log(`Wrote ${materials.length} materials → ${OUT}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
