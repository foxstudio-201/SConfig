import { EXPANSIONS } from './placeholderApiExpansions'

export { EXPANSIONS } from './placeholderApiExpansions'

export const STORE_KEY = 'placeholderapi-profile'

export const DEFAULT_INPUT = [
  '&b[Welcome] &fHello &e%player_name%&f!',
  '&7Balance: &a%vault_eco_balance_formatted% &7| Rank: &c%luckperms_primary_group_name%',
  '&7World: &f%player_world% &8(&f%player_x%&7, &f%player_y%&7, &f%player_z%&8)',
].join('\n')

export const DEFAULT_SIMULATION_VARS = {
  player_name: 'Steve',
  player_displayname: '§b[Hero] Steve',
  player_uuid: 'f84c6a79-a7ba-4b0f-b25b-80dfcc01f11a',
  player_ping: '42',
  player_level: '24',
  player_exp: '345',
  player_world: 'world_survival',
  player_x: '142',
  player_y: '68',
  player_z: '-310',
  player_health: '18',
  player_max_health: '20',
  player_food_level: '17',
  player_gamemode: 'SURVIVAL',
  player_biome: 'PLAINS',
  player_direction: 'SOUTH',
  player_has_permission_vip: 'yes',

  vault_eco_balance: '12540.50',
  vault_eco_balance_formatted: '$12,540.50',
  vault_rank: 'MVP',
  vault_prefix: '&b[MVP] &r',
  vault_suffix: ' &7[Pro]',
  vault_group: 'MVP',

  server_name: 'FoxNetwork',
  server_online: '84',
  server_max_players: '200',
  server_tps: '19.95',
  server_uptime: '2d 4h 12m',
  server_ram_used: '4120',
  server_ram_max: '8192',
  server_version: '1.20.4',
  'server_time_HH:mm': '14:32',
  server_weather: 'clear',

  essentials_nickname: 'Stevy',
  essentials_afk: 'no',
  essentials_godmode: 'no',
  essentials_muted: 'no',
  essentials_homes: '3',
  essentials_kit_is_newbie: 'no',
  essentials_jailed: 'no',

  luckperms_primary_group_name: 'admin',
  luckperms_prefix: '&4[Admin] &7',
  luckperms_suffix: ' &7[Dev]',
  luckperms_weight: '100',
  luckperms_meta_tag: 'Builder',
  luckperms_has_permission_vip: 'yes',

  statistic_deaths: '12',
  statistic_player_kills: '57',
  statistic_mob_kills: '483',
  statistic_jump: '4201',
  statistic_time_played: '1840000',
  statistic_distance_walked: '89234',
  statistic_blocks_mined: '12450',

  bungee_total_players: '312',
  bungee_server_count: '8',
  bungee_server_survival_online: '42',
  bungee_server_survival_maxplayers: '100',
  bungee_server_survival_name: 'Survival',

  'math_10+5': '15',
  'math_{vault_eco_balance}/100': '125.405',
  'math_{player_health}*5': '90',
  'math_round({player_ping}/10)': '4',
  'math_max(0,{player_health}-10)': '8',

  'formatter_number_{vault_eco_balance}%,###.##': '12,540.50',
  'formatter_date_yyyy-MM-dd': '2026-05-31',
  'formatter_time_HH:mm:ss': '14:32:08',
  'formatter_uppercase_{player_name}': 'STEVE',
  'formatter_lowercase_{luckperms_primary_group_name}': 'admin',

  'parseother_player_name_<target>': 'Alex',
  'parseother_player_health_<target>': '20',
  'parseother_luckperms_prefix_<target>': '&a[VIP] &r',
  'parseother_vault_eco_balance_<target>': '500.00',

  worldguard_region_name: 'spawn',
  worldguard_region_owner: 'Steve',
  worldguard_region_members: '5',
  worldguard_region_flag_pvp: 'deny',
  worldguard_region_flag_build: 'allow',

  'checkitem_amount_mat:DIAMOND': '12',
  'checkitem_amount_mat:EMERALD': '4',
  'checkitem_amount_namecontains:Sword': '1',
  'checkitem_has_mat:NETHERITE_PICKAXE': 'yes',
}

export const MESSAGE_PRESETS = [
  {
    id: 'welcome-chat',
    labelKey: 'presetWelcomeChat',
    descKey: 'presetWelcomeChatDesc',
    text: DEFAULT_INPUT,
  },
  {
    id: 'tablist-header',
    labelKey: 'presetTabHeader',
    descKey: 'presetTabHeaderDesc',
    text: '&6&lFoxNetwork &7| &fOnline: &a%server_online%&7/&a%server_max_players%',
  },
  {
    id: 'tablist-footer',
    labelKey: 'presetTabFooter',
    descKey: 'presetTabFooterDesc',
    text: '&7TPS: &f%server_tps% &8| &7Ping: &f%player_ping%ms &8| &7Rank: %luckperms_prefix%',
  },
  {
    id: 'scoreboard-title',
    labelKey: 'presetScoreboardTitle',
    descKey: 'presetScoreboardTitleDesc',
    text: '&6&lFOX &e&lNETWORK',
  },
  {
    id: 'scoreboard-lines',
    labelKey: 'presetScoreboardLines',
    descKey: 'presetScoreboardLinesDesc',
    text: [
      '&7&m                    ',
      '&fPlayer: &e%player_name%',
      '&fRank: %luckperms_prefix%',
      '&fBalance: &a%vault_eco_balance_formatted%',
      '&fKills: &c%statistic_player_kills% &7| Deaths: &c%statistic_deaths%',
      '&fWorld: &b%player_world%',
      '&7&m                    ',
    ].join('\n'),
  },
  {
    id: 'join-message',
    labelKey: 'presetJoinMessage',
    descKey: 'presetJoinMessageDesc',
    text: '&8[&a+&8] &7%luckperms_prefix%%player_name%%luckperms_suffix% &7joined &f%server_name%',
  },
  {
    id: 'actionbar',
    labelKey: 'presetActionBar',
    descKey: 'presetActionBarDesc',
    text: '&7[&a%player_health%&7/&c%player_max_health% ❤&7] &f%player_world% &8| &e%vault_eco_balance_formatted%',
  },
  {
    id: 'bossbar',
    labelKey: 'presetBossBar',
    descKey: 'presetBossBarDesc',
    text: '&6%server_name% &7— &f%server_online%&7/&f%server_max_players% online &8| &aTPS %server_tps%',
  },
]

export const CONFIG_PRESETS = [
  { id: 'default', labelKey: 'configPresetDefault' },
  { id: 'performance', labelKey: 'configPresetPerformance' },
  { id: 'offline', labelKey: 'configPresetOffline' },
]

export function createConfigState(overrides = {}) {
  return {
    checkUpdates: true,
    cloudEnabled: true,
    cloudAllowExpansionDownload: true,
    cloudSorting: 'name',
    cloudAllowUnverifiedExpansions: false,
    debug: false,
    booleanTrue: 'yes',
    booleanFalse: 'no',
    ...overrides,
  }
}

const CONFIG_PRESET_VALUES = {
  default: createConfigState(),
  performance: createConfigState({
    checkUpdates: false,
    cloudAllowExpansionDownload: false,
    debug: false,
  }),
  offline: createConfigState({
    checkUpdates: false,
    cloudEnabled: false,
    cloudAllowExpansionDownload: false,
    cloudAllowUnverifiedExpansions: false,
  }),
}

export function presetToConfig(presetId) {
  return CONFIG_PRESET_VALUES[presetId]
    ? { ...CONFIG_PRESET_VALUES[presetId] }
    : createConfigState()
}

/** Keys from catalog not in default vars (for "add from catalog" suggestions) */
export function getCatalogVarKeys() {
  const keys = new Set()
  for (const exp of EXPANSIONS) {
    for (const p of exp.placeholders) {
      keys.add(p.name.replace(/^%|%$/g, ''))
    }
  }
  return [...keys]
}

export function isBuiltinVar(key, builtin = DEFAULT_SIMULATION_VARS) {
  return Object.prototype.hasOwnProperty.call(builtin, key)
}
