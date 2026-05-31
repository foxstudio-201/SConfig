let _uid = 0
export function uid() {
  _uid += 1
  return `mc${Date.now()}_${_uid}`
}

export function emptyScaled() {
  return { base: '', perLevel: '', min: '', max: '', formula: '', useFormula: false }
}

export const PROJECT_MODES = [
  { value: 'class', label: 'Classes' },
  { value: 'profession', label: 'Professions' },
]

export const TRIGGERS = [
  { value: '', label: 'Active (no trigger)' },
  { value: 'ATTACK', label: 'ATTACK' },
  { value: 'DAMAGED', label: 'DAMAGED' },
  { value: 'TIMER', label: 'TIMER' },
  { value: 'KILL', label: 'KILL' },
  { value: 'DEATH', label: 'DEATH' },
  { value: 'CAST', label: 'CAST' },
  { value: 'SHIFT', label: 'SHIFT' },
  { value: 'JUMP', label: 'JUMP' },
  { value: 'EQUIP', label: 'EQUIP' },
  { value: 'UNEQUIP', label: 'UNEQUIP' },
]

export const PARTICLES = [
  'SPELL', 'SPELL_INSTANT', 'SPELL_WITCH', 'REDSTONE', 'DUST', 'FLAME', 'SOUL',
  'ENCHANT', 'CRIT', 'CLOUD', 'HEART', 'PORTAL', 'END_ROD', 'FIREWORK', 'BLOCK',
  'BLOCK_BREAK', 'FALLING_DUST', 'DUST_PILLAR',
]

export const STAT_CATEGORIES = [
  {
    id: 'vanilla',
    label: 'Vanilla',
    stats: [
      { key: 'max-health', label: 'Max Health' },
      { key: 'attack-damage', label: 'Attack Damage' },
      { key: 'attack-speed', label: 'Attack Speed' },
      { key: 'movement-speed', label: 'Movement Speed' },
      { key: 'knockback-resistance', label: 'Knockback Resistance' },
      { key: 'armor', label: 'Armor' },
      { key: 'armor-toughness', label: 'Armor Toughness' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    stats: [
      { key: 'max-mana', label: 'Max Mana' },
      { key: 'max-stamina', label: 'Max Stamina' },
      { key: 'max-stellium', label: 'Max Stellium' },
      { key: 'health-regeneration', label: 'Health Regen' },
      { key: 'mana-regeneration', label: 'Mana Regen' },
      { key: 'stamina-regeneration', label: 'Stamina Regen' },
      { key: 'stellium-regeneration', label: 'Stellium Regen' },
      { key: 'max-health-regeneration', label: 'Max HP Regen %' },
      { key: 'max-mana-regeneration', label: 'Max Mana Regen %' },
      { key: 'max-stamina-regeneration', label: 'Max Stamina Regen %' },
    ],
  },
  {
    id: 'combat',
    label: 'Combat',
    stats: [
      { key: 'critical-strike-chance', label: 'Crit Chance' },
      { key: 'critical-strike-power', label: 'Crit Power' },
      { key: 'skill-critical-strike-chance', label: 'Skill Crit Chance' },
      { key: 'skill-critical-strike-power', label: 'Skill Crit Power' },
      { key: 'weapon-damage', label: 'Weapon Damage' },
      { key: 'magic-damage', label: 'Magic Damage' },
      { key: 'physical-damage', label: 'Physical Damage' },
      { key: 'projectile-damage', label: 'Projectile Damage' },
      { key: 'skill-damage', label: 'Skill Damage' },
      { key: 'pvp-damage', label: 'PvP Damage' },
      { key: 'pve-damage', label: 'PvE Damage' },
    ],
  },
  {
    id: 'utility',
    label: 'Utility',
    stats: [
      { key: 'cooldown-reduction', label: 'Cooldown Reduction' },
      { key: 'additional-experience', label: 'Additional XP' },
      { key: 'speed-malus-reduction', label: 'Speed Malus Reduction' },
      { key: 'luck', label: 'Luck' },
    ],
  },
]

export const ALL_STATS = STAT_CATEGORIES.flatMap(c => c.stats.map(s => ({ ...s, category: c.id })))

export const BUILTIN_SKILLS = [
  { id: 'FIRE_STORM', label: 'Fire Storm', mods: ['damage', 'ignite'], passive: false },
  { id: 'FIREBALL', label: 'Fireball', mods: ['damage', 'ignite', 'ratio'], passive: false },
  { id: 'FIREBOLT', label: 'Firebolt', mods: ['damage', 'ignite'], passive: false },
  { id: 'BLINK', label: 'Blink', mods: ['range'], passive: false },
  { id: 'WARP', label: 'Warp', mods: ['range'], passive: false },
  { id: 'HEAL', label: 'Heal', mods: ['heal'], passive: false },
  { id: 'GRAND_HEAL', label: 'Grand Heal', mods: ['heal', 'radius'], passive: false },
  { id: 'MINOR_HEALINGS', label: 'Minor Healings', mods: ['heal'], passive: false },
  { id: 'GREATER_HEALINGS', label: 'Greater Healings', mods: ['heal'], passive: false },
  { id: 'POWER_MARK', label: 'Power Mark', mods: ['stun', 'ratio', 'duration'], passive: false },
  { id: 'ICE_SPIKES', label: 'Ice Spikes', mods: ['damage', 'slow'], passive: false },
  { id: 'LIGHTNING_BEAM', label: 'Lightning Beam', mods: ['radius', 'damage'], passive: false },
  { id: 'MAGICAL_SHIELD', label: 'Magical Shield', mods: ['power', 'radius', 'duration'], passive: false },
  { id: 'CIRCULAR_SLASH', label: 'Circular Slash', mods: ['damage', 'radius', 'knockback'], passive: false },
  { id: 'SHOCKWAVE', label: 'Shockwave', mods: ['knock-up', 'length'], passive: false },
  { id: 'EVADE', label: 'Evade', mods: ['duration'], passive: false },
  { id: 'SWIFTNESS', label: 'Swiftness', mods: ['duration', 'amplifier'], passive: false },
  { id: 'MAGICAL_PATH', label: 'Magical Path', mods: ['duration'], passive: false },
  { id: 'TARGETED_FIREBALL', label: 'Targeted Fireball', mods: ['damage', 'ignite'], passive: false },
  { id: 'STUN', label: 'Stun', mods: ['duration'], passive: false },
  { id: 'POISON', label: 'Poison', mods: ['duration', 'amplifier'], passive: false },
  { id: 'SMITE', label: 'Smite', mods: ['damage'], passive: false },
  { id: 'BACKSTAB', label: 'Backstab', mods: ['extra'], passive: true },
  { id: 'VAMPIRISM', label: 'Vampirism', mods: ['drain'], passive: true },
  { id: 'FIRE_BERSERKER', label: 'Fire Berserker', mods: ['extra'], passive: true },
  { id: 'NEPTUNES_GIFT', label: "Neptune's Gift", mods: ['extra'], passive: true },
  { id: 'SNEAKY_PICKY', label: 'Sneaky Picky', mods: ['extra'], passive: true },
  { id: 'AMBERS', label: 'Ambers', mods: ['percent'], passive: true },
]

export const EXP_SOURCE_PRESETS = [
  { label: 'Mine block', value: "mineblock{type=DIAMOND_ORE;amount=5-10}" },
  { label: 'Mine crop', value: "mineblock{type=WHEAT;amount=1-3;crop=true;player-placed=false}" },
  { label: 'Kill mob', value: 'killmob{amount=5-15}' },
  { label: 'Fish item', value: 'fishitem{amount=3-8}' },
  { label: 'Smelt item', value: 'smeltitem{type=IRON_INGOT;amount=2-5}' },
  { label: 'Craft item', value: 'craftitem{type=DIAMOND_SWORD;amount=10-20}' },
  { label: 'Enchant item', value: 'enchantitem{amount=5-12}' },
  { label: 'Brew potion', value: 'brewpotion{amount=8-15}' },
]

export function createSkillEntry(skillId = 'FIRE_STORM') {
  const def = BUILTIN_SKILLS.find(s => s.id === skillId)
  return {
    _id: uid(),
    skillId,
    level: 1,
    maxLevel: 30,
    unlockedByDefault: true,
    needsBound: false,
    trigger: def?.passive ? 'ATTACK' : '',
    timer: '',
    modifiers: (def?.mods || ['damage']).map(key => ({ key, ...emptyScaled() })),
  }
}

export function createSkillSlot(slotId = '1') {
  return {
    _id: uid(),
    slotId,
    name: `&aSkill Slot ${slotId}`,
    lore: ['&7Drag a skill here to bind it.'],
    material: 'GRAY_DYE',
    customModelData: '',
    formula: '',
    unlockedByDefault: true,
    canManuallyBind: true,
    triggers: [],
  }
}

export function createClassState(overrides = {}) {
  return {
    _id: uid(),
    fileId: 'mage',
    display: {
      name: 'Mage',
      lore: ['&7Master of arcane magic.'],
      attributeLore: [],
      itemMaterial: 'BLAZE_POWDER',
      itemCmd: '',
      itemModel: '',
      skullTexture: '',
    },
    maxLevel: 100,
    expCurve: 'levels',
    expTable: 'class_exp_table',
    options: {
      default: false,
      display: true,
      offCombatHealthRegen: false,
      offCombatManaRegen: false,
      offCombatStaminaRegen: false,
      offCombatStelliumRegen: false,
      needsPermission: false,
    },
    stats: {},
    mana: {
      char: '♦',
      icon: '&9♦',
      colorFull: 'DARK_BLUE',
      colorHalf: 'BLUE',
      colorEmpty: 'WHITE',
      name: 'Mana',
    },
    subclasses: [],
    skillTrees: ['general'],
    skillSlots: [],
    skills: [],
    castParticle: { particle: 'SPELL_INSTANT', colorR: '', colorG: '', colorB: '', material: '' },
    resourceYaml: '',
    scriptsYaml: '',
    extraYaml: '',
    ...overrides,
  }
}

export function createProfessionState(overrides = {}) {
  return {
    _id: uid(),
    fileId: 'farming',
    name: 'Farming',
    maxLevel: 10,
    expCurve: 'levels',
    expTable: 'example_exp_table',
    classExp: { base: 10, perLevel: 2 },
    expSources: [],
    extraYaml: '',
    ...overrides,
  }
}

export const CLASS_PRESETS = [
  {
    id: 'mage',
    label: 'Mage',
    state: {
      fileId: 'mage',
      display: {
        name: 'Mage',
        lore: ['&7Master of arcane magic and ranged spells.'],
        attributeLore: ['&a+ &7Max Mana', '&a+ &7Mana Regeneration', '&c- &7Max Health'],
        itemMaterial: 'BLAZE_POWDER',
        itemCmd: '10',
      },
      stats: {
        'max-health': { base: '18', perLevel: '0', min: '', max: '', formula: '', useFormula: false },
        'max-mana': { base: '27', perLevel: '1.2', min: '', max: '', formula: '', useFormula: false },
        'mana-regeneration': { base: '0.2', perLevel: '0.04', min: '', max: '', formula: '', useFormula: false },
        'health-regeneration': { base: '0.13', perLevel: '0', min: '', max: '', formula: '', useFormula: false },
      },
      mana: { char: '♦', icon: '&9♦', colorFull: 'DARK_BLUE', colorHalf: 'BLUE', colorEmpty: 'WHITE', name: 'Mana' },
      skillTrees: ['general', 'mage-arcane-mage'],
      skills: [
        { skillId: 'FIRE_STORM', level: 1, maxLevel: 30, unlockedByDefault: true, modifiers: [{ key: 'damage', base: '5', perLevel: '3' }, { key: 'cooldown', base: '5', perLevel: '-0.1', min: '1', max: '5' }] },
        { skillId: 'BLINK', level: 5, maxLevel: 30, unlockedByDefault: true, modifiers: [{ key: 'range', base: '8', perLevel: '0.5' }] },
        { skillId: 'HEAL', level: 3, maxLevel: 30, unlockedByDefault: true, modifiers: [{ key: 'heal', base: '4', perLevel: '2' }] },
        { skillId: 'POWER_MARK', level: 8, maxLevel: 30, unlockedByDefault: true, needsBound: true, modifiers: [] },
      ],
    },
  },
  {
    id: 'warrior',
    label: 'Warrior',
    state: {
      fileId: 'warrior',
      display: {
        name: 'Warrior',
        lore: ['&7Frontline fighter with high durability.'],
        attributeLore: ['&a+ &7Max Health', '&a+ &7Knockback Resistance'],
        itemMaterial: 'IRON_SWORD',
      },
      stats: {
        'max-health': { base: '24', perLevel: '0.5', min: '', max: '80', formula: '', useFormula: false },
        'attack-damage': { base: '2', perLevel: '0.1', min: '', max: '', formula: '', useFormula: false },
        'knockback-resistance': { base: '0.2', perLevel: '0.01', min: '', max: '', formula: '', useFormula: false },
      },
      mana: { char: '♦', icon: '&c♦', colorFull: 'DARK_RED', colorHalf: 'RED', colorEmpty: 'WHITE', name: 'Rage' },
      skillTrees: ['general'],
      skills: [
        { skillId: 'CIRCULAR_SLASH', level: 1, maxLevel: 30, unlockedByDefault: true, modifiers: [{ key: 'damage', base: '6', perLevel: '2' }, { key: 'radius', base: '3', perLevel: '0.1' }] },
        { skillId: 'HEAVY_CHARGE', level: 4, maxLevel: 30, unlockedByDefault: true, modifiers: [{ key: 'damage', base: '8', perLevel: '3' }] },
        { skillId: 'VAMPIRISM', level: 10, maxLevel: 30, trigger: 'ATTACK', unlockedByDefault: true, needsBound: false, modifiers: [{ key: 'drain', base: '10', perLevel: '1' }] },
      ],
    },
  },
  {
    id: 'rogue',
    label: 'Rogue',
    state: {
      fileId: 'rogue',
      display: {
        name: 'Rogue',
        lore: ['&7Stealthy assassin with burst damage.'],
        attributeLore: ['&a+ &7Movement Speed', '&a+ &7Crit Chance'],
        itemMaterial: 'FEATHER',
      },
      stats: {
        'max-health': { base: '20', perLevel: '0.2', min: '', max: '', formula: '', useFormula: false },
        'movement-speed': { base: '0.12', perLevel: '0.001', min: '', max: '', formula: '', useFormula: false },
        'critical-strike-chance': { base: '5', perLevel: '0.5', min: '', max: '', formula: '', useFormula: false },
      },
      mana: { char: '♦', icon: '&8♦', colorFull: 'DARK_GRAY', colorHalf: 'GRAY', colorEmpty: 'WHITE', name: 'Energy' },
      skills: [
        { skillId: 'BACKSTAB', level: 1, maxLevel: 30, trigger: 'ATTACK', unlockedByDefault: true, modifiers: [{ key: 'extra', base: '20', perLevel: '3' }] },
        { skillId: 'SHADOW_VEIL', level: 6, maxLevel: 30, unlockedByDefault: true, modifiers: [{ key: 'duration', base: '3', perLevel: '0.2' }] },
        { skillId: 'FURTIVE_STRIKE', level: 3, maxLevel: 30, unlockedByDefault: true, modifiers: [{ key: 'damage', base: '7', perLevel: '2' }] },
      ],
    },
  },
]

export const PROFESSION_PRESETS = [
  {
    id: 'farming',
    label: 'Farming',
    state: {
      fileId: 'farming',
      name: 'Farming',
      maxLevel: 10,
      expCurve: 'levels',
      expTable: 'example_exp_table',
      classExp: { base: 10, perLevel: 2 },
      expSources: [
        "mineblock{type=CARROTS;amount=1-3;crop=true;player-placed=false}",
        "mineblock{type=POTATOES;amount=1-3;crop=true;player-placed=false}",
        "mineblock{type=WHEAT;amount=1-3;crop=true;player-placed=false}",
      ],
    },
  },
  {
    id: 'mining',
    label: 'Mining',
    state: {
      fileId: 'mining',
      name: 'Mining',
      maxLevel: 10,
      expCurve: 'levels',
      expTable: 'example_exp_table',
      classExp: { base: 12, perLevel: 3 },
      expSources: [
        "mineblock{type=COAL_ORE;amount=2-5}",
        "mineblock{type=IRON_ORE;amount=4-8}",
        "mineblock{type=DIAMOND_ORE;amount=15-25}",
      ],
    },
  },
  {
    id: 'fishing',
    label: 'Fishing',
    state: {
      fileId: 'fishing',
      name: 'Fishing',
      maxLevel: 10,
      expCurve: 'levels',
      expTable: 'example_exp_table',
      classExp: { base: 8, perLevel: 2 },
      expSources: ['fishitem{amount=3-10}'],
    },
  },
]

export function presetToClass(preset) {
  const s = preset.state
  return createClassState({
    ...s,
    skills: (s.skills || []).map(sk => ({
      ...createSkillEntry(sk.skillId),
      ...sk,
      _id: uid(),
      modifiers: (sk.modifiers || []).map(m => ({ ...emptyScaled(), ...m })),
    })),
    stats: Object.fromEntries(
      Object.entries(s.stats || {}).map(([k, v]) => [k, { ...emptyScaled(), ...v }])
    ),
  })
}

export function presetToProfession(preset) {
  return createProfessionState(preset.state)
}
