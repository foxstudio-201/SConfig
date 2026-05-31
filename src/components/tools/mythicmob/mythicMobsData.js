let _seq = 0

export function uid() {
  _seq += 1
  return `${Date.now()}_${_seq}`
}

export const ENTITY_TYPES = [
  'ZOMBIE', 'SKELETON', 'WITHER_SKELETON', 'STRAY', 'HUSK', 'DROWNED', 'PHANTOM',
  'CREEPER', 'SPIDER', 'CAVE_SPIDER', 'ENDERMAN', 'WITCH', 'SLIME', 'MAGMA_CUBE',
  'BLAZE', 'GHAST', 'PIGLIN', 'PIGLIN_BRUTE', 'HOGLIN', 'ZOGLIN', 'VINDICATOR',
  'EVOKER', 'PILLAGER', 'RAVAGER', 'VEX', 'GUARDIAN', 'ELDER_GUARDIAN', 'SHULKER',
  'SILVERFISH', 'ENDERMITE', 'IRON_GOLEM', 'SNOW_GOLEM', 'WOLF', 'POLAR_BEAR',
  'BEAR', 'PANDA', 'BEE', 'CHICKEN', 'COW', 'PIG', 'SHEEP', 'HORSE', 'RABBIT',
  'VILLAGER', 'WANDERING_TRADER', 'ILLUSIONER', 'WARDEN', 'ALLAY', 'FROG',
  'TADPOLE', 'GOAT', 'AXOLOTL', 'CAMEL', 'SNIFFER', 'BREEZE', 'BOGGED',
  'WITHER', 'ENDER_DRAGON', 'GIANT', 'ARMOR_STAND', 'BAT', 'SQUID', 'GLOW_SQUID',
  'DOLPHIN', 'TURTLE', 'COD', 'SALMON', 'PUFFERFISH', 'TROPICAL_FISH',
  'PARROT', 'OCELOT', 'CAT', 'FOX', 'LLAMA', 'TRADER_LLAMA', 'MULE', 'DONKEY',
  'ZOMBIE_HORSE', 'SKELETON_HORSE', 'ZOMBIE_VILLAGER', 'ZOMBIFIED_PIGLIN',
]

export const EQUIPMENT_SLOTS = ['HAND', 'OFFHAND', 'HEAD', 'CHEST', 'LEGS', 'FEET']

export const MATERIALS = [
  'WOODEN_SWORD', 'STONE_SWORD', 'IRON_SWORD', 'GOLDEN_SWORD', 'DIAMOND_SWORD', 'NETHERITE_SWORD',
  'WOODEN_AXE', 'STONE_AXE', 'IRON_AXE', 'GOLDEN_AXE', 'DIAMOND_AXE', 'NETHERITE_AXE',
  'BOW', 'CROSSBOW', 'TRIDENT', 'SHIELD', 'TOTEM_OF_UNDYING',
  'LEATHER_HELMET', 'LEATHER_CHESTPLATE', 'LEATHER_LEGGINGS', 'LEATHER_BOOTS',
  'CHAINMAIL_HELMET', 'CHAINMAIL_CHESTPLATE', 'CHAINMAIL_LEGGINGS', 'CHAINMAIL_BOOTS',
  'IRON_HELMET', 'IRON_CHESTPLATE', 'IRON_LEGGINGS', 'IRON_BOOTS',
  'GOLDEN_HELMET', 'GOLDEN_CHESTPLATE', 'GOLDEN_LEGGINGS', 'GOLDEN_BOOTS',
  'DIAMOND_HELMET', 'DIAMOND_CHESTPLATE', 'DIAMOND_LEGGINGS', 'DIAMOND_BOOTS',
  'NETHERITE_HELMET', 'NETHERITE_CHESTPLATE', 'NETHERITE_LEGGINGS', 'NETHERITE_BOOTS',
  'PLAYER_HEAD', 'BLAZE_ROD', 'STICK', 'BONE', 'BOW',
]

export const TRIGGERS = [
  { value: 'onSpawn', label: 'onSpawn' },
  { value: 'onAttack', label: 'onAttack' },
  { value: 'onDamaged', label: 'onDamaged' },
  { value: 'onDeath', label: 'onDeath' },
  { value: 'onTimer', label: 'onTimer (set ticks)' },
  { value: 'onInteract', label: 'onInteract' },
  { value: 'onEnterCombat', label: 'onEnterCombat' },
  { value: 'onDropCombat', label: 'onDropCombat' },
  { value: 'onPlayerKill', label: 'onPlayerKill' },
  { value: 'onCombat', label: 'onCombat' },
  { value: 'onSignal', label: 'onSignal' },
  { value: 'onTeleport', label: 'onTeleport' },
]

export const TARGETS = [
  { value: '@target', label: '@target' },
  { value: '@trigger', label: '@trigger' },
  { value: '@Self', label: '@Self' },
  { value: '@PlayersInRadius{r=10}', label: '@PlayersInRadius{r=10}' },
  { value: '@LivingInRadius{r=8}', label: '@LivingInRadius{r=8}' },
  { value: '@MobsInRadius{r=8}', label: '@MobsInRadius{r=8}' },
  { value: '@NearestPlayer{r=16}', label: '@NearestPlayer{r=16}' },
  { value: '@World', label: '@World' },
  { value: '@Origin', label: '@Origin' },
  { value: '@Forward{f=5}', label: '@Forward{f=5}' },
]

export const COMMON_MECHANICS = [
  { value: 'skill', label: 'skill (reference skill file)' },
  { value: 'damage', label: 'damage' },
  { value: 'ignite', label: 'ignite' },
  { value: 'potion', label: 'potion' },
  { value: 'message', label: 'message' },
  { value: 'teleport', label: 'teleport' },
  { value: 'lightning', label: 'lightning' },
  { value: 'effect:particles', label: 'effect:particles' },
  { value: 'effect:sound', label: 'effect:sound' },
  { value: 'heal', label: 'heal' },
  { value: 'velocity', label: 'velocity' },
  { value: 'throw', label: 'throw' },
  { value: 'summon', label: 'summon' },
  { value: 'swap', label: 'swap' },
  { value: 'pull', label: 'pull' },
  { value: 'leap', label: 'leap' },
  { value: 'stun', label: 'stun' },
  { value: 'shield', label: 'shield' },
  { value: 'totem', label: 'totem' },
]

export const MECHANIC_DEFAULTS = {
  skill: 's=MySkill',
  damage: 'amount=10',
  ignite: 'ticks=100',
  potion: 'type=SLOW;duration=100;level=2',
  message: 'm="&cWatch out!"',
  teleport: '',
  lightning: '',
  'effect:particles': 'particle=flame;amount=20;hS=0.5;vS=0.5',
  'effect:sound': 's=entity.blaze.shoot;v=1;p=1',
  heal: 'amount=10',
  velocity: 'm=add;x=0;y=1;z=0',
  throw: 'velocity=5;velocityY=0.5',
  summon: 'mob=MyMob;amount=1',
  swap: '',
  pull: 'velocity=5',
  leap: 'velocity=5',
  stun: 'duration=40',
  shield: 'amount=50;maxShield=100',
  totem: 'ch=0.5',
}

export const BOSS_BAR_COLORS = ['RED', 'BLUE', 'GREEN', 'PINK', 'PURPLE', 'WHITE', 'YELLOW']
export const BOSS_BAR_STYLES = ['SOLID', 'SEGMENTED_6', 'SEGMENTED_10', 'SEGMENTED_12', 'SEGMENTED_20', 'NOTCHED_6', 'NOTCHED_10', 'NOTCHED_12', 'NOTCHED_20']
export const DESPAWN_OPTIONS = ['', 'PERSISTENT', 'CHUNK', 'NORMAL', 'NEVER']

export const DAMAGE_CAUSES = [
  'FIRE', 'FIRE_TICK', 'LAVA', 'LIGHTNING', 'PROJECTILE', 'ENTITY_ATTACK',
  'ENTITY_EXPLOSION', 'BLOCK_EXPLOSION', 'FALL', 'DROWNING', 'POISON', 'MAGIC', 'WITHER',
]

export const MOB_OPTION_FIELDS = [
  { key: 'movementSpeed', label: 'Movement Speed', type: 'number', placeholder: '0.2' },
  { key: 'knockbackResistance', label: 'Knockback Resistance', type: 'number', placeholder: '0.5' },
  { key: 'followRange', label: 'Follow Range', type: 'number', placeholder: '32' },
  { key: 'attackSpeed', label: 'Attack Speed', type: 'number', placeholder: '4' },
  { key: 'maxCombatDistance', label: 'Max Combat Distance', type: 'number', placeholder: '32' },
  { key: 'despawn', label: 'Despawn', type: 'select', options: DESPAWN_OPTIONS },
  { key: 'preventOtherDrops', label: 'Prevent Other Drops', type: 'bool' },
  { key: 'preventRandomEquipment', label: 'Prevent Random Equipment', type: 'bool' },
  { key: 'preventSunburn', label: 'Prevent Sunburn', type: 'bool' },
  { key: 'preventItemPickup', label: 'Prevent Item Pickup', type: 'bool' },
  { key: 'preventMobKillDrops', label: 'Prevent Mob Kill Drops', type: 'bool' },
  { key: 'silent', label: 'Silent', type: 'bool' },
  { key: 'noAI', label: 'No AI', type: 'bool' },
  { key: 'alwaysShowName', label: 'Always Show Name', type: 'bool' },
  { key: 'collidable', label: 'Collidable', type: 'bool' },
  { key: 'glowing', label: 'Glowing', type: 'bool' },
  { key: 'invincible', label: 'Invincible', type: 'bool' },
  { key: 'repeatAllSkills', label: 'Repeat All Skills', type: 'bool' },
]

export function emptyEquipment() {
  return { item: 'IRON_SWORD', slot: 'HAND' }
}

export function emptyDrop() {
  return { text: 'exp 10-20 1' }
}

export function emptyDamageMod() {
  return { cause: 'FIRE', multiplier: '0.5' }
}

export function emptyLevelMod() {
  return { stat: 'health', amount: '5' }
}

export function emptyMobSkill() {
  return {
    useRaw: false,
    raw: '',
    mechanic: 'skill',
    options: 's=MySkill',
    target: '@target',
    trigger: 'onAttack',
    timerTicks: '200',
    healthMod: '',
    chance: '',
  }
}

export function emptySkillMechanic() {
  return {
    useRaw: false,
    raw: '',
    mechanic: 'damage',
    options: 'amount=10',
    target: '@target',
    conditions: '',
  }
}

export function createMobState(overrides = {}) {
  return {
    _id: uid(),
    internalName: 'ExampleMob',
    type: 'ZOMBIE',
    display: '&cExample Mob',
    health: '50',
    damage: '6',
    armor: '',
    faction: '',
    level: '',
    options: {
      movementSpeed: '',
      knockbackResistance: '',
      followRange: '',
      attackSpeed: '',
      maxCombatDistance: '',
      despawn: '',
      preventOtherDrops: false,
      preventRandomEquipment: false,
      preventSunburn: false,
      preventItemPickup: false,
      preventMobKillDrops: false,
      silent: false,
      noAI: false,
      alwaysShowName: false,
      collidable: true,
      glowing: false,
      invincible: false,
      repeatAllSkills: false,
    },
    equipment: [],
    drops: [],
    damageModifiers: [],
    levelModifiers: [],
    bossBar: {
      enabled: false,
      title: '',
      range: '30',
      color: 'RED',
      style: 'NOTCHED_6',
    },
    skills: [],
    extraYaml: '',
    ...overrides,
  }
}

export function createSkillState(overrides = {}) {
  return {
    _id: uid(),
    skillId: 'ExampleSkill',
    mechanics: [emptySkillMechanic()],
    extraYaml: '',
    ...overrides,
  }
}

export const MOB_PRESETS = [
  {
    id: 'skeletal-knight',
    label: 'Skeletal Knight',
    state: {
      internalName: 'SkeletalKnight',
      type: 'WITHER_SKELETON',
      display: '&6Skeletal Knight',
      health: '200',
      damage: '12',
      armor: '10',
      faction: 'undead_army',
      options: {
        movementSpeed: '0.3',
        knockbackResistance: '0.5',
        preventOtherDrops: true,
        preventRandomEquipment: true,
        despawn: 'PERSISTENT',
      },
      equipment: [
        { item: 'DIAMOND_SWORD', slot: 'HAND' },
        { item: 'IRON_HELMET', slot: 'HEAD' },
        { item: 'CHAINMAIL_CHESTPLATE', slot: 'CHEST' },
      ],
      drops: [
        { text: 'exp 50-100 1' },
        { text: 'diamond 1-3 0.5' },
      ],
      bossBar: {
        enabled: true,
        title: '&6Skeletal Knight',
        range: '30',
        color: 'RED',
        style: 'NOTCHED_6',
      },
      skills: [
        { useRaw: false, mechanic: 'skill', options: 's=KnightSlash', target: '@target', trigger: 'onAttack', timerTicks: '200', healthMod: '', chance: '' },
        { useRaw: false, mechanic: 'skill', options: 's=KnightShield', target: '', trigger: 'onDamaged', timerTicks: '200', healthMod: '', chance: '0.3' },
      ],
    },
  },
  {
    id: 'charged-sheep',
    label: 'Charged Sheep',
    state: {
      internalName: 'StaticallyChargedSheep',
      type: 'SHEEP',
      display: '&bStatically Charged Sheep',
      health: '100',
      damage: '2',
      options: { movementSpeed: '0.3' },
      damageModifiers: [
        { cause: 'LIGHTNING', multiplier: '0' },
        { cause: 'FIRE', multiplier: '0.5' },
      ],
      skills: [
        { useRaw: false, mechanic: 'lightning', options: '', target: '@LivingInRadius{r=10}', trigger: 'onTimer', timerTicks: '100', healthMod: '', chance: '' },
      ],
    },
  },
  {
    id: 'slime-boss',
    label: 'Angry Sludge',
    state: {
      internalName: 'AngrySludge',
      type: 'SLIME',
      display: 'Angry Sludge',
      health: '100',
      damage: '2',
      options: { movementSpeed: '0.2' },
      skills: [
        { useRaw: false, mechanic: 'skill', options: 's=AngrySludgePoison', target: '', trigger: 'onTimer', timerTicks: '200', healthMod: '', chance: '0.2' },
      ],
    },
  },
  {
    id: 'fast-zombie',
    label: 'Fast Zombie',
    state: {
      internalName: 'FastZombie',
      type: 'ZOMBIE',
      display: '&2Fast Zombie',
      health: '20',
      damage: '4',
      options: { movementSpeed: '0.35', preventOtherDrops: true },
      skills: [
        { useRaw: false, mechanic: 'effect:particles', options: 'particle=cloud;amount=5;hS=0.2;vS=0.2', target: '@Self', trigger: 'onAttack', timerTicks: '200', healthMod: '', chance: '0.5' },
      ],
    },
  },
]

export const SKILL_PRESETS = [
  {
    id: 'slash',
    label: 'Slash Attack',
    state: {
      skillId: 'KnightSlash',
      mechanics: [
        { useRaw: false, mechanic: 'damage', options: 'amount=15', target: '@target', conditions: '' },
        { useRaw: false, mechanic: 'effect:particles', options: 'particle=SWEEP_ATTACK;amount=1', target: '@Self', conditions: '' },
        { useRaw: false, mechanic: 'effect:sound', options: 's=entity.player.attack.sweep;v=1;p=1', target: '@Self', conditions: '' },
      ],
    },
  },
  {
    id: 'aoe-pulse',
    label: 'AOE Pulse',
    state: {
      skillId: 'AOEPulse',
      mechanics: [
        { useRaw: false, mechanic: 'damage', options: 'amount=8;ignorearmor=true', target: '@LivingInRadius{r=5}', conditions: '' },
        { useRaw: false, mechanic: 'effect:particles', options: 'particle=explosion;amount=10;hS=1;vS=0.5', target: '@Self', conditions: '' },
        { useRaw: false, mechanic: 'effect:sound', options: 's=entity.generic.explode;v=0.8;p=0.8', target: '@Self', conditions: '' },
      ],
    },
  },
  {
    id: 'shield',
    label: 'Shield Buff',
    state: {
      skillId: 'KnightShield',
      mechanics: [
        { useRaw: false, mechanic: 'shield', options: 'amount=50;maxShield=100', target: '@Self', conditions: '' },
        { useRaw: false, mechanic: 'effect:particles', options: 'particle=totem;amount=20;hS=0.5;vS=0.5', target: '@Self', conditions: '' },
      ],
    },
  },
]

export function buildMobSkillLine(skill) {
  if (skill.useRaw && skill.raw?.trim()) return skill.raw.trim()
  if (!skill.mechanic) return ''
  let line = skill.options?.trim() ? `${skill.mechanic}{${skill.options.trim()}}` : skill.mechanic
  if (skill.target?.trim()) line += ` ${skill.target.trim()}`
  const trig = skill.trigger || ''
  if (trig.startsWith('onTimer')) {
    const ticks = skill.timerTicks?.trim() || '200'
    line += ` ~onTimer:${ticks}`
  } else if (trig) {
    line += ` ~${trig.startsWith('on') ? trig : `on${trig}`}`
  }
  if (skill.healthMod?.trim()) line += ` ${skill.healthMod.trim()}`
  if (skill.chance !== '' && skill.chance != null && String(skill.chance).trim() !== '') {
    line += ` ${String(skill.chance).trim()}`
  }
  return line.trim()
}

export function buildSkillMechanicLine(m) {
  if (m.useRaw && m.raw?.trim()) return m.raw.trim()
  if (!m.mechanic) return ''
  let line = m.options?.trim() ? `${m.mechanic}{${m.options.trim()}}` : m.mechanic
  if (m.target?.trim()) line += ` ${m.target.trim()}`
  if (m.conditions?.trim()) line += ` ${m.conditions.trim()}`
  return line.trim()
}

export function presetToMob(preset) {
  const base = createMobState()
  const { options, equipment, drops, damageModifiers, levelModifiers, bossBar, skills, ...rest } = preset.state
  return createMobState({
    ...base,
    ...rest,
    options: { ...base.options, ...(options || {}) },
    equipment: equipment ? equipment.map(e => ({ ...e })) : [],
    drops: drops ? drops.map(d => ({ ...d })) : [],
    damageModifiers: damageModifiers ? damageModifiers.map(d => ({ ...d })) : [],
    levelModifiers: levelModifiers ? levelModifiers.map(l => ({ ...l })) : [],
    bossBar: { ...base.bossBar, ...(bossBar || {}) },
    skills: skills ? skills.map(s => ({ ...emptyMobSkill(), ...s })) : [],
  })
}

export function presetToSkill(preset) {
  const base = createSkillState()
  const { mechanics, ...rest } = preset.state
  return createSkillState({
    ...base,
    ...rest,
    mechanics: mechanics ? mechanics.map(m => ({ ...emptySkillMechanic(), ...m })) : [emptySkillMechanic()],
  })
}
