/** Permission Builder — English UI */
export default {
  badge: 'LuckPerms Tool',
  title: 'Permission Builder',
  subtitle: 'LuckPerms groups, presets, export & REST API sync',
  tabOverview: 'Overview',
  tabPermissions: 'Permissions',
  tabMeta: 'Meta',
  groups: 'Groups',
  groupCount: '{{count}} group',
  groupCount_plural: '{{count}} groups',
  new: 'New',
  nodes: '{{count}} nodes',
  delete: 'Delete',
  fieldGroupName: 'Group name (lowercase)',
  fieldDisplayName: 'Display name',
  fieldWeight: 'Weight (higher = higher rank)',
  fieldPrefix: 'Prefix (& color codes)',
  fieldPrefixPriority: 'Prefix priority',
  fieldSuffix: 'Suffix',
  fieldSuffixPriority: 'Suffix priority',
  prefixPreview: 'Prefix preview',
  inheritFrom: 'Inherit from groups',
  searchPermissions: 'Search permissions…',
  customNodePlaceholder: 'Custom node e.g. essentials.fly',
  add: 'Add',
  noPermissionsYet: 'No permissions yet — pick from presets below',
  presetPermissions: 'Preset permissions',
  customMeta: 'Custom meta nodes',
  addMeta: 'Add meta',
  metaHint: 'Extra LuckPerms meta keys (nametag-color, fly-speed, etc.)',
  noCustomMeta: 'No custom meta — prefix/suffix/weight are in Overview',
  fieldKey: 'Key',
  fieldValue: 'Value',
  syncTitle: 'LuckPerms REST API',
  syncDesc: 'Connect to LuckPerms REST API (Bearer token). Enable in LuckPerms config: rest-server enabled.',
  fieldBaseUrl: 'Base URL',
  fieldApiKey: 'API Key (Bearer)',
  test: 'Test',
  pull: 'Pull',
  push: 'Push',
  output: 'Output',
  exportFormat: 'Export format',
  copy: 'Copy',
  copied: 'Copied',
  save: 'Save',
  loadPreset: 'Load preset…',
  import: 'Import',
  importPrompt: 'Paste LuckPerms export YAML or API JSON:',
  importFileYaml: 'YAML / JSON',
  importFileAll: 'All',
  trueVal: 'true',
  falseVal: 'false',
  catLuckperms: 'LuckPerms',
  catEssentials: 'EssentialsX',
  catWorldedit: 'WorldEdit',
  catWorldguard: 'WorldGuard',
  catMinecraft: 'Minecraft (Vanilla)',
  catVault: 'Vault / Economy',
  catChat: 'Chat / Social',
  catServer: 'Server Admin',
  presetRankLadder: 'Full rank ladder',
  presetRankLadderDesc: 'default → member → vip → mvp → helper → mod → admin',
  presetMinimal: 'Minimal setup',
  presetMinimalDesc: 'default + admin only',
  exportCommands: 'LP Commands',
  exportYaml: 'LP Export YAML',
  exportApi: 'REST API JSON',
  msgNoGroups: 'No groups found in file',
  msgImported: 'Imported {{count}} group(s)',
  msgImportFailed: 'Import failed',
  msgConnected: 'Connected — {{count}} group(s) on server',
  msgPulled: 'Pulled {{count}} group(s) from LuckPerms',
  msgPushPartial: 'Push partial: {{names}} failed',
  msgPushed: 'Pushed {{count}} group(s) to LuckPerms',

  perm: {
    luckperms_star: {
      label: 'Full LuckPerms admin',
      desc: 'All LuckPerms commands'
    },
    luckperms_user: {
      label: 'User management',
      desc: 'Manage player permissions'
    },
    luckperms_group: {
      label: 'Group management',
      desc: 'Create/edit groups'
    },
    luckperms_track: {
      label: 'Track management',
      desc: 'Manage rank tracks'
    },
    luckperms_editor: {
      label: 'Web editor',
      desc: 'Open /lp editor'
    },
    luckperms_sync: {
      label: 'Sync',
      desc: 'Force permission sync'
    },
    luckperms_verbose: {
      label: 'Verbose mode',
      desc: 'Permission debug output'
    },
    luckperms_info: {
      label: 'Info commands',
      desc: 'View permission info'
    },
    essentials_star: {
      label: 'Full Essentials',
      desc: 'All Essentials commands'
    },
    essentials_spawn: {
      label: 'Spawn',
      desc: '/spawn'
    },
    essentials_home: {
      label: 'Home',
      desc: '/home'
    },
    essentials_sethome: {
      label: 'Set home',
      desc: '/sethome'
    },
    essentials_delhome: {
      label: 'Delete home',
      desc: '/delhome'
    },
    essentials_warp: {
      label: 'Warp',
      desc: '/warp'
    },
    essentials_warp_list: {
      label: 'Warp list',
      desc: '/warps'
    },
    essentials_setwarp: {
      label: 'Set warp',
      desc: '/setwarp'
    },
    essentials_delwarp: {
      label: 'Delete warp',
      desc: '/delwarp'
    },
    essentials_tpa: {
      label: 'TPA',
      desc: '/tpa request'
    },
    essentials_tpaccept: {
      label: 'TP accept',
      desc: '/tpaccept'
    },
    essentials_tpdeny: {
      label: 'TP deny',
      desc: '/tpdeny'
    },
    essentials_msg: {
      label: 'Private message',
      desc: '/msg /r'
    },
    essentials_mail: {
      label: 'Mail',
      desc: '/mail'
    },
    essentials_kit: {
      label: 'Kits',
      desc: '/kit'
    },
    essentials_kits_star: {
      label: 'All kits',
      desc: 'Access every kit'
    },
    essentials_fly: {
      label: 'Fly',
      desc: '/fly toggle'
    },
    essentials_god: {
      label: 'God mode',
      desc: '/god'
    },
    essentials_heal: {
      label: 'Heal',
      desc: '/heal'
    },
    essentials_feed: {
      label: 'Feed',
      desc: '/feed'
    },
    essentials_speed: {
      label: 'Speed',
      desc: '/speed'
    },
    essentials_nick: {
      label: 'Nickname',
      desc: '/nick'
    },
    essentials_afk: {
      label: 'AFK',
      desc: '/afk'
    },
    essentials_back: {
      label: 'Back',
      desc: '/back after death'
    },
    essentials_workbench: {
      label: 'Workbench',
      desc: '/workbench'
    },
    essentials_enderchest: {
      label: 'Ender chest',
      desc: '/ec'
    },
    essentials_hat: {
      label: 'Hat',
      desc: '/hat'
    },
    essentials_repair: {
      label: 'Repair',
      desc: '/repair'
    },
    essentials_repair_all: {
      label: 'Repair all',
      desc: '/repair all'
    },
    essentials_invsee: {
      label: 'Invsee',
      desc: 'View player inventory'
    },
    essentials_socialspy: {
      label: 'Social spy',
      desc: 'Monitor private messages'
    },
    essentials_ban: {
      label: 'Ban',
      desc: '/ban'
    },
    essentials_kick: {
      label: 'Kick',
      desc: '/kick'
    },
    essentials_mute: {
      label: 'Mute',
      desc: '/mute'
    },
    essentials_tempban: {
      label: 'Temp ban',
      desc: '/tempban'
    },
    essentials_jail: {
      label: 'Jail',
      desc: '/jail'
    },
    essentials_unjail: {
      label: 'Unjail',
      desc: '/unjail'
    },
    essentials_tp: {
      label: 'Teleport',
      desc: '/tp'
    },
    essentials_tp_others: {
      label: 'TP others',
      desc: '/tp player1 player2'
    },
    essentials_tpall: {
      label: 'TP all',
      desc: '/tpall'
    },
    essentials_gamemode: {
      label: 'Gamemode',
      desc: '/gamemode'
    },
    essentials_give: {
      label: 'Give',
      desc: '/give items'
    },
    essentials_clearinventory: {
      label: 'Clear inv',
      desc: '/clear'
    },
    essentials_time: {
      label: 'Time',
      desc: '/time'
    },
    essentials_weather: {
      label: 'Weather',
      desc: '/weather'
    },
    essentials_broadcast: {
      label: 'Broadcast',
      desc: '/broadcast'
    },
    essentials_chat_color: {
      label: 'Chat color',
      desc: 'Colored chat'
    },
    essentials_chat_format: {
      label: 'Chat format',
      desc: 'Custom chat format'
    },
    essentials_sethome_multiple: {
      label: 'Multiple homes',
      desc: 'More than one home'
    },
    essentials_sethome_multiple_unlimited: {
      label: 'Unlimited homes',
      desc: 'No home limit'
    },
    worldedit_star: {
      label: 'Full WorldEdit',
      desc: 'All WE commands'
    },
    worldedit_region: {
      label: 'Region selection',
      desc: '//wand, //pos'
    },
    worldedit_selection: {
      label: 'Selection tools',
      desc: 'Selection commands'
    },
    worldedit_clipboard: {
      label: 'Clipboard',
      desc: '//copy, //paste'
    },
    worldedit_schematic: {
      label: 'Schematics',
      desc: 'Save/load schematics'
    },
    worldedit_generation: {
      label: 'Generation',
      desc: '//generate, //hcyl'
    },
    worldedit_navigation: {
      label: 'Navigation',
      desc: '//thru, //jumpto'
    },
    worldedit_region_set: {
      label: 'Set blocks',
      desc: '//set'
    },
    worldedit_region_replace: {
      label: 'Replace',
      desc: '//replace'
    },
    worldedit_region_walls: {
      label: 'Walls',
      desc: '//walls'
    },
    worldedit_region_faces: {
      label: 'Faces',
      desc: '//faces'
    },
    worldedit_region_stack: {
      label: 'Stack',
      desc: '//stack'
    },
    worldedit_region_move: {
      label: 'Move',
      desc: '//move'
    },
    worldedit_region_deform: {
      label: 'Deform',
      desc: '//deform'
    },
    worldedit_region_smooth: {
      label: 'Smooth',
      desc: '//smooth'
    },
    worldedit_brush: {
      label: 'Brushes',
      desc: 'Brush tools'
    },
    worldedit_limit_unrestricted: {
      label: 'No block limit',
      desc: 'Unlimited blocks'
    },
    worldguard_star: {
      label: 'Full WorldGuard',
      desc: 'All WG commands'
    },
    worldguard_region: {
      label: 'Region define',
      desc: '/rg define'
    },
    worldguard_region_claim: {
      label: 'Region claim',
      desc: '/rg claim'
    },
    worldguard_region_remove: {
      label: 'Region remove',
      desc: '/rg remove'
    },
    worldguard_region_flag: {
      label: 'Region flags',
      desc: '/rg flag'
    },
    worldguard_region_bypass: {
      label: 'Bypass flags',
      desc: 'Ignore region restrictions'
    },
    worldguard_entry: {
      label: 'Entry deny bypass',
      desc: 'Enter denied regions'
    },
    worldguard_build: {
      label: 'Build bypass',
      desc: 'Build in protected areas'
    },
    minecraft_command_star: {
      label: 'All commands',
      desc: 'Every vanilla command'
    },
    minecraft_command_gamemode: {
      label: 'Gamemode',
      desc: '/gamemode'
    },
    minecraft_command_tp: {
      label: 'Teleport',
      desc: '/tp'
    },
    minecraft_command_give: {
      label: 'Give',
      desc: '/give'
    },
    minecraft_command_kill: {
      label: 'Kill',
      desc: '/kill'
    },
    minecraft_command_kick: {
      label: 'Kick',
      desc: '/kick'
    },
    minecraft_command_ban: {
      label: 'Ban',
      desc: '/ban'
    },
    minecraft_command_pardon: {
      label: 'Pardon',
      desc: '/pardon'
    },
    minecraft_command_op: {
      label: 'OP',
      desc: '/op'
    },
    minecraft_command_deop: {
      label: 'Deop',
      desc: '/deop'
    },
    minecraft_command_weather: {
      label: 'Weather',
      desc: '/weather'
    },
    minecraft_command_time: {
      label: 'Time',
      desc: '/time'
    },
    minecraft_command_effect: {
      label: 'Effect',
      desc: '/effect'
    },
    minecraft_command_enchant: {
      label: 'Enchant',
      desc: '/enchant'
    },
    minecraft_command_clear: {
      label: 'Clear',
      desc: '/clear'
    },
    minecraft_command_fill: {
      label: 'Fill',
      desc: '/fill'
    },
    minecraft_command_setblock: {
      label: 'Set block',
      desc: '/setblock'
    },
    minecraft_command_summon: {
      label: 'Summon',
      desc: '/summon'
    },
    minecraft_command_whitelist: {
      label: 'Whitelist',
      desc: '/whitelist'
    },
    vault_admin: {
      label: 'Vault admin',
      desc: 'Vault administration'
    },
    essentials_balance: {
      label: 'Balance',
      desc: '/balance'
    },
    essentials_pay: {
      label: 'Pay',
      desc: '/pay'
    },
    essentials_eco: {
      label: 'Eco admin',
      desc: '/eco give/set'
    },
    essentials_baltop: {
      label: 'Baltop',
      desc: '/baltop'
    },
    chat_color: {
      label: 'Chat colors',
      desc: 'Use & color codes in chat'
    },
    chat_format: {
      label: 'Chat format',
      desc: 'Custom formatting'
    },
    chat_magic: {
      label: 'Obfuscated text',
      desc: '&k magic text'
    },
    chat_rainbow: {
      label: 'Rainbow chat',
      desc: 'Rainbow name/text plugin'
    },
    chat_mention: {
      label: 'Mentions',
      desc: '@mention players'
    },
    chat_bypass_cooldown: {
      label: 'Bypass cooldown',
      desc: 'No chat cooldown'
    },
    chat_bypass_filter: {
      label: 'Bypass filter',
      desc: 'Skip chat filter'
    },
    wildcard: {
      label: 'Wildcard (OP)',
      desc: 'All permissions — use with care'
    },
    bukkit_command_plugins: {
      label: 'List plugins',
      desc: '/plugins'
    },
    bukkit_command_reload: {
      label: 'Reload',
      desc: '/reload'
    },
    bukkit_command_restart: {
      label: 'Restart',
      desc: '/restart'
    },
    bukkit_command_stop: {
      label: 'Stop server',
      desc: '/stop'
    },
    bukkit_broadcast: {
      label: 'Broadcast',
      desc: 'Server broadcast'
    },
    bukkit_broadcast_admin: {
      label: 'Admin broadcast',
      desc: 'Admin-only broadcast'
    },
    spark: {
      label: 'Spark profiler',
      desc: 'Spark commands'
    },
    spark_profiler: {
      label: 'Spark profiler run',
      desc: 'Run profiler'
    }
  },
}
