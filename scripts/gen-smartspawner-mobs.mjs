/**
 * One-off generator: smartspawner-spawners-sample.yml → smartSpawnerMobsDefault.js
 * Run: node scripts/gen-smartspawner-mobs.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const yamlPath = path.join(root, 'smartspawner-spawners-sample.yml')
const outPath = path.join(root, 'src/components/tools/smartspawner/smartSpawnerMobsDefault.js')

function parseYamlValue(line) {
  const m = line.match(/:\s*(.+)$/)
  if (!m) return null
  let v = m[1].trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1)
  }
  if (v === 'true') return true
  if (v === 'false') return false
  const n = Number(v)
  if (!Number.isNaN(n) && v !== '') return n
  return v
}

function parseSpawnersYaml(text) {
  const lines = text.split(/\r?\n/)
  const result = { defaultMaterial: 'SPAWNER', mobs: {} }
  let currentMob = null
  let section = null
  let lootItem = null

  for (const raw of lines) {
    const line = raw.trimEnd()
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const indent = line.match(/^\s*/)[0].length

    if (indent === 0 && /^[A-Z][A-Z0-9_]+:$/.test(trimmed)) {
      const key = trimmed.slice(0, -1)
      if (key === 'default_material') {
        section = 'root'
        currentMob = null
        continue
      }
      currentMob = key
      result.mobs[currentMob] = {
        experience: 0,
        loot: {},
        headTexture: { material: 'PLAYER_HEAD', customTexture: '' },
      }
      section = 'mob'
      lootItem = null
      continue
    }

    if (trimmed.startsWith('default_material:')) {
      result.defaultMaterial = String(parseYamlValue(trimmed) || 'SPAWNER')
      continue
    }

    if (!currentMob) continue

    const mob = result.mobs[currentMob]

    if (indent <= 2 && trimmed.startsWith('experience:')) {
      mob.experience = Number(parseYamlValue(trimmed)) || 0
      section = 'mob'
      lootItem = null
      continue
    }

    if (indent <= 2 && trimmed === 'loot:') {
      section = 'loot'
      lootItem = null
      continue
    }

    if (indent <= 2 && trimmed === 'head_texture:') {
      section = 'head'
      lootItem = null
      continue
    }

    if (section === 'loot') {
      if (indent <= 4 && /^[A-Z][A-Z0-9_]+:$/.test(trimmed)) {
        lootItem = trimmed.slice(0, -1)
        mob.loot[lootItem] = { amount: '0-1', chance: 100 }
        continue
      }
      if (lootItem && indent >= 6) {
        const key = trimmed.split(':')[0]
        const val = parseYamlValue(trimmed)
        if (key === 'amount') mob.loot[lootItem].amount = String(val)
        else if (key === 'chance') mob.loot[lootItem].chance = Number(val)
        else if (key === 'durability') mob.loot[lootItem].durability = String(val)
        else if (key === 'potion_type') mob.loot[lootItem].potionType = String(val)
        else if (key === 'extended') mob.loot[lootItem].extended = val
        else if (key === 'upgraded') mob.loot[lootItem].upgraded = val
      }
      continue
    }

    if (section === 'head') {
      if (trimmed.startsWith('material:')) {
        mob.headTexture.material = String(parseYamlValue(trimmed) || 'PLAYER_HEAD')
      } else if (trimmed.startsWith('custom_texture:')) {
        mob.headTexture.customTexture = String(parseYamlValue(trimmed) || '')
      }
    }
  }

  return result
}

const yaml = fs.readFileSync(yamlPath, 'utf8')
const data = parseSpawnersYaml(yaml)
const out = `/** Auto-generated from SmartSpawner spawners_settings.yml — do not edit by hand */\nexport default ${JSON.stringify(data, null, 2)}\n`
fs.writeFileSync(outPath, out)
console.log(`Wrote ${Object.keys(data.mobs).length} mobs → ${outPath}`)
