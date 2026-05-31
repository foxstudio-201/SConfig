export const ITEM_TYPES = [
  'SWORD', 'DAGGER', 'SPEAR', 'HAMMER', 'GAUNTLET', 'WHIP', 'STAFF', 'BOW', 'CROSSBOW',
  'MUSKET', 'LUTE', 'CATALYST', 'OFF_CATALYST', 'MAIN_CATALYST', 'ORNAMENT', 'ACCESSORY',
  'ARMOR', 'TOOL', 'CONSUMABLE', 'MISCELLANEOUS', 'SKIN', 'GEM_STONE', 'BLOCK',
  'GREATSWORD', 'LONG_SWORD', 'KATANA', 'THRUSTING_SWORD', 'AXE', 'GREATAXE', 'HALBERD',
  'LANCE', 'GREATHAMMER', 'GREATSTAFF', 'STAVE', 'TOME', 'TALISMAN', 'WAND', 'GREATBOW',
  'SHIELD', 'MATERIAL', 'RING', 'AMULET', 'BRACELET', 'GLOVES', 'ARTIFACT',
]

export const TYPE_TO_FILE = {
  SWORD: 'sword', DAGGER: 'dagger', SPEAR: 'spear', HAMMER: 'hammer', GAUNTLET: 'gauntlet',
  WHIP: 'whip', STAFF: 'staff', BOW: 'bow', CROSSBOW: 'crossbow', MUSKET: 'musket',
  LUTE: 'lute', CATALYST: 'catalyst', OFF_CATALYST: 'off_catalyst', MAIN_CATALYST: 'main_catalyst',
  ORNAMENT: 'ornament', ACCESSORY: 'accessory', ARMOR: 'armor', TOOL: 'tool',
  CONSUMABLE: 'consumable', MISCELLANEOUS: 'miscellaneous', SKIN: 'skin', GEM_STONE: 'gem_stone',
  BLOCK: 'block', GREATSWORD: 'sword', LONG_SWORD: 'sword', KATANA: 'sword', THRUSTING_SWORD: 'dagger',
  AXE: 'sword', GREATAXE: 'sword', HALBERD: 'sword', LANCE: 'spear', GREATHAMMER: 'hammer',
  GREATSTAFF: 'hammer', STAVE: 'hammer', TOME: 'catalyst', TALISMAN: 'catalyst', WAND: 'staff',
  GREATBOW: 'bow', SHIELD: 'catalyst', MATERIAL: 'miscellaneous', RING: 'accessory',
  AMULET: 'accessory', BRACELET: 'accessory', GLOVES: 'accessory', ARTIFACT: 'accessory',
}

export const TIERS = [
  '', 'COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE', 'EPIC', 'LEGENDARY', 'MYTHICAL', 'ARTIFACT',
]

export const ABILITY_MODES = [
  'ATTACK', 'RIGHT_CLICK', 'LEFT_CLICK', 'SHIFT_RIGHT_CLICK', 'SHIFT_LEFT_CLICK',
  'KILL_ENTITY', 'DEATH', 'TIMER', 'DAMAGED', 'DAMAGED_BY_ENTITY', 'API',
]

export const ELEMENTS = [
  'fire', 'water', 'earth', 'wind', 'thunder', 'ice', 'darkness', 'lightness',
]

export const PARTICLE_TYPES = [
  'OFFSET', 'FIREFLIES', 'VORTEX', 'GALAXY', 'DOUBLE_RINGS', 'HELIX', 'AURA',
]

export const COMMON_ABILITIES = [
  'FIREBOLT', 'ICE_CRYSTAL', 'CURSED_BEAM', 'HOLY_MISSILE', 'GRAND_HEAL', 'FROZEN_AURA',
  'LIFE_ENDER', 'VAMPIRISM', 'MAGICAL_SHIELD', 'BLINK', 'CORRUPT', 'SMITE', 'SHOCK',
  'SHOCKWAVE', 'BURNING', 'FREEZE', 'POISON', 'WITHER', 'REGENERATE', 'HEAL',
]

export const MATERIALS = [
  'WOODEN_SWORD', 'STONE_SWORD', 'IRON_SWORD', 'GOLDEN_SWORD', 'DIAMOND_SWORD', 'NETHERITE_SWORD',
  'WOODEN_AXE', 'STONE_AXE', 'IRON_AXE', 'GOLDEN_AXE', 'DIAMOND_AXE', 'NETHERITE_AXE',
  'WOODEN_PICKAXE', 'STONE_PICKAXE', 'IRON_PICKAXE', 'GOLDEN_PICKAXE', 'DIAMOND_PICKAXE', 'NETHERITE_PICKAXE',
  'WOODEN_SHOVEL', 'STONE_SHOVEL', 'IRON_SHOVEL', 'GOLDEN_SHOVEL', 'DIAMOND_SHOVEL', 'NETHERITE_SHOVEL',
  'WOODEN_HOE', 'STONE_HOE', 'IRON_HOE', 'GOLDEN_HOE', 'DIAMOND_HOE', 'NETHERITE_HOE',
  'LEATHER_HELMET', 'LEATHER_CHESTPLATE', 'LEATHER_LEGGINGS', 'LEATHER_BOOTS',
  'CHAINMAIL_HELMET', 'CHAINMAIL_CHESTPLATE', 'CHAINMAIL_LEGGINGS', 'CHAINMAIL_BOOTS',
  'IRON_HELMET', 'IRON_CHESTPLATE', 'IRON_LEGGINGS', 'IRON_BOOTS',
  'GOLDEN_HELMET', 'GOLDEN_CHESTPLATE', 'GOLDEN_LEGGINGS', 'GOLDEN_BOOTS',
  'DIAMOND_HELMET', 'DIAMOND_CHESTPLATE', 'DIAMOND_LEGGINGS', 'DIAMOND_BOOTS',
  'NETHERITE_HELMET', 'NETHERITE_CHESTPLATE', 'NETHERITE_LEGGINGS', 'NETHERITE_BOOTS',
  'BOW', 'CROSSBOW', 'TRIDENT', 'SHIELD', 'TOTEM_OF_UNDYING', 'ELYTRA',
  'BLAZE_ROD', 'STICK', 'PAPER', 'BOOK', 'EMERALD', 'DIAMOND', 'GOLD_INGOT', 'IRON_INGOT',
  'LEAD', 'NAME_TAG', 'PRISMARINE_SHARD', 'PRISMARINE_CRYSTALS', 'IRON_HORSE_ARMOR',
  'APPLE', 'GOLDEN_APPLE', 'ENCHANTED_GOLDEN_APPLE', 'POTION', 'SPLASH_POTION', 'LINGERING_POTION',
  'PLAYER_HEAD', 'SKULL_BANNER_PATTERN', 'FIREWORK_ROCKET', 'CARROT_ON_A_STICK',
  'WARPED_FUNGUS_ON_A_STICK', 'MUSIC_DISC_CAT', 'MUSIC_DISC_MALL',
]

export const NUMERIC_STATS = [
  { key: 'attack-damage', label: 'Attack Damage', cat: 'combat' },
  { key: 'attack-speed', label: 'Attack Speed', cat: 'combat' },
  { key: 'critical-strike-chance', label: 'Critical Strike Chance', cat: 'combat' },
  { key: 'critical-strike-power', label: 'Critical Strike Power', cat: 'combat' },
  { key: 'skill-critical-strike-chance', label: 'Skill Crit Chance', cat: 'combat' },
  { key: 'skill-critical-strike-power', label: 'Skill Crit Power', cat: 'combat' },
  { key: 'weapon-damage', label: 'Weapon Damage', cat: 'combat' },
  { key: 'skill-damage', label: 'Skill Damage', cat: 'combat' },
  { key: 'projectile-damage', label: 'Projectile Damage', cat: 'combat' },
  { key: 'magic-damage', label: 'Magic Damage', cat: 'combat' },
  { key: 'physical-damage', label: 'Physical Damage', cat: 'combat' },
  { key: 'pve-damage', label: 'PvE Damage', cat: 'combat' },
  { key: 'pvp-damage', label: 'PvP Damage', cat: 'combat' },
  { key: 'undead-damage', label: 'Undead Damage', cat: 'combat' },
  { key: 'lifesteal', label: 'Lifesteal', cat: 'combat' },
  { key: 'spell-vampirism', label: 'Spell Vampirism', cat: 'combat' },
  { key: 'range', label: 'Range', cat: 'combat' },
  { key: 'blunt-power', label: 'Blunt Power', cat: 'combat' },
  { key: 'blunt-rating', label: 'Blunt Rating', cat: 'combat' },
  { key: 'knockback', label: 'Knockback (Musket)', cat: 'combat' },
  { key: 'recoil', label: 'Recoil (Musket)', cat: 'combat' },
  { key: 'arrow-velocity', label: 'Arrow Velocity', cat: 'combat' },
  { key: 'mana-cost', label: 'Mana Cost', cat: 'combat' },
  { key: 'stamina-cost', label: 'Stamina Cost', cat: 'combat' },
  { key: 'note-weight', label: 'Note Weight (Lute)', cat: 'combat' },
  { key: 'defense', label: 'Defense', cat: 'defense' },
  { key: 'damage-reduction', label: 'Damage Reduction', cat: 'defense' },
  { key: 'fall-damage-reduction', label: 'Fall Damage Reduction', cat: 'defense' },
  { key: 'projectile-damage-reduction', label: 'Projectile Damage Reduction', cat: 'defense' },
  { key: 'physical-damage-reduction', label: 'Physical Damage Reduction', cat: 'defense' },
  { key: 'fire-damage-reduction', label: 'Fire Damage Reduction', cat: 'defense' },
  { key: 'magic-damage-reduction', label: 'Magic Damage Reduction', cat: 'defense' },
  { key: 'pve-damage-reduction', label: 'PvE Damage Reduction', cat: 'defense' },
  { key: 'pvp-damage-reduction', label: 'PvP Damage Reduction', cat: 'defense' },
  { key: 'block-power', label: 'Block Power', cat: 'defense' },
  { key: 'block-rating', label: 'Block Rating', cat: 'defense' },
  { key: 'block-cooldown-reduction', label: 'Block Cooldown Reduction', cat: 'defense' },
  { key: 'dodge-rating', label: 'Dodge Rating', cat: 'defense' },
  { key: 'dodge-cooldown-reduction', label: 'Dodge Cooldown Reduction', cat: 'defense' },
  { key: 'parry-rating', label: 'Parry Rating', cat: 'defense' },
  { key: 'parry-cooldown-reduction', label: 'Parry Cooldown Reduction', cat: 'defense' },
  { key: 'cooldown-reduction', label: 'Cooldown Reduction', cat: 'defense' },
  { key: 'armor', label: 'Armor', cat: 'attributes' },
  { key: 'armor-toughness', label: 'Armor Toughness', cat: 'attributes' },
  { key: 'max-health', label: 'Max Health', cat: 'attributes' },
  { key: 'knockback-resistance', label: 'Knockback Resistance', cat: 'attributes' },
  { key: 'movement-speed', label: 'Movement Speed', cat: 'attributes' },
  { key: 'max-mana', label: 'Max Mana', cat: 'resources' },
  { key: 'mana-regeneration', label: 'Mana Regeneration', cat: 'resources' },
  { key: 'max-stamina', label: 'Max Stamina', cat: 'resources' },
  { key: 'stamina-regeneration', label: 'Stamina Regeneration', cat: 'resources' },
  { key: 'required-level', label: 'Required Level', cat: 'requirements' },
  { key: 'equip-priority', label: 'Equip Priority', cat: 'requirements' },
  { key: 'max-durability', label: 'Max Durability', cat: 'durability' },
  { key: 'custom-durability', label: 'Custom Durability', cat: 'durability' },
  { key: 'item-damage', label: 'Item Damage (Durability)', cat: 'durability' },
  { key: 'max-item-damage', label: 'Max Item Damage', cat: 'durability' },
  { key: 'custom-model-data', label: 'Custom Model Data', cat: 'display' },
  { key: 'restore-health', label: 'Restore Health', cat: 'consumable' },
  { key: 'restore-food', label: 'Restore Food', cat: 'consumable' },
  { key: 'restore-saturation', label: 'Restore Saturation', cat: 'consumable' },
  { key: 'restore-mana', label: 'Restore Mana', cat: 'consumable' },
  { key: 'restore-stamina', label: 'Restore Stamina', cat: 'consumable' },
  { key: 'item-cooldown', label: 'Item Cooldown', cat: 'consumable' },
  { key: 'consume-seconds', label: 'Consume Seconds', cat: 'consumable' },
  { key: 'success-rate', label: 'Success Rate', cat: 'consumable' },
  { key: 'soulbinding-chance', label: 'Soulbinding Chance', cat: 'consumable' },
  { key: 'soulbound-break-chance', label: 'Soulbound Break Chance', cat: 'consumable' },
  { key: 'soulbound-level', label: 'Soulbound Level', cat: 'consumable' },
  { key: 'pickaxe-power', label: 'Pickaxe Power', cat: 'tool' },
  { key: 'repair', label: 'Repair Power', cat: 'tool' },
  { key: 'repair-percent', label: 'Repair Percent', cat: 'tool' },
  { key: 'block-id', label: 'Block ID', cat: 'block' },
  { key: 'required-power', label: 'Required Power', cat: 'block' },
  { key: 'min-xp', label: 'Min XP', cat: 'block' },
  { key: 'max-xp', label: 'Max XP', cat: 'block' },
  { key: 'max-absorption', label: 'Max Absorption', cat: 'attributes' },
  { key: 'block-break-speed', label: 'Block Break Speed', cat: 'attributes' },
  { key: 'block-interaction-range', label: 'Block Interaction Range', cat: 'attributes' },
  { key: 'entity-interaction-range', label: 'Entity Interaction Range', cat: 'attributes' },
  { key: 'fall-damage-multiplier', label: 'Fall Damage Multiplier', cat: 'attributes' },
  { key: 'gravity', label: 'Gravity', cat: 'attributes' },
  { key: 'jump-strength', label: 'Jump Strength', cat: 'attributes' },
  { key: 'safe-fall-distance', label: 'Safe Fall Distance', cat: 'attributes' },
  { key: 'scale', label: 'Scale', cat: 'attributes' },
  { key: 'step-height', label: 'Step Height', cat: 'attributes' },
  { key: 'burning-time', label: 'Burning Time', cat: 'attributes' },
  { key: 'explosion-knockback-resistance', label: 'Explosion Knockback Resistance', cat: 'attributes' },
  { key: 'mining-efficiency', label: 'Mining Efficiency', cat: 'attributes' },
  { key: 'movement-efficiency', label: 'Movement Efficiency', cat: 'attributes' },
  { key: 'oxygen-bonus', label: 'Oxygen Bonus', cat: 'attributes' },
  { key: 'sneaking-speed', label: 'Sneaking Speed', cat: 'attributes' },
  { key: 'submerged-mining-speed', label: 'Submerged Mining Speed', cat: 'attributes' },
  { key: 'sweeping-damage-ratio', label: 'Sweeping Damage Ratio', cat: 'attributes' },
  { key: 'water-movement-efficiency', label: 'Water Movement Efficiency', cat: 'attributes' },
  { key: 'death-downgrade-chance', label: 'Death Downgrade Chance', cat: 'upgrade' },
]

export const BOOLEAN_STATS = [
  { key: 'unbreakable', label: 'Unbreakable' },
  { key: 'unstackable', label: 'Unstackable' },
  { key: 'two-handed', label: 'Two Handed' },
  { key: 'handworn', label: 'Handworn' },
  { key: 'autosmelt', label: 'Autosmelt' },
  { key: 'bouncing-crack', label: 'Bouncing Crack' },
  { key: 'inedible', label: 'Inedible' },
  { key: 'hide-enchants', label: 'Hide Enchants' },
  { key: 'hide-tooltip', label: 'Hide Tooltip' },
  { key: 'hide-durability-bar', label: 'Hide Durability Bar' },
  { key: 'hide-dye', label: 'Hide Dye' },
  { key: 'hide-armor-trim', label: 'Hide Armor Trim' },
  { key: 'hide-potion-effects', label: 'Hide Potion Effects' },
  { key: 'disable-interaction', label: 'Disable Interaction' },
  { key: 'disable-crafting', label: 'Disable Crafting' },
  { key: 'disable-smelting', label: 'Disable Smelting' },
  { key: 'disable-smithing', label: 'Disable Smithing' },
  { key: 'disable-enchanting', label: 'Disable Enchanting' },
  { key: 'disable-repairing', label: 'Disable Repairing' },
  { key: 'disable-drop', label: 'Disable Drop' },
  { key: 'disable-arrow-shooting', label: 'Disable Arrow Shooting' },
  { key: 'disable-arrow-consumption', label: 'Disable Arrow Consumption' },
  { key: 'disable-attack-passive', label: 'Disable On-Hit Effect' },
  { key: 'disable-right-click-consume', label: 'Infinite Consume' },
  { key: 'disable-death-drop', label: 'Disable Death Drop' },
  { key: 'break-downgrade', label: 'Downgrade When Broken' },
  { key: 'death-downgrade', label: 'Downgrade on Death' },
  { key: 'can-always-eat', label: 'Can Always Eat' },
  { key: 'vanilla-eating-animation', label: 'Vanilla Eating Animation' },
  { key: 'require-power-to-break', label: 'Require Power To Break' },
  { key: 'will-break', label: 'Lost When Broken' },
]

export const STAT_CATEGORIES = [
  { id: 'combat', label: 'Combat' },
  { id: 'defense', label: 'Defense' },
  { id: 'attributes', label: 'Attributes' },
  { id: 'resources', label: 'Resources' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'durability', label: 'Durability' },
  { id: 'display', label: 'Display' },
  { id: 'consumable', label: 'Consumable' },
  { id: 'tool', label: 'Tool' },
  { id: 'block', label: 'Block' },
  { id: 'upgrade', label: 'Upgrade' },
]

export const ENCHANTMENTS = [
  'sharpness', 'smite', 'bane_of_arthropods', 'efficiency', 'unbreaking', 'fortune',
  'silk_touch', 'power', 'punch', 'flame', 'infinity', 'loyalty', 'impaling', 'riptide',
  'channeling', 'multishot', 'quick_charge', 'piercing', 'mending', 'vanishing_curse',
  'binding_curse', 'protection', 'fire_protection', 'feather_falling', 'blast_protection',
  'projectile_protection', 'respiration', 'aqua_affinity', 'thorns', 'depth_strider',
  'frost_walker', 'soul_speed', 'swift_sneak', 'luck_of_the_sea', 'lure', 'looting',
  'sweeping_edge', 'density', 'breach', 'wind_burst',
]

export const POTION_EFFECTS = [
  'SPEED', 'SLOW', 'FAST_DIGGING', 'SLOW_DIGGING', 'INCREASE_DAMAGE', 'HEAL', 'HARM',
  'JUMP', 'CONFUSION', 'REGENERATION', 'DAMAGE_RESISTANCE', 'FIRE_RESISTANCE', 'WATER_BREATHING',
  'INVISIBILITY', 'BLINDNESS', 'NIGHT_VISION', 'HUNGER', 'WEAKNESS', 'POISON', 'WITHER',
  'HEALTH_BOOST', 'ABSORPTION', 'SATURATION', 'GLOWING', 'LEVITATION', 'LUCK', 'UNLUCK',
  'SLOW_FALLING', 'CONDUIT_POWER', 'DOLPHINS_GRACE', 'BAD_OMEN', 'HERO_OF_THE_VILLAGE',
  'DARKNESS', 'NAUSEA',
]

export function emptyScaled() {
  return { base: '', scale: '', spread: '', maxSpread: '' }
}

export function emptyAbility(id = 'ability1') {
  return { id, type: 'FIREBOLT', mode: 'RIGHT_CLICK', cooldown: '', mana: '', params: [] }
}

export function emptyElement(name = 'fire') {
  return { element: name, damage: emptyScaled(), defense: emptyScaled() }
}

export function emptyModifier(id = 'modifier1') {
  return { id, chance: '', weight: '', prefix: '', suffix: '', stats: [] }
}

export function emptyCommand(id = '1') {
  return { id, command: '', cooldown: '', delay: '' }
}

let _itemSeq = 0

export function createItemState(overrides = {}) {
  _itemSeq += 1
  return {
    _id: `${Date.now()}_${_itemSeq}`,
    ...DEFAULT_ITEM_STATE,
    numericStats: {},
    booleanStats: {},
    enchants: [],
    gemSockets: [],
    permEffects: [],
    consumableEffects: [],
    elements: [],
    abilities: [],
    modifiers: [],
    commands: [],
    requiredClass: [],
    permission: [],
    grantedPermissions: [],
    lore: ['&7Custom item created with SConfig'],
    ...overrides,
  }
}

export const DEFAULT_ITEM_STATE = {
  itemId: 'MY_ITEM',
  itemType: 'SWORD',
  material: 'IRON_SWORD',
  name: '&fMy Item',
  lore: ['&7Custom item created with SConfig'],
  tier: '',
  revisionId: '',
  itemModel: '',
  skullTexture: '',
  tooltip: '',
  loreFormat: '',
  dyeColor: '',
  trimMaterial: '',
  trimPattern: '',
  maxStackSize: '',
  displayedType: '',
  cooldownReference: '',
  repairType: '',
  luteAttackEffect: '',
  luteAttackSound: '',
  itemSet: '',
  requiredClass: [],
  permission: [],
  grantedPermissions: [],
  numericStats: {},
  booleanStats: {},
  enchants: [],
  gemSockets: [],
  permEffects: [],
  consumableEffects: [],
  elements: [],
  abilities: [],
  modifiers: [],
  commands: [],
  itemParticles: null,
  arrowParticles: null,
  upgrade: null,
  craftingYaml: '',
  extraBaseYaml: '',
  templateModifiersYaml: '',
}

export const ITEM_PRESETS = [
  {
    name: 'Iron Sword',
    patch: {
      itemId: 'IRON_SWORD_ITEM', itemType: 'SWORD', material: 'IRON_SWORD', tier: 'COMMON',
      name: '&fIron Sword',
      lore: ['&7A reliable starter weapon.'],
      numericStats: { 'attack-damage': { base: '6', scale: '1', spread: '0.1', maxSpread: '0.3' }, 'attack-speed': { base: '1.6', scale: '', spread: '', maxSpread: '' } },
      booleanStats: {}, enchants: [], gemSockets: [], permEffects: [], consumableEffects: [],
      elements: [], abilities: [], modifiers: [], commands: [],
    },
  },
  {
    name: 'Epic Bow',
    patch: {
      itemId: 'EPIC_BOW', itemType: 'BOW', material: 'BOW', tier: 'EPIC',
      name: '&5&lEpic Bow',
      lore: ['&7Fires with mystical force.'],
      numericStats: { 'arrow-velocity': { base: '1.5', scale: '', spread: '', maxSpread: '' }, 'critical-strike-chance': { base: '25', scale: '', spread: '', maxSpread: '' } },
      booleanStats: { unbreakable: true }, enchants: [{ name: 'power', base: '4', scale: '', level: '4' }],
      gemSockets: ['Blue'], permEffects: [], consumableEffects: [], elements: [], abilities: [], modifiers: [], commands: [],
    },
  },
  {
    name: 'Health Potion',
    patch: {
      itemId: 'HEALTH_POTION', itemType: 'CONSUMABLE', material: 'POTION', tier: 'UNCOMMON',
      name: '&cHealth Potion',
      lore: ['&7Restores health instantly.'],
      numericStats: { 'restore-health': { base: '8', scale: '', spread: '', maxSpread: '' }, 'item-cooldown': { base: '5', scale: '', spread: '', maxSpread: '' } },
      booleanStats: {}, enchants: [], gemSockets: [], permEffects: [], consumableEffects: [],
      elements: [], abilities: [], modifiers: [], commands: [],
    },
  },
]
