/** ExcellentCrates Builder — data, presets & constants */

let _uid = 0
export function uid(prefix = 'id') {
  _uid += 1
  return `${prefix}-${_uid}`
}

// ── Rarity definitions ───────────────────────────────────────────────────────
export const RARITIES = [
  { id: 'common',    labelKey: 'rarityCommon',    color: '#aaaaaa', weight: 50 },
  { id: 'uncommon',  labelKey: 'rarityUncommon',  color: '#55ff55', weight: 30 },
  { id: 'rare',      labelKey: 'rarityRare',      color: '#5555ff', weight: 15 },
  { id: 'epic',      labelKey: 'rarityEpic',      color: '#aa00aa', weight: 8 },
  { id: 'legendary', labelKey: 'rarityLegendary', color: '#ffaa00', weight: 3 },
  { id: 'mythic',    labelKey: 'rarityMythic',    color: '#ff5555', weight: 1 },
]

// ── Opening animations ───────────────────────────────────────────────────────
export const ANIMATIONS = [
  { id: 'none',     labelKey: 'animNone' },
  { id: 'spin',     labelKey: 'animSpin' },
  { id: 'csgo',     labelKey: 'animCsgo' },
  { id: 'wheel',    labelKey: 'animWheel' },
  { id: 'letter',   labelKey: 'animLetter' },
]

// ── Particle effects ─────────────────────────────────────────────────────────
export const PARTICLES = [
  'NONE', 'FLAME', 'VILLAGER_HAPPY', 'SPELL_MOB', 'HEART',
  'REDSTONE', 'ENCHANTMENT_TABLE', 'TOTEM', 'END_ROD',
  'DRAGON_BREATH', 'SOUL_FIRE_FLAME', 'CHERRY_LEAVES',
  'PORTAL', 'CRIT', 'CRIT_MAGIC', 'CLOUD', 'NOTE',
  'SNOWFLAKE', 'WAX_ON', 'WAX_OFF', 'ELECTRIC_SPARK',
]

// ── Key types ────────────────────────────────────────────────────────────────
export const KEY_TYPES = [
  { value: 'physical', labelKey: 'keyPhysical' },
  { value: 'virtual',  labelKey: 'keyVirtual' },
]

// ── Currency types for open cost ─────────────────────────────────────────────
export const COST_TYPES = [
  { value: 'none',    labelKey: 'costNone' },
  { value: 'vault',   labelKey: 'costVault' },
  { value: 'exp',     labelKey: 'costExp' },
  { value: 'levels',  labelKey: 'costLevels' },
  { value: 'player_points', labelKey: 'costPlayerPoints' },
]

// ── Reward types ─────────────────────────────────────────────────────────────
export const REWARD_TYPES = [
  { value: 'item',    labelKey: 'rewardItem' },
  { value: 'command', labelKey: 'rewardCommand' },
]

// ── Cooldown units ───────────────────────────────────────────────────────────
export const COOLDOWN_UNITS = [
  { value: 'seconds', labelKey: 'unitSeconds' },
  { value: 'minutes', labelKey: 'unitMinutes' },
  { value: 'hours',   labelKey: 'unitHours' },
  { value: 'days',    labelKey: 'unitDays' },
]

// ── Presets ──────────────────────────────────────────────────────────────────
export const PRESETS = [
  { id: 'blank',       labelKey: 'presetBlank' },
  { id: 'voteCrate',   labelKey: 'presetVoteCrate' },
  { id: 'common',      labelKey: 'presetCommonCrate' },
  { id: 'rare',        labelKey: 'presetRareCrate' },
  { id: 'legendary',   labelKey: 'presetLegendaryCrate' },
  { id: 'seasonal',    labelKey: 'presetSeasonalCrate' },
]

// ── Sections / modules ───────────────────────────────────────────────────────
export const MODULES = [
  { id: 'general',   labelKey: 'moduleGeneral',   icon: 'cog' },
  { id: 'keys',      labelKey: 'moduleKeys',      icon: 'key' },
  { id: 'rewards',   labelKey: 'moduleRewards',   icon: 'gift' },
  { id: 'animation', labelKey: 'moduleAnimation', icon: 'play' },
  { id: 'preview',   labelKey: 'modulePreview',   icon: 'eye' },
  { id: 'milestones', labelKey: 'moduleMilestones', icon: 'trophy' },
  { id: 'effects',   labelKey: 'moduleEffects',   icon: 'sparkle' },
]

// ── Default factories ────────────────────────────────────────────────────────
export function createReward(type = 'item') {
  return {
    id: uid('rwd'),
    enabled: true,
    type,
    name: type === 'item' ? 'Diamond Sword' : 'Balance Reward',
    rarity: 'common',
    weight: 50,
    broadcast: false,
    // Item reward fields
    material: 'DIAMOND_SWORD',
    amount: 1,
    displayName: '&bDiamond Sword',
    lore: ['&7A shiny sword!'],
    enchantments: [],
    // Command reward fields
    commands: type === 'command' ? ['eco give %player% 1000'] : [],
    // Limits
    winLimitEnabled: false,
    winLimitAmount: 1,
    winLimitCooldown: 0,
    winLimitCooldownUnit: 'hours',
    // Global limit
    globalLimitEnabled: false,
    globalLimitAmount: -1,
    globalLimitCooldown: 0,
    globalLimitCooldownUnit: 'hours',
  }
}

export function createKey() {
  return {
    id: uid('key'),
    name: 'Crate Key',
    type: 'physical',
    material: 'TRIPWIRE_HOOK',
    displayName: '&6Crate Key',
    lore: ['&7Right-click a crate to open!'],
    glowing: true,
  }
}

export function createMilestone() {
  return {
    id: uid('ms'),
    openings: 10,
    rewards: [createReward('command')],
  }
}

export function createCrateState() {
  return {
    // General settings
    general: {
      id: 'my_crate',
      displayName: '&6&lVote Crate',
      description: ['&7Open with a Vote Key!'],
      permission: '',
      permissionRequired: false,
    },
    // Open cost
    cost: {
      type: 'none',
      amount: 0,
    },
    // Open cooldown
    cooldown: {
      enabled: false,
      amount: 0,
      unit: 'seconds',
    },
    // Keys
    keys: [createKey()],
    // Rewards
    rewards: [
      { ...createReward('item'), name: 'Diamond Sword', material: 'DIAMOND_SWORD', rarity: 'rare', weight: 15, displayName: '&bDiamond Sword', lore: ['&7Sharpness V'] },
      { ...createReward('item'), name: '64 Diamonds', material: 'DIAMOND', amount: 64, rarity: 'epic', weight: 8, displayName: '&b64 Diamonds', lore: ['&7Stack of diamonds'] },
      { ...createReward('command'), name: '$10,000', rarity: 'uncommon', weight: 30, displayName: '&a$10,000', commands: ['eco give %player% 10000'], lore: ['&7Money reward'] },
      { ...createReward('command'), name: 'VIP Rank', rarity: 'legendary', weight: 3, displayName: '&6VIP Rank', commands: ['lp user %player% parent set vip'], lore: ['&7Upgrade rank'], broadcast: true },
    ],
    // Animation
    animation: {
      enabled: true,
      type: 'spin',
      preventSkip: false,
    },
    // Preview GUI
    preview: {
      enabled: true,
      title: '&8Crate Preview: &6%crate_name%',
      rows: 6,
    },
    // Block effects
    effects: {
      particle: 'FLAME',
      particleData: '',
    },
    // Hologram
    hologram: {
      enabled: true,
      lines: ['&6&l%crate_name%', '&7Right-click to open!'],
      offsetY: 1.5,
    },
    // Pushback
    pushback: {
      enabled: true,
      strength: 1.5,
    },
    // Milestones
    milestones: [],
    // Mass open
    massOpen: {
      enabled: true,
      maxAmount: 10,
    },
  }
}

// ── Preset applier ───────────────────────────────────────────────────────────
export function applyPreset(presetId) {
  const base = createCrateState()

  if (presetId === 'blank') {
    base.rewards = []
    base.general.displayName = '&f&lNew Crate'
    base.general.id = 'new_crate'
    return base
  }

  if (presetId === 'voteCrate') {
    base.general.id = 'vote_crate'
    base.general.displayName = '&a&lVote Crate'
    base.general.description = ['&7Thank you for voting!']
    base.keys[0].name = 'Vote Key'
    base.keys[0].displayName = '&aVote Key'
    base.keys[0].lore = ['&7Received from voting']
    base.animation.type = 'spin'
    base.effects.particle = 'VILLAGER_HAPPY'
    base.rewards = [
      { ...createReward('item'), name: '16 Iron', material: 'IRON_INGOT', amount: 16, rarity: 'common', weight: 40, displayName: '&f16 Iron Ingots' },
      { ...createReward('item'), name: '8 Gold', material: 'GOLD_INGOT', amount: 8, rarity: 'common', weight: 35, displayName: '&68 Gold Ingots' },
      { ...createReward('item'), name: '4 Diamonds', material: 'DIAMOND', amount: 4, rarity: 'uncommon', weight: 20, displayName: '&b4 Diamonds' },
      { ...createReward('command'), name: '$5,000', rarity: 'uncommon', weight: 25, displayName: '&a$5,000', commands: ['eco give %player% 5000'] },
      { ...createReward('command'), name: '$25,000', rarity: 'rare', weight: 10, displayName: '&b$25,000', commands: ['eco give %player% 25000'] },
      { ...createReward('item'), name: 'Enchanted Book', material: 'ENCHANTED_BOOK', amount: 1, rarity: 'rare', weight: 12, displayName: '&dEnchanted Book' },
    ]
    return base
  }

  if (presetId === 'common') {
    base.general.id = 'common_crate'
    base.general.displayName = '&f&lCommon Crate'
    base.effects.particle = 'CLOUD'
    base.animation.type = 'spin'
    base.rewards = [
      { ...createReward('item'), name: '32 Iron', material: 'IRON_INGOT', amount: 32, rarity: 'common', weight: 50, displayName: '&f32 Iron Ingots' },
      { ...createReward('item'), name: '16 Gold', material: 'GOLD_INGOT', amount: 16, rarity: 'common', weight: 40, displayName: '&616 Gold Ingots' },
      { ...createReward('item'), name: 'Iron Set', material: 'IRON_CHESTPLATE', amount: 1, rarity: 'uncommon', weight: 20, displayName: '&fIron Chestplate' },
      { ...createReward('command'), name: '$2,000', rarity: 'common', weight: 45, displayName: '&a$2,000', commands: ['eco give %player% 2000'] },
    ]
    return base
  }

  if (presetId === 'rare') {
    base.general.id = 'rare_crate'
    base.general.displayName = '&9&lRare Crate'
    base.effects.particle = 'ENCHANTMENT_TABLE'
    base.animation.type = 'csgo'
    base.keys[0].displayName = '&9Rare Key'
    base.keys[0].name = 'Rare Key'
    base.rewards = [
      { ...createReward('item'), name: 'Diamond Sword', material: 'DIAMOND_SWORD', rarity: 'rare', weight: 20, displayName: '&bDiamond Sword', lore: ['&7Sharpness III'] },
      { ...createReward('item'), name: 'Diamond Set', material: 'DIAMOND_CHESTPLATE', rarity: 'rare', weight: 15, displayName: '&bDiamond Chestplate' },
      { ...createReward('item'), name: '32 Diamonds', material: 'DIAMOND', amount: 32, rarity: 'uncommon', weight: 25, displayName: '&b32 Diamonds' },
      { ...createReward('command'), name: '$50,000', rarity: 'epic', weight: 8, displayName: '&d$50,000', commands: ['eco give %player% 50000'] },
      { ...createReward('command'), name: 'Fly 1h', rarity: 'epic', weight: 5, displayName: '&dFly 1 Hour', commands: ['lp user %player% permission settemp essentials.fly true 1h'] },
      { ...createReward('command'), name: 'VIP Rank', rarity: 'legendary', weight: 2, displayName: '&6VIP Rank', commands: ['lp user %player% parent set vip'], broadcast: true },
    ]
    return base
  }

  if (presetId === 'legendary') {
    base.general.id = 'legendary_crate'
    base.general.displayName = '&6&lLegendary Crate'
    base.effects.particle = 'TOTEM'
    base.animation.type = 'csgo'
    base.keys[0].displayName = '&6Legendary Key'
    base.keys[0].name = 'Legendary Key'
    base.keys[0].material = 'NETHER_STAR'
    base.cost.type = 'vault'
    base.cost.amount = 5000
    base.rewards = [
      { ...createReward('item'), name: 'Netherite Sword', material: 'NETHERITE_SWORD', rarity: 'legendary', weight: 5, displayName: '&6Netherite Sword', lore: ['&7Sharpness V', '&7Fire Aspect II'] },
      { ...createReward('item'), name: 'Netherite Set', material: 'NETHERITE_CHESTPLATE', rarity: 'legendary', weight: 3, displayName: '&6Netherite Chestplate' },
      { ...createReward('item'), name: '64 Diamonds', material: 'DIAMOND', amount: 64, rarity: 'epic', weight: 12, displayName: '&b64 Diamonds' },
      { ...createReward('command'), name: '$100,000', rarity: 'epic', weight: 10, displayName: '&d$100,000', commands: ['eco give %player% 100000'] },
      { ...createReward('command'), name: 'MVP Rank', rarity: 'mythic', weight: 1, displayName: '&c&lMVP Rank', commands: ['lp user %player% parent set mvp'], broadcast: true },
      { ...createReward('command'), name: 'Spawner', rarity: 'legendary', weight: 4, displayName: '&6Zombie Spawner', commands: ['give %player% spawner{BlockEntityTag:{SpawnData:{entity:{id:"minecraft:zombie"}}}} 1'] },
    ]
    base.milestones = [
      { ...createMilestone(), openings: 25, rewards: [{ ...createReward('command'), name: 'Milestone 25', displayName: '&6Milestone: 25 Opens', commands: ['eco give %player% 50000', 'broadcast &6%player% &7hit 25 legendary opens!'] }] },
      { ...createMilestone(), openings: 50, rewards: [{ ...createReward('command'), name: 'Milestone 50', displayName: '&c&lMilestone: 50 Opens', commands: ['lp user %player% parent set elite', 'broadcast &c%player% &7hit 50 legendary opens!'] }] },
    ]
    return base
  }

  if (presetId === 'seasonal') {
    base.general.id = 'seasonal_crate'
    base.general.displayName = '&c&l❄ Winter Crate'
    base.general.description = ['&7Limited time winter rewards!']
    base.effects.particle = 'SNOWFLAKE'
    base.animation.type = 'wheel'
    base.keys[0].displayName = '&c❄ Winter Key'
    base.keys[0].name = 'Winter Key'
    base.keys[0].material = 'PACKED_ICE'
    base.cooldown.enabled = true
    base.cooldown.amount = 30
    base.cooldown.unit = 'minutes'
    base.rewards = [
      { ...createReward('item'), name: 'Snowballs', material: 'SNOWBALL', amount: 64, rarity: 'common', weight: 40, displayName: '&f64 Snowballs' },
      { ...createReward('item'), name: 'Ice Block', material: 'BLUE_ICE', amount: 16, rarity: 'uncommon', weight: 25, displayName: '&b16 Blue Ice' },
      { ...createReward('item'), name: 'Elytra', material: 'ELYTRA', rarity: 'legendary', weight: 2, displayName: '&6Elytra', broadcast: true },
      { ...createReward('command'), name: 'Winter Title', rarity: 'rare', weight: 10, displayName: '&bWinter Title', commands: ['title %player% title {"text":"❄ Winter Champion ❄","color":"aqua"}'] },
    ]
    return base
  }

  return base
}
