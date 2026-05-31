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
  const s = String(v).trim()
  if (s === '') return null
  if (/^-?\d+(\.\d+)?$/.test(s)) return s
  if (s.startsWith('&') || s.startsWith('§') || s.includes(':') || s.includes('#')) return quoteStr(s)
  return quoteStr(s)
}

function hasScaledData(scaled) {
  return scaled && (scaled.base !== '' || scaled.scale !== '' || scaled.spread !== '' || scaled.maxSpread !== '')
}

function writeScaled(lines, key, scaled, level) {
  if (!hasScaledData(scaled)) return
  const ind = indent(level)
  const onlyBase = scaled.base !== '' && scaled.scale === '' && scaled.spread === '' && scaled.maxSpread === ''
  if (onlyBase) {
    lines.push(`${ind}${key}: ${formatScalar(scaled.base)}`)
    return
  }
  lines.push(`${ind}${key}:`)
  if (scaled.base !== '') lines.push(`${indent(level + 1)}base: ${formatScalar(scaled.base)}`)
  if (scaled.scale !== '') lines.push(`${indent(level + 1)}scale: ${formatScalar(scaled.scale)}`)
  if (scaled.spread !== '') lines.push(`${indent(level + 1)}spread: ${formatScalar(scaled.spread)}`)
  if (scaled.maxSpread !== '') lines.push(`${indent(level + 1)}max-spread: ${formatScalar(scaled.maxSpread)}`)
}

function writeStringList(lines, key, items, level) {
  const filtered = items.map(s => String(s).trim()).filter(Boolean)
  if (!filtered.length) return
  lines.push(`${indent(level)}${key}:`)
  filtered.forEach(item => lines.push(`${indent(level + 1)}- ${formatScalar(item)}`))
}

function writeEnchants(lines, enchants, level) {
  if (!enchants.length) return
  lines.push(`${indent(level)}enchants:`)
  enchants.forEach(e => {
    if (!e.name) return
    if (e.scale && e.scale !== '' && e.base !== '') {
      lines.push(`${indent(level + 1)}${e.name}:`)
      lines.push(`${indent(level + 2)}base: ${formatScalar(e.base)}`)
      if (e.scale !== '') lines.push(`${indent(level + 2)}scale: ${formatScalar(e.scale)}`)
    } else {
      const val = e.base !== '' ? e.base : e.level
      if (val !== '') lines.push(`${indent(level + 1)}${e.name}: ${formatScalar(val)}`)
    }
  })
}

function writePermEffects(lines, effects, level) {
  if (!effects.length) return
  lines.push(`${indent(level)}perm-effects:`)
  effects.forEach(e => {
    if (!e.effect) return
    const val = e.level !== '' ? e.level : '1'
    lines.push(`${indent(level + 1)}${e.effect}: ${formatScalar(val)}`)
  })
}

function writeConsumableEffects(lines, effects, level) {
  if (!effects.length) return
  lines.push(`${indent(level)}effects:`)
  effects.forEach(e => {
    if (!e.effect) return
    lines.push(`${indent(level + 1)}${e.effect}:`)
    if (e.duration !== '') lines.push(`${indent(level + 2)}duration: ${formatScalar(e.duration)}`)
    if (e.amplifier !== '') lines.push(`${indent(level + 2)}amplifier: ${formatScalar(e.amplifier)}`)
  })
}

function writeElements(lines, elements, level) {
  if (!elements.length) return
  const active = elements.filter(el => hasScaledData(el.damage) || hasScaledData(el.defense) || el.simpleDamage !== '' || el.simpleDefense !== '')
  if (!active.length) return
  lines.push(`${indent(level)}element:`)
  active.forEach(el => {
    lines.push(`${indent(level + 1)}${el.element}:`)
    if (el.simpleDamage !== '' && !hasScaledData(el.damage)) {
      lines.push(`${indent(level + 2)}damage: ${formatScalar(el.simpleDamage)}`)
    } else if (hasScaledData(el.damage)) {
      writeScaled(lines, 'damage', el.damage, level + 2)
    }
    if (el.simpleDefense !== '' && !hasScaledData(el.defense)) {
      lines.push(`${indent(level + 2)}defense: ${formatScalar(el.simpleDefense)}`)
    } else if (hasScaledData(el.defense)) {
      writeScaled(lines, 'defense', el.defense, level + 2)
    }
  })
}

function writeAbilities(lines, abilities, level) {
  if (!abilities.length) return
  lines.push(`${indent(level)}ability:`)
  abilities.forEach(ab => {
    if (!ab.type) return
    const key = ab.id || 'ability1'
    lines.push(`${indent(level + 1)}${key}:`)
    lines.push(`${indent(level + 2)}type: ${ab.type}`)
    if (ab.mode) lines.push(`${indent(level + 2)}mode: ${ab.mode}`)
    if (ab.cooldown !== '') lines.push(`${indent(level + 2)}cooldown: ${formatScalar(ab.cooldown)}`)
    if (ab.mana !== '') lines.push(`${indent(level + 2)}mana: ${formatScalar(ab.mana)}`)
    ab.params.forEach(p => {
      if (p.key && p.value !== '') lines.push(`${indent(level + 2)}${p.key}: ${formatScalar(p.value)}`)
    })
  })
}

function writeModifiers(lines, modifiers, level) {
  if (!modifiers.length) return
  lines.push(`${indent(level)}modifiers:`)
  modifiers.forEach(mod => {
    if (!mod.id) return
    lines.push(`${indent(level + 1)}${mod.id}:`)
    if (mod.chance !== '') lines.push(`${indent(level + 2)}chance: ${formatScalar(mod.chance)}`)
    if (mod.weight !== '') lines.push(`${indent(level + 2)}weight: ${formatScalar(mod.weight)}`)
    if (mod.prefix) lines.push(`${indent(level + 2)}prefix: ${formatScalar(mod.prefix)}`)
    if (mod.suffix) lines.push(`${indent(level + 2)}suffix: ${formatScalar(mod.suffix)}`)
    if (mod.min !== '') lines.push(`${indent(level + 2)}min: ${formatScalar(mod.min)}`)
    if (mod.max !== '') lines.push(`${indent(level + 2)}max: ${formatScalar(mod.max)}`)
    if (mod.stats?.length) {
      lines.push(`${indent(level + 2)}stats:`)
      mod.stats.forEach(st => {
        if (!st.key) return
        if (hasScaledData(st.value)) writeScaled(lines, st.key, st.value, level + 3)
        else if (st.simple !== '') lines.push(`${indent(level + 3)}${st.key}: ${formatScalar(st.simple)}`)
      })
    }
    if (mod.modifiers?.length) {
      lines.push(`${indent(level + 2)}modifiers:`)
      mod.modifiers.forEach(sub => {
        if (sub.id && sub.weight !== '') lines.push(`${indent(level + 3)}${sub.id}: ${formatScalar(sub.weight)}`)
      })
    }
  })
}

function writeCommands(lines, commands, level) {
  if (!commands.length) return
  lines.push(`${indent(level)}commands:`)
  commands.forEach(cmd => {
    if (!cmd.command) return
    lines.push(`${indent(level + 1)}'${cmd.id || '1'}':`)
    lines.push(`${indent(level + 2)}command: ${formatScalar(cmd.command)}`)
    if (cmd.cooldown !== '') lines.push(`${indent(level + 2)}cooldown: ${formatScalar(cmd.cooldown)}`)
    if (cmd.delay !== '') lines.push(`${indent(level + 2)}delay: ${formatScalar(cmd.delay)}`)
  })
}

function writeItemParticles(lines, particles, level) {
  if (!particles || !particles.type) return
  lines.push(`${indent(level)}item-particles:`)
  lines.push(`${indent(level + 1)}type: ${particles.type}`)
  if (particles.particle) lines.push(`${indent(level + 1)}particle: ${particles.particle}`)
  if (particles.radius !== '') lines.push(`${indent(level + 1)}radius: ${formatScalar(particles.radius)}`)
  if (particles.rotationSpeed !== '') lines.push(`${indent(level + 1)}rotation-speed: ${formatScalar(particles.rotationSpeed)}`)
  if (particles.colorRed !== '' || particles.colorGreen !== '' || particles.colorBlue !== '') {
    lines.push(`${indent(level + 1)}color:`)
    if (particles.colorRed !== '') lines.push(`${indent(level + 2)}red: ${formatScalar(particles.colorRed)}`)
    if (particles.colorGreen !== '') lines.push(`${indent(level + 2)}green: ${formatScalar(particles.colorGreen)}`)
    if (particles.colorBlue !== '') lines.push(`${indent(level + 2)}blue: ${formatScalar(particles.colorBlue)}`)
  }
}

function writeArrowParticles(lines, particles, level) {
  if (!particles || !particles.particle) return
  lines.push(`${indent(level)}arrow-particles:`)
  lines.push(`${indent(level + 1)}particle: ${particles.particle}`)
  if (particles.amount !== '') lines.push(`${indent(level + 1)}amount: ${formatScalar(particles.amount)}`)
  if (particles.speed !== '') lines.push(`${indent(level + 1)}speed: ${formatScalar(particles.speed)}`)
}

function writeUpgrade(lines, upgrade, level) {
  if (!upgrade) return
  const hasData = upgrade.template || upgrade.reference || upgrade.workbench !== '' || upgrade.max !== ''
  if (!hasData) return
  lines.push(`${indent(level)}upgrade:`)
  if (upgrade.template) lines.push(`${indent(level + 1)}template: ${formatScalar(upgrade.template)}`)
  if (upgrade.reference) lines.push(`${indent(level + 1)}reference: ${formatScalar(upgrade.reference)}`)
  if (upgrade.workbench !== '') lines.push(`${indent(level + 1)}workbench: ${formatScalar(upgrade.workbench === 'true' || upgrade.workbench === true)}`)
  if (upgrade.max !== '') lines.push(`${indent(level + 1)}max: ${formatScalar(upgrade.max)}`)
}

function appendRawYaml(lines, raw, level) {
  if (!raw?.trim()) return
  raw.trim().split('\n').forEach(line => {
    if (line.trim() === '') lines.push('')
    else lines.push(`${indent(level)}${line}`)
  })
}

import { TYPE_TO_FILE } from './mmoItemsData'

export function getItemFileKey(state) {
  return TYPE_TO_FILE[state.itemType] || 'sword'
}

export function groupItemsByFile(items) {
  const groups = {}
  items.forEach(item => {
    const file = getItemFileKey(item)
    if (!groups[file]) groups[file] = []
    groups[file].push(item)
  })
  return groups
}

export function buildFileYaml(items, fileKey) {
  const grouped = groupItemsByFile(items)
  const list = grouped[fileKey] || []
  if (!list.length) return ''
  return list.map(item => buildItemYaml(item).trimEnd()).join('\n\n') + '\n'
}

export function buildProjectYaml(items, { withHeaders = true } = {}) {
  const groups = groupItemsByFile(items)
  const files = Object.keys(groups).sort()
  if (!files.length) return ''
  return files.map(file => {
    const body = groups[file].map(item => buildItemYaml(item).trimEnd()).join('\n\n')
    return withHeaders ? `# ${file}.yml\n${body}` : body
  }).join('\n\n') + '\n'
}

export function buildItemYaml(state) {
  const lines = []
  const id = state.itemId?.trim() || 'MY_ITEM'
  lines.push(`${id}:`)
  lines.push(`${indent(1)}base:`)

  if (state.material) lines.push(`${indent(2)}material: ${state.material}`)
  if (state.name) lines.push(`${indent(2)}name: ${formatScalar(state.name)}`)
  writeStringList(lines, 'lore', state.lore, 2)
  if (state.tier) lines.push(`${indent(2)}tier: ${state.tier}`)
  if (state.revisionId !== '') lines.push(`${indent(2)}revision-id: ${formatScalar(state.revisionId)}`)
  if (state.itemModel) lines.push(`${indent(2)}item-model: ${formatScalar(state.itemModel)}`)
  if (state.skullTexture) lines.push(`${indent(2)}skull-texture: ${formatScalar(state.skullTexture)}`)
  if (state.tooltip) lines.push(`${indent(2)}tooltip: ${formatScalar(state.tooltip)}`)
  if (state.loreFormat) lines.push(`${indent(2)}lore-format: ${formatScalar(state.loreFormat)}`)
  if (state.dyeColor) lines.push(`${indent(2)}dye-color: ${state.dyeColor}`)
  if (state.trimMaterial) lines.push(`${indent(2)}trim-material: ${formatScalar(state.trimMaterial)}`)
  if (state.trimPattern) lines.push(`${indent(2)}trim-pattern: ${formatScalar(state.trimPattern)}`)
  if (state.maxStackSize !== '') lines.push(`${indent(2)}max-stack-size: ${formatScalar(state.maxStackSize)}`)
  if (state.displayedType) lines.push(`${indent(2)}displayed-type: ${formatScalar(state.displayedType)}`)
  if (state.cooldownReference) lines.push(`${indent(2)}cooldown-reference: ${formatScalar(state.cooldownReference)}`)
  if (state.repairType) lines.push(`${indent(2)}repair-type: ${formatScalar(state.repairType)}`)
  if (state.luteAttackEffect) lines.push(`${indent(2)}lute-attack-effect: ${formatScalar(state.luteAttackEffect)}`)
  if (state.luteAttackSound) lines.push(`${indent(2)}lute-attack-sound: ${formatScalar(state.luteAttackSound)}`)
  if (state.itemSet) lines.push(`${indent(2)}set: ${formatScalar(state.itemSet)}`)

  writeStringList(lines, 'required-class', state.requiredClass, 2)
  writeStringList(lines, 'permission', state.permission, 2)
  writeStringList(lines, 'granted-permissions', state.grantedPermissions, 2)
  writeStringList(lines, 'gem-sockets', state.gemSockets, 2)

  Object.entries(state.numericStats || {}).forEach(([key, scaled]) => {
    writeScaled(lines, key, scaled, 2)
  })

  Object.entries(state.booleanStats || {}).forEach(([key, val]) => {
    if (val) lines.push(`${indent(2)}${key}: true`)
  })

  writeEnchants(lines, state.enchants, 2)
  writePermEffects(lines, state.permEffects, 2)
  writeConsumableEffects(lines, state.consumableEffects, 2)
  writeElements(lines, state.elements, 2)
  writeAbilities(lines, state.abilities, 2)
  writeCommands(lines, state.commands, 2)
  writeItemParticles(lines, state.itemParticles, 2)
  writeArrowParticles(lines, state.arrowParticles, 2)
  writeUpgrade(lines, state.upgrade, 2)
  appendRawYaml(lines, state.extraBaseYaml, 2)

  writeModifiers(lines, state.modifiers, 1)
  appendRawYaml(lines, state.templateModifiersYaml, 1)
  appendRawYaml(lines, state.craftingYaml, 1)

  return lines.join('\n') + '\n'
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
