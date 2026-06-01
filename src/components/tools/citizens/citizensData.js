let _uid = 0
export function nextNpcId() {
  _uid += 1
  return _uid
}

export const ENTITY_TYPES = [
  { value: 'PLAYER', label: 'Player (humanoid)' },
  { value: 'VILLAGER', label: 'Villager' },
  { value: 'COW', label: 'Cow' },
  { value: 'PIG', label: 'Pig' },
  { value: 'SHEEP', label: 'Sheep' },
  { value: 'CHICKEN', label: 'Chicken' },
  { value: 'WOLF', label: 'Wolf' },
  { value: 'CAT', label: 'Cat' },
  { value: 'HORSE', label: 'Horse' },
  { value: 'IRON_GOLEM', label: 'Iron Golem' },
  { value: 'ZOMBIE', label: 'Zombie' },
  { value: 'SKELETON', label: 'Skeleton' },
  { value: 'ARMOR_STAND', label: 'Armor Stand' },
]

export const EQUIPMENT_SLOTS = [
  { key: 'hand', labelKey: 'slotHand' },
  { key: 'offhand', labelKey: 'slotOffhand' },
  { key: 'helmet', labelKey: 'slotHelmet' },
  { key: 'chestplate', labelKey: 'slotChest' },
  { key: 'leggings', labelKey: 'slotLegs' },
  { key: 'boots', labelKey: 'slotBoots' },
]

export const CLICK_HANDS = [
  { value: 'RIGHT', labelKey: 'clickRight' },
  { value: 'LEFT', labelKey: 'clickLeft' },
]

export const SKIN_MODES = [
  { value: 'player', labelKey: 'skinModePlayer' },
  { value: 'url', labelKey: 'skinModeUrl' },
  { value: 'texture', labelKey: 'skinModeTexture' },
]

export const NPC_PRESETS = [
  { id: 'shop', labelKey: 'presetShop' },
  { id: 'quest', labelKey: 'presetQuest' },
  { id: 'guard', labelKey: 'presetGuard' },
  { id: 'warp', labelKey: 'presetWarp' },
]

export function createEquipmentItem(material = 'STONE', amount = 1) {
  return { material: material || 'STONE', amount: amount || 1 }
}

export function createCommandEntry(hand = 'RIGHT') {
  return {
    id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    command: '',
    hand,
    player: true,
    op: false,
    cooldown: 0,
    globalCooldown: 0,
    n: -1,
    cost: 0,
    experienceCost: 0,
  }
}

export function createWaypoint(overrides = {}) {
  return {
    id: `wp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    world: 'world',
    x: 0,
    y: 64,
    z: 0,
    yaw: 0,
    pitch: 0,
    delay: 0,
    ...overrides,
  }
}

export function createNpc(overrides = {}) {
  const id = overrides.citizensId ?? nextNpcId()
  return {
    _id: `npc-${id}-${Math.random().toString(36).slice(2, 8)}`,
    citizensId: id,
    name: '&aNPC',
    entityType: 'PLAYER',
    spawned: true,
    protected: true,
    useMinecraftAI: false,
    location: {
      world: 'world',
      x: 0,
      y: 64,
      z: 0,
      yaw: 0,
      pitch: 0,
    },
    skin: {
      mode: 'player',
      skinName: 'Notch',
      skinUrl: '',
      useLatest: false,
      textureData: '',
      signature: '',
    },
    equipment: {
      hand: null,
      offhand: null,
      helmet: null,
      chestplate: null,
      leggings: null,
      boots: null,
    },
    lookClose: {
      enabled: true,
      range: 5,
      randomLook: false,
      realisticLooking: false,
    },
    talkClose: {
      enabled: false,
      range: 5,
    },
    randomTalker: false,
    textLines: ['&7Hi, I\'m &f<npc>&7!'],
    commands: [],
    waypoints: [],
    ...overrides,
  }
}

export function createProjectState() {
  const npc = createNpc({ citizensId: 0, name: '&aShop Keeper' })
  return {
    fileName: 'saves',
    npcs: [npc],
    activeNpcId: npc._id,
  }
}

export function applyNpcPreset(presetId) {
  switch (presetId) {
    case 'shop':
      return createNpc({
        citizensId: 0,
        name: '&6&lShop Keeper',
        skin: { mode: 'player', skinName: 'Notch', skinUrl: '', useLatest: false, textureData: '', signature: '' },
        equipment: {
          hand: createEquipmentItem('EMERALD', 1),
          offhand: null,
          helmet: null,
          chestplate: createEquipmentItem('LEATHER_CHESTPLATE', 1),
          leggings: null,
          boots: null,
        },
        lookClose: { enabled: true, range: 8, randomLook: false, realisticLooking: true },
        textLines: ['&7Welcome to my shop!', '&eRight-click to browse.'],
        commands: [
          { ...createCommandEntry('RIGHT'), command: 'shop open main' },
        ],
      })
    case 'quest':
      return createNpc({
        citizensId: 0,
        name: '&d&lQuest Giver',
        skin: { mode: 'player', skinName: 'jeb_', skinUrl: '', useLatest: true, textureData: '', signature: '' },
        equipment: { hand: createEquipmentItem('WRITTEN_BOOK', 1), offhand: null, helmet: null, chestplate: null, leggings: null, boots: null },
        talkClose: { enabled: true, range: 6 },
        randomTalker: true,
        textLines: ['&7Adventurer! I have a task for you.', '&aTalk to me when you\'re ready.'],
        commands: [
          { ...createCommandEntry('RIGHT'), command: 'quests open' },
        ],
      })
    case 'guard':
      return createNpc({
        citizensId: 0,
        name: '&c&lGuard',
        skin: { mode: 'player', skinName: 'Steve', skinUrl: '', useLatest: false, textureData: '', signature: '' },
        equipment: {
          hand: createEquipmentItem('IRON_SWORD', 1),
          offhand: createEquipmentItem('SHIELD', 1),
          helmet: createEquipmentItem('IRON_HELMET', 1),
          chestplate: createEquipmentItem('IRON_CHESTPLATE', 1),
          leggings: createEquipmentItem('IRON_LEGGINGS', 1),
          boots: createEquipmentItem('IRON_BOOTS', 1),
        },
        lookClose: { enabled: true, range: 10, randomLook: false, realisticLooking: true },
        textLines: ['&7Move along, citizen.'],
        commands: [],
      })
    case 'warp':
      return createNpc({
        citizensId: 0,
        name: '&b&lWarp NPC',
        skin: { mode: 'player', skinName: 'Dinnerbone', skinUrl: '', useLatest: false, textureData: '', signature: '' },
        equipment: { hand: createEquipmentItem('COMPASS', 1), offhand: null, helmet: null, chestplate: null, leggings: null, boots: null },
        textLines: ['&7Where would you like to go?'],
        commands: [
          { ...createCommandEntry('RIGHT'), command: 'warp spawn' },
          { ...createCommandEntry('LEFT'), command: 'warp pvp' },
        ],
        waypoints: [
          createWaypoint({ x: 0, y: 64, z: 0 }),
          createWaypoint({ x: 5, y: 64, z: 5, delay: 40 }),
        ],
      })
    default:
      return createNpc()
  }
}

export function getActiveNpc(state) {
  return state.npcs.find(n => n._id === state.activeNpcId) || state.npcs[0] || null
}

export function stripNpcName(name) {
  return String(name || 'NPC').replace(/&[0-9a-fk-or]/gi, '').trim() || 'NPC'
}
