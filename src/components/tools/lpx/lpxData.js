/** LPX AntiPacketExploit — state, catalog & chip matrix (config.yml) */

export const CHIP_NODES = [
  { id: 'messages', label: 'Messages', angle: -90, desc: 'Prefix, kick & alert messages' },
  { id: 'options', label: 'Options', angle: -45, desc: 'License, bypass, VL clear, alerts store' },
  { id: 'printer', label: 'Printer', angle: 0, desc: 'Schematic / printer mode' },
  { id: 'mechanics', label: 'Mechanics', angle: 45, desc: 'Portal, bow, containers, redstone' },
  { id: 'logger', label: 'Logger', angle: 90, desc: 'Heavy packet & packet logger' },
  { id: 'discord', label: 'Discord', angle: 135, desc: 'Webhook embeds' },
  { id: 'checks-core', label: 'Packets', angle: 180, desc: 'Netty, window, creative, payload' },
  { id: 'checks-traffic', label: 'Traffic', angle: -135, desc: 'Flood, place, position, tab, command' },
]

export const SECTION_INFO = Object.fromEntries(CHIP_NODES.map(n => [n.id, n]))

const DEFAULT_KICK = "lpx kick %player% &cYou are sending suspicious packets."
const FLOOD_KICK_A = "lpx kick %player% &cYou are sending too many packets. :<"
const FLOOD_KICK_B = "lpx kick %player% &cYou are sending too many packets. >:"
const FLOOD_KICK_C = "lpx kick %player% &cYou are sending too many packets. :o"
const FLOOD_KICK_D = "lpx kick %player% &cYou are sending too many packets. o:"
const FLOOD_KICK_F = "lpx kick %player% &cYou are sending too many packets. :$"

function check(id, category, type, label, section, extra = {}) {
  return { id, category, type, label, section, ...extra }
}

export const CHECK_CATALOG = [
  check('netty.a', 'netty', 'a', 'Netty A', 'checks-core', {
    defaults: { maxVl: 3, options: { automatic: true, max: 98304 } },
  }),
  check('netty.b', 'netty', 'b', 'Netty B', 'checks-core', {
    defaults: {
      maxVl: 3,
      options: { resolved: true, max: 15, maxCharacters: 255, resolvedMultiplier: 3, resize: true, asciiOnly: false },
    },
  }),
  ...['a', 'b', 'c'].map(t => check(`window.${t}`, 'window', t, `Window ${t.toUpperCase()}`, 'checks-core', {
    defaults: { maxVl: 5, buffer: { max: 3, multiply: 0.25, decay: 1 } },
  })),
  check('window.d', 'window', 'd', 'Window D', 'checks-core', { defaults: { maxVl: 2 } }),
  check('creative.a', 'creative', 'a', 'Creative A', 'checks-core'),
  check('creative.b', 'creative', 'b', 'Creative B', 'checks-core', {
    defaults: { options: { max: 127, min: 0 } },
  }),
  check('creative.c', 'creative', 'c', 'Creative C', 'checks-core', { defaults: { options: { max: 3000 } } }),
  check('creative.d', 'creative', 'd', 'Creative D', 'checks-core', { defaults: { options: { max: 16384 } } }),
  check('creative.e', 'creative', 'e', 'Creative E', 'checks-core', {
    defaults: { options: { blacklist: ['run_command', 'translation.test.invalid'] } },
  }),
  check('creative.f', 'creative', 'f', 'Creative F', 'checks-core', { defaults: { options: { max: 64 } } }),
  check('creative.g', 'creative', 'g', 'Creative G', 'checks-core'),
  check('place.a', 'place', 'a', 'Place A', 'checks-traffic', {
    defaults: { maxVl: 10, buffer: { max: 5, multiply: 0.5, decay: 1 }, options: { max: 100 } },
  }),
  check('place.b', 'place', 'b', 'Place B', 'checks-traffic', { defaults: { options: { max: 70 } } }),
  check('place.c', 'place', 'c', 'Place C', 'checks-traffic', {
    defaults: { maxVl: 5, buffer: { max: 5, multiply: 0.5, decay: 1 }, options: { max: 50 } },
  }),
  check('flood.a', 'flood', 'a', 'Flood A', 'checks-traffic', {
    defaults: { maxVl: 3, punishCommands: [FLOOD_KICK_A], options: { max: 1100 } },
  }),
  check('flood.b', 'flood', 'b', 'Flood B', 'checks-traffic', {
    defaults: {
      maxVl: 6,
      minVl: 3,
      punishCommands: [FLOOD_KICK_B],
      options: {
        limits: [
          'ANIMATION,50,500,5,2',
          'USE_ITEM,60,1000,5,2',
          'PLAYER_BLOCK_PLACEMENT,14,100,6,3',
          'CLICK_WINDOW,20,200,10,4',
          'CREATIVE_INVENTORY_ACTION,20,200,10,4',
          'PLAYER_POSITION,40,100,5,3',
          'PLAYER_ROTATION,40,100,5,3',
          'PLAYER_POSITION_AND_ROTATION,40,100,5,3',
          'CRAFT_RECIPE_REQUEST,15,1000,2,1',
          'TAB_COMPLETE,40,1000,2,1',
          'INTERACT_ENTITY,20,600,5,2',
          'CHAT_COMMAND,5,500,5,2',
          'PLAYER_DIGGING,40,500,6,3',
          'UPDATE_SIGN,2,300,6,2',
        ],
      },
    },
  }),
  check('flood.c', 'flood', 'c', 'Flood C', 'checks-traffic', {
    defaults: {
      punishCommands: [FLOOD_KICK_C],
      options: { max: 10, resetInterval: 100, maxPeriods: 6, maxWarnings: 3, bigThreshold: 2048 },
    },
  }),
  check('flood.d', 'flood', 'd', 'Flood D', 'checks-traffic', {
    defaults: {
      maxVl: 4,
      punishCommands: [FLOOD_KICK_D],
      options: { max: 10, bigThreshold: 2048, maxBig: 6 },
    },
  }),
  check('flood.f', 'flood', 'f', 'Flood F', 'checks-traffic', {
    defaults: { maxVl: 2, punishCommands: [FLOOD_KICK_F], options: { max: 8 } },
  }),
  check('position.a', 'position', 'a', 'Position A', 'checks-traffic', { defaults: { maxVl: 1 } }),
  check('position.b', 'position', 'b', 'Position B', 'checks-traffic', {
    defaults: {
      maxVl: 6,
      buffer: { max: 2, multiply: 0.5, decay: 0.05 },
      options: { delay: 2000, hard: false, ignoreFly: true },
    },
  }),
  check('position.c', 'position', 'c', 'Position C', 'checks-traffic', { defaults: { maxVl: 1, options: { max: 15000 } } }),
  check('position.d', 'position', 'd', 'Position D', 'checks-traffic', { defaults: { maxVl: 1, options: { max: 100000 } } }),
  check('payload.a', 'payload', 'a', 'Payload A', 'checks-core'),
  check('payload.b', 'payload', 'b', 'Payload B', 'checks-core', { defaults: { maxVl: 2, options: { delay: 1000, max: 15 } } }),
  check('payload.c', 'payload', 'c', 'Payload C', 'checks-core'),
  check('payload.d', 'payload', 'd', 'Payload D', 'checks-core'),
  check('payload.e', 'payload', 'e', 'Payload E', 'checks-core', { defaults: { maxVl: 1 } }),
  check('payload.f', 'payload', 'f', 'Payload F', 'checks-core'),
  check('book.a', 'book', 'a', 'Book A', 'checks-core', { defaults: { options: { max: 15 } } }),
  check('tab.a', 'tab', 'a', 'Tab A', 'checks-traffic', {
    defaults: {
      maxVl: 10,
      options: {
        starts: ['/to ', '//to', '/calc ', '//calc'],
        contains: ['targetoffset', 'for(', '^(.', '*.'],
      },
    },
  }),
  check('tab.b', 'tab', 'b', 'Tab B', 'checks-traffic', {
    defaults: {
      enabled: true,
      punish: false,
      maxVl: 1,
      minVl: -1,
      options: { maxLength: 256, characters: ['[', ']', '{', '}', '@', '=', 'nbt'] },
    },
  }),
  check('command.a', 'command', 'a', 'Command A', 'checks-traffic', {
    defaults: {
      options: {
        commands: [
          '//calc', '//calculate', '//eval', '//evaluate', '//solve',
          '/hd readtext', '/holo readtext', '/hologram readtext', '/holograms readtext', '/holographicdisplays readtext',
          '/pex promote', '/pex demote', '/promote', '/demote', '/execute',
          '/mv ^', '/mv help ^', '/mvhelp ^', '/mv <', '/mv help <', '/mvhelp <', '/$',
        ],
      },
    },
  }),
]

export const CHECK_CATALOG_UNIQUE = CHECK_CATALOG

export function defaultCheckEntry(overrides = {}) {
  return {
    enabled: true,
    punish: true,
    maxVl: 3,
    minVl: 1,
    punishCommands: [DEFAULT_KICK],
    buffer: null,
    options: {},
    ...overrides,
  }
}

export function buildDefaultChecks() {
  const checks = {}
  CHECK_CATALOG_UNIQUE.forEach(meta => {
    const base = defaultCheckEntry()
    if (meta.defaults) {
      const { buffer, options, punishCommands, ...rest } = meta.defaults
      Object.assign(base, rest)
      if (buffer) base.buffer = { ...buffer }
      if (options) base.options = JSON.parse(JSON.stringify(options))
      if (punishCommands) base.punishCommands = [...punishCommands]
    }
    checks[meta.id] = base
  })
  return checks
}

export const CONFIG_PRESETS = [
  {
    id: 'balanced',
    label: 'Balanced',
    patch: {
      options: { bypassPermission: false, checkUpdates: true, clearTask: { enabled: true, delay: 300 } },
      packetLogger: { enabled: false },
    },
  },
  {
    id: 'strict',
    label: 'Strict',
    patch: {
      options: { kickOnException: true, bypassPermission: false, punishDelay: 500 },
      printer: { automatic: false },
    },
    checksPatch: { maxVl: 2, punish: true },
  },
  {
    id: 'lenient',
    label: 'Lenient',
    patch: {
      options: { kickOnException: false, bypassPermission: true, punishDelay: 2000 },
      printer: { automatic: true, placeThreshold: 15 },
    },
    checksPatch: { maxVl: 8, punish: false },
  },
]

export function createLpxState(overrides = {}) {
  return {
    license: 'null',
    forceFallback: false,
    messages: {
      mainColor: '&5',
      secondColor: '&d',
      prefix: '%main-color%LPX >>',
      kick: '&cYou are sending suspicious packets.',
      kickAlert: '%prefix% %second-color%%player% &7was kicked',
      noPermission: '%prefix% &cInsufficient permissions &7(%permission%)',
      invalidArguments: '%prefix% &cInvalid arguments!',
      injectionFailure: '%prefix% &cInjection failure!',
      updateFound: '%prefix% &aAn update was found!',
      nullAddress: '%prefix% &cYou are joining with an invalid address!',
      alerts: {
        permission: 'lpx.alerts',
        format: '%prefix% %second-color%%player% &7failed %main-color%%check% %type% &7(%vl%/%max-vl%)',
        hover: [
          '%main-color%Description:',
          '%second-color%%description%',
          '',
          '%main-color%Infos: %infos%',
          '',
        ],
        enabled: '%prefix% &aAlerts enabled',
        disabled: '%prefix% &cAlerts disabled',
      },
    },
    options: {
      silentFailures: false,
      kickOnException: true,
      disableItemDecoding: 'BOOKS',
      hiddenCommand: false,
      bypassPermission: false,
      geyser: false,
      checkUpdates: true,
      bstats: true,
      clearTask: { enabled: true, delay: 300 },
      printer: {
        automatic: false,
        placeThreshold: 10,
        disableDelay: 3000,
        alerts: true,
        permission: 'lpx.alerts.printer',
        join: '%prefix% %second-color%%player% &7joined printer mode (%mode%)',
        leave: '%prefix% %second-color%%player% &7left printer mode',
      },
      mechanics: {
        netherPortalDelay: 1000,
        maxArrowVelocity: 15,
        shearsCooldown: 500,
        breakCloseInventory: false,
        trapdoorRailRedstone: true,
        interactContainerDelay: 100,
      },
      alerts: { store: true, days: 14 },
      server: 'unnamed',
      punishDelay: 1000,
      debug: false,
      externalConfig: false,
    },
    discord: {
      enabled: false,
      url: '',
      color: '#00FFFF',
      content: [
        '**Player**: %player%',
        '**Check**: %check% %type%',
        '**VL**: %vl%/%max-vl%',
        '**Infos**: %infos%',
        '**Description**: %description%',
      ],
    },
    packetLogger: {
      heavyPacketThreshold: 5000000,
      enabled: false,
      playerMode: 'whitelist',
      players: ['Ytnoos'],
      packetMode: 'blacklist',
      packets: [
        'PLAYER_FLYING',
        'PLAYER_POSITION',
        'PLAYER_POSITION_AND_ROTATION',
        'PLAYER_ROTATION',
        'KEEP_ALIVE',
        'ANIMATION',
        'WINDOW_CONFIRMATION',
      ],
    },
    checks: buildDefaultChecks(),
    ...overrides,
  }
}

export function applyPreset(state, preset) {
  let next = { ...state }
  if (preset.patch) {
    Object.entries(preset.patch).forEach(([key, val]) => {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        next[key] = { ...next[key], ...val }
      } else {
        next[key] = val
      }
    })
  }
  if (preset.checksPatch) {
    const checks = { ...next.checks }
    Object.keys(checks).forEach(id => {
      checks[id] = { ...checks[id], ...preset.checksPatch }
    })
    next = { ...next, checks }
  }
  return next
}

function countEnabledChecks(state, section) {
  return CHECK_CATALOG_UNIQUE.filter(c => c.section === section && state.checks?.[c.id]?.enabled).length
}

export function getNodeStatus(state, nodeId) {
  switch (nodeId) {
    case 'messages':
      return state.messages?.prefix ? 'active' : 'idle'
    case 'options':
      if (state.options?.debug) return 'warning'
      if (state.options?.bypassPermission) return 'lenient'
      return state.options?.kickOnException ? 'strict' : 'active'
    case 'printer':
      return state.options?.printer?.automatic ? 'active' : 'idle'
    case 'mechanics':
      return state.options?.mechanics?.trapdoorRailRedstone ? 'active' : 'idle'
    case 'logger':
      return state.packetLogger?.enabled ? 'warning' : 'idle'
    case 'discord':
      return state.discord?.enabled ? 'active' : 'idle'
    case 'checks-core': {
      const n = countEnabledChecks(state, 'checks-core')
      if (n === 0) return 'idle'
      return n >= 20 ? 'strict' : 'active'
    }
    case 'checks-traffic': {
      const n = countEnabledChecks(state, 'checks-traffic')
      if (n === 0) return 'idle'
      return n >= 12 ? 'strict' : 'active'
    }
    default:
      return 'idle'
  }
}

export function getCoreStatus(state) {
  const statuses = CHIP_NODES.map(n => getNodeStatus(state, n.id))
  if (statuses.includes('warning')) return 'warning'
  if (statuses.filter(s => s === 'strict').length >= 3) return 'strict'
  if (statuses.filter(s => s === 'active').length >= 4) return 'active'
  return 'idle'
}

export function getConfigStats(state) {
  const nodes = {}
  CHIP_NODES.forEach(n => { nodes[n.id] = getNodeStatus(state, n.id) })
  const enabledChecks = Object.values(state.checks || {}).filter(c => c.enabled).length
  const punishChecks = Object.values(state.checks || {}).filter(c => c.enabled && c.punish).length
  return {
    core: getCoreStatus(state),
    nodes,
    strict: Object.values(nodes).filter(s => s === 'strict').length,
    active: Object.values(nodes).filter(s => s === 'active').length,
    checks: enabledChecks,
    punish: punishChecks,
  }
}

export const NODE_COLORS = {
  idle: { stroke: '#6b7280', fill: '#111827', glow: 'rgba(107,114,128,0.35)', line: '#374151' },
  active: { stroke: '#c084fc', fill: '#3b0764', glow: 'rgba(192,132,252,0.55)', line: '#a855f7' },
  strict: { stroke: '#f472b6', fill: '#500724', glow: 'rgba(244,114,182,0.55)', line: '#ec4899' },
  warning: { stroke: '#fbbf24', fill: '#422006', glow: 'rgba(251,191,36,0.5)', line: '#f59e0b' },
  lenient: { stroke: '#34d399', fill: '#064e3b', glow: 'rgba(52,211,153,0.45)', line: '#10b981' },
}

export const CORE_COLORS = {
  idle: { stroke: '#9ca3af', fill: '#0f0a14', glow: 'rgba(168,85,247,0.2)' },
  active: { stroke: '#d946ef', fill: '#3b0764', glow: 'rgba(217,70,239,0.65)' },
  strict: { stroke: '#f472b6', fill: '#500724', glow: 'rgba(244,114,182,0.65)' },
  warning: { stroke: '#fbbf24', fill: '#422006', glow: 'rgba(251,191,36,0.55)' },
  lenient: { stroke: '#34d399', fill: '#064e3b', glow: 'rgba(52,211,153,0.5)' },
}

export function getChecksForSection(section) {
  return CHECK_CATALOG_UNIQUE.filter(c => c.section === section)
}

export function getChecksForCategory(category) {
  return CHECK_CATALOG_UNIQUE.filter(c => c.category === category)
}

/** Group checks by category for UI */
export function getCheckCategoriesForSection(section) {
  const cats = new Set()
  getChecksForSection(section).forEach(c => cats.add(c.category))
  return [...cats]
}
