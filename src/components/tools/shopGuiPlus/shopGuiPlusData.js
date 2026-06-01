import { formatMcPrice } from '../shopShared'

export const SHOP_SIZES = [9, 18, 27, 36, 45, 54]

export const ITEM_TYPES = [
  { value: 'item', labelKey: 'typeItem' },
  { value: 'command', labelKey: 'typeCommand' },
  { value: 'permission', labelKey: 'typePermission' },
  { value: 'dummy', labelKey: 'typeDummy' },
]

export const SHOP_PRESETS = [
  { id: 'blocks', labelKey: 'presetBlocks' },
  { id: 'food', labelKey: 'presetFood' },
  { id: 'ores', labelKey: 'presetOres' },
  { id: 'tools', labelKey: 'presetTools' },
]

export function createShopItem(slot = 10) {
  return {
    id: `si-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    slot,
    type: 'item',
    material: 'STONE',
    quantity: 1,
    name: '',
    lore: [],
    buyPrice: 10,
    sellPrice: 5,
    sellOnly: false,
    buyOnly: false,
    commands: [],
    permission: '',
  }
}

export function createShop(overrides = {}) {
  const shopId = overrides.shopId || 'shop'
  return {
    _id: `shop-${shopId}-${Math.random().toString(36).slice(2, 8)}`,
    shopId,
    name: '&6&lShop',
    size: 54,
    fillItem: { material: 'GRAY_STAINED_GLASS_PANE', name: ' ', quantity: 1 },
    items: [],
    menuSlot: 20,
    menuIcon: { material: 'CHEST', name: '&6&lShop', quantity: 1 },
    ...overrides,
  }
}

export function createProjectState() {
  const shop = createShop({ shopId: 'blocks', name: '&7&lBlocks', menuIcon: { material: 'GRASS_BLOCK', name: '&2&lBlocks', quantity: 1 } })
  shop.items = [createShopItem(10)]
  shop.items[0].material = 'STONE'
  shop.items[0].buyPrice = 5
  shop.items[0].sellPrice = 1
  return { shops: [shop], activeShopId: shop._id }
}

export function getActiveShop(state) {
  return state.shops.find(s => s._id === state.activeShopId) || state.shops[0] || null
}

export function buildItemLore(item) {
  const lines = [...(item.lore || []).filter(Boolean)]
  if (item.type === 'item') {
    if (item.buyPrice >= 0) lines.push(`&aBuy: &f$${formatMcPrice(item.buyPrice)}`)
    if (item.sellPrice >= 0) lines.push(`&cSell: &f$${formatMcPrice(item.sellPrice)}`)
    if (item.buyOnly) lines.push('&7Buy only')
    if (item.sellOnly) lines.push('&7Sell only')
  }
  if (item.type === 'command') lines.push('&dCommand item')
  if (item.type === 'permission') lines.push(`&ePerm: &f${item.permission || '?'}`)
  return lines
}

export function shopToMenuState(shop) {
  const items = {}
  shop.items.forEach(i => {
    if (i.slot == null) return
    items[i.slot] = {
      slot: i.slot,
      material: i.material || 'STONE',
      amount: i.quantity || 1,
      displayName: i.name || `&f${i.material}`,
      lore: buildItemLore(i),
    }
  })
  return {
    menuTitle: shop.name,
    inventoryType: 'CHEST',
    size: shop.size,
    items,
    openCommand: shop.shopId,
  }
}

function presetItems(entries) {
  return entries.map(([slot, material, buy, sell], idx) => ({
    ...createShopItem(slot),
    material,
    buyPrice: buy,
    sellPrice: sell,
    name: `&f${material.replace(/_/g, ' ')}`,
  }))
}

export function applyShopPreset(presetId) {
  switch (presetId) {
    case 'blocks':
      return createShop({
        shopId: 'blocks',
        name: '&7&lBlocks',
        menuSlot: 20,
        menuIcon: { material: 'GRASS_BLOCK', name: '&2&lBlocks', quantity: 1 },
        items: presetItems([[10, 'STONE', 2, 0.5], [11, 'COBBLESTONE', 1, 0.25], [12, 'OAK_LOG', 8, 2], [13, 'GLASS', 6, 1.5]]),
      })
    case 'food':
      return createShop({
        shopId: 'food',
        name: '&6&lFood',
        menuSlot: 21,
        menuIcon: { material: 'COOKED_BEEF', name: '&6&lFood', quantity: 1 },
        items: presetItems([[10, 'BREAD', 5, 1], [11, 'COOKED_BEEF', 12, 3], [12, 'GOLDEN_APPLE', 120, 30], [13, 'CAKE', 40, 10]]),
      })
    case 'ores':
      return createShop({
        shopId: 'ores',
        name: '&b&lOres',
        menuSlot: 22,
        menuIcon: { material: 'DIAMOND', name: '&b&lOres', quantity: 1 },
        items: presetItems([[10, 'COAL', 4, 1], [11, 'IRON_INGOT', 25, 6], [12, 'GOLD_INGOT', 45, 12], [13, 'DIAMOND', 500, 120]]),
      })
    case 'tools':
      return createShop({
        shopId: 'tools',
        name: '&e&lTools',
        menuSlot: 23,
        menuIcon: { material: 'DIAMOND_PICKAXE', name: '&e&lTools', quantity: 1 },
        items: presetItems([[10, 'WOODEN_PICKAXE', 15, 3], [11, 'STONE_PICKAXE', 25, 5], [12, 'IRON_PICKAXE', 120, 25], [13, 'DIAMOND_PICKAXE', 800, 150]]),
      })
    default:
      return createShop()
  }
}
