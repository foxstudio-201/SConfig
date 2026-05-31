let _uid = 0
export function uid() {
  _uid += 1
  return `cp${Date.now()}_${_uid}`
}

export const PROFILE_TYPES = [
  { value: 'global', label: 'Global (config.yml)' },
  { value: 'world', label: 'World override' },
]

export const LOGGING_GROUPS = [
  {
    id: 'rollback',
    label: 'Rollback',
    options: [
      { key: 'rollback-items', field: 'rollbackItems', label: 'Rollback items', desc: 'Include container items in rollbacks' },
      { key: 'rollback-entities', field: 'rollbackEntities', label: 'Rollback entities', desc: 'Include killed entities in rollbacks' },
      { key: 'skip-generic-data', field: 'skipGenericData', label: 'Skip generic data', desc: 'Skip generic data like mobs burning in daylight' },
    ],
  },
  {
    id: 'blocks',
    label: 'Blocks',
    options: [
      { key: 'block-place', field: 'blockPlace', label: 'Block place', desc: 'Log blocks placed by players' },
      { key: 'block-break', field: 'blockBreak', label: 'Block break', desc: 'Log blocks broken by players' },
      { key: 'natural-break', field: 'naturalBreak', label: 'Natural break', desc: 'Signs/torches falling when block broken' },
      { key: 'block-movement', field: 'blockMovement', label: 'Block movement', desc: 'Sand/gravel falling' },
      { key: 'pistons', field: 'pistons', label: 'Pistons', desc: 'Blocks moved by pistons' },
      { key: 'block-burn', field: 'blockBurn', label: 'Block burn', desc: 'Blocks burning in fire' },
      { key: 'block-ignite', field: 'blockIgnite', label: 'Block ignite', desc: 'Blocks igniting naturally' },
      { key: 'explosions', field: 'explosions', label: 'Explosions', desc: 'TNT, creepers, etc.' },
      { key: 'sign-text', field: 'signText', label: 'Sign text', desc: 'Text written on signs' },
    ],
  },
  {
    id: 'entities',
    label: 'Entities',
    options: [
      { key: 'entity-change', field: 'entityChange', label: 'Entity change', desc: 'Endermen destroying blocks' },
      { key: 'entity-kills', field: 'entityKills', label: 'Entity kills', desc: 'Killed animals and mobs' },
    ],
  },
  {
    id: 'liquids',
    label: 'Liquids & Nature',
    options: [
      { key: 'buckets', field: 'buckets', label: 'Buckets', desc: 'Lava/water bucket usage' },
      { key: 'water-flow', field: 'waterFlow', label: 'Water flow', desc: 'Water destroying blocks' },
      { key: 'lava-flow', field: 'lavaFlow', label: 'Lava flow', desc: 'Lava destroying blocks' },
      { key: 'liquid-tracking', field: 'liquidTracking', label: 'Liquid tracking', desc: 'Link liquid flow to player' },
      { key: 'leaf-decay', field: 'leafDecay', label: 'Leaf decay', desc: 'Natural leaf decay' },
      { key: 'tree-growth', field: 'treeGrowth', label: 'Tree growth', desc: 'Sapling growth linked to planter' },
      { key: 'mushroom-growth', field: 'mushroomGrowth', label: 'Mushroom growth', desc: 'Mushroom spread' },
      { key: 'vine-growth', field: 'vineGrowth', label: 'Vine growth', desc: 'Natural vine growth' },
      { key: 'portals', field: 'portals', label: 'Portals', desc: 'Nether portal generation' },
    ],
  },
  {
    id: 'player',
    label: 'Player & Items',
    options: [
      { key: 'item-transactions', field: 'itemTransactions', label: 'Item transactions', desc: 'Chest/furnace/dispenser items' },
      { key: 'player-interactions', field: 'playerInteractions', label: 'Player interactions', desc: 'Doors, buttons, chest opens' },
      { key: 'player-messages', field: 'playerMessages', label: 'Chat messages', desc: 'Player chat logging' },
      { key: 'player-commands', field: 'playerCommands', label: 'Commands', desc: 'All player commands' },
      { key: 'player-sessions', field: 'playerSessions', label: 'Sessions', desc: 'Login/logout events' },
      { key: 'username-changes', field: 'usernameChanges', label: 'Username changes', desc: 'Name change history' },
      { key: 'worldedit', field: 'worldedit', label: 'WorldEdit', desc: 'WorldEdit changes' },
    ],
  },
]

export const ROLLBACK_FIELDS = LOGGING_GROUPS.find(g => g.id === 'rollback')?.options || []
export const ALL_LOG_FIELDS = LOGGING_GROUPS.filter(g => g.id !== 'rollback').flatMap(g => g.options)
export const ALL_CONFIG_FIELDS = [...ROLLBACK_FIELDS, ...ALL_LOG_FIELDS]

export const COMMAND_TYPES = [
  { value: 'lookup', label: 'Lookup (/co lookup)', alias: 'l' },
  { value: 'rollback', label: 'Rollback (/co rollback)', alias: 'rb' },
  { value: 'restore', label: 'Restore (/co restore)', alias: 'rs' },
  { value: 'purge', label: 'Purge (/co purge)', alias: 'purge' },
  { value: 'inspect', label: 'Inspect (/co inspect)', alias: 'i' },
]

export const ACTIONS = [
  { value: '', label: 'Any action' },
  { value: 'block', label: 'block (placed/broken)' },
  { value: '+block', label: '+block (placed)' },
  { value: '-block', label: '-block (broken)' },
  { value: 'container', label: 'container' },
  { value: '+container', label: '+container (put in)' },
  { value: '-container', label: '-container (taken)' },
  { value: 'item', label: 'item' },
  { value: 'inventory', label: 'inventory' },
  { value: 'kill', label: 'kill' },
  { value: 'chat', label: 'chat' },
  { value: 'command', label: 'command' },
  { value: 'click', label: 'click' },
  { value: 'sign', label: 'sign' },
  { value: 'session', label: 'session' },
  { value: '+session', label: '+session (login)' },
  { value: '-session', label: '-session (logout)' },
  { value: 'username', label: 'username' },
]

export const HASHTAGS = [
  { value: 'preview', label: '#preview', desc: 'Preview rollback/restore' },
  { value: 'verbose', label: '#verbose', desc: 'Extra rollback info' },
  { value: 'silent', label: '#silent', desc: 'Minimal output' },
  { value: 'count', label: '#count', desc: 'Return row count (lookup)' },
  { value: 'optimize', label: '#optimize', desc: 'MySQL table optimize (purge)' },
]

export const BLACKLIST_TYPES = [
  { value: 'user', label: 'User', prefix: '', example: 'Notch', desc: 'Player or #creeper' },
  { value: 'command', label: 'Command', prefix: '', example: '/help', desc: 'Command to ignore' },
  { value: 'block', label: 'Block', prefix: 'minecraft:', example: 'minecraft:stone', desc: 'Block ID with namespace' },
  { value: 'entity', label: 'Entity', prefix: 'minecraft:', example: 'minecraft:creeper', desc: 'Entity ID with namespace' },
  { value: 'filter', label: 'Filter', prefix: '', example: 'minecraft:shears@#dispenser', desc: 'id@user filter' },
]

export const COMMAND_PRESETS = [
  { id: 'grief-1h', label: 'Rollback grief (1h, 50 blocks)', type: 'rollback', users: '', time: '1h', radius: '50', action: '', include: '', exclude: '', hashtags: [] },
  { id: 'grief-player', label: 'Rollback player (1h)', type: 'rollback', users: 'Griefer', time: '1h', radius: '10', action: '', include: '', exclude: '', hashtags: ['preview'] },
  { id: 'chest-theft', label: 'Lookup chest theft', type: 'lookup', users: '', time: '1h', radius: '10', action: '-container', include: '', exclude: '', hashtags: [] },
  { id: 'xray', label: 'Lookup diamond mined', type: 'lookup', users: '', time: '1h', radius: '', action: '-block', include: 'diamond_ore', exclude: '', hashtags: [] },
  { id: 'purge-30d', label: 'Purge older than 30 days', type: 'purge', users: '', time: '30d', radius: '', action: '', include: '', exclude: '', hashtags: [] },
  { id: 'restore-undo', label: 'Restore undo rollback', type: 'restore', users: '', time: '1h', radius: '10', action: '', include: '', exclude: '', hashtags: [] },
]

export function createProfileState(overrides = {}) {
  return {
    _id: uid(),
    profileType: 'global',
    worldName: '',
    verbose: true,
    checkUpdates: true,
    apiEnabled: true,
    defaultRadius: 10,
    maxRadius: 100,
    useMysql: false,
    tablePrefix: 'co_',
    mysqlHost: '127.0.0.1',
    mysqlPort: 3306,
    mysqlDatabase: 'database',
    mysqlUsername: 'root',
    mysqlPassword: '',
    rollbackItems: true,
    rollbackEntities: true,
    skipGenericData: true,
    blockPlace: true,
    blockBreak: true,
    naturalBreak: true,
    blockMovement: true,
    pistons: true,
    blockBurn: true,
    blockIgnite: true,
    explosions: true,
    entityChange: true,
    entityKills: true,
    signText: true,
    buckets: true,
    leafDecay: true,
    treeGrowth: true,
    mushroomGrowth: true,
    vineGrowth: true,
    portals: true,
    waterFlow: true,
    lavaFlow: true,
    liquidTracking: true,
    itemTransactions: true,
    playerInteractions: true,
    playerMessages: true,
    playerCommands: true,
    playerSessions: true,
    usernameChanges: true,
    worldedit: true,
    worldOverrideMinimal: false,
    extraYaml: '',
    ...overrides,
  }
}

export function createBlacklistEntry(type = 'user', value = '') {
  return { _id: uid(), type, value }
}

export function createCommandState(overrides = {}) {
  return {
    commandType: 'rollback',
    users: '',
    time: '1h',
    radius: '10',
    action: '',
    include: '',
    exclude: '',
    hashtags: [],
    ...overrides,
  }
}

function applyLoggingPatch(state, patch) {
  return { ...state, ...patch }
}

export const CONFIG_PRESETS = [
  {
    id: 'default',
    label: 'Default (full logging)',
    patch: {},
  },
  {
    id: 'performance',
    label: 'Performance optimized',
    patch: {
      entityChange: false,
      leafDecay: false,
      waterFlow: false,
      lavaFlow: false,
      mushroomGrowth: false,
      vineGrowth: false,
      playerMessages: false,
      playerCommands: false,
      skipGenericData: true,
    },
  },
  {
    id: 'minimal',
    label: 'Minimal (blocks + containers)',
    patch: {
      blockPlace: true, blockBreak: true, naturalBreak: true, itemTransactions: true,
      entityChange: false, entityKills: false, leafDecay: false, waterFlow: false,
      lavaFlow: false, playerMessages: false, playerCommands: false, playerSessions: false,
      explosions: false, blockBurn: false, treeGrowth: false, worldedit: false,
    },
  },
  {
    id: 'pvp-survival',
    label: 'PvP Survival',
    patch: {
      entityKills: true, explosions: true, blockPlace: true, blockBreak: true,
      itemTransactions: true, playerSessions: true, playerMessages: false,
      waterFlow: false, lavaFlow: false, leafDecay: false,
    },
  },
]

export const WORLD_PRESETS = [
  {
    id: 'nether-minimal',
    label: 'Nether (no entity kills)',
    worldName: 'world_nether',
    patch: { rollbackEntities: false, entityKills: false },
    worldOverrideMinimal: true,
  },
  {
    id: 'end-disabled',
    label: 'End (logging disabled)',
    worldName: 'world_the_end',
    patch: Object.fromEntries(ALL_CONFIG_FIELDS.map(o => [o.field, false])),
    worldOverrideMinimal: false,
  },
  {
    id: 'overworld-standard',
    label: 'Overworld override',
    worldName: 'world',
    patch: {},
    worldOverrideMinimal: true,
  },
]

export function presetToProfile(preset) {
  return applyLoggingPatch(createProfileState(), preset.patch || {})
}

export function worldPresetToProfile(preset) {
  return createProfileState({
    profileType: 'world',
    worldName: preset.worldName,
    worldOverrideMinimal: preset.worldOverrideMinimal ?? true,
    ...preset.patch,
  })
}

export function buildCoCommand(cmd) {
  if (cmd.commandType === 'inspect') return '/co inspect'
  const type = COMMAND_TYPES.find(t => t.value === cmd.commandType)
  const alias = type?.alias || cmd.commandType
  const parts = []
  if (cmd.users.trim()) parts.push(`u:${cmd.users.trim()}`)
  if (cmd.time.trim()) parts.push(`t:${cmd.time.trim()}`)
  if (cmd.radius.trim()) parts.push(`r:${cmd.radius.trim()}`)
  if (cmd.action.trim()) parts.push(`a:${cmd.action.trim()}`)
  if (cmd.include.trim()) parts.push(`i:${cmd.include.trim()}`)
  if (cmd.exclude.trim()) parts.push(`e:${cmd.exclude.trim()}`)
  const tags = (cmd.hashtags || []).map(h => `#${h}`).join(' ')
  const params = parts.join(' ')
  const base = `/co ${alias}${params ? ` ${params}` : ''}`
  return tags ? `${base} ${tags}` : base
}

export function countEnabledLogging(state) {
  return ALL_CONFIG_FIELDS.filter(o => state[o.field] === true).length
}
