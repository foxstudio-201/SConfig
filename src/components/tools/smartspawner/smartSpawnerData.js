import mobsDefault from './smartSpawnerMobsDefault.js'

export const LANGUAGE_OPTIONS = ['en_US', 'vi_VN', 'de_DE', 'en_US_DonutSMP', 'en_US_DonutSMP_v2']
export const GUI_LAYOUT_OPTIONS = ['default', 'DonutSMP', 'DonutSMP_v2']
export const CURRENCY_OPTIONS = ['VAULT', 'EXCELLENTECONOMY']
export const PRICE_SOURCE_OPTIONS = ['SHOP_ONLY', 'SHOP_PRIORITY', 'CUSTOM_ONLY', 'CUSTOM_PRIORITY']
export const SHOP_PLUGIN_OPTIONS = ['auto', 'EconomyShopGUI', 'EconomyShopGUI-Premium', 'ShopGUIPlus', 'zShop']
export const DB_MODE_OPTIONS = ['YAML', 'MYSQL', 'SQLITE']
export const HOLOGRAM_ALIGN_OPTIONS = ['CENTER', 'LEFT', 'RIGHT']

export const LOG_EVENTS = [
  'SPAWNER_PLACE', 'SPAWNER_BREAK', 'SPAWNER_EXPLODE', 'SPAWNER_STACK_HAND', 'SPAWNER_STACK_GUI',
  'SPAWNER_DESTACK_GUI', 'SPAWNER_GUI_OPEN', 'SPAWNER_STORAGE_OPEN', 'SPAWNER_STACKER_OPEN',
  'SPAWNER_EXP_CLAIM', 'SPAWNER_SELL_ALL', 'SPAWNER_ITEM_TAKE_ALL', 'SPAWNER_ITEM_DROP',
  'SPAWNER_ITEMS_SORT', 'SPAWNER_ITEM_FILTER', 'SPAWNER_DROP_PAGE_ITEMS', 'SPAWNER_EGG_CHANGE',
  'COMMAND_EXECUTE_PLAYER', 'COMMAND_EXECUTE_CONSOLE', 'COMMAND_EXECUTE_RCON',
]

export const CONFIG_SECTIONS = [
  { id: 'general', labelKey: 'secGeneral' },
  { id: 'spawner', labelKey: 'secSpawner' },
  { id: 'break', labelKey: 'secBreak' },
  { id: 'economy', labelKey: 'secEconomy' },
  { id: 'hopper', labelKey: 'secHopper' },
  { id: 'bedrock', labelKey: 'secBedrock' },
  { id: 'visual', labelKey: 'secVisual' },
  { id: 'logging', labelKey: 'secLogging' },
  { id: 'database', labelKey: 'secDatabase' },
  { id: 'performance', labelKey: 'secPerformance' },
]

const CHIP_GLYPH = {
  general: 'GEN', spawner: 'SPN', break: 'BRK', economy: '$',
  hopper: 'HOP', bedrock: 'BED', visual: 'FX', logging: 'LOG', database: 'DB', performance: 'CPU',
}

/** Chip matrix nodes — angles on ellipse around core */
export const CHIP_NODES = CONFIG_SECTIONS.map((sec, i) => ({
  id: sec.id,
  labelKey: sec.labelKey,
  glyph: CHIP_GLYPH[sec.id] || sec.id.slice(0, 3).toUpperCase(),
  angle: -90 + (360 / CONFIG_SECTIONS.length) * i,
}))

export const NODE_COLORS = {
  idle: { stroke: '#64748b', fill: '#0f172a', glow: 'rgba(100,116,139,0.35)', line: '#334155' },
  active: { stroke: '#34d399', fill: '#064e3b', glow: 'rgba(52,211,153,0.55)', line: '#10b981' },
  hover: { stroke: '#6ee7b7', fill: '#047857', glow: 'rgba(110,231,183,0.5)', line: '#34d399' },
}

export const CORE_COLORS = {
  idle: { stroke: '#94a3b8', fill: '#0a120e', glow: 'rgba(16,185,129,0.2)' },
  active: { stroke: '#34d399', fill: '#064e3b', glow: 'rgba(52,211,153,0.65)' },
}

export const DEFAULT_ITEM_PRICES = {
  LEATHER: 4, STRING: 0.75, FEATHER: 1, CHICKEN: 1.5, COD: 1, SALMON: 1.5, BEEF: 2, PORKCHOP: 2,
  MUTTON: 1.5, RABBIT: 2, WHITE_WOOL: 1, RABBIT_HIDE: 1.5, RABBIT_FOOT: 8, PUFFERFISH: 2.5,
  TROPICAL_FISH: 3, BONE: 1, BONE_MEAL: 0.5, ARROW: 0.5, SPIDER_EYE: 2, GUNPOWDER: 3,
  ROTTEN_FLESH: 0.5, ENDER_PEARL: 10, GHAST_TEAR: 15, MAGMA_CREAM: 8, PHANTOM_MEMBRANE: 12,
  SHULKER_SHELL: 25, SLIME_BALL: 2.5, BLAZE_ROD: 12, BREEZE_ROD: 15, WITHER_SKELETON_SKULL: 100,
  BOW: 5, CROSSBOW: 8, GOLDEN_SWORD: 15, GOLDEN_AXE: 18, STONE_SWORD: 3, IRON_AXE: 15,
  TRIDENT: 50, TIPPED_ARROW: 2, TOTEM_OF_UNDYING: 150, SADDLE: 20, COPPER_INGOT: 3,
  PRISMARINE_SHARD: 5, PRISMARINE_CRYSTALS: 8, WET_SPONGE: 20, EMERALD: 25, IRON_INGOT: 10,
  GOLD_NUGGET: 1.5, GOLD_INGOT: 15, REDSTONE: 2, GLOWSTONE_DUST: 2.5, COAL: 1.5,
  GLOW_INK_SAC: 4, INK_SAC: 1.5, CARROT: 1, POTATO: 1, POPPY: 0.5, SNOWBALL: 0.2,
  SEAGRASS: 0.5, SUGAR: 0.5, GLASS_BOTTLE: 1, STICK: 0.2, SCULK_CATALYST: 30,
  TIDE_ARMOR_TRIM_SMITHING_TEMPLATE: 75,
}

/** Preset patches differ clearly from createSmartSpawnerState() defaults. */
export const CONFIG_PRESETS = [
  {
    id: 'balanced',
    focusSection: 'spawner',
    patch: {
      spawnerProperties: {
        minMobs: 2,
        maxMobs: 6,
        range: 20,
        delay: '20s',
        maxStoragePages: 2,
        maxStackSize: 25000,
      },
      hopper: { enabled: true, checkDelay: '2s', stackPerTransfer: 8 },
      sellIntegration: { enabled: true, priceSourceMode: 'SHOP_PRIORITY' },
      performance: { approximateLoot: true, approximationThreshold: 2000 },
      particle: { spawnerStack: true, spawnerActivate: true, spawnerGenerateLoot: true },
    },
  },
  {
    id: 'performance',
    focusSection: 'performance',
    patch: {
      spawnerProperties: { range: 12, maxStackSize: 100000, maxStoragePages: 1 },
      performance: { approximateLoot: true, approximationThreshold: 250 },
      hologram: { enabled: false },
      particle: { spawnerStack: false, spawnerActivate: false, spawnerGenerateLoot: false },
      hopper: { enabled: true, checkDelay: '1s', stackPerTransfer: 16 },
      logging: { consoleOutput: false, logAllEvents: false },
      debug: false,
    },
  },
  {
    id: 'economy',
    focusSection: 'economy',
    patch: {
      sellIntegration: {
        enabled: true,
        priceSourceMode: 'CUSTOM_PRIORITY',
        shopIntegration: { enabled: true, preferredPlugin: 'auto' },
        customPrices: { enabled: true, defaultPrice: 5 },
      },
      spawnerBreak: {
        autoSellAndClaimExpOnBreak: true,
        directToInventory: true,
        durabilityLoss: 2,
      },
      spawnerProperties: { maxStoredExp: 10000, allowExpMending: true },
      naturalSpawner: { breakable: false, convertToSmartSpawner: true },
    },
  },
]

function deepMergePreset(base, patch) {
  if (patch == null || typeof patch !== 'object' || Array.isArray(patch)) return patch
  const out = { ...(base && typeof base === 'object' && !Array.isArray(base) ? base : {}) }
  Object.entries(patch).forEach(([key, val]) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      out[key] = deepMergePreset(out[key], val)
    } else {
      out[key] = val
    }
  })
  return out
}

export function createSmartSpawnerState() {
  return {
    language: 'en_US',
    guiLayout: 'default',
    debug: false,
    spawnerProperties: {
      minMobs: 1,
      maxMobs: 4,
      range: 16,
      delay: '25s',
      maxStoragePages: 1,
      maxStoredExp: 1000,
      maxStackSize: 10000,
      allowExpMending: true,
      protectFromExplosions: true,
    },
    spawnerBreak: {
      enabled: true,
      directToInventory: false,
      requiredTools: ['IRON_PICKAXE', 'GOLDEN_PICKAXE', 'DIAMOND_PICKAXE', 'NETHERITE_PICKAXE'],
      durabilityLoss: 1,
      autoSellAndClaimExpOnBreak: true,
      silkTouch: { required: true, level: 1 },
    },
    naturalSpawner: {
      breakable: false,
      convertToSmartSpawner: false,
      spawnMobs: true,
      protectFromExplosions: false,
    },
    sellIntegration: {
      enabled: true,
      currency: 'VAULT',
      excellenteconomyCurrency: 'money',
      priceSourceMode: 'SHOP_PRIORITY',
      shopIntegration: { enabled: true, preferredPlugin: 'auto' },
      customPrices: { enabled: true, defaultPrice: 1 },
    },
    hopper: { enabled: false, checkDelay: '3s', stackPerTransfer: 5 },
    bedrockSupport: { enableFormui: true },
    hologram: {
      enabled: false,
      offsetX: 0.5,
      offsetY: 1.6,
      offsetZ: 0.5,
      alignment: 'CENTER',
      shadowedText: true,
      seeThrough: false,
      transparentBackground: false,
    },
    particle: {
      spawnerStack: true,
      spawnerActivate: true,
      spawnerGenerateLoot: true,
    },
    logging: {
      enabled: true,
      jsonFormat: false,
      consoleOutput: false,
      maxLogFiles: 10,
      maxLogSizeMb: 10,
      logAllEvents: false,
      loggedEvents: [
        'SPAWNER_PLACE', 'SPAWNER_BREAK', 'SPAWNER_EXPLODE', 'SPAWNER_STACK_HAND',
        'SPAWNER_STACK_GUI', 'SPAWNER_DESTACK_GUI', 'SPAWNER_EXP_CLAIM', 'SPAWNER_SELL_ALL',
        'SPAWNER_ITEM_TAKE_ALL', 'SPAWNER_ITEMS_SORT', 'SPAWNER_ITEM_FILTER',
        'SPAWNER_DROP_PAGE_ITEMS', 'COMMAND_EXECUTE_PLAYER', 'COMMAND_EXECUTE_CONSOLE',
        'COMMAND_EXECUTE_RCON',
      ],
    },
    database: {
      mode: 'YAML',
      serverName: 'server1',
      syncAcrossServers: false,
      migrateFromLocal: true,
      database: 'smartspawner',
      sqlite: { file: 'spawners.db' },
      sql: {
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        pool: {
          maximumSize: 10,
          minimumIdle: 2,
          connectionTimeout: 10000,
          maxLifetime: 1800000,
          idleTimeout: 600000,
          keepaliveTime: 30000,
          leakDetectionThreshold: 0,
        },
      },
    },
    performance: {
      approximateLoot: true,
      approximationThreshold: 1000,
    },
    spawnersSettings: {
      defaultMaterial: mobsDefault.defaultMaterial || 'SPAWNER',
      mobs: JSON.parse(JSON.stringify(mobsDefault.mobs || {})),
    },
    itemPrices: { ...DEFAULT_ITEM_PRICES },
  }
}

export function applyConfigPreset(state, preset) {
  if (!preset?.patch) return state
  const next = { ...state }
  Object.entries(preset.patch).forEach(([key, val]) => {
    next[key] = deepMergePreset(next[key], val)
  })
  return next
}

export function getMobIds(state) {
  return Object.keys(state.spawnersSettings?.mobs || {}).sort()
}

export function getMobsWithLoot(state) {
  return getMobIds(state).filter(id => Object.keys(state.spawnersSettings.mobs[id]?.loot || {}).length > 0)
}

export function emptyLootEntry() {
  return { amount: '0-1', chance: 100 }
}

export function emptyMob() {
  return {
    experience: 0,
    loot: {},
    headTexture: { material: 'PLAYER_HEAD', customTexture: '' },
  }
}
