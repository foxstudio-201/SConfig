/** DeluxeMenus GUI layouts — selectable vs blocked slots per inventory_type */

export const INVENTORY_TYPES = [
  { value: 'CHEST', label: 'Chest (9–54)' },
  { value: 'HOPPER', label: 'Hopper (5)' },
  { value: 'DISPENSER', label: 'Dispenser (9)' },
  { value: 'DROPPER', label: 'Dropper (9)' },
  { value: 'FURNACE', label: 'Furnace (3)' },
  { value: 'BLAST_FURNACE', label: 'Blast Furnace (3)' },
  { value: 'SMOKER', label: 'Smoker (3)' },
  { value: 'BREWING_STAND', label: 'Brewing Stand (5)' },
  { value: 'ANVIL', label: 'Anvil (3)' },
  { value: 'BEACON', label: 'Beacon (1)' },
  { value: 'ENCHANTING', label: 'Enchanting (2)' },
  { value: 'GRINDSTONE', label: 'Grindstone (3)' },
  { value: 'LOOM', label: 'Loom (4)' },
  { value: 'CARTOGRAPHY', label: 'Cartography (3)' },
  { value: 'SMITHING', label: 'Smithing (3)' },
  { value: 'STONECUTTER', label: 'Stonecutter (2)' },
  { value: 'WORKBENCH', label: 'Crafting Table (10)' },
  { value: 'MERCHANT', label: 'Villager Trade (3)' },
  { value: 'BARREL', label: 'Barrel (27)' },
  { value: 'ENDER_CHEST', label: 'Ender Chest (27–54)' },
  { value: 'SHULKER_BOX', label: 'Shulker Box (27–54)' },
]

export const CHEST_SIZES = [9, 18, 27, 36, 45, 54]

export const CLICK_TYPES = [
  { value: 'left', labelKey: 'clickLeft' },
  { value: 'right', labelKey: 'clickRight' },
  { value: 'middle', labelKey: 'clickMiddle' },
  { value: 'shift_left', labelKey: 'clickShiftLeft' },
  { value: 'shift_right', labelKey: 'clickShiftRight' },
]

export const ACTION_PRESETS = [
  { value: '[close]', labelKey: 'actionClose' },
  { value: '[player] spawn', labelKey: 'actionPlayerSpawn' },
  { value: '[console] say Hello', labelKey: 'actionConsoleSay' },
  { value: '[message] &aDone!', labelKey: 'actionMessage' },
  { value: '[openguimenu] other_menu', labelKey: 'actionOpenMenu' },
  { value: '[connect] lobby', labelKey: 'actionConnect' },
  { value: '[refresh]', labelKey: 'actionRefresh' },
  { value: '[sound] UI_BUTTON_CLICK', labelKey: 'actionSound' },
]

/** @typedef {{ slot: number, selectable: boolean, labelKey?: string }} GridCell */

/** Build chest grid cells */
function chestCells(size) {
  return Array.from({ length: size }, (_, slot) => ({ slot, selectable: true }))
}

/** Layout: cols + rows for render; cells in row-major order (null = spacer) */
export function getGuiLayout(inventoryType, size = 54) {
  switch (inventoryType) {
    case 'HOPPER':
      return {
        cols: 9,
        rows: 1,
        cells: [
          ...[0, 1, 2].map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...[0, 1, 2, 3, 4].map(slot => ({ slot, selectable: true })),
          ...[0, 1, 2].map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'DISPENSER':
    case 'DROPPER':
      return { cols: 3, rows: 3, cells: chestCells(9) }
    case 'FURNACE':
    case 'BLAST_FURNACE':
    case 'SMOKER':
      return {
        cols: 9,
        rows: 3,
        cells: [
          { slot: null, selectable: false, labelKey: 'spacer' },
          { slot: 0, selectable: true, labelKey: 'slotInput' },
          { slot: null, selectable: false, labelKey: 'spacer' },
          { slot: null, selectable: false, labelKey: 'spacer' },
          { slot: 1, selectable: true, labelKey: 'slotFuel' },
          { slot: null, selectable: false, labelKey: 'spacer' },
          { slot: null, selectable: false, labelKey: 'spacer' },
          { slot: 2, selectable: true, labelKey: 'slotOutput' },
          { slot: null, selectable: false, labelKey: 'spacer' },
          ...Array(18).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'BREWING_STAND':
      return {
        cols: 9,
        rows: 3,
        cells: [
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 1, selectable: true, labelKey: 'slotBottle' },
          { slot: 2, selectable: true, labelKey: 'slotBottle' },
          { slot: 3, selectable: true, labelKey: 'slotBottle' },
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 0, selectable: true, labelKey: 'slotIngredient' },
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 4, selectable: true, labelKey: 'slotFuel' },
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'ANVIL':
      return {
        cols: 9,
        rows: 3,
        cells: [
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 0, selectable: true, labelKey: 'slotAnvilLeft' },
          { slot: null, selectable: false, labelKey: 'spacer' },
          { slot: 1, selectable: true, labelKey: 'slotAnvilRight' },
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 2, selectable: true, labelKey: 'slotAnvilResult' },
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'BEACON':
      return {
        cols: 9,
        rows: 3,
        cells: [
          ...Array(12).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 0, selectable: true, labelKey: 'slotBeacon' },
          ...Array(14).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'ENCHANTING':
      return {
        cols: 9,
        rows: 3,
        cells: [
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 0, selectable: true, labelKey: 'slotEnchantItem' },
          { slot: null, selectable: false, labelKey: 'spacer' },
          { slot: 1, selectable: true, labelKey: 'slotLapis' },
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'GRINDSTONE':
      return {
        cols: 9,
        rows: 3,
        cells: [
          ...Array(2).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 0, selectable: true, labelKey: 'slotInput' },
          { slot: 1, selectable: true, labelKey: 'slotInput' },
          ...Array(2).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 2, selectable: true, labelKey: 'slotOutput' },
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'LOOM':
      return {
        cols: 9,
        rows: 3,
        cells: [
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 0, selectable: true, labelKey: 'slotBanner' },
          { slot: 1, selectable: true, labelKey: 'slotDye' },
          { slot: 2, selectable: true, labelKey: 'slotPattern' },
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 3, selectable: true, labelKey: 'slotOutput' },
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'CARTOGRAPHY':
      return {
        cols: 9,
        rows: 3,
        cells: [
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 0, selectable: true, labelKey: 'slotMap' },
          { slot: 1, selectable: true, labelKey: 'slotPaper' },
          { slot: null, selectable: false, labelKey: 'spacer' },
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 2, selectable: true, labelKey: 'slotOutput' },
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'SMITHING':
      return {
        cols: 9,
        rows: 3,
        cells: [
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 0, selectable: true, labelKey: 'slotTemplate' },
          { slot: 1, selectable: true, labelKey: 'slotBase' },
          { slot: 2, selectable: true, labelKey: 'slotAddition' },
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 3, selectable: true, labelKey: 'slotOutput' },
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'STONECUTTER':
      return {
        cols: 9,
        rows: 3,
        cells: [
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 0, selectable: true, labelKey: 'slotInput' },
          { slot: 1, selectable: true, labelKey: 'slotRecipe' },
          ...Array(4).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'WORKBENCH':
      return {
        cols: 9,
        rows: 3,
        cells: [
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map(slot => ({ slot, selectable: true, labelKey: 'slotCraft' })),
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 9, selectable: true, labelKey: 'slotResult' },
          ...Array(5).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'MERCHANT':
      return {
        cols: 9,
        rows: 3,
        cells: [
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          { slot: 0, selectable: true, labelKey: 'slotTrade' },
          { slot: 1, selectable: true, labelKey: 'slotTradeCost' },
          { slot: 2, selectable: true, labelKey: 'slotTradeResult' },
          ...Array(3).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
          ...Array(9).fill(null).map(() => ({ slot: null, selectable: false, labelKey: 'spacer' })),
        ],
      }
    case 'BARREL':
      return { cols: 9, rows: 3, cells: chestCells(27) }
    case 'ENDER_CHEST':
    case 'SHULKER_BOX':
      return { cols: 9, rows: Math.ceil(size / 9), cells: chestCells(size) }
    case 'CHEST':
    default:
      return { cols: 9, rows: Math.ceil(size / 9), cells: chestCells(size) }
  }
}

export function defaultSizeForType(inventoryType) {
  if (inventoryType === 'HOPPER') return 5
  if (inventoryType === 'BARREL') return 27
  if (['DISPENSER', 'DROPPER'].includes(inventoryType)) return 9
  if (['FURNACE', 'BLAST_FURNACE', 'SMOKER', 'ANVIL', 'GRINDSTONE', 'CARTOGRAPHY', 'SMITHING', 'MERCHANT'].includes(inventoryType)) {
    return getGuiLayout(inventoryType).cells.filter(c => c.selectable).length
  }
  if (inventoryType === 'BEACON') return 1
  if (inventoryType === 'ENCHANTING') return 2
  if (inventoryType === 'BREWING_STAND') return 5
  if (inventoryType === 'LOOM') return 4
  if (inventoryType === 'STONECUTTER') return 2
  if (inventoryType === 'WORKBENCH') return 10
  return 54
}

export function createMenuItem(slot, partial = {}) {
  return {
    slot,
    material: 'STONE',
    amount: 1,
    displayName: '&fItem',
    lore: ['&7Click me'],
    priority: 0,
    update: false,
    hideAttributes: false,
    hideEnchantments: false,
    glow: false,
    leftClick: [],
    rightClick: [],
    middleClick: [],
    shiftLeftClick: [],
    shiftRightClick: [],
    ...partial,
  }
}

export function createMenuState() {
  return {
    fileName: 'menu',
    menuTitle: '&8Deluxe Menu',
    openCommand: 'menu',
    registerCommand: true,
    openCommandAliases: [],
    inventoryType: 'CHEST',
    size: 54,
    updateInterval: 20,
    items: {},
    openRequirements: '',
    openCommands: [],
    closeCommands: [],
  }
}

export function applyPreset(preset) {
  const base = createMenuState()
  if (preset === 'shop') {
    return {
      ...base,
      fileName: 'shop',
      menuTitle: '&8&lServer Shop',
      openCommand: 'shop',
      items: {
        13: createMenuItem(13, {
          material: 'EMERALD',
          displayName: '&a&lBuy Items',
          lore: ['&7Click to browse'],
          leftClick: ['[message] &aShop!'],
        }),
        22: createMenuItem(22, {
          material: 'BARRIER',
          displayName: '&cClose',
          leftClick: ['[close]'],
        }),
      },
    }
  }
  if (preset === 'hub') {
    return {
      ...base,
      fileName: 'hub',
      menuTitle: '&b&lHub Menu',
      openCommand: 'hubmenu',
      size: 27,
      items: {
        11: createMenuItem(11, { material: 'COMPASS', displayName: '&eSpawn', leftClick: ['[player] spawn'] }),
        13: createMenuItem(13, { material: 'DIAMOND_SWORD', displayName: '&cPvP', leftClick: ['[connect] pvp'] }),
        15: createMenuItem(15, { material: 'CHEST', displayName: '&6Crates', leftClick: ['[openguimenu] crates'] }),
      },
    }
  }
  return base
}

export const MATERIALS_COMMON = [
  'STONE', 'GRASS_BLOCK', 'DIRT', 'COBBLESTONE', 'OAK_PLANKS', 'BARRIER', 'GLASS', 'BEDROCK',
  'DIAMOND', 'EMERALD', 'GOLD_INGOT', 'IRON_INGOT', 'NETHERITE_INGOT',
  'DIAMOND_SWORD', 'IRON_SWORD', 'BOW', 'TRIDENT', 'ELYTRA',
  'PLAYER_HEAD', 'COMPASS', 'CLOCK', 'MAP', 'BOOK', 'WRITABLE_BOOK', 'ENCHANTED_BOOK',
  'CHEST', 'ENDER_CHEST', 'SHULKER_BOX', 'HOPPER', 'ANVIL',
  'PAPER', 'NAME_TAG', 'EXPERIENCE_BOTTLE', 'TNT', 'FIREWORK_ROCKET',
  'REDSTONE', 'REDSTONE_TORCH', 'LEVER', 'TRIPWIRE_HOOK',
  'LIME_DYE', 'GRAY_DYE', 'RED_DYE', 'BLUE_DYE',
  'SUNFLOWER', 'POPPY', 'OAK_SAPLING',
]
