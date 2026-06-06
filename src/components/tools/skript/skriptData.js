/** Skript Builder — data, presets, templates */

let _uid = 0
export function uid(prefix = 'id') {
  _uid += 1
  return `${prefix}-${_uid}`
}

export const MODULES = [
  { id: 'header', labelKey: 'moduleHeader', icon: 'doc' },
  { id: 'options', labelKey: 'moduleOptions', icon: 'cog' },
  { id: 'variables', labelKey: 'moduleVariables', icon: 'var' },
  { id: 'commands', labelKey: 'moduleCommands', icon: 'cmd' },
  { id: 'events', labelKey: 'moduleEvents', icon: 'bolt' },
  { id: 'functions', labelKey: 'moduleFunctions', icon: 'fn' },
  { id: 'custom', labelKey: 'moduleCustom', icon: 'code' },
]

export const PRESETS = [
  { id: 'blank', labelKey: 'presetBlank' },
  { id: 'homeSystem', labelKey: 'presetHomeSystem' },
  { id: 'welcomeKit', labelKey: 'presetWelcomeKit' },
  { id: 'chatFormat', labelKey: 'presetChatFormat' },
  { id: 'economyBasic', labelKey: 'presetEconomyBasic' },
  { id: 'deathMessages', labelKey: 'presetDeathMessages' },
  { id: 'serverCore', labelKey: 'presetServerCore' },
]

export const EXECUTABLE_BY = [
  { value: 'players', labelKey: 'execPlayers' },
  { value: 'console', labelKey: 'execConsole' },
  { value: 'both', labelKey: 'execBoth' },
]

export const EVENT_PRIORITIES = [
  { value: '', labelKey: 'priorityNormal' },
  { value: 'lowest', labelKey: 'priorityLowest' },
  { value: 'low', labelKey: 'priorityLow' },
  { value: 'normal', labelKey: 'priorityNormal' },
  { value: 'high', labelKey: 'priorityHigh' },
  { value: 'highest', labelKey: 'priorityHighest' },
  { value: 'monitor', labelKey: 'priorityMonitor' },
]

export const EVENT_FILTERS = [
  { value: '', labelKey: 'filterAny' },
  { value: 'uncancelled', labelKey: 'filterUncancelled' },
  { value: 'cancelled', labelKey: 'filterCancelled' },
]

export const COOLDOWN_STORAGE = [
  { value: 'player', labelKey: 'cooldownPlayer' },
  { value: 'server', labelKey: 'cooldownServer' },
]

export const PARAM_TYPES = [
  'text', 'number', 'integer', 'player', 'offline player', 'entity',
  'location', 'world', 'item', 'inventory', 'block', 'boolean',
]

export const EVENT_TYPES = [
  { value: 'join', syntax: 'on join', labelKey: 'eventJoin', category: 'player' },
  { value: 'quit', syntax: 'on quit', labelKey: 'eventQuit', category: 'player' },
  { value: 'firstJoin', syntax: 'on first join', labelKey: 'eventFirstJoin', category: 'player' },
  { value: 'respawn', syntax: 'on respawn', labelKey: 'eventRespawn', category: 'player' },
  { value: 'death', syntax: 'death of player', labelKey: 'eventDeath', category: 'player' },
  { value: 'chat', syntax: 'on chat', labelKey: 'eventChat', category: 'player' },
  { value: 'command', syntax: 'on command', labelKey: 'eventCommand', category: 'player' },
  { value: 'damage', syntax: 'on damage', labelKey: 'eventDamage', category: 'combat' },
  { value: 'damageCause', syntax: 'on damage of player by fall', labelKey: 'eventDamageCause', category: 'combat', custom: true },
  { value: 'kill', syntax: 'on death of player', labelKey: 'eventKill', category: 'combat' },
  { value: 'break', syntax: 'on break', labelKey: 'eventBreak', category: 'block' },
  { value: 'place', syntax: 'on place', labelKey: 'eventPlace', category: 'block' },
  { value: 'rightClick', syntax: 'on right click', labelKey: 'eventRightClick', category: 'block' },
  { value: 'leftClick', syntax: 'on left click', labelKey: 'eventLeftClick', category: 'block' },
  { value: 'drop', syntax: 'on drop', labelKey: 'eventDrop', category: 'item' },
  { value: 'pickup', syntax: 'on pickup', labelKey: 'eventPickup', category: 'item' },
  { value: 'consume', syntax: 'on consume', labelKey: 'eventConsume', category: 'item' },
  { value: 'craft', syntax: 'on craft', labelKey: 'eventCraft', category: 'item' },
  { value: 'fish', syntax: 'on fish', labelKey: 'eventFish', category: 'item' },
  { value: 'bucketFill', syntax: 'on bucket fill', labelKey: 'eventBucketFill', category: 'block' },
  { value: 'bucketEmpty', syntax: 'on bucket empty', labelKey: 'eventBucketEmpty', category: 'block' },
  { value: 'move', syntax: 'on move', labelKey: 'eventMove', category: 'player' },
  { value: 'sneakToggle', syntax: 'on sneak toggle', labelKey: 'eventSneak', category: 'player' },
  { value: 'sprintToggle', syntax: 'on sprint toggle', labelKey: 'eventSprint', category: 'player' },
  { value: 'gamemodeChange', syntax: 'on gamemode change', labelKey: 'eventGamemode', category: 'player' },
  { value: 'worldChange', syntax: 'on world change', labelKey: 'eventWorldChange', category: 'player' },
  { value: 'bedEnter', syntax: 'on bed enter', labelKey: 'eventBedEnter', category: 'player' },
  { value: 'bedLeave', syntax: 'on bed leave', labelKey: 'eventBedLeave', category: 'player' },
  { value: 'projectileHit', syntax: 'on projectile hit', labelKey: 'eventProjectileHit', category: 'combat' },
  { value: 'shoot', syntax: 'on shoot', labelKey: 'eventShoot', category: 'combat' },
  { value: 'regionEnter', syntax: 'on region enter', labelKey: 'eventRegionEnter', category: 'world' },
  { value: 'regionLeave', syntax: 'on region leave', labelKey: 'eventRegionLeave', category: 'world' },
  { value: 'weatherChange', syntax: 'on weather change', labelKey: 'eventWeather', category: 'world' },
  { value: 'scriptLoad', syntax: 'on script load', labelKey: 'eventScriptLoad', category: 'system' },
  { value: 'scriptUnload', syntax: 'on script unload', labelKey: 'eventScriptUnload', category: 'system' },
  { value: 'skriptStart', syntax: 'on skript start', labelKey: 'eventSkriptStart', category: 'system' },
  { value: 'periodic', syntax: 'every 10 minutes', labelKey: 'eventPeriodic', category: 'system', custom: true },
  { value: 'atTime', syntax: 'at 12:00', labelKey: 'eventAtTime', category: 'system', custom: true },
  { value: 'custom', syntax: '', labelKey: 'eventCustom', category: 'system', custom: true },
]

export const EVENT_CATEGORIES = [
  { id: 'player', labelKey: 'catPlayer' },
  { id: 'combat', labelKey: 'catCombat' },
  { id: 'block', labelKey: 'catBlock' },
  { id: 'item', labelKey: 'catItem' },
  { id: 'world', labelKey: 'catWorld' },
  { id: 'system', labelKey: 'catSystem' },
]

export const EFFECT_SNIPPETS = [
  { id: 'send', labelKey: 'snipSend', code: 'send "{@prefix}Hello %player%!" to player' },
  { id: 'broadcast', labelKey: 'snipBroadcast', code: 'broadcast "{@prefix}%message%"' },
  { id: 'teleport', labelKey: 'snipTeleport', code: 'teleport player to {spawn::location}' },
  { id: 'giveItem', labelKey: 'snipGiveItem', code: 'give diamond sword to player' },
  { id: 'removeItem', labelKey: 'snipRemoveItem', code: 'remove 1 diamond from player' },
  { id: 'setVar', labelKey: 'snipSetVar', code: 'set {data::%uuid of player%} to true' },
  { id: 'deleteVar', labelKey: 'snipDeleteVar', code: 'delete {data::%uuid of player%}' },
  { id: 'addVar', labelKey: 'snipAddVar', code: 'add 1 to {balance::%uuid of player%}' },
  { id: 'removeVar', labelKey: 'snipRemoveVar', code: 'remove 1 from {balance::%uuid of player%}' },
  { id: 'heal', labelKey: 'snipHeal', code: 'heal player' },
  { id: 'feed', labelKey: 'snipFeed', code: 'feed player' },
  { id: 'kick', labelKey: 'snipKick', code: 'kick player due to "&cYou were kicked."' },
  { id: 'ban', labelKey: 'snipBan', code: 'ban player due to "&cBanned." for 1 day' },
  { id: 'sound', labelKey: 'snipSound', code: 'play sound "entity.player.levelup" with volume 1 and pitch 1 to player' },
  { id: 'title', labelKey: 'snipTitle', code: 'send title "&aWelcome!" with subtitle "&7Enjoy the server" to player for 3 seconds with fadein 0.5 seconds and fade out 0.5 seconds' },
  { id: 'actionBar', labelKey: 'snipActionBar', code: 'send action bar "&eTip: Use /help" to player' },
  { id: 'effect', labelKey: 'snipEffect', code: 'apply speed 1 to player for 30 seconds' },
  { id: 'gamemode', labelKey: 'snipGamemode', code: 'set gamemode of player to survival' },
  { id: 'execute', labelKey: 'snipExecute', code: 'execute console command "say Hello from Skript"' },
  { id: 'stopTrigger', labelKey: 'snipStop', code: 'stop trigger' },
  { id: 'cancelEvent', labelKey: 'snipCancel', code: 'cancel event' },
]

export const CONDITION_SNIPPETS = [
  { id: 'hasPerm', labelKey: 'snipHasPerm', code: 'player has permission "skript.admin"' },
  { id: 'isOp', labelKey: 'snipIsOp', code: 'player is op' },
  { id: 'isSet', labelKey: 'snipIsSet', code: '{home::%uuid of player%} is set' },
  { id: 'isNotSet', labelKey: 'snipIsNotSet', code: '{home::%uuid of player%} is not set' },
  { id: 'hasItem', labelKey: 'snipHasItem', code: 'player has 1 diamond' },
  { id: 'inWorld', labelKey: 'snipInWorld', code: 'world of player is "world"' },
  { id: 'inRegion', labelKey: 'snipInRegion', code: 'player is in region "spawn"' },
  { id: 'isSneaking', labelKey: 'snipSneaking', code: 'player is sneaking' },
  { id: 'isFlying', labelKey: 'snipFlying', code: 'player is flying' },
  { id: 'compare', labelKey: 'snipCompare', code: '{balance::%uuid of player%} is greater than 100' },
  { id: 'contains', labelKey: 'snipContains', code: 'message contains "hello"' },
  { id: 'chance', labelKey: 'snipChance', code: 'chance of 25%' },
]

function emptyCommand() {
  return {
    id: uid('cmd'),
    enabled: true,
    path: '/example',
    args: '',
    permission: '',
    permissionMessage: '',
    description: '',
    usage: '',
    aliases: [],
    executableBy: 'players',
    cooldown: 0,
    cooldownUnit: 'seconds',
    cooldownMessage: '',
    cooldownBypass: '',
    cooldownStorage: 'player',
    prefix: '',
    conditions: [],
    effects: ['send "&aDone!" to player'],
    elseEffects: [],
  }
}

function emptyEvent() {
  return {
    id: uid('evt'),
    enabled: true,
    type: 'join',
    customSyntax: '',
    priority: '',
    filter: '',
    conditions: [],
    effects: ['send "{@prefix}Welcome %player%!" to player'],
    elseEffects: [],
  }
}

function emptyFunction() {
  return {
    id: uid('fn'),
    enabled: true,
    name: 'myFunction',
    params: [{ name: 'p', type: 'player' }],
    returnType: '',
    local: false,
    body: ['send "Hello %p%!" to p'],
  }
}

export function createSkriptState() {
  return {
    header: {
      scriptName: 'my-script',
      author: 'FoxStudio',
      version: '1.0.0',
      description: 'Generated by SConfig Skript Builder',
      prefix: '&8[&bServer&8]&r ',
      includeTimestamp: true,
    },
    options: [
      { key: 'prefix', value: '&8[&bServer&8]&r ' },
      { key: 'server-name', value: 'My Server' },
    ],
    variables: {
      onLoad: [],
      onUnload: [],
    },
    commands: [emptyCommand()],
    events: [emptyEvent()],
    functions: [],
    custom: {
      enabled: false,
      code: '',
    },
  }
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function applyPreset(state, presetId) {
  const base = createSkriptState()
  base.header.scriptName = presetId === 'blank' ? 'my-script' : presetId.replace(/([A-Z])/g, '-$1').toLowerCase()

  if (presetId === 'blank') return base

  if (presetId === 'homeSystem') {
    base.options = [
      { key: 'prefix', value: '&8[&bHomes&8]&r ' },
      { key: 'max-homes', value: '3' },
    ]
    base.commands = [
      {
        ...emptyCommand(),
        id: uid('cmd'),
        path: '/sethome',
        args: '<text>',
        permission: 'skript.sethome',
        description: 'Set a home at your location',
        usage: '/sethome <name>',
        effects: [
          'set {homes::%uuid of player%::%arg-1%} to location of player',
          'send "{@prefix}&aHome &e%arg-1% &aset to &7%location of player%" to player',
        ],
      },
      {
        ...emptyCommand(),
        id: uid('cmd'),
        path: '/home',
        args: '<text>',
        permission: 'skript.home',
        description: 'Teleport to a home',
        usage: '/home <name>',
        cooldown: 30,
        cooldownMessage: '&cWait %remaining time% before teleporting again.',
        effects: [
          'if {homes::%uuid of player%::%arg-1%} is not set:',
          '\tsend "{@prefix}&cHome &e%arg-1% &cdoes not exist!" to player',
          '\tstop trigger',
          'teleport player to {homes::%uuid of player%::%arg-1%}',
          'send "{@prefix}&aTeleported to &e%arg-1%" to player',
        ],
      },
      {
        ...emptyCommand(),
        id: uid('cmd'),
        path: '/delhome',
        args: '<text>',
        permission: 'skript.delhome',
        description: 'Delete a home',
        usage: '/delhome <name>',
        effects: [
          'if {homes::%uuid of player%::%arg-1%} is not set:',
          '\tsend "{@prefix}&cHome &e%arg-1% &cdoes not exist!" to player',
          '\tstop trigger',
          'delete {homes::%uuid of player%::%arg-1%}',
          'send "{@prefix}&aDeleted home &e%arg-1%" to player',
        ],
      },
      {
        ...emptyCommand(),
        id: uid('cmd'),
        path: '/homes',
        permission: 'skript.home',
        description: 'List your homes',
        effects: [
          'set {_list::*} to indices of {homes::%uuid of player%::*}',
          'if size of {_list::*} is 0:',
          '\tsend "{@prefix}&cYou have no homes set." to player',
          '\tstop trigger',
          'send "{@prefix}&aYour homes: &e%{_list::*}%" to player',
        ],
      },
    ]
    base.events = [{
      ...emptyEvent(),
      id: uid('evt'),
      type: 'join',
      effects: ['send "{@prefix}&aWelcome back, &e%player%&a!" to player'],
    }]
    return base
  }

  if (presetId === 'welcomeKit') {
    base.header.scriptName = 'welcome-kit'
    base.options = [{ key: 'prefix', value: '&8[&aWelcome&8]&r ' }]
    base.events = [
      {
        ...emptyEvent(),
        id: uid('evt'),
        type: 'firstJoin',
        effects: [
          'send title "&aWelcome!" with subtitle "&7First time here?" to player for 5 seconds',
          'give stone sword to player',
          'give 16 bread to player',
          'give 16 oak log to player',
          'set {kit::received::%uuid of player%} to true',
          'broadcast "{@prefix}&e%player% &7joined for the first time!"',
        ],
      },
      {
        ...emptyEvent(),
        id: uid('evt'),
        type: 'join',
        conditions: ['{kit::received::%uuid of player%} is set'],
        effects: ['send "{@prefix}&aWelcome back, &e%player%&a!" to player'],
      },
    ]
    return base
  }

  if (presetId === 'chatFormat') {
    base.header.scriptName = 'chat-format'
    base.options = [
      { key: 'prefix', value: '&8[&bChat&8]&r ' },
      { key: 'format', value: '&7[%world%] &f%player%&8: &f%message%' },
    ]
    base.events = [{
      ...emptyEvent(),
      id: uid('evt'),
      type: 'chat',
      effects: [
        'cancel event',
        'set chat format to "{@format}"',
      ],
    }]
    base.functions = [{
      ...emptyFunction(),
      id: uid('fn'),
      name: 'chatPrefix',
      params: [{ name: 'p', type: 'player' }],
      returnType: 'text',
      body: [
        'if p has permission "group.admin":',
        '\treturn "&c[Admin] "',
        'if p has permission "group.vip":',
        '\treturn "&6[VIP] "',
        'return "&7" ',
      ],
    }]
    return base
  }

  if (presetId === 'economyBasic') {
    base.header.scriptName = 'economy'
    base.options = [{ key: 'prefix', value: '&8[&6$&8]&r ' }, { key: 'start-balance', value: '100' }]
    base.variables = {
      onLoad: ['loop all players:', '\tset {balance::%uuid of loop-player%} to {@start-balance} if {balance::%uuid of loop-player%} is not set'],
      onUnload: [],
    }
    base.commands = [
      {
        ...emptyCommand(),
        id: uid('cmd'),
        path: '/balance',
        aliases: ['bal', 'money'],
        permission: 'skript.balance',
        effects: ['send "{@prefix}&aBalance: &e%{balance::%uuid of player%}% coins" to player'],
      },
      {
        ...emptyCommand(),
        id: uid('cmd'),
        path: '/pay',
        args: '<player> <number>',
        permission: 'skript.pay',
        effects: [
          'if arg-2 <= 0:',
          '\tsend "{@prefix}&cAmount must be positive." to player',
          '\tstop trigger',
          'if {balance::%uuid of player%} < arg-2:',
          '\tsend "{@prefix}&cInsufficient funds." to player',
          '\tstop trigger',
          'remove arg-2 from {balance::%uuid of player%}',
          'add arg-2 to {balance::%uuid of arg-1%}',
          'send "{@prefix}&aPaid &e%arg-2% &ato &e%arg-1%" to player',
          'send "{@prefix}&aReceived &e%arg-2% &afrom &e%player%" to arg-1',
        ],
      },
    ]
    base.functions = [{
      ...emptyFunction(),
      id: uid('fn'),
      name: 'formatMoney',
      params: [{ name: 'amount', type: 'number' }],
      returnType: 'text',
      body: ['return "%amount% coins"'],
    }]
    return base
  }

  if (presetId === 'deathMessages') {
    base.header.scriptName = 'death-messages'
    base.events = [{
      ...emptyEvent(),
      id: uid('evt'),
      type: 'death',
      effects: [
        'set death message to "&c☠ &7% victim % &8was slain by &c% attacker %"',
      ],
    }]
    return base
  }

  if (presetId === 'serverCore') {
    const home = applyPreset(deepClone(base), 'homeSystem')
    const welcome = applyPreset(deepClone(base), 'welcomeKit')
    const chat = applyPreset(deepClone(base), 'chatFormat')
    home.header.scriptName = 'server-core'
    home.header.description = 'Combined server core scripts'
    home.commands = [...home.commands, ...applyPreset(deepClone(base), 'economyBasic').commands.slice(0, 2)]
    home.events = [...welcome.events, ...chat.events, ...home.events]
    home.functions = chat.functions
    home.variables = applyPreset(deepClone(base), 'economyBasic').variables
    home.options = [
      { key: 'prefix', value: '&8[&bCore&8]&r ' },
      { key: 'server-name', value: 'My Server' },
      { key: 'format', value: '&7[%world%] &f%player%&8: &f%message%' },
      { key: 'start-balance', value: '100' },
      { key: 'max-homes', value: '3' },
    ]
    return home
  }

  return base
}

export function createCommand() { return emptyCommand() }
export function createEvent() { return emptyEvent() }
export function createFunction() { return emptyFunction() }

export function getEventSyntax(evt) {
  const def = EVENT_TYPES.find(e => e.value === evt.type)
  if (evt.type === 'custom' || def?.custom) return evt.customSyntax || def?.syntax || 'on join'
  return def?.syntax || 'on join'
}
