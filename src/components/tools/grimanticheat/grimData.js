let _seq = 0

export function uid() {
  _seq += 1
  return `grim${Date.now()}_${_seq}`
}

export const CHIP_NODES = [
  { id: 'alerts', label: 'Alerts', angle: -90, desc: 'Console, proxy & verbose alerts' },
  { id: 'spectators', label: 'Spectate', angle: -45, desc: 'Spectator visibility rules' },
  { id: 'network', label: 'Network', angle: 0, desc: 'Packets, ping, client brands' },
  { id: 'simulation', label: 'Sim', angle: 45, desc: 'Movement simulation & phase' },
  { id: 'movement', label: 'Move', angle: 90, desc: 'NoSlow, timers, vehicles' },
  { id: 'combat', label: 'Combat', angle: 135, desc: 'Reach & block placement' },
  { id: 'exploit', label: 'Exploit', angle: 180, desc: 'Elytra, ghostblocks' },
  { id: 'system', label: 'System', angle: -135, desc: 'Experimental, item reset, meta' },
]

export const SECTION_INFO = Object.fromEntries(CHIP_NODES.map(n => [n.id, n]))

export const CONFIG_PRESETS = [
  {
    id: 'balanced',
    label: 'Balanced',
    patch: {
      simulation: { threshold: '0.001', maxAdvantage: '1', maxCeiling: '4' },
      reach: { threshold: '0.0005', blockImpossibleHits: true, enablePostPacket: false },
      flags: { experimentalChecks: false, packetSpamThreshold: '100' },
    },
  },
  {
    id: 'strict',
    label: 'Strict PvP',
    patch: {
      simulation: { threshold: '0.0005', immediateSetbackThreshold: '0.05', maxAdvantage: '0.8' },
      reach: { threshold: '0.0003', blockImpossibleHits: true, enablePostPacket: true },
      noSlow: { threshold: '0.0005', setbackvl: '3' },
      flags: { experimentalChecks: false, packetSpamThreshold: '80' },
    },
  },
  {
    id: 'lenient',
    label: 'Lenient',
    patch: {
      simulation: { threshold: '0.002', maxAdvantage: '2', maxCeiling: '6' },
      reach: { threshold: '0.001', blockImpossibleHits: false, enablePostPacket: false },
      flags: { experimentalChecks: false, packetSpamThreshold: '150' },
    },
  },
]

export const PUNISHMENT_PRESETS = [
  { id: 'full', label: 'Full Grim default' },
  { id: 'minimal', label: 'Alerts only' },
]

export function defaultIgnoredClients() {
  return [
    '^vanilla$',
    '^fabric$',
    '^quilt$',
    '^lunarclient:v\\d+\\.\\d+\\.\\d+-\\d{4},(?:fabric|forge)$',
    '^Feather Fabric$',
    '^labymod$',
  ]
}

export function defaultPunishmentCategories() {
  return [
    { id: uid(), name: 'Simulation', removeViolationsAfter: '300', checks: ['Simulation', 'GroundSpoof', 'Timer', 'TimerLimit', 'NoFall'], commands: ['100:40 [alert]', '1:1 [log]', '100:100 [webhook]', '100:100 [proxy]'] },
    { id: uid(), name: 'Knockback', removeViolationsAfter: '300', checks: ['Knockback', 'Explosion'], commands: ['5:5 [alert]', '1:1 [log]', '20:20 [webhook]', '20:20 [proxy]'] },
    { id: uid(), name: 'Post', removeViolationsAfter: '300', checks: ['Post'], commands: ['20:20 [alert]', '1:1 [log]', '40:40 [webhook]', '40:40 [proxy]'] },
    { id: uid(), name: 'BadPackets', removeViolationsAfter: '300', checks: ['BadPackets', 'PacketOrder', 'Crash'], commands: ['20:20 [alert]', '1:1 [log]', '40:40 [webhook]', '40:40 [proxy]'] },
    { id: uid(), name: 'Reach', removeViolationsAfter: '300', checks: ['Reach'], commands: ['1:1 [alert]', '1:1 [log]', '1:1 [webhook]', '1:1 [proxy]'] },
    { id: uid(), name: 'Hitboxes', removeViolationsAfter: '300', checks: ['Hitboxes'], commands: ['5:3 [alert]', '1:1 [log]', '5:3 [webhook]', '5:3 [proxy]'] },
    { id: uid(), name: 'Misc', removeViolationsAfter: '300', checks: ['Vehicle', 'NoSlow', 'Sprint', 'MultiActions', 'Place', 'Baritone', 'Break', 'TransactionOrder', 'Elytra', 'Chat', 'Exploit'], commands: ['10:5 [alert]', '1:1 [log]', '20:10 [webhook]', '20:10 [proxy]'] },
    { id: uid(), name: 'Combat', removeViolationsAfter: '300', checks: ['Interact', 'Aim'], commands: ['20:40 [alert]', '1:1 [log]'] },
    { id: uid(), name: 'Autoclicker', removeViolationsAfter: '300', checks: ['Autoclicker'], commands: ['20:40 [alert]', '1:1 [log]'] },
  ]
}

export function minimalPunishmentCategories() {
  return [
    { id: uid(), name: 'Alerts', removeViolationsAfter: '300', checks: ['Simulation', 'Reach', 'BadPackets'], commands: ['5:5 [alert]', '1:1 [log]'] },
  ]
}

export function emptyPunishmentCategory(name = 'NewCategory') {
  return {
    id: uid(),
    name,
    removeViolationsAfter: '300',
    checks: [],
    commands: ['5:5 [alert]'],
  }
}

export function createGrimState(overrides = {}) {
  return {
    alerts: {
      printToConsole: true,
      proxySend: false,
      proxyReceive: false,
    },
    verbose: { printToConsole: false },
    checkForUpdates: true,
    clientBrand: {
      disconnectBlacklistedForge: true,
      ignoredClients: defaultIgnoredClients(),
    },
    spectators: {
      hideRegardless: false,
      allowedWorlds: [],
    },
    general: {
      maxTransactionTime: '60',
      disablePongCancelling: false,
      disableDefaultResyncHandler: false,
      cancelDuplicatePacket: true,
      ignoreDuplicatePacketRotation: false,
    },
    simulation: {
      setbackDecayMultiplier: '0.999',
      threshold: '0.001',
      immediateSetbackThreshold: '0.1',
      maxAdvantage: '1',
      maxCeiling: '4',
      setbackViolationThreshold: '1',
    },
    phase: { setbackvl: '1', decay: '0.005' },
    place: {
      airLiquidCancelvl: '0',
      fabricatedCancelvl: '5',
      farCancelvl: '5',
      positionCancelvl: '5',
      rotationCancelvl: '5',
    },
    noSlow: { threshold: '0.001', setbackvl: '5', decay: '0.05' },
    knockback: {
      setbackDecayMultiplier: '0.999',
      threshold: '0.001',
      immediateSetbackThreshold: '0.1',
      maxAdvantage: '1',
      maxCeiling: '4',
    },
    explosion: { threshold: '0.001', setbackvl: '3' },
    timer: {
      timerASetbackvl: '10',
      drift: '120',
      timerLimitPingThreshold: '1000',
      negativeTimerDrift: '1200',
      vehicleTimerSetbackvl: '10',
    },
    reach: {
      threshold: '0.0005',
      blockImpossibleHits: true,
      enablePostPacket: false,
    },
    exploit: {
      allowSprintJumpElytra: true,
      allowBuildingGhostblocks: true,
      distanceGhostblocks: '2',
    },
    flags: {
      debugPipelineOnJoin: false,
      experimentalChecks: false,
      resetItemOnUpdate: true,
      resetItemOnAttack: true,
      resetItemOnSlotChange: true,
      resetItemOnItemUse: true,
      packetSpamThreshold: '100',
      debugPacketCancel: false,
      maxPingOutOfFlying: '1000',
      maxPingFireworkBoost: '1000',
    },
    packetOrder: { exemptPlacingWhileDigging: false },
    configFlavor: 'V2',
    configVersion: '10',
    punishments: defaultPunishmentCategories(),
    ...overrides,
  }
}

export function applyPreset(state, preset) {
  const next = { ...state }
  if (preset.patch) {
    Object.entries(preset.patch).forEach(([key, val]) => {
      next[key] = { ...next[key], ...val }
    })
  }
  return next
}

export function applyPunishmentPreset(state, presetId) {
  if (presetId === 'minimal') {
    return { ...state, punishments: minimalPunishmentCategories() }
  }
  return { ...state, punishments: defaultPunishmentCategories() }
}

export function getNodeStatus(state, nodeId) {
  switch (nodeId) {
    case 'alerts':
      if (state.alerts?.proxySend && state.alerts?.proxyReceive) return 'strict'
      return state.alerts?.printToConsole || state.alerts?.proxySend ? 'active' : 'idle'
    case 'spectators':
      return state.spectators?.hideRegardless || (state.spectators?.allowedWorlds?.length > 0) ? 'active' : 'idle'
    case 'network': {
      if (parseInt(state.flags?.packetSpamThreshold, 10) < 90) return 'strict'
      const custom = state.general?.maxTransactionTime !== '60'
        || state.general?.disablePongCancelling
        || !state.general?.cancelDuplicatePacket
      return custom ? 'active' : 'idle'
    }
    case 'simulation':
      if (parseFloat(state.simulation?.threshold || '0.001') <= 0.0006) return 'strict'
      return 'active'
    case 'movement':
      if (state.noSlow?.setbackvl === '3' || parseFloat(state.timer?.drift || '120') < 100) return 'strict'
      return 'active'
    case 'combat':
      if (state.reach?.enablePostPacket) return 'strict'
      return state.reach?.blockImpossibleHits ? 'active' : 'idle'
    case 'exploit':
      if (!state.exploit?.allowBuildingGhostblocks || !state.exploit?.allowSprintJumpElytra) return 'strict'
      return parseInt(state.exploit?.distanceGhostblocks, 10) > 2 ? 'active' : 'idle'
    case 'system':
      if (state.flags?.experimentalChecks) return 'experimental'
      if (state.flags?.debugPipelineOnJoin || state.flags?.debugPacketCancel) return 'warning'
      return 'idle'
    default:
      return 'idle'
  }
}

export function getCoreStatus(state) {
  const statuses = CHIP_NODES.map(n => getNodeStatus(state, n.id))
  if (statuses.includes('experimental')) return 'experimental'
  const strictCount = statuses.filter(s => s === 'strict').length
  if (strictCount >= 3) return 'strict'
  if (strictCount >= 1 || statuses.filter(s => s === 'active').length >= 4) return 'active'
  return 'idle'
}

export function getConfigStats(state) {
  const nodeStatuses = {}
  CHIP_NODES.forEach(n => { nodeStatuses[n.id] = getNodeStatus(state, n.id) })
  return {
    core: getCoreStatus(state),
    nodes: nodeStatuses,
    strict: Object.values(nodeStatuses).filter(s => s === 'strict').length,
    active: Object.values(nodeStatuses).filter(s => s === 'active').length,
    categories: (state.punishments || []).length,
  }
}

export const STATUS_LABELS = {
  idle: 'Standby',
  active: 'Online',
  strict: 'Strict',
  warning: 'Debug',
  experimental: 'Experimental',
}

export const NODE_COLORS = {
  idle: { stroke: '#64748b', fill: '#0f172a', glow: 'rgba(100,116,139,0.25)', line: '#334155' },
  active: { stroke: '#22d3ee', fill: '#042f2e', glow: 'rgba(34,211,238,0.55)', line: '#06b6d4' },
  strict: { stroke: '#fb7185', fill: '#4c0519', glow: 'rgba(251,113,133,0.55)', line: '#f43f5e' },
  warning: { stroke: '#fbbf24', fill: '#422006', glow: 'rgba(251,191,36,0.5)', line: '#f59e0b' },
  experimental: { stroke: '#c084fc', fill: '#2e1065', glow: 'rgba(192,132,252,0.6)', line: '#a855f7' },
}

export const CORE_COLORS = {
  idle: { stroke: '#94a3b8', fill: '#0c0c14', glow: 'rgba(148,163,184,0.25)' },
  active: { stroke: '#2dd4bf', fill: '#042f2e', glow: 'rgba(45,212,191,0.55)' },
  strict: { stroke: '#fb7185', fill: '#450a0a', glow: 'rgba(251,113,133,0.65)' },
  experimental: { stroke: '#e879f9', fill: '#3b0764', glow: 'rgba(232,121,249,0.7)' },
}
