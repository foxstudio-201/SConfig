let _uid = 0
export function uid() {
  _uid += 1
  return `tab${Date.now()}_${_uid}`
}

export const SORTING_TYPE_OPTIONS = [
  { value: 'GROUPS:owner,admin,mod,helper,builder,vip,default', label: 'GROUPS (permission order)' },
  { value: 'PLACEHOLDER_A_TO_Z:%player%', label: 'PLACEHOLDER_A_TO_Z (%player%)' },
  { value: 'PLACEHOLDER_Z_TO_A:%player%', label: 'PLACEHOLDER_Z_TO_A (%player%)' },
  { value: 'PERMISSIONS:highest', label: 'PERMISSIONS (highest)' },
  { value: 'PERMISSIONS:lowest', label: 'PERMISSIONS (lowest)' },
]

export const BOSSBAR_STYLES = [
  { value: 'PROGRESS', label: 'PROGRESS' },
  { value: 'NOTCHED_6', label: 'NOTCHED_6' },
  { value: 'NOTCHED_10', label: 'NOTCHED_10' },
  { value: 'NOTCHED_12', label: 'NOTCHED_12' },
  { value: 'NOTCHED_20', label: 'NOTCHED_20' },
]

export const BOSSBAR_COLORS = [
  'BLUE', 'GREEN', 'PINK', 'PURPLE', 'RED', 'WHITE', 'YELLOW',
].map(v => ({ value: v, label: v }))

export const DEFAULT_HEADER = [
  '&m                                                ',
  '&3&lFoxNetwork',
  '&7Welcome &e%player_name%&7!',
  '&7Online: &f%server_online%&7/&f%server_max_players%',
  '',
]

export const DEFAULT_FOOTER = [
  '&7Ping: &f%player_ping%&8ms',
  '&7TPS: &f%server_tps%',
  '&7Balance: &a%vault_eco_balance_formatted%',
  '',
]

export const DEFAULT_SCOREBOARD_LINES = [
  '&7&m                    ',
  '&6&lFOX NETWORK',
  '',
  '&ePlayer: &f%player_name%',
  '&eRank: &f%luckperms_primary_group_name%',
  '&eBalance: &a%vault_eco_balance_formatted%',
  '&eKills: &c%statistic_player_kills%',
  '&eDeaths: &c%statistic_deaths%',
  '',
  '&7play.foxnetwork.net',
  '&7&m                    ',
]

export const MOCK_PLAYERS = [
  { name: 'Steve', group: 'admin', prefix: '&4[Admin] &7', suffix: '' },
  { name: 'Alex', group: 'vip', prefix: '&6[VIP] &7', suffix: '' },
  { name: 'Notch', group: 'default', prefix: '&7', suffix: '' },
  { name: 'Herobrine', group: 'mod', prefix: '&9[Mod] &7', suffix: '' },
]

export function createDesign(overrides = {}) {
  return {
    _id: uid(),
    name: 'default',
    displayCondition: '',
    header: [...DEFAULT_HEADER],
    footer: [...DEFAULT_FOOTER],
    ...overrides,
  }
}

export function createScoreboard(overrides = {}) {
  return {
    _id: uid(),
    key: 'scoreboard',
    title: '&6&lFoxNetwork',
    displayCondition: '',
    lines: [...DEFAULT_SCOREBOARD_LINES],
    ...overrides,
  }
}

export function createBossBar(overrides = {}) {
  return {
    _id: uid(),
    key: 'ServerInfo',
    style: 'PROGRESS',
    color: 'BLUE',
    progress: '100',
    text: '&fWebsite: &bwww.foxnetwork.net',
    ...overrides,
  }
}

export function createGroup(overrides = {}) {
  return {
    _id: uid(),
    name: 'default',
    tabprefix: '&7',
    tabsuffix: '',
    tagprefix: '&7',
    tagsuffix: '',
    customtabname: '%player_name%',
    ...overrides,
  }
}

export function createTabState(overrides = {}) {
  return {
    _id: uid(),
    profileName: 'FoxNetwork TAB',
    headerFooter: {
      enabled: true,
      designs: [createDesign()],
    },
    tablistFormatting: {
      enabled: true,
      disableCondition: '%world%=disabledworld',
    },
    scoreboardTeams: {
      enabled: true,
      enableCollision: true,
      invisibleNametags: false,
      sortingTypes: ['GROUPS:owner,admin,mod,helper,builder,vip,default', 'PLACEHOLDER_A_TO_Z:%player%'],
      caseSensitiveSorting: true,
      canSeeFriendlyInvisibles: false,
      disableCondition: '%world%=disabledworld',
    },
    playerlistObjective: {
      enabled: true,
      value: '%player_ping%',
      fancyValue: '&7Ping: %ping%',
      title: 'TAB',
      renderType: 'INTEGER',
      disableCondition: '%world%=disabledworld',
    },
    belownameObjective: {
      enabled: false,
      value: '%player_health%',
      fancyValue: '&c%health%',
      fancyValueDefault: 'NPC',
      title: '&cHealth',
      disableCondition: '%world%=disabledworld',
    },
    scoreboard: {
      enabled: true,
      toggleCommand: '/sb',
      rememberToggleChoice: false,
      hiddenByDefault: false,
      delayOnJoinMs: 0,
      boards: [createScoreboard()],
    },
    bossbar: {
      enabled: false,
      toggleCommand: '/bossbar',
      rememberToggleChoice: false,
      hiddenByDefault: false,
      bars: [createBossBar()],
    },
    placeholders: {
      dateFormat: 'dd.MM.yyyy',
      timeFormat: '[HH:mm:ss / h:mm a]',
      timeOffset: 0,
      registerTabExpansion: false,
      locale: 'en-US',
    },
    primaryGroupFindingList: ['Owner', 'Admin', 'Mod', 'Helper', 'default'],
    debug: false,
    groups: [
      createGroup({ name: '_DEFAULT_', tabprefix: '%luckperms_prefix%', tagprefix: '%luckperms_prefix%', tabsuffix: '%luckperms_suffix%', tagsuffix: '%luckperms_suffix%' }),
      createGroup({ name: 'Admin', tabprefix: '&4[Admin] &7', tagprefix: '&4[Admin] &7' }),
      createGroup({ name: 'VIP', tabprefix: '&6[VIP] &7', tagprefix: '&6[VIP] &7' }),
      createGroup({ name: 'default', tabprefix: '&7', tagprefix: '&7' }),
    ],
    ...overrides,
  }
}

export const CONFIG_PRESETS = {
  default: () => createTabState(),
  minimal: () => createTabState({
    profileName: 'Minimal TAB',
    headerFooter: { enabled: true, designs: [createDesign({
      name: 'default',
      header: ['&3&lMy Server', '&7Online: &f%server_online%'],
      footer: ['&7Ping: &f%player_ping%ms'],
    })] },
    scoreboard: { enabled: false, toggleCommand: '/sb', rememberToggleChoice: false, hiddenByDefault: false, delayOnJoinMs: 0, boards: [] },
    bossbar: { enabled: false, toggleCommand: '/bossbar', rememberToggleChoice: false, hiddenByDefault: false, bars: [] },
    groups: [createGroup({ name: '_DEFAULT_', tabprefix: '&7', tagprefix: '&7' })],
  }),
  network: () => createTabState({
    profileName: 'Network Hub',
    headerFooter: { enabled: true, designs: [createDesign({
      name: 'default',
      header: ['&6&lFoxNetwork &7| &fHub', '&7Players: &a%server_online%', ''],
      footer: ['&7Store: &bstore.foxnetwork.net', '&7Discord: &bdiscord.gg/fox'],
    })] },
    scoreboard: {
      enabled: true, toggleCommand: '/sb', rememberToggleChoice: false, hiddenByDefault: false, delayOnJoinMs: 500,
      boards: [createScoreboard({ title: '&6&lHUB', lines: ['&7Welcome &e%player_name%', '', '&fRank: &b%luckperms_primary_group_name%', '&fServer: &aLobby-1'] })],
    },
  }),
  pvp: () => createTabState({
    profileName: 'PvP Arena',
    scoreboardTeams: { enabled: true, enableCollision: false, invisibleNametags: false, sortingTypes: ['GROUPS:owner,admin,mod,vip,default'], caseSensitiveSorting: true, canSeeFriendlyInvisibles: false, disableCondition: '' },
    belownameObjective: { enabled: true, value: '%player_health%', fancyValue: '&c❤ %player_health%', fancyValueDefault: 'NPC', title: '&cHealth', disableCondition: '' },
    scoreboard: {
      enabled: true, toggleCommand: '/sb', rememberToggleChoice: false, hiddenByDefault: false, delayOnJoinMs: 0,
      boards: [createScoreboard({ title: '&c&lARENA', lines: ['&7Kills: &c%statistic_player_kills%', '&7Deaths: &c%statistic_deaths%', '&7Streak: &e%player_level%'] })],
    },
  }),
}

export function applyPreset(presetId) {
  const fn = CONFIG_PRESETS[presetId]
  return fn ? fn() : createTabState()
}

/** Simple demo substitution for preview */
export function previewText(text, ctx = {}) {
  if (!text) return ''
  const map = {
    player_name: ctx.playerName || 'Steve',
    player: ctx.playerName || 'Steve',
    player_ping: '42',
    ping: '42',
    server_online: '84',
    server_max_players: '200',
    server_tps: '19.95',
    vault_eco_balance_formatted: '$12,540',
    luckperms_primary_group_name: ctx.group || 'admin',
    luckperms_prefix: ctx.prefix || '&4[Admin] &7',
    luckperms_suffix: '',
    statistic_player_kills: '57',
    statistic_deaths: '12',
    player_health: '18',
    health: '18',
    group: ctx.group || 'admin',
    online: '84',
    world: 'world',
    date: '31.05.2026',
    memory_used: '4120',
    memory_max: '8192',
    staffonline: '3',
    worldonline: '24',
  }
  let out = text
  Object.entries(map).forEach(([k, v]) => {
    out = out.replace(new RegExp(`%${k}%`, 'gi'), v)
  })
  out = out.replace(/%animation:[^%]+%/g, '▌')
  out = out.replace(/<#[0-9A-Fa-f]{6}>/g, '')
  out = out.replace(/<\/#[0-9A-Fa-f]{6}>/g, '')
  return out
}

export function linesToText(lines) {
  return (lines || []).join('\n')
}

export function textToLines(text) {
  return text.split('\n')
}
