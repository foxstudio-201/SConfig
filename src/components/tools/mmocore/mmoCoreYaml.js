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

function hasScaled(sc) {
  if (!sc) return false
  if (sc.useFormula && sc.formula) return true
  return sc.base !== '' || sc.perLevel !== '' || sc.min !== '' || sc.max !== ''
}

function writeScaled(lines, key, sc, level) {
  if (!hasScaled(sc)) return
  const ind = indent(level)
  if (sc.useFormula && sc.formula) {
    lines.push(`${ind}${key}: ${quoteStr(sc.formula)}`)
    return
  }
  const onlyBase = sc.base !== '' && sc.perLevel === '' && sc.min === '' && sc.max === ''
  if (onlyBase) {
    lines.push(`${ind}${key}: ${formatScalar(sc.base)}`)
    return
  }
  lines.push(`${ind}${key}:`)
  if (sc.base !== '') lines.push(`${indent(level + 1)}base: ${formatScalar(sc.base)}`)
  if (sc.perLevel !== '') lines.push(`${indent(level + 1)}per-level: ${formatScalar(sc.perLevel)}`)
  if (sc.min !== '') lines.push(`${indent(level + 1)}min: ${formatScalar(sc.min)}`)
  if (sc.max !== '') lines.push(`${indent(level + 1)}max: ${formatScalar(sc.max)}`)
}

function writeStringList(lines, key, items, level) {
  const filtered = (items || []).map(s => String(s).trim()).filter(Boolean)
  if (!filtered.length) return
  lines.push(`${indent(level)}${key}:`)
  filtered.forEach(item => lines.push(`${indent(level + 1)}- ${formatScalar(item)}`))
}

function writeSkillModifiers(lines, modifiers, level) {
  ;(modifiers || []).forEach(m => {
    if (!m.key) return
    writeScaled(lines, m.key, m, level)
  })
}

export function buildClassYaml(cls) {
  const lines = []

  lines.push('display:')
  lines.push(`${indent(1)}name: ${formatScalar(cls.display?.name || cls.fileId)}`)
  writeStringList(lines, 'lore', cls.display?.lore, 1)
  if (cls.display?.attributeLore?.length) writeStringList(lines, 'attribute-lore', cls.display.attributeLore, 1)

  const mat = cls.display?.itemMaterial || 'PAPER'
  const cmd = cls.display?.itemCmd
  if (cls.display?.skullTexture) {
    lines.push(`${indent(1)}item:`)
    lines.push(`${indent(2)}item: PLAYER_HEAD`)
    lines.push(`${indent(2)}texture: ${formatScalar(cls.display.skullTexture)}`)
  } else if (cls.display?.itemModel) {
    lines.push(`${indent(1)}item:`)
    lines.push(`${indent(2)}item: ${mat}`)
    lines.push(`${indent(2)}item-model: ${formatScalar(cls.display.itemModel)}`)
    if (cmd) lines.push(`${indent(2)}custom-model-data: ${formatScalar(cmd)}`)
  } else if (cmd) {
    lines.push(`${indent(1)}item: ${formatScalar(`${mat}:${cmd}`)}`)
  } else {
    lines.push(`${indent(1)}item: ${mat}`)
  }

  if (cls.maxLevel != null && cls.maxLevel !== '') lines.push(`max-level: ${formatScalar(cls.maxLevel)}`)
  if (cls.expCurve) lines.push(`exp-curve: ${formatScalar(cls.expCurve)}`)
  if (cls.expTable) lines.push(`exp-table: ${formatScalar(cls.expTable)}`)

  const opt = cls.options || {}
  const optKeys = [
    ['default', opt.default], ['display', opt.display],
    ['off-combat-health-regen', opt.offCombatHealthRegen],
    ['off-combat-mana-regen', opt.offCombatManaRegen],
    ['off-combat-stamina-regen', opt.offCombatStaminaRegen],
    ['off-combat-stellium-regen', opt.offCombatStelliumRegen],
    ['needs-permission', opt.needsPermission],
  ]
  const hasOpts = optKeys.some(([, v]) => v === true || v === false)
  if (hasOpts) {
    lines.push('options:')
    optKeys.forEach(([k, v]) => {
      if (v === true || v === false) lines.push(`${indent(1)}${k}: ${v}`)
    })
  }

  const statEntries = Object.entries(cls.stats || {}).filter(([, v]) => hasScaled(v))
  if (statEntries.length) {
    lines.push('stats:')
    statEntries.forEach(([key, val]) => writeScaled(lines, key, val, 1))
  }

  const mana = cls.mana
  if (mana && (mana.char || mana.icon || mana.name)) {
    lines.push('mana:')
    if (mana.char) lines.push(`${indent(1)}char: ${formatScalar(mana.char)}`)
    if (mana.icon) lines.push(`${indent(1)}icon: ${formatScalar(mana.icon)}`)
    if (mana.name) lines.push(`${indent(1)}name: ${formatScalar(mana.name)}`)
    if (mana.colorFull || mana.colorHalf || mana.colorEmpty) {
      lines.push(`${indent(1)}color:`)
      if (mana.colorFull) lines.push(`${indent(2)}full: ${mana.colorFull}`)
      if (mana.colorHalf) lines.push(`${indent(2)}half: ${mana.colorHalf}`)
      if (mana.colorEmpty) lines.push(`${indent(2)}empty: ${mana.colorEmpty}`)
    }
  }

  if (cls.subclasses?.length) {
    lines.push('subclasses:')
    cls.subclasses.forEach(sub => {
      if (sub.id) lines.push(`${indent(1)}${sub.id}: ${formatScalar(sub.level ?? 1)}`)
    })
  }

  if (cls.skillTrees?.length) writeStringList(lines, 'skill-trees', cls.skillTrees, 0)

  if (cls.skills?.length) {
    lines.push('skills:')
    cls.skills.forEach(sk => {
      if (!sk.skillId) return
      lines.push(`${indent(1)}${sk.skillId}:`)
      if (sk.level != null && sk.level !== '') lines.push(`${indent(2)}level: ${formatScalar(sk.level)}`)
      if (sk.maxLevel != null && sk.maxLevel !== '') lines.push(`${indent(2)}max-level: ${formatScalar(sk.maxLevel)}`)
      if (sk.unlockedByDefault === true || sk.unlockedByDefault === false) {
        lines.push(`${indent(2)}unlocked-by-default: ${sk.unlockedByDefault}`)
      }
      if (sk.needsBound === true || sk.needsBound === false) {
        lines.push(`${indent(2)}needs-bound: ${sk.needsBound}`)
      }
      if (sk.trigger) lines.push(`${indent(2)}trigger: ${sk.trigger}`)
      if (sk.trigger === 'TIMER' && sk.timer !== '') lines.push(`${indent(2)}timer: ${formatScalar(sk.timer)}`)
      writeSkillModifiers(lines, sk.modifiers, 2)
    })
  }

  if (cls.skillSlots?.length) {
    lines.push('skill-slots:')
    cls.skillSlots.forEach(slot => {
      const sid = slot.slotId || '1'
      lines.push(`${indent(1)}${sid}:`)
      if (slot.name) lines.push(`${indent(2)}name: ${formatScalar(slot.name)}`)
      writeStringList(lines, 'lore', slot.lore, 2)
      if (slot.material) lines.push(`${indent(2)}material: ${slot.material}`)
      if (slot.customModelData) lines.push(`${indent(2)}custom-model-data: ${formatScalar(slot.customModelData)}`)
      if (slot.formula) lines.push(`${indent(2)}formula: ${formatScalar(slot.formula)}`)
      if (slot.unlockedByDefault === false) lines.push(`${indent(2)}unlocked-by-default: false`)
      if (slot.canManuallyBind === false) lines.push(`${indent(2)}can-manually-bind: false`)
      if (slot.triggers?.length) writeStringList(lines, 'triggers', slot.triggers, 2)
    })
  }

  const cp = cls.castParticle
  if (cp?.particle) {
    lines.push('cast-particle:')
    lines.push(`${indent(1)}particle: ${cp.particle}`)
    if (cp.colorR !== '' || cp.colorG !== '' || cp.colorB !== '') {
      lines.push(`${indent(1)}color:`)
      if (cp.colorR !== '') lines.push(`${indent(2)}red: ${formatScalar(cp.colorR)}`)
      if (cp.colorG !== '') lines.push(`${indent(2)}green: ${formatScalar(cp.colorG)}`)
      if (cp.colorB !== '') lines.push(`${indent(2)}blue: ${formatScalar(cp.colorB)}`)
    }
    if (cp.material) lines.push(`${indent(1)}material: ${cp.material}`)
  }

  if (cls.resourceYaml?.trim()) lines.push(cls.resourceYaml.trim())
  if (cls.scriptsYaml?.trim()) lines.push(cls.scriptsYaml.trim())
  if (cls.extraYaml?.trim()) lines.push(cls.extraYaml.trim())

  return lines.join('\n')
}

export function buildProfessionYaml(prof) {
  const lines = []
  if (prof.name) lines.push(`name: ${formatScalar(prof.name)}`)
  if (prof.maxLevel != null && prof.maxLevel !== '') lines.push(`max-level: ${formatScalar(prof.maxLevel)}`)
  if (prof.expCurve) lines.push(`exp-curve: ${formatScalar(prof.expCurve)}`)
  if (prof.expTable) lines.push(`exp-table: ${formatScalar(prof.expTable)}`)
  writeStringList(lines, 'exp-sources', prof.expSources, 0)
  const cx = prof.classExp
  if (cx && (cx.base !== '' || cx.perLevel !== '')) {
    lines.push('experience:')
    if (cx.base !== '') lines.push(`${indent(1)}base: ${formatScalar(cx.base)}`)
    if (cx.perLevel !== '') lines.push(`${indent(1)}per-level: ${formatScalar(cx.perLevel)}`)
  }
  if (prof.extraYaml?.trim()) lines.push(prof.extraYaml.trim())
  return lines.join('\n')
}

export function getClassFileName(cls) {
  return `${(cls.fileId || 'class').toLowerCase().replace(/[^a-z0-9_-]/g, '')}.yml`
}

export function getProfessionFileName(prof) {
  return `${(prof.fileId || prof.name || 'profession').toLowerCase().replace(/[^a-z0-9_-]/g, '')}.yml`
}

export function buildProjectYaml(mode, entries, activeId) {
  if (mode === 'profession') {
    const active = entries.find(e => e._id === activeId) || entries[0]
    return active ? buildProfessionYaml(active) : ''
  }
  if (entries.length === 1) return buildClassYaml(entries[0])
  return entries.map(e => `# --- ${getClassFileName(e)} ---\n${buildClassYaml(e)}`).join('\n\n')
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
