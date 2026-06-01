import { stripNpcName } from './citizensData'

function yamlQuote(str) {
  if (str == null) return '""'
  return `"${String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function yamlBool(v) {
  return v ? 'true' : 'false'
}

function yamlNum(n) {
  if (Number.isInteger(n)) return String(n)
  return String(Number(n).toFixed(4)).replace(/\.?0+$/, '')
}

function buildEquipmentYaml(equipment) {
  if (!equipment) return []
  const lines = ['      equipment:']
  let any = false
  EQUIP_SLOTS.forEach(slot => {
    const item = equipment[slot]
    if (!item?.material) return
    any = true
    lines.push(`        ${slot}:`)
    lines.push(`          type: ${item.material}`)
    if (item.amount && item.amount !== 1) lines.push(`          amount: ${item.amount}`)
  })
  return any ? lines : []
}

const EQUIP_SLOTS = ['hand', 'offhand', 'helmet', 'chestplate', 'leggings', 'boots']

function buildSkinYaml(skin) {
  if (!skin) return []
  const lines = ['      skintrait:']
  if (skin.mode === 'player' && skin.skinName?.trim()) {
    lines.push(`        skinName: ${yamlQuote(skin.skinName.trim())}`)
    if (skin.useLatest) lines.push('        updateSkins: true')
  } else if (skin.mode === 'url' && skin.skinUrl?.trim()) {
    lines.push(`        textureRaw: ${yamlQuote(skin.skinUrl.trim())}`)
  } else if (skin.mode === 'texture' && skin.textureData?.trim()) {
    if (skin.skinName?.trim()) lines.push(`        skinName: ${yamlQuote(skin.skinName.trim())}`)
    lines.push(`        signature: ${yamlQuote(skin.signature || '')}`)
    lines.push(`        textureRaw: ${yamlQuote(skin.textureData.trim())}`)
  }
  return lines.length > 1 ? lines : []
}

function buildCommandsYaml(commands) {
  if (!commands?.length) return []
  const lines = ['      commandtrait:', '        commands:']
  commands.forEach((cmd, i) => {
    if (!cmd.command?.trim()) return
    lines.push(`          '${i}':`)
    lines.push(`            command: ${yamlQuote(cmd.command.trim())}`)
    lines.push(`            hand: ${cmd.hand || 'RIGHT'}`)
    lines.push(`            player: ${yamlBool(cmd.player !== false)}`)
    if (cmd.op) lines.push(`            op: true`)
    if (cmd.cooldown > 0) lines.push(`            cooldown: ${cmd.cooldown}`)
    if (cmd.globalCooldown > 0) lines.push(`            globalcooldown: ${cmd.globalCooldown}`)
    if (cmd.n >= 0) lines.push(`            n: ${cmd.n}`)
    if (cmd.cost > 0) lines.push(`            cost: ${cmd.cost}`)
    if (cmd.experienceCost > 0) lines.push(`            experience-cost: ${cmd.experienceCost}`)
  })
  return lines.length > 2 ? lines : []
}

function buildWaypointsYaml(waypoints) {
  if (!waypoints?.length) return []
  const lines = [
    '      waypoints:',
    '        provider: linear',
    '        linear:',
    '          points:',
  ]
  waypoints.forEach((wp, i) => {
    lines.push(`            '${i}':`)
    lines.push('              location:')
    lines.push(`                world: ${yamlQuote(wp.world || 'world')}`)
    lines.push(`                x: '${yamlNum(wp.x)}'`)
    lines.push(`                y: '${yamlNum(wp.y)}'`)
    lines.push(`                z: '${yamlNum(wp.z)}'`)
    lines.push(`                yaw: '${yamlNum(wp.yaw || 0)}'`)
    lines.push(`                pitch: '${yamlNum(wp.pitch || 0)}'`)
    if (wp.delay > 0) lines.push(`              delay: ${wp.delay}`)
  })
  return lines
}

function buildNpcYaml(npc) {
  const lines = [
    `  '${npc.citizensId}':`,
    `    name: ${yamlQuote(npc.name)}`,
    '    traits:',
    `      spawned: ${yamlBool(npc.spawned !== false)}`,
    `      type: ${npc.entityType || 'PLAYER'}`,
  ]

  if (npc.protected) lines.push('      protected: true')
  if (npc.useMinecraftAI) lines.push('      minecraftai: true')

  const loc = npc.location || {}
  lines.push('      location:')
  lines.push(`        world: ${yamlQuote(loc.world || 'world')}`)
  lines.push(`        x: '${yamlNum(loc.x ?? 0)}'`)
  lines.push(`        y: '${yamlNum(loc.y ?? 64)}'`)
  lines.push(`        z: '${yamlNum(loc.z ?? 0)}'`)
  lines.push(`        yaw: '${yamlNum(loc.yaw ?? 0)}'`)
  lines.push(`        pitch: '${yamlNum(loc.pitch ?? 0)}'`)

  if (npc.lookClose?.enabled) {
    lines.push('      lookclose:')
    lines.push('        enabled: true')
    lines.push(`        range: ${npc.lookClose.range ?? 5}`)
    if (npc.lookClose.randomLook) lines.push('        random-look-enabled: true')
    if (npc.lookClose.realisticLooking) lines.push('        realistic-looking: true')
  }

  if (npc.talkClose?.enabled) {
    lines.push('      talkclose:')
    lines.push('        enabled: true')
    lines.push(`        range: ${npc.talkClose.range ?? 5}`)
  }

  if (npc.randomTalker) lines.push('      random-talker: true')

  if (npc.textLines?.filter(Boolean).length) {
    lines.push('      text:')
    npc.textLines.filter(Boolean).forEach((line, i) => {
      lines.push(`        '${i}': ${yamlQuote(line)}`)
    })
  }

  lines.push(...buildSkinYaml(npc.skin))
  lines.push(...buildEquipmentYaml(npc.equipment))
  lines.push(...buildCommandsYaml(npc.commands))
  lines.push(...buildWaypointsYaml(npc.waypoints))

  return lines
}

export function buildCitizensSavesYaml(state) {
  const lines = [
    '# Citizens NPC Storage — generated by SConfig',
    '# Place under plugins/Citizens/saves.yml (merge npc section carefully)',
    '',
    'npc:',
  ]

  state.npcs.forEach(npc => {
    lines.push(...buildNpcYaml(npc))
    lines.push('')
  })

  return lines.join('\n').trim() + '\n'
}

export function buildCitizensCommands(npc) {
  const name = stripNpcName(npc.name)
  const cmds = [
    `# Citizens commands for NPC #${npc.citizensId} (${name})`,
    `/npc create ${yamlQuote(name).replace(/"/g, '')} --type ${npc.entityType || 'PLAYER'}`,
  ]

  if (npc.entityType === 'PLAYER' && npc.skin?.mode === 'player' && npc.skin.skinName?.trim()) {
    const flag = npc.skin.useLatest ? ' -l' : ''
    cmds.push(`/npc skin ${npc.skin.skinName.trim()}${flag}`)
  } else if (npc.skin?.mode === 'url' && npc.skin.skinUrl?.trim()) {
    cmds.push(`/npc skin --url ${npc.skin.skinUrl.trim()}`)
  }

  Object.entries(npc.equipment || {}).forEach(([slot, item]) => {
    if (item?.material) cmds.push(`/npc setequipment ${slot} ${item.material}${item.amount > 1 ? ` ${item.amount}` : ''}`)
  })

  if (npc.lookClose?.enabled) cmds.push(`/trait lookclose`)
  if (npc.talkClose?.enabled) cmds.push(`/trait talkclose`)
  if (npc.commands?.length) cmds.push(`/trait commandtrait`)

  npc.commands?.forEach(cmd => {
    if (!cmd.command?.trim()) return
    cmds.push(`/npc command add ${cmd.hand === 'LEFT' ? '-l ' : ''}${cmd.command.trim()}`)
  })

  npc.textLines?.filter(Boolean).forEach((line, i) => {
    cmds.push(`/npc text add ${yamlQuote(line)}`)
  })

  if (npc.spawned !== false) cmds.push('/npc spawn')

  return cmds.join('\n')
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
