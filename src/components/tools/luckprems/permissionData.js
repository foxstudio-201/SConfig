let _uid = 0
export function uid() {
  _uid += 1
  return `p${Date.now()}_${_uid}`
}

export const NODE_TYPES = [
  { value: 'permission', label: 'Permission' },
  { value: 'regex_permission', label: 'Regex Permission' },
  { value: 'inheritance', label: 'Inheritance (parent group)' },
  { value: 'prefix', label: 'Prefix' },
  { value: 'suffix', label: 'Suffix' },
  { value: 'meta', label: 'Meta' },
  { value: 'weight', label: 'Weight' },
  { value: 'display_name', label: 'Display Name' },
]

export const CONTEXT_KEYS = [
  { value: '', label: 'Global (no context)' },
  { value: 'server', label: 'server' },
  { value: 'world', label: 'world' },
  { value: 'dimension', label: 'dimension' },
]

export const PERMISSION_CATEGORIES = [
  {
    id: 'luckperms',
    label: 'LuckPerms',
    color: 'violet',
    permissions: [
      { node: 'luckperms.*', label: 'Full LuckPerms admin', desc: 'All LuckPerms commands' },
      { node: 'luckperms.user', label: 'User management', desc: 'Manage player permissions' },
      { node: 'luckperms.group', label: 'Group management', desc: 'Create/edit groups' },
      { node: 'luckperms.track', label: 'Track management', desc: 'Manage rank tracks' },
      { node: 'luckperms.editor', label: 'Web editor', desc: 'Open /lp editor' },
      { node: 'luckperms.sync', label: 'Sync', desc: 'Force permission sync' },
      { node: 'luckperms.verbose', label: 'Verbose mode', desc: 'Permission debug output' },
      { node: 'luckperms.info', label: 'Info commands', desc: 'View permission info' },
    ],
  },
  {
    id: 'essentials',
    label: 'EssentialsX',
    color: 'emerald',
    permissions: [
      { node: 'essentials.*', label: 'Full Essentials', desc: 'All Essentials commands' },
      { node: 'essentials.spawn', label: 'Spawn', desc: '/spawn' },
      { node: 'essentials.home', label: 'Home', desc: '/home' },
      { node: 'essentials.sethome', label: 'Set home', desc: '/sethome' },
      { node: 'essentials.delhome', label: 'Delete home', desc: '/delhome' },
      { node: 'essentials.warp', label: 'Warp', desc: '/warp' },
      { node: 'essentials.warp.list', label: 'Warp list', desc: '/warps' },
      { node: 'essentials.setwarp', label: 'Set warp', desc: '/setwarp' },
      { node: 'essentials.delwarp', label: 'Delete warp', desc: '/delwarp' },
      { node: 'essentials.tpa', label: 'TPA', desc: '/tpa request' },
      { node: 'essentials.tpaccept', label: 'TP accept', desc: '/tpaccept' },
      { node: 'essentials.tpdeny', label: 'TP deny', desc: '/tpdeny' },
      { node: 'essentials.msg', label: 'Private message', desc: '/msg /r' },
      { node: 'essentials.mail', label: 'Mail', desc: '/mail' },
      { node: 'essentials.kit', label: 'Kits', desc: '/kit' },
      { node: 'essentials.kits.*', label: 'All kits', desc: 'Access every kit' },
      { node: 'essentials.fly', label: 'Fly', desc: '/fly toggle' },
      { node: 'essentials.god', label: 'God mode', desc: '/god' },
      { node: 'essentials.heal', label: 'Heal', desc: '/heal' },
      { node: 'essentials.feed', label: 'Feed', desc: '/feed' },
      { node: 'essentials.speed', label: 'Speed', desc: '/speed' },
      { node: 'essentials.nick', label: 'Nickname', desc: '/nick' },
      { node: 'essentials.afk', label: 'AFK', desc: '/afk' },
      { node: 'essentials.back', label: 'Back', desc: '/back after death' },
      { node: 'essentials.workbench', label: 'Workbench', desc: '/workbench' },
      { node: 'essentials.enderchest', label: 'Ender chest', desc: '/ec' },
      { node: 'essentials.hat', label: 'Hat', desc: '/hat' },
      { node: 'essentials.repair', label: 'Repair', desc: '/repair' },
      { node: 'essentials.repair.all', label: 'Repair all', desc: '/repair all' },
      { node: 'essentials.invsee', label: 'Invsee', desc: 'View player inventory' },
      { node: 'essentials.socialspy', label: 'Social spy', desc: 'Monitor private messages' },
      { node: 'essentials.ban', label: 'Ban', desc: '/ban' },
      { node: 'essentials.kick', label: 'Kick', desc: '/kick' },
      { node: 'essentials.mute', label: 'Mute', desc: '/mute' },
      { node: 'essentials.tempban', label: 'Temp ban', desc: '/tempban' },
      { node: 'essentials.jail', label: 'Jail', desc: '/jail' },
      { node: 'essentials.unjail', label: 'Unjail', desc: '/unjail' },
      { node: 'essentials.tp', label: 'Teleport', desc: '/tp' },
      { node: 'essentials.tp.others', label: 'TP others', desc: '/tp player1 player2' },
      { node: 'essentials.tpall', label: 'TP all', desc: '/tpall' },
      { node: 'essentials.gamemode', label: 'Gamemode', desc: '/gamemode' },
      { node: 'essentials.give', label: 'Give', desc: '/give items' },
      { node: 'essentials.clearinventory', label: 'Clear inv', desc: '/clear' },
      { node: 'essentials.time', label: 'Time', desc: '/time' },
      { node: 'essentials.weather', label: 'Weather', desc: '/weather' },
      { node: 'essentials.broadcast', label: 'Broadcast', desc: '/broadcast' },
      { node: 'essentials.chat.color', label: 'Chat color', desc: 'Colored chat' },
      { node: 'essentials.chat.format', label: 'Chat format', desc: 'Custom chat format' },
      { node: 'essentials.sethome.multiple', label: 'Multiple homes', desc: 'More than one home' },
      { node: 'essentials.sethome.multiple.unlimited', label: 'Unlimited homes', desc: 'No home limit' },
    ],
  },
  {
    id: 'worldedit',
    label: 'WorldEdit',
    color: 'cyan',
    permissions: [
      { node: 'worldedit.*', label: 'Full WorldEdit', desc: 'All WE commands' },
      { node: 'worldedit.region', label: 'Region selection', desc: '//wand, //pos' },
      { node: 'worldedit.selection', label: 'Selection tools', desc: 'Selection commands' },
      { node: 'worldedit.clipboard', label: 'Clipboard', desc: '//copy, //paste' },
      { node: 'worldedit.schematic', label: 'Schematics', desc: 'Save/load schematics' },
      { node: 'worldedit.generation', label: 'Generation', desc: '//generate, //hcyl' },
      { node: 'worldedit.navigation', label: 'Navigation', desc: '//thru, //jumpto' },
      { node: 'worldedit.region.set', label: 'Set blocks', desc: '//set' },
      { node: 'worldedit.region.replace', label: 'Replace', desc: '//replace' },
      { node: 'worldedit.region.walls', label: 'Walls', desc: '//walls' },
      { node: 'worldedit.region.faces', label: 'Faces', desc: '//faces' },
      { node: 'worldedit.region.stack', label: 'Stack', desc: '//stack' },
      { node: 'worldedit.region.move', label: 'Move', desc: '//move' },
      { node: 'worldedit.region.deform', label: 'Deform', desc: '//deform' },
      { node: 'worldedit.region.smooth', label: 'Smooth', desc: '//smooth' },
      { node: 'worldedit.brush', label: 'Brushes', desc: 'Brush tools' },
      { node: 'worldedit.limit.unrestricted', label: 'No block limit', desc: 'Unlimited blocks' },
    ],
  },
  {
    id: 'worldguard',
    label: 'WorldGuard',
    color: 'blue',
    permissions: [
      { node: 'worldguard.*', label: 'Full WorldGuard', desc: 'All WG commands' },
      { node: 'worldguard.region', label: 'Region define', desc: '/rg define' },
      { node: 'worldguard.region.claim', label: 'Region claim', desc: '/rg claim' },
      { node: 'worldguard.region.remove', label: 'Region remove', desc: '/rg remove' },
      { node: 'worldguard.region.flag', label: 'Region flags', desc: '/rg flag' },
      { node: 'worldguard.region.bypass', label: 'Bypass flags', desc: 'Ignore region restrictions' },
      { node: 'worldguard.entry', label: 'Entry deny bypass', desc: 'Enter denied regions' },
      { node: 'worldguard.build', label: 'Build bypass', desc: 'Build in protected areas' },
    ],
  },
  {
    id: 'minecraft',
    label: 'Minecraft (Vanilla)',
    color: 'amber',
    permissions: [
      { node: 'minecraft.command.*', label: 'All commands', desc: 'Every vanilla command' },
      { node: 'minecraft.command.gamemode', label: 'Gamemode', desc: '/gamemode' },
      { node: 'minecraft.command.tp', label: 'Teleport', desc: '/tp' },
      { node: 'minecraft.command.give', label: 'Give', desc: '/give' },
      { node: 'minecraft.command.kill', label: 'Kill', desc: '/kill' },
      { node: 'minecraft.command.kick', label: 'Kick', desc: '/kick' },
      { node: 'minecraft.command.ban', label: 'Ban', desc: '/ban' },
      { node: 'minecraft.command.pardon', label: 'Pardon', desc: '/pardon' },
      { node: 'minecraft.command.op', label: 'OP', desc: '/op' },
      { node: 'minecraft.command.deop', label: 'Deop', desc: '/deop' },
      { node: 'minecraft.command.weather', label: 'Weather', desc: '/weather' },
      { node: 'minecraft.command.time', label: 'Time', desc: '/time' },
      { node: 'minecraft.command.effect', label: 'Effect', desc: '/effect' },
      { node: 'minecraft.command.enchant', label: 'Enchant', desc: '/enchant' },
      { node: 'minecraft.command.clear', label: 'Clear', desc: '/clear' },
      { node: 'minecraft.command.fill', label: 'Fill', desc: '/fill' },
      { node: 'minecraft.command.setblock', label: 'Set block', desc: '/setblock' },
      { node: 'minecraft.command.summon', label: 'Summon', desc: '/summon' },
      { node: 'minecraft.command.whitelist', label: 'Whitelist', desc: '/whitelist' },
    ],
  },
  {
    id: 'vault',
    label: 'Vault / Economy',
    color: 'yellow',
    permissions: [
      { node: 'vault.admin', label: 'Vault admin', desc: 'Vault administration' },
      { node: 'essentials.balance', label: 'Balance', desc: '/balance' },
      { node: 'essentials.pay', label: 'Pay', desc: '/pay' },
      { node: 'essentials.eco', label: 'Eco admin', desc: '/eco give/set' },
      { node: 'essentials.baltop', label: 'Baltop', desc: '/baltop' },
    ],
  },
  {
    id: 'chat',
    label: 'Chat / Social',
    color: 'pink',
    permissions: [
      { node: 'chat.color', label: 'Chat colors', desc: 'Use & color codes in chat' },
      { node: 'chat.format', label: 'Chat format', desc: 'Custom formatting' },
      { node: 'chat.magic', label: 'Obfuscated text', desc: '&k magic text' },
      { node: 'chat.rainbow', label: 'Rainbow chat', desc: 'Rainbow name/text plugin' },
      { node: 'chat.mention', label: 'Mentions', desc: '@mention players' },
      { node: 'chat.bypass.cooldown', label: 'Bypass cooldown', desc: 'No chat cooldown' },
      { node: 'chat.bypass.filter', label: 'Bypass filter', desc: 'Skip chat filter' },
    ],
  },
  {
    id: 'server',
    label: 'Server Admin',
    color: 'red',
    permissions: [
      { node: '*', label: 'Wildcard (OP)', desc: 'All permissions — use with care' },
      { node: 'bukkit.command.plugins', label: 'List plugins', desc: '/plugins' },
      { node: 'bukkit.command.reload', label: 'Reload', desc: '/reload' },
      { node: 'bukkit.command.restart', label: 'Restart', desc: '/restart' },
      { node: 'bukkit.command.stop', label: 'Stop server', desc: '/stop' },
      { node: 'bukkit.broadcast', label: 'Broadcast', desc: 'Server broadcast' },
      { node: 'bukkit.broadcast.admin', label: 'Admin broadcast', desc: 'Admin-only broadcast' },
      { node: 'spark', label: 'Spark profiler', desc: 'Spark commands' },
      { node: 'spark.profiler', label: 'Spark profiler run', desc: 'Run profiler' },
    ],
  },
]

export const ALL_PRESET_NODES = PERMISSION_CATEGORIES.flatMap(c =>
  c.permissions.map(p => ({ ...p, category: c.id, categoryLabel: c.label }))
)

export function createGroupState(overrides = {}) {
  return {
    _id: uid(),
    name: 'default',
    displayName: 'Default',
    weight: 0,
    prefix: { value: '&7', priority: 100 },
    suffix: { value: '', priority: 100 },
    parents: [],
    permissions: [],
    meta: [],
    ...overrides,
  }
}

export function createPermissionEntry(node, value = true) {
  return {
    _id: uid(),
    node: String(node || '').trim(),
    value: value !== false,
    context: [],
    expiry: null,
  }
}

export const GROUP_PRESETS = [
  {
    id: 'rank-ladder',
    label: 'Full rank ladder',
    desc: 'default → member → vip → mvp → helper → mod → admin',
    groups: [
      {
        name: 'default', displayName: 'Default', weight: 0,
        prefix: { value: '&7', priority: 100 },
        permissions: ['essentials.spawn', 'essentials.home', 'essentials.sethome', 'essentials.warp', 'essentials.msg', 'essentials.tpa', 'essentials.kit', 'essentials.afk'],
      },
      {
        name: 'member', displayName: 'Member', weight: 10,
        prefix: { value: '&a[Member]&r ', priority: 100 },
        parents: ['default'],
        permissions: ['essentials.back', 'essentials.workbench', 'essentials.hat', 'essentials.chat.color'],
      },
      {
        name: 'vip', displayName: 'VIP', weight: 50,
        prefix: { value: '&e[VIP]&r ', priority: 100 },
        parents: ['member'],
        permissions: ['essentials.fly', 'essentials.feed', 'essentials.repair', 'essentials.enderchest', 'essentials.sethome.multiple'],
      },
      {
        name: 'mvp', displayName: 'MVP', weight: 70,
        prefix: { value: '&b[MVP]&r ', priority: 100 },
        parents: ['vip'],
        permissions: ['essentials.repair.all', 'essentials.nick', 'essentials.speed'],
      },
      {
        name: 'helper', displayName: 'Helper', weight: 100,
        prefix: { value: '&9[Helper]&r ', priority: 100 },
        parents: ['mvp'],
        permissions: ['essentials.socialspy', 'essentials.tp', 'essentials.invsee', 'essentials.mute', 'essentials.jail'],
      },
      {
        name: 'mod', displayName: 'Moderator', weight: 150,
        prefix: { value: '&2[Mod]&r ', priority: 100 },
        parents: ['helper'],
        permissions: ['essentials.kick', 'essentials.tempban', 'essentials.tp.others', 'essentials.gamemode', 'worldguard.region.bypass'],
      },
      {
        name: 'admin', displayName: 'Admin', weight: 200,
        prefix: { value: '&c[Admin]&r ', priority: 100 },
        parents: ['mod'],
        permissions: ['essentials.*', 'worldedit.*', 'worldguard.*', 'luckperms.user', 'luckperms.group', 'luckperms.info'],
      },
    ],
  },
  {
    id: 'minimal',
    label: 'Minimal setup',
    desc: 'default + admin only',
    groups: [
      {
        name: 'default', displayName: 'Default', weight: 0,
        prefix: { value: '&7', priority: 100 },
        permissions: ['essentials.spawn', 'essentials.home', 'essentials.sethome', 'essentials.warp', 'essentials.msg'],
      },
      {
        name: 'admin', displayName: 'Admin', weight: 100,
        prefix: { value: '&c[Admin]&r ', priority: 100 },
        parents: ['default'],
        permissions: ['*'],
      },
    ],
  },
]

export function presetToGroups(preset) {
  return preset.groups.map(g => createGroupState({
    name: g.name,
    displayName: g.displayName || g.name,
    weight: g.weight ?? 0,
    prefix: g.prefix || { value: '', priority: 100 },
    suffix: g.suffix || { value: '', priority: 100 },
    parents: g.parents || [],
    permissions: (g.permissions || []).map(p => createPermissionEntry(p)),
    meta: g.meta || [],
  }))
}

export const EXPORT_FORMATS = [
  { value: 'commands', label: 'LP Commands' },
  { value: 'yaml', label: 'LP Export YAML' },
  { value: 'api', label: 'REST API JSON' },
]
