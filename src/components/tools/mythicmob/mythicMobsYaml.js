import { buildMobSkillLine, buildSkillMechanicLine } from './mythicMobsData'

function indent(level) {
  return '  '.repeat(level)
}

function quoteStr(s) {
  if (s.includes("'") && !s.includes('"')) return `"${s}"`
  if (s.includes('"')) return `'${s.replace(/'/g, "''")}'`
  return `'${s}'`
}

function formatScalar(v) {
  if (v === true) return 'true'
  if (v === false) return 'false'
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return String(v)
    return String(Number(v.toFixed(4).replace(/\.?0+$/, '')))
  }
  const s = String(v ?? '').trim()
  if (s === '') return null
  if (/^-?\d+(\.\d+)?$/.test(s)) return s
  if (s.startsWith('&') || s.startsWith('§') || s.includes(':') || s.includes('#')) return quoteStr(s)
  return quoteStr(s)
}

function appendRawYaml(lines, raw, level) {
  const text = String(raw || '').trim()
  if (!text) return
  text.split('\n').forEach(line => {
    lines.push(`${indent(level)}${line}`)
  })
}

const MOB_OPTION_KEYS = [
  { key: 'movementSpeed', type: 'number' },
  { key: 'knockbackResistance', type: 'number' },
  { key: 'followRange', type: 'number' },
  { key: 'attackSpeed', type: 'number' },
  { key: 'maxCombatDistance', type: 'number' },
  { key: 'despawn', type: 'select' },
  { key: 'preventOtherDrops', type: 'bool' },
  { key: 'preventRandomEquipment', type: 'bool' },
  { key: 'preventSunburn', type: 'bool' },
  { key: 'preventItemPickup', type: 'bool' },
  { key: 'preventMobKillDrops', type: 'bool' },
  { key: 'silent', type: 'bool' },
  { key: 'noAI', type: 'bool' },
  { key: 'alwaysShowName', type: 'bool' },
  { key: 'collidable', type: 'bool' },
  { key: 'glowing', type: 'bool' },
  { key: 'invincible', type: 'bool' },
  { key: 'repeatAllSkills', type: 'bool' },
]

function camelToPascal(key) {
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function writeMobOptions(lines, options, level) {
  if (!options) return
  const entries = []
  MOB_OPTION_KEYS.forEach(({ key, type }) => {
    const val = options[key]
    if (type === 'bool') {
      if (val === true) entries.push([camelToPascal(key), true])
      return
    }
    if (type === 'select') {
      if (val && String(val).trim()) entries.push([camelToPascal(key), String(val).trim()])
      return
    }
    if (val !== '' && val != null && String(val).trim() !== '') {
      entries.push([camelToPascal(key), String(val).trim()])
    }
  })
  if (!entries.length) return
  lines.push(`${indent(level)}Options:`)
  entries.forEach(([key, val]) => {
    lines.push(`${indent(level + 1)}${key}: ${formatScalar(val)}`)
  })
}

export function getMobFileName(mob) {  const name = String(mob?.internalName || 'mob').trim() || 'mob'
  return `${name}.yml`
}

export function getSkillFileName(skill) {
  const name = String(skill?.skillId || 'skill').trim() || 'skill'
  return `${name}.yml`
}

export function buildMobYaml(mob) {
  const lines = []
  const key = String(mob.internalName || 'ExampleMob').trim() || 'ExampleMob'
  lines.push(`${key}:`)
  lines.push(`${indent(1)}Type: ${mob.type || 'ZOMBIE'}`)
  if (mob.display?.trim()) lines.push(`${indent(1)}Display: ${formatScalar(mob.display)}`)
  if (mob.health !== '' && mob.health != null) lines.push(`${indent(1)}Health: ${formatScalar(mob.health)}`)
  if (mob.damage !== '' && mob.damage != null) lines.push(`${indent(1)}Damage: ${formatScalar(mob.damage)}`)
  if (mob.armor !== '' && mob.armor != null) lines.push(`${indent(1)}Armor: ${formatScalar(mob.armor)}`)
  if (mob.faction?.trim()) lines.push(`${indent(1)}Faction: ${formatScalar(mob.faction)}`)
  if (mob.level !== '' && mob.level != null) lines.push(`${indent(1)}Level: ${formatScalar(mob.level)}`)

  writeMobOptions(lines, mob.options, 1)

  if (mob.equipment?.length) {
    lines.push(`${indent(1)}Equipment:`)
    mob.equipment.forEach(eq => {
      if (!eq.item?.trim()) return
      const slot = eq.slot?.trim() || 'HAND'
      lines.push(`${indent(2)}- ${eq.item.trim()} ${slot}`)
    })
  }

  const bb = mob.bossBar || {}
  if (bb.enabled) {
    lines.push(`${indent(1)}BossBar:`)
    lines.push(`${indent(2)}Enabled: true`)
    if (bb.title?.trim()) lines.push(`${indent(2)}Title: ${formatScalar(bb.title)}`)
    if (bb.range !== '' && bb.range != null) lines.push(`${indent(2)}Range: ${formatScalar(bb.range)}`)
    if (bb.color?.trim()) lines.push(`${indent(2)}Color: ${bb.color}`)
    if (bb.style?.trim()) lines.push(`${indent(2)}Style: ${bb.style}`)
  }

  if (mob.damageModifiers?.length) {
    lines.push(`${indent(1)}DamageModifiers:`)
    mob.damageModifiers.forEach(dm => {
      if (!dm.cause?.trim()) return
      lines.push(`${indent(2)}- ${dm.cause.trim()} ${formatScalar(dm.multiplier ?? '1')}`)
    })
  }

  if (mob.levelModifiers?.length) {
    lines.push(`${indent(1)}LevelModifiers:`)
    mob.levelModifiers.forEach(lm => {
      if (!lm.stat?.trim()) return
      lines.push(`${indent(2)}- ${lm.stat.trim()} ${formatScalar(lm.amount ?? '1')}`)
    })
  }

  if (mob.drops?.length) {
    lines.push(`${indent(1)}Drops:`)
    mob.drops.forEach(d => {
      if (!d.text?.trim()) return
      lines.push(`${indent(2)}- ${d.text.trim()}`)
    })
  }

  const skillLines = (mob.skills || []).map(buildMobSkillLine).filter(Boolean)
  if (skillLines.length) {
    lines.push(`${indent(1)}Skills:`)
    skillLines.forEach(s => lines.push(`${indent(2)}- ${s}`))
  }

  appendRawYaml(lines, mob.extraYaml, 1)
  return lines.join('\n') + '\n'
}

export function buildSkillYaml(skill) {
  const lines = []
  const key = String(skill.skillId || 'ExampleSkill').trim() || 'ExampleSkill'
  lines.push(`${key}:`)
  const mechLines = (skill.mechanics || []).map(buildSkillMechanicLine).filter(Boolean)
  if (mechLines.length) {
    lines.push(`${indent(1)}Skills:`)
    mechLines.forEach(s => lines.push(`${indent(2)}- ${s}`))
  }
  appendRawYaml(lines, skill.extraYaml, 1)
  return lines.join('\n') + '\n'
}

export function buildProjectYaml(mobs, skills) {
  const parts = []
  if (mobs?.length) {
    parts.push('# MythicMobs — Mobs')
    mobs.forEach(m => parts.push(buildMobYaml(m).trimEnd()))
  }
  if (skills?.length) {
    if (parts.length) parts.push('')
    parts.push('# MythicMobs — Skills')
    skills.forEach(s => parts.push(buildSkillYaml(s).trimEnd()))
  }
  return parts.join('\n\n') + (parts.length ? '\n' : '')
}

export function downloadYaml(content, filename) {
  const blob = new Blob([content], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
