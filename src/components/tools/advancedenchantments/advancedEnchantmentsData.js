let _uid = 0
export function uid(prefix = 'ae') {
  _uid += 1
  return `${prefix}-${Date.now()}-${_uid}-${Math.random().toString(36).slice(2, 6)}`
}

export const GROUPS = [
  { id: 'SIMPLE', color: '&7', weight: 50 },
  { id: 'UNIQUE', color: '&e', weight: 25 },
  { id: 'ELITE', color: '&a', weight: 15 },
  { id: 'ULTIMATE', color: '&d', weight: 8 },
  { id: 'LEGENDARY', color: '&6', weight: 3 },
  { id: 'HEROIC', color: '&c', weight: 1 },
]

export const TRIGGERS = [
  'ATTACK', 'ATTACK_MOB', 'DEFENSE', 'DEFENSE_MOB', 'MINING',
  'SHOOT', 'SHOOT_MOB', 'HELD', 'EFFECT_STATIC', 'EXPLOSION_DAMAGE',
  'DEATH', 'KILL', 'BLOCK_PLACE', 'BLOCK_BREAK', 'RIGHT_CLICK',
  'LEFT_CLICK', 'SNEAK', 'JOIN', 'RESPAWN', 'CROUCH', 'SPRINT', 'JUMP',
]

export const EFFECTS = [
  // ── Potion & Buff ──────────────────────────────────────────────────────────
  { id: 'POTION', label: 'POTION', params: [
    { key: 'type', placeholder: 'SPEED', hint: 'SPEED, INCREASE_DAMAGE, POISON, REGENERATION, SLOW, BLINDNESS, JUMP, NIGHT_VISION, INVISIBILITY, FIRE_RESISTANCE, WATER_BREATHING, ABSORPTION, SATURATION, GLOWING, LEVITATION, LUCK, UNLUCK, SLOW_FALLING, CONDUIT_POWER, DOLPHINS_GRACE, WITHER, HEALTH_BOOST, WEAKNESS, HUNGER, CONFUSION, DAMAGE_RESISTANCE, FAST_DIGGING, SLOW_DIGGING' },
    { key: 'amplifier', placeholder: '0', hint: '0=I, 1=II, 2=III...' },
    { key: 'duration', placeholder: '60', hint: 'Ticks (20=1s)' },
  ]},
  { id: 'REMOVE_POTION', label: 'REMOVE_POTION', params: [{ key: 'type', placeholder: 'SPEED', hint: 'Potion type to remove' }] },

  // ── Damage & Health ────────────────────────────────────────────────────────
  { id: 'DAMAGE', label: 'DAMAGE', params: [{ key: 'amount', placeholder: '3', hint: 'Damage amount (hearts)' }] },
  { id: 'DAMAGE_PERCENTAGE', label: 'DAMAGE_PERCENTAGE', params: [{ key: 'percent', placeholder: '25', hint: '% of max health' }] },
  { id: 'STEAL_HEALTH', label: 'STEAL_HEALTH', params: [{ key: 'amount', placeholder: '2', hint: 'Hearts to steal' }] },
  { id: 'HEAL', label: 'HEAL', params: [{ key: 'amount', placeholder: '2', hint: 'Hearts to heal' }] },
  { id: 'HEAL_PERCENTAGE', label: 'HEAL_PERCENTAGE', params: [{ key: 'percent', placeholder: '10', hint: '% of max health' }] },
  { id: 'SET_HEALTH', label: 'SET_HEALTH', params: [{ key: 'amount', placeholder: '10', hint: 'Set to X hearts' }] },
  { id: 'ABSORB', label: 'ABSORB', params: [{ key: 'amount', placeholder: '4', hint: 'Absorption hearts' }] },

  // ── Fire & Ice ─────────────────────────────────────────────────────────────
  { id: 'BURN', label: 'BURN', params: [{ key: 'ticks', placeholder: '60', hint: 'Ticks (20=1s)' }] },
  { id: 'SET_ON_FIRE', label: 'SET_ON_FIRE', params: [{ key: 'ticks', placeholder: '60', hint: 'Ticks' }] },
  { id: 'EXTINGUISH', label: 'EXTINGUISH', params: [] },
  { id: 'FREEZE', label: 'FREEZE', params: [{ key: 'ticks', placeholder: '60', hint: 'Freeze ticks' }] },

  // ── Movement & Knockback ───────────────────────────────────────────────────
  { id: 'LAUNCH_UP', label: 'LAUNCH_UP', params: [{ key: 'power', placeholder: '1.5', hint: 'Vertical launch power' }] },
  { id: 'THROW_BACK', label: 'THROW_BACK', params: [{ key: 'power', placeholder: '1.5', hint: 'Knockback power' }] },
  { id: 'PULL_TOWARD', label: 'PULL_TOWARD', params: [{ key: 'power', placeholder: '1.0', hint: 'Pull strength' }] },
  { id: 'TELEPORT_BEHIND', label: 'TELEPORT_BEHIND', params: [] },
  { id: 'SWAP_LOCATIONS', label: 'SWAP_LOCATIONS', params: [] },
  { id: 'DASH', label: 'DASH', params: [{ key: 'power', placeholder: '1.5', hint: 'Dash power' }] },

  // ── Debuffs & CC ───────────────────────────────────────────────────────────
  { id: 'BLIND', label: 'BLIND', params: [{ key: 'duration', placeholder: '60', hint: 'Ticks' }] },
  { id: 'SLOWNESS', label: 'SLOWNESS', params: [
    { key: 'amplifier', placeholder: '1', hint: 'Level' },
    { key: 'duration', placeholder: '60', hint: 'Ticks' },
  ]},
  { id: 'CONFUSE', label: 'CONFUSE', params: [{ key: 'duration', placeholder: '60', hint: 'Nausea ticks' }] },
  { id: 'SILENCE', label: 'SILENCE', params: [{ key: 'duration', placeholder: '60', hint: 'Ticks' }] },
  { id: 'DISARM', label: 'DISARM', params: [] },
  { id: 'STARVE', label: 'STARVE', params: [{ key: 'amount', placeholder: '4', hint: 'Hunger points' }] },

  // ── Environment & Explosion ────────────────────────────────────────────────
  { id: 'LIGHTNING', label: 'LIGHTNING', params: [] },
  { id: 'TNT', label: 'TNT', params: [] },
  { id: 'EXPLOSION', label: 'EXPLOSION', params: [{ key: 'power', placeholder: '2.0', hint: 'Explosion power (TNT=4)' }] },
  { id: 'FIREBALL', label: 'FIREBALL', params: [] },
  { id: 'METEOR', label: 'METEOR', params: [] },
  { id: 'COBWEB', label: 'COBWEB', params: [{ key: 'duration', placeholder: '60', hint: 'Ticks before remove' }] },
  { id: 'ANVIL', label: 'ANVIL', params: [] },
  { id: 'LAVA_POOL', label: 'LAVA_POOL', params: [{ key: 'duration', placeholder: '40', hint: 'Ticks' }] },

  // ── EXP & Economy ──────────────────────────────────────────────────────────
  { id: 'STEAL_EXP', label: 'STEAL_EXP', params: [{ key: 'amount', placeholder: '5', hint: 'XP amount to steal' }] },
  { id: 'GIVE_EXP', label: 'GIVE_EXP', params: [{ key: 'amount', placeholder: '10', hint: 'XP to give' }] },
  { id: 'REMOVE_EXP', label: 'REMOVE_EXP', params: [{ key: 'amount', placeholder: '5', hint: 'XP to remove' }] },
  { id: 'STEAL_MONEY', label: 'STEAL_MONEY', params: [{ key: 'amount', placeholder: '100', hint: 'Money to steal' }] },
  { id: 'GIVE_MONEY', label: 'GIVE_MONEY', params: [{ key: 'amount', placeholder: '50', hint: 'Money to give' }] },

  // ── Items & Drops ──────────────────────────────────────────────────────────
  { id: 'DROP_ITEM', label: 'DROP_ITEM', params: [
    { key: 'material', placeholder: 'DIAMOND', hint: 'Material name' },
    { key: 'amount', placeholder: '1', hint: 'Amount' },
  ]},
  { id: 'STEAL_ITEM', label: 'STEAL_ITEM', params: [] },
  { id: 'BREAK_ITEM', label: 'BREAK_ITEM', params: [] },
  { id: 'SMELT', label: 'SMELT', params: [] },
  { id: 'REPLANT', label: 'REPLANT', params: [] },
  { id: 'MULTI_DROP', label: 'MULTI_DROP', params: [{ key: 'multiplier', placeholder: '2', hint: 'x multiplier' }] },

  // ── Visual & Sound ─────────────────────────────────────────────────────────
  { id: 'PARTICLE', label: 'PARTICLE', params: [
    { key: 'type', placeholder: 'FLAME', hint: 'FLAME, HEART, CRIT, SPELL_MOB, ENCHANTMENT_TABLE, REDSTONE, VILLAGER_HAPPY, SMOKE, TOTEM, SOUL_FIRE_FLAME...' },
    { key: 'amount', placeholder: '20', hint: 'Count' },
  ]},
  { id: 'SOUND', label: 'SOUND', params: [
    { key: 'sound', placeholder: 'ENTITY_LIGHTNING_BOLT_THUNDER', hint: 'Sound name' },
    { key: 'volume', placeholder: '1.0', hint: '0.0-2.0' },
    { key: 'pitch', placeholder: '1.0', hint: '0.0-2.0' },
  ]},

  // ── Message & Command ──────────────────────────────────────────────────────
  { id: 'MESSAGE', label: 'MESSAGE', params: [{ key: 'text', placeholder: '&cYou got hit!', hint: 'Message with color codes' }] },
  { id: 'ACTION_BAR', label: 'ACTION_BAR', params: [{ key: 'text', placeholder: '&aEnchant activated!', hint: 'Action bar message' }] },
  { id: 'TITLE', label: 'TITLE', params: [
    { key: 'title', placeholder: '&c&lCRIT!', hint: 'Title text' },
    { key: 'subtitle', placeholder: '&7You dealt a critical hit', hint: 'Subtitle text' },
  ]},
  { id: 'COMMAND', label: 'COMMAND', params: [{ key: 'cmd', placeholder: 'say %player% activated!', hint: 'Console command (%player% = player name)' }] },
  { id: 'PLAYER_COMMAND', label: 'PLAYER_COMMAND', params: [{ key: 'cmd', placeholder: 'warp spawn', hint: 'Run as player' }] },

  // ── Spawn & Summon ─────────────────────────────────────────────────────────
  { id: 'SPAWN_MOB', label: 'SPAWN_MOB', params: [
    { key: 'type', placeholder: 'ZOMBIE', hint: 'Entity type' },
    { key: 'amount', placeholder: '1', hint: 'Count' },
  ]},
  { id: 'SPAWN_GUARD', label: 'SPAWN_GUARD', params: [
    { key: 'type', placeholder: 'IRON_GOLEM', hint: 'Mob type' },
    { key: 'duration', placeholder: '200', hint: 'Ticks alive' },
  ]},

  // ── Special ────────────────────────────────────────────────────────────────
  { id: 'CANCEL_EVENT', label: 'CANCEL_EVENT', params: [] },
  { id: 'BLOOD', label: 'BLOOD', params: [] },
  { id: 'RAGE', label: 'RAGE', params: [{ key: 'stacks', placeholder: '3', hint: 'Max rage stacks' }] },
  { id: 'REFLECT', label: 'REFLECT', params: [{ key: 'percent', placeholder: '30', hint: '% damage reflected' }] },
  { id: 'DODGE', label: 'DODGE', params: [{ key: 'percent', placeholder: '15', hint: '% dodge chance' }] },
  { id: 'CRIT', label: 'CRIT', params: [{ key: 'multiplier', placeholder: '1.5', hint: 'Damage multiplier' }] },
  { id: 'DOUBLE_DAMAGE', label: 'DOUBLE_DAMAGE', params: [] },
  { id: 'HALF_DAMAGE', label: 'HALF_DAMAGE', params: [] },
  { id: 'KEEP_INVENTORY', label: 'KEEP_INVENTORY', params: [] },
  { id: 'KEEP_EXP', label: 'KEEP_EXP', params: [] },
  { id: 'FLY', label: 'FLY', params: [{ key: 'duration', placeholder: '100', hint: 'Ticks of flight' }] },
  { id: 'GRAPPLE', label: 'GRAPPLE', params: [{ key: 'power', placeholder: '1.5', hint: 'Grapple strength' }] },
]

export const TARGETS = ['@Attacker', '@Victim', '@Self', '@Random', '@All']

export const CONDITIONS = [
  { id: 'HEALTH_ABOVE', label: 'HEALTH:ABOVE', params: [{ key: 'percent', placeholder: '50', hint: '% health' }], format: 'HEALTH:ABOVE:{percent}%' },
  { id: 'HEALTH_BELOW', label: 'HEALTH:BELOW', params: [{ key: 'percent', placeholder: '50', hint: '% health' }], format: 'HEALTH:BELOW:{percent}%' },
  { id: 'FOOD_ABOVE', label: 'FOOD:ABOVE', params: [{ key: 'amount', placeholder: '10', hint: 'Food level (0-20)' }], format: 'FOOD:ABOVE:{amount}' },
  { id: 'FOOD_BELOW', label: 'FOOD:BELOW', params: [{ key: 'amount', placeholder: '5', hint: 'Food level (0-20)' }], format: 'FOOD:BELOW:{amount}' },
  { id: 'WORLD', label: 'WORLD', params: [{ key: 'world', placeholder: 'world_nether', hint: 'World name' }], format: 'WORLD:{world}' },
  { id: 'BIOME', label: 'BIOME', params: [{ key: 'biome', placeholder: 'PLAINS', hint: 'Biome name' }], format: 'BIOME:{biome}' },
  { id: 'PERMISSION', label: 'PERMISSION', params: [{ key: 'node', placeholder: 'ae.vip', hint: 'Permission node' }], format: 'PERMISSION:{node}' },
  { id: 'LEVEL_ABOVE', label: 'LEVEL:ABOVE', params: [{ key: 'level', placeholder: '30', hint: 'XP level' }], format: 'LEVEL:ABOVE:{level}' },
  { id: 'LEVEL_BELOW', label: 'LEVEL:BELOW', params: [{ key: 'level', placeholder: '10', hint: 'XP level' }], format: 'LEVEL:BELOW:{level}' },
  { id: 'CHANCE', label: 'CHANCE', params: [{ key: 'percent', placeholder: '50', hint: '% chance' }], format: 'CHANCE:{percent}' },
  { id: 'PLACEHOLDER', label: 'PLACEHOLDER', params: [
    { key: 'placeholder', placeholder: '%player_health%', hint: 'PAPI placeholder' },
    { key: 'operator', placeholder: '>=', hint: '>, <, >=, <=, ==' },
    { key: 'value', placeholder: '10', hint: 'Value to compare' },
  ], format: 'PLACEHOLDER:{placeholder}:{operator}:{value}' },
  { id: 'SNEAKING', label: 'SNEAKING', params: [], format: 'SNEAKING' },
  { id: 'SPRINTING', label: 'SPRINTING', params: [], format: 'SPRINTING' },
  { id: 'FLYING', label: 'FLYING', params: [], format: 'FLYING' },
  { id: 'IN_WATER', label: 'IN_WATER', params: [], format: 'IN_WATER' },
  { id: 'ON_FIRE', label: 'ON_FIRE', params: [], format: 'ON_FIRE' },
  { id: 'NIGHT', label: 'NIGHT', params: [], format: 'NIGHT' },
  { id: 'DAY', label: 'DAY', params: [], format: 'DAY' },
  { id: 'STORM', label: 'STORM', params: [], format: 'STORM' },
]

export const APPLIES_SHORTCUTS = [
  'ALL_SWORD', 'ALL_AXE', 'ALL_PICKAXE', 'ALL_SHOVEL', 'ALL_HOE',
  'ALL_HELMET', 'ALL_CHESTPLATE', 'ALL_LEGGINGS', 'ALL_BOOTS', 'ALL_ARMOR',
  'BOW', 'CROSSBOW', 'TRIDENT', 'SHIELD', 'ELYTRA', 'FISHING_ROD',
]

export const PRESETS = [
  { id: 'blank', labelKey: 'presetBlank' },
  { id: 'venom', labelKey: 'presetVenom' },
  { id: 'berserk', labelKey: 'presetBerserk' },
  { id: 'lifesteal', labelKey: 'presetLifesteal' },
  { id: 'explosive', labelKey: 'presetExplosive' },
  { id: 'speed', labelKey: 'presetSpeed' },
  { id: 'lucky_miner', labelKey: 'presetLuckyMiner' },
  { id: 'thunder_strike', labelKey: 'presetThunderStrike' },
]

// ── Full list of enchantment names (for required/incompatible/removed) ────────
export const ENCHANTMENT_NAMES = [
  // Vanilla
  'sharpness', 'smite', 'bane_of_arthropods', 'knockback', 'fire_aspect', 'looting', 'sweeping_edge',
  'protection', 'fire_protection', 'feather_falling', 'blast_protection', 'projectile_protection', 'thorns',
  'respiration', 'aqua_affinity', 'depth_strider', 'frost_walker', 'soul_speed', 'swift_sneak',
  'efficiency', 'silk_touch', 'fortune', 'unbreaking', 'mending',
  'power', 'punch', 'flame', 'infinity',
  'luck_of_the_sea', 'lure',
  'loyalty', 'riptide', 'channeling', 'impaling',
  'multishot', 'quick_charge', 'piercing',
  // AE Common Custom
  'venom', 'berserk', 'lifesteal', 'explosive', 'speed', 'lucky_miner', 'thunder_strike',
  'gears', 'rage', 'crit', 'dodge', 'reflect', 'blind', 'freeze', 'disarm',
  'heal', 'feedme', 'drunk', 'confusion', 'molten', 'hardened', 'springs',
  'telekinesis', 'autosmelt', 'haste', 'oxygenate', 'nightvision',
  'strength', 'jump', 'fly', 'glowing', 'inquisitive', 'experienced',
  'obliterate', 'overload', 'implants', 'tank', 'valor',
  'anti_gravity', 'rocketeers', 'self_destruct', 'snare', 'wither',
  'virus', 'headless', 'decapitation', 'double_strike', 'vampire',
  'angelic', 'armored', 'blessed', 'enlightened', 'frozen',
  'icy', 'insomnia', 'fortify', 'obsidian_shield', 'guardian_angel',
  'painkiller', 'last_stand', 'phoenix', 'revive', 'overcharge',
]

export function createLevel(levelNum = 1) {
  return {
    id: uid('lvl'),
    level: levelNum,
    chance: 20,
    cooldown: 5,
    effects: ['POTION:INCREASE_DAMAGE:0:60 @Attacker'],
    conditions: [],
  }
}

export function createEnchantmentState() {
  return {
    name: 'my_enchantment',
    display: '%group-color%My Enchantment',
    description: 'A cool enchantment',
    appliesTo: 'Swords',
    type: 'ATTACK',
    group: 'UNIQUE',
    applies: ['ALL_SWORD'],
    settings: {
      showActionBar: false,
      removeable: true,
      disableInEnchanter: false,
      disabledWorlds: [],
      requiredEnchants: [],
      notApplyableWith: [],
      removedEnchants: [],
    },
    levels: [createLevel(1)],
    activeLevelId: null,
  }
}

export function applyPreset(presetId) {
  switch (presetId) {
    case 'venom':
      return {
        name: 'venom',
        display: '%group-color%Venom',
        description: 'Poisons your enemies on hit',
        appliesTo: 'Swords',
        type: 'ATTACK',
        group: 'UNIQUE',
        applies: ['ALL_SWORD'],
        settings: {
          showActionBar: true,
          removeable: true,
          disableInEnchanter: false,
          disabledWorlds: [],
          requiredEnchants: [],
          notApplyableWith: [],
          removedEnchants: [],
        },
        levels: [
          { id: uid('lvl'), level: 1, chance: 25, cooldown: 8, effects: ['POTION:POISON:0:60 @Victim'], conditions: [] },
          { id: uid('lvl'), level: 2, chance: 30, cooldown: 7, effects: ['POTION:POISON:1:80 @Victim'], conditions: [] },
          { id: uid('lvl'), level: 3, chance: 35, cooldown: 6, effects: ['POTION:POISON:2:100 @Victim'], conditions: [] },
        ],
        activeLevelId: null,
      }

    case 'berserk':
      return {
        name: 'berserk',
        display: '%group-color%Berserk',
        description: 'Gain strength when attacking',
        appliesTo: 'Swords & Axes',
        type: 'ATTACK',
        group: 'ELITE',
        applies: ['ALL_SWORD', 'ALL_AXE'],
        settings: {
          showActionBar: true,
          removeable: true,
          disableInEnchanter: false,
          disabledWorlds: [],
          requiredEnchants: [],
          notApplyableWith: [],
          removedEnchants: [],
        },
        levels: [
          { id: uid('lvl'), level: 1, chance: 15, cooldown: 10, effects: ['POTION:INCREASE_DAMAGE:0:60 @Attacker'], conditions: [] },
          { id: uid('lvl'), level: 2, chance: 20, cooldown: 9, effects: ['POTION:INCREASE_DAMAGE:1:80 @Attacker'], conditions: [] },
          { id: uid('lvl'), level: 3, chance: 25, cooldown: 8, effects: ['POTION:INCREASE_DAMAGE:2:100 @Attacker'], conditions: [] },
        ],
        activeLevelId: null,
      }

    case 'lifesteal':
      return {
        name: 'lifesteal',
        display: '%group-color%Lifesteal',
        description: 'Steal health from your enemies',
        appliesTo: 'Swords',
        type: 'ATTACK',
        group: 'LEGENDARY',
        applies: ['ALL_SWORD'],
        settings: {
          showActionBar: true,
          removeable: true,
          disableInEnchanter: false,
          disabledWorlds: [],
          requiredEnchants: [],
          notApplyableWith: [],
          removedEnchants: [],
        },
        levels: [
          { id: uid('lvl'), level: 1, chance: 20, cooldown: 12, effects: ['STEAL_HEALTH:1 @Victim'], conditions: [] },
          { id: uid('lvl'), level: 2, chance: 25, cooldown: 10, effects: ['STEAL_HEALTH:2 @Victim'], conditions: [] },
          { id: uid('lvl'), level: 3, chance: 30, cooldown: 8, effects: ['STEAL_HEALTH:3 @Victim'], conditions: [] },
        ],
        activeLevelId: null,
      }

    case 'explosive':
      return {
        name: 'explosive',
        display: '%group-color%Explosive',
        description: 'Chance to create an explosion on hit',
        appliesTo: 'Swords & Axes',
        type: 'ATTACK',
        group: 'ULTIMATE',
        applies: ['ALL_SWORD', 'ALL_AXE'],
        settings: {
          showActionBar: false,
          removeable: true,
          disableInEnchanter: false,
          disabledWorlds: [],
          requiredEnchants: [],
          notApplyableWith: [],
          removedEnchants: [],
        },
        levels: [
          { id: uid('lvl'), level: 1, chance: 5, cooldown: 20, effects: ['TNT @Victim'], conditions: [] },
          { id: uid('lvl'), level: 2, chance: 8, cooldown: 18, effects: ['TNT @Victim'], conditions: [] },
          { id: uid('lvl'), level: 3, chance: 12, cooldown: 15, effects: ['TNT @Victim', 'BURN:40 @Victim'], conditions: [] },
        ],
        activeLevelId: null,
      }

    case 'speed':
      return {
        name: 'speed',
        display: '%group-color%Speed',
        description: 'Gain speed while held',
        appliesTo: 'Boots',
        type: 'HELD',
        group: 'SIMPLE',
        applies: ['ALL_BOOTS'],
        settings: {
          showActionBar: false,
          removeable: true,
          disableInEnchanter: false,
          disabledWorlds: [],
          requiredEnchants: [],
          notApplyableWith: [],
          removedEnchants: [],
        },
        levels: [
          { id: uid('lvl'), level: 1, chance: 100, cooldown: 0, effects: ['POTION:SPEED:0:40 @Self'], conditions: [] },
          { id: uid('lvl'), level: 2, chance: 100, cooldown: 0, effects: ['POTION:SPEED:1:40 @Self'], conditions: [] },
        ],
        activeLevelId: null,
      }

    case 'lucky_miner':
      return {
        name: 'lucky_miner',
        display: '%group-color%Lucky Miner',
        description: 'Chance to double drops while mining',
        appliesTo: 'Pickaxes',
        type: 'MINING',
        group: 'ELITE',
        applies: ['ALL_PICKAXE'],
        settings: {
          showActionBar: true,
          removeable: true,
          disableInEnchanter: false,
          disabledWorlds: [],
          requiredEnchants: [],
          notApplyableWith: [],
          removedEnchants: [],
        },
        levels: [
          { id: uid('lvl'), level: 1, chance: 10, cooldown: 3, effects: ['DROP_ITEM:DIAMOND:1 @Self'], conditions: [] },
          { id: uid('lvl'), level: 2, chance: 15, cooldown: 3, effects: ['DROP_ITEM:DIAMOND:2 @Self'], conditions: [] },
          { id: uid('lvl'), level: 3, chance: 20, cooldown: 3, effects: ['DROP_ITEM:DIAMOND:3 @Self'], conditions: [] },
        ],
        activeLevelId: null,
      }

    case 'thunder_strike':
      return {
        name: 'thunder_strike',
        display: '%group-color%Thunder Strike',
        description: 'Summon lightning on your enemies',
        appliesTo: 'Swords',
        type: 'ATTACK',
        group: 'HEROIC',
        applies: ['ALL_SWORD'],
        settings: {
          showActionBar: true,
          removeable: true,
          disableInEnchanter: false,
          disabledWorlds: [],
          requiredEnchants: [],
          notApplyableWith: [],
          removedEnchants: [],
        },
        levels: [
          { id: uid('lvl'), level: 1, chance: 3, cooldown: 30, effects: ['LIGHTNING @Victim'], conditions: [] },
          { id: uid('lvl'), level: 2, chance: 5, cooldown: 25, effects: ['LIGHTNING @Victim', 'BURN:40 @Victim'], conditions: [] },
          { id: uid('lvl'), level: 3, chance: 8, cooldown: 20, effects: ['LIGHTNING @Victim', 'BURN:60 @Victim', 'DAMAGE:2 @Victim'], conditions: [] },
        ],
        activeLevelId: null,
      }

    case 'blank':
    default:
      return createEnchantmentState()
  }
}

export function getGroupColor(groupId) {
  const group = GROUPS.find(g => g.id === groupId)
  return group?.color || '&7'
}

export function getGroupCssColor(groupId) {
  const map = {
    SIMPLE: '#AAAAAA',
    UNIQUE: '#FFFF55',
    ELITE: '#55FF55',
    ULTIMATE: '#FF55FF',
    LEGENDARY: '#FFAA00',
    HEROIC: '#FF5555',
  }
  return map[groupId] || '#AAAAAA'
}
