/** Simulate DeluxeMenus click commands for test mode (no server) */

export const CLICK_TYPE_KEYS = {
  left: 'leftClick',
  right: 'rightClick',
  middle: 'middleClick',
  shift_left: 'shiftLeftClick',
  shift_right: 'shiftRightClick',
}

export function parseAction(raw) {
  const s = String(raw || '').trim()
  if (!s) return null
  const m = s.match(/^\[([^\]]+)\]\s*(.*)$/s)
  if (!m) return { type: 'raw', label: s, detail: s }
  const tag = m[1].toLowerCase().trim()
  const arg = m[2].trim()
  return { type: tag, label: s, detail: arg || tag }
}

export function describeAction(action) {
  if (!action) return { kind: 'empty', text: 'No action' }
  switch (action.type) {
    case 'close':
      return { kind: 'close', text: 'Menu closed', icon: '✕', color: '#f87171' }
    case 'message':
    case 'msg':
      return { kind: 'message', text: action.detail || action.label, icon: '💬', color: '#86efac' }
    case 'broadcast':
      return { kind: 'broadcast', text: action.detail, icon: '📢', color: '#fcd34d' }
    case 'player':
      return { kind: 'player', text: `/${action.detail}`, icon: '⌨', color: '#93c5fd' }
    case 'console':
      return { kind: 'console', text: action.detail, icon: '⚙', color: '#c4b5fd' }
    case 'openguimenu':
    case 'open_menu':
      return { kind: 'menu', text: `Open menu: ${action.detail}`, icon: '📋', color: '#f0abfc' }
    case 'connect':
      return { kind: 'connect', text: `Connect → ${action.detail}`, icon: '🌐', color: '#67e8f9' }
    case 'sound':
      return { kind: 'sound', text: `Sound: ${action.detail}`, icon: '🔊', color: '#fdba74' }
    case 'refresh':
      return { kind: 'refresh', text: 'Menu refreshed', icon: '↻', color: '#a3e635' }
    case 'give':
      return { kind: 'give', text: action.detail, icon: '🎁', color: '#6ee7b7' }
    case 'take':
      return { kind: 'take', text: action.detail, icon: '📤', color: '#fca5a5' }
    default:
      return { kind: action.type, text: action.label, icon: '•', color: '#d4d4d8' }
  }
}

export function simulateSlotClick(item, clickType, slot) {
  const key = CLICK_TYPE_KEYS[clickType] || 'leftClick'
  const commands = item?.[key] || []
  if (!commands.length) {
    return [{
      id: `${Date.now()}-empty`,
      time: new Date(),
      level: 'info',
      slot,
      clickType,
      itemName: item?.displayName,
      ...describeAction(null),
      text: 'No click commands for this button',
      icon: '○',
      color: '#71717a',
    }]
  }
  return commands.map((cmd, i) => {
    const action = parseAction(cmd)
    const desc = describeAction(action)
    return {
      id: `${Date.now()}-${slot}-${i}`,
      time: new Date(),
      level: desc.kind === 'close' ? 'system' : 'action',
      slot,
      clickType,
      itemName: item?.displayName,
      raw: cmd,
      ...desc,
    }
  })
}

export function simulateMenuOpen(state) {
  const entries = []
  entries.push({
    id: `open-${Date.now()}`,
    time: new Date(),
    level: 'system',
    text: `Opened menu: ${state.menuTitle}`,
    icon: '▶',
    color: '#e879f9',
    detail: `/${state.openCommand}`,
  })
  if (state.openCommands?.length) {
    state.openCommands.forEach((cmd, i) => {
      const action = parseAction(cmd)
      entries.push({
        id: `open-cmd-${Date.now()}-${i}`,
        time: new Date(),
        level: 'action',
        slot: null,
        clickType: 'open',
        raw: cmd,
        ...describeAction(action),
      })
    })
  }
  return entries
}

export function simulateMenuClose(state) {
  const entries = [{
    id: `close-${Date.now()}`,
    time: new Date(),
    level: 'system',
    text: 'Menu closed',
    icon: '✕',
    color: '#f87171',
  }]
  if (state.closeCommands?.length) {
    state.closeCommands.forEach((cmd, i) => {
      const action = parseAction(cmd)
      entries.push({
        id: `close-cmd-${Date.now()}-${i}`,
        time: new Date(),
        level: 'action',
        slot: null,
        clickType: 'close',
        raw: cmd,
        ...describeAction(action),
      })
    })
  }
  return entries
}

export function formatLogTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
