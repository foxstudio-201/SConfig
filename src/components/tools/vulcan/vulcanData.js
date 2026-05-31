let _seq = 0

export function uid() {
  _seq += 1
  return `vul${Date.now()}_${_seq}`
}

export const CHIP_NODES = [
  { id: 'alerts', label: 'Alerts', angle: -90, desc: 'Staff alerts, logging & VL reset' },
  { id: 'client', label: 'Client', angle: -45, desc: 'Client brand alerts & blacklist' },
  { id: 'connection', label: 'Link', angle: 0, desc: 'Packet confirmation & ping kicks' },
  { id: 'settings', label: 'Core', angle: 45, desc: 'Global plugin settings' },
  { id: 'combat', label: 'Combat', angle: 90, desc: 'Combat category checks' },
  { id: 'movement', label: 'Move', angle: 135, desc: 'Movement category checks' },
  { id: 'player', label: 'Player', angle: 180, desc: 'Player category checks' },
  { id: 'discord', label: 'Discord', angle: -135, desc: 'Webhooks & ghost blocks' },
]

export const SECTION_INFO = Object.fromEntries(CHIP_NODES.map(n => [n.id, n]))

export const CHECK_CATALOG = [
  { id: 'combat.aim.a', category: 'combat', group: 'aim', type: 'a', label: 'Aim A' },
  { id: 'combat.aim.b', category: 'combat', group: 'aim', type: 'b', label: 'Aim B' },
  { id: 'combat.autoclicker.a', category: 'combat', group: 'autoclicker', type: 'a', label: 'AutoClicker A' },
  { id: 'combat.autoclicker.b', category: 'combat', group: 'autoclicker', type: 'b', label: 'AutoClicker B' },
  { id: 'combat.killaura.a', category: 'combat', group: 'killaura', type: 'a', label: 'KillAura A' },
  { id: 'combat.reach.a', category: 'combat', group: 'reach', type: 'a', label: 'Reach A' },
  { id: 'combat.velocity.a', category: 'combat', group: 'velocity', type: 'a', label: 'Velocity A' },
  { id: 'combat.hitbox.a', category: 'combat', group: 'hitbox', type: 'a', label: 'Hitbox A' },
  { id: 'movement.speed.a', category: 'movement', group: 'speed', type: 'a', label: 'Speed A' },
  { id: 'movement.speed.b', category: 'movement', group: 'speed', type: 'b', label: 'Speed B' },
  { id: 'movement.fly.a', category: 'movement', group: 'fly', type: 'a', label: 'Fly A' },
  { id: 'movement.noslow.a', category: 'movement', group: 'noslow', type: 'a', label: 'NoSlow A' },
  { id: 'movement.step.a', category: 'movement', group: 'step', type: 'a', label: 'Step A' },
  { id: 'movement.jump.a', category: 'movement', group: 'jump', type: 'a', label: 'Jump A' },
  { id: 'movement.elytra.a', category: 'movement', group: 'elytra', type: 'a', label: 'Elytra A' },
  { id: 'movement.boatfly.a', category: 'movement', group: 'boatfly', type: 'a', label: 'BoatFly A' },
  { id: 'player.badpackets.a', category: 'player', group: 'badpackets', type: 'a', label: 'BadPackets A' },
  { id: 'player.badpackets.f', category: 'player', group: 'badpackets', type: 'f', label: 'BadPackets F' },
  { id: 'player.timer.a', category: 'player', group: 'timer', type: 'a', label: 'Timer A' },
  { id: 'player.timer.d', category: 'player', group: 'timer', type: 'd', label: 'Timer D' },
  { id: 'player.scaffold.a', category: 'player', group: 'scaffold', type: 'a', label: 'Scaffold A' },
  { id: 'player.inventory.a', category: 'player', group: 'inventory', type: 'a', label: 'Inventory A' },
  { id: 'player.improbable.a', category: 'player', group: 'improbable', type: 'a', label: 'Improbable A' },
  { id: 'player.groundspoof.a', category: 'player', group: 'groundspoof', type: 'a', label: 'GroundSpoof A' },
]

export function defaultCheckEntry(overrides = {}) {
  return {
    enabled: true,
    punishable: true,
    broadcastPunishment: false,
    maxViolations: 8,
    alertInterval: 1,
    dontAlertUntil: 1,
    maximumPing: '100000',
    minimumTps: '-1',
    punishmentCommands: ['kick %player% &c[Vulcan] Unfair Advantage'],
    bufferMax: 5,
    bufferMultiple: '0.5',
    bufferDecay: '0.75',
    ...overrides,
  }
}

export function buildDefaultChecks() {
  const checks = {}
  CHECK_CATALOG.forEach(c => {
    const strict = c.id.includes('aim.a') || c.id.includes('killaura')
    checks[c.id] = defaultCheckEntry({
      maxViolations: strict ? 3 : 8,
      enabled: !c.id.includes('boatfly'),
    })
  })
  return checks
}

export const CONFIG_PRESETS = [
  {
    id: 'balanced',
    label: 'Balanced',
    patch: {
      settings: { asyncAlerts: false, maxAlertViolation: '250', punishmentDelay: '10000' },
    },
    checksPatch: { maxViolations: 10 },
  },
  {
    id: 'strict',
    label: 'Strict',
    patch: {
      settings: { asyncAlerts: false, maxAlertViolation: '150', punishmentDelay: '5000', joinCheckWaitTime: '3000' },
      connection: { maxPingKick: true, maxPingValue: '5000' },
    },
    checksPatch: { maxViolations: 5, punishable: true },
  },
  {
    id: 'lenient',
    label: 'Lenient',
    patch: {
      settings: { maxAlertViolation: '350', punishmentDelay: '15000' },
    },
    checksPatch: { maxViolations: 15, dontAlertUntil: 3 },
  },
]

export function createVulcanState(overrides = {}) {
  return {
    prefix: '&4&lVulcan &8»',
    alerts: {
      format: '%prefix% &f%player% &7failed &f%check% %dev%&7(&fType %type%&7)%dev% &7[&4%vl%&7/&4%max-vl%&7]',
      printToConsole: true,
      consoleFormat: '[Vulcan] %player% failed %check% %dev%(Type %type%)%dev% (%vl%/%max-vl%)',
      experimentalSymbol: '*',
      toggledOnMessage: '%prefix% &7Vulcan alerts &aenabled&7!',
      toggledOffMessage: '%prefix% &7Vulcan alerts &cdisabled&7!',
      clickCommands: ['/vulcan clickalert %player%'],
      clickAlertCommands: ['tp %player%'],
      customCommands: [],
    },
    logFile: {
      enabled: true,
      alertMessage: '%player% failed %check% %dev%(Type %type%)%dev% [VL: %vl%] [Ping: %ping%] [TPS: %tps%]',
      punishmentMessage: '%player% was punished for %check% %dev%(Type %type%)%dev% [VL: %vl%]',
    },
    violationReset: {
      enabled: true,
      intervalMinutes: '8',
      messageEnabled: true,
      message: '%prefix% &7Violations for all online players were reset!',
    },
    clientBrand: {
      resolve: true,
      enabled: true,
      ignoreAlertsList: ['vanilla', 'lunar', 'feather'],
      message: '%prefix% &c%player% &7joined using &f%client-brand%&7!',
      blockedBrands: [],
      unallowedKickMessage: "&cYou can't join with %client-brand%!",
      whitelistEnabled: false,
      whitelistedBrands: [],
      console: false,
    },
    connection: {
      debugMessages: false,
      otherAnticheatSupport: false,
      noResponseDelay: '30',
      maxSizeAmount: '2000',
      keepaliveKick: true,
      keepaliveMaxDelay: '45000',
      maxPingKick: true,
      maxPingValue: '20000',
      maxPingTicks: '20',
    },
    settings: {
      toggleAlertsOnJoin: true,
      perCheckSeverities: true,
      checkForUpdates: true,
      asyncAlerts: false,
      maxAlertViolation: '250',
      punishmentDelay: '10000',
      ignoreFloodgate: true,
      joinCheckWaitTime: '2500',
      maxLogsFileSize: '7500',
      serverName: 'Default',
      flightCooldown: '40',
      lenientScaffolding: true,
      entityCollision: true,
      pluginMessaging: true,
      debug: false,
    },
    ghostBlocks: {
      enabled: true,
      ghostWaterFix: true,
      minimumTps: '18.5',
      setback: true,
      ticks: '3',
      staffMessageEnabled: true,
    },
    discord: {
      alertsEnabled: false,
      alertsUrl: 'insert-webhook-url-here',
      punishmentsEnabled: false,
      punishmentsUrl: 'insert-webhook-url-here',
      username: 'Vulcan',
      alertTitle: 'Vulcan Alert',
      punishmentTitle: 'Vulcan Punishment',
    },
    punishments: {
      message: '%prefix% &c%player% &7was punished for &f%check% &7(&fType %type%&7) &7[&4x%vl%&7]',
    },
    checks: buildDefaultChecks(),
    ...overrides,
  }
}

export function applyPreset(state, preset) {
  let next = { ...state }
  if (preset.patch) {
    Object.entries(preset.patch).forEach(([key, val]) => {
      next[key] = { ...next[key], ...val }
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

export function getNodeStatus(state, nodeId) {
  switch (nodeId) {
    case 'alerts':
      return state.alerts?.printToConsole ? 'active' : 'idle'
    case 'client':
      return (state.clientBrand?.blockedBrands?.length > 0) ? 'strict' : 'active'
    case 'connection':
      if (state.connection?.maxPingKick && parseInt(state.connection.maxPingValue, 10) < 10000) return 'strict'
      return 'active'
    case 'settings':
      if (state.settings?.debug) return 'warning'
      return parseInt(state.settings?.punishmentDelay, 10) <= 5000 ? 'strict' : 'active'
    case 'combat': {
      const n = countEnabledChecks(state, 'combat')
      if (n === 0) return 'idle'
      return avgMaxVl(state, 'combat') <= 5 ? 'strict' : 'active'
    }
    case 'movement': {
      const n = countEnabledChecks(state, 'movement')
      return n === 0 ? 'idle' : 'active'
    }
    case 'player': {
      const n = countEnabledChecks(state, 'player')
      return n === 0 ? 'idle' : 'active'
    }
    case 'discord':
      if (state.discord?.alertsEnabled || state.discord?.punishmentsEnabled) return 'active'
      return state.ghostBlocks?.enabled ? 'active' : 'idle'
    default:
      return 'idle'
  }
}

function countEnabledChecks(state, category) {
  return CHECK_CATALOG.filter(c => c.category === category && state.checks?.[c.id]?.enabled).length
}

function avgMaxVl(state, category) {
  const items = CHECK_CATALOG.filter(c => c.category === category && state.checks?.[c.id]?.enabled)
  if (!items.length) return 99
  const sum = items.reduce((a, c) => a + parseInt(state.checks[c.id]?.maxViolations || '8', 10), 0)
  return sum / items.length
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
  return {
    core: getCoreStatus(state),
    nodes,
    strict: Object.values(nodes).filter(s => s === 'strict').length,
    active: Object.values(nodes).filter(s => s === 'active').length,
    checks: enabledChecks,
  }
}

export const STATUS_LABELS = {
  idle: 'Standby',
  active: 'Online',
  strict: 'Strict',
  warning: 'Debug',
  experimental: 'Beta',
}

export const NODE_COLORS = {
  idle: { stroke: '#78716c', fill: '#1c1917', glow: 'rgba(120,113,108,0.3)', line: '#44403c' },
  active: { stroke: '#fb923c', fill: '#431407', glow: 'rgba(251,146,60,0.55)', line: '#ea580c' },
  strict: { stroke: '#ef4444', fill: '#450a0a', glow: 'rgba(239,68,68,0.55)', line: '#dc2626' },
  warning: { stroke: '#facc15', fill: '#422006', glow: 'rgba(250,204,21,0.5)', line: '#ca8a04' },
  experimental: { stroke: '#f472b6', fill: '#500724', glow: 'rgba(244,114,182,0.5)', line: '#db2777' },
}

export const CORE_COLORS = {
  idle: { stroke: '#a8a29e', fill: '#0c0a09', glow: 'rgba(168,162,158,0.25)' },
  active: { stroke: '#f97316', fill: '#431407', glow: 'rgba(249,115,22,0.6)' },
  strict: { stroke: '#ef4444', fill: '#450a0a', glow: 'rgba(239,68,68,0.65)' },
  warning: { stroke: '#eab308', fill: '#422006', glow: 'rgba(234,179,8,0.55)' },
  experimental: { stroke: '#ec4899', fill: '#500724', glow: 'rgba(236,72,153,0.6)' },
}

export function getChecksForCategory(category) {
  return CHECK_CATALOG.filter(c => c.category === category)
}
