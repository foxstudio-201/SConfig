import { stripNpcName } from './citizensData'

export function formatLogTime(date) {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function expandNpcText(text, npcName) {
  const plain = stripNpcName(npcName)
  return String(text || '')
    .replace(/<npc>/gi, plain)
    .replace(/<player>/gi, 'Player')
}

export function getCommandsForHand(npc, hand) {
  return (npc.commands || []).filter(c => c.command?.trim() && (c.hand || 'RIGHT') === hand)
}

export function simulateNpcClick(npc, hand, t) {
  const entries = []
  const time = new Date()
  const cmds = getCommandsForHand(npc, hand)

  entries.push({
    id: `click-${Date.now()}`,
    time,
    kind: 'click',
    hand,
    icon: hand === 'LEFT' ? '◀' : '▶',
    color: hand === 'LEFT' ? '#a78bfa' : '#34d399',
    text: t('citizens.testClicked', { hand: hand === 'LEFT' ? t('citizens.clickLeft') : t('citizens.clickRight') }),
  })

  if (!cmds.length) {
    entries.push({
      id: `nocmd-${Date.now()}`,
      time,
      kind: 'info',
      icon: '○',
      color: '#71717a',
      text: t('citizens.testNoCommands'),
    })
    return entries
  }

  cmds.forEach((cmd, i) => {
    entries.push({
      id: `cmd-${Date.now()}-${i}`,
      time,
      kind: 'command',
      icon: '⚡',
      color: '#6ee7b7',
      text: cmd.player !== false ? t('citizens.testRunPlayer', { cmd: cmd.command }) : t('citizens.testRunConsole', { cmd: cmd.command }),
      raw: cmd.command,
      op: cmd.op,
      cooldown: cmd.cooldown,
    })
  })

  return entries
}

export function simulateNpcTalk(npc, t) {
  const lines = npc.textLines?.filter(Boolean) || []
  if (!lines.length) return []

  const pick = npc.randomTalker
    ? lines[Math.floor(Math.random() * lines.length)]
    : lines[0]

  return [{
    id: `talk-${Date.now()}`,
    time: new Date(),
    kind: 'chat',
    icon: '💬',
    color: '#fcd34d',
    text: expandNpcText(pick, npc.name),
    npcName: stripNpcName(npc.name),
  }]
}

export function simulateLookClose(npc, t) {
  if (!npc.lookClose?.enabled) return []
  return [{
    id: `look-${Date.now()}`,
    time: new Date(),
    kind: 'info',
    icon: '👁',
    color: '#93c5fd',
    text: t('citizens.testLookClose', { range: npc.lookClose.range ?? 5 }),
  }]
}

export function simulateTalkClose(npc, t) {
  if (!npc.talkClose?.enabled) return []
  return simulateNpcTalk(npc, t)
}
