import { materialToMcId } from '../shopShared'

export const SHOP_TYPES = [
  { value: 'admin', labelKey: 'shopTypeAdmin' },
  { value: 'selling', labelKey: 'shopTypeSelling' },
  { value: 'buying', labelKey: 'shopTypeBuying' },
  { value: 'trading', labelKey: 'shopTypeTrading' },
]

export const OBJECT_TYPES = [
  { value: 'VILLAGER', labelKey: 'objectVillager' },
  { value: 'WANDERING_TRADER', labelKey: 'objectWanderingTrader' },
  { value: 'COW', labelKey: 'objectCow' },
  { value: 'PIG', labelKey: 'objectPig' },
  { value: 'SHEEP', labelKey: 'objectSheep' },
  { value: 'IRON_GOLEM', labelKey: 'objectGolem' },
  { value: 'ARMOR_STAND', labelKey: 'objectArmorStand' },
  { value: 'SIGN', labelKey: 'objectSign' },
  { value: 'CITIZENS', labelKey: 'objectCitizens' },
]

export const SK_PRESETS = [
  { id: 'emerald', labelKey: 'presetEmerald' },
  { id: 'blacksmith', labelKey: 'presetBlacksmith' },
  { id: 'food', labelKey: 'presetFoodShop' },
]

export function createStack(material = 'EMERALD', amount = 1) {
  return { material, amount: amount || 1, name: '', lore: [] }
}

export function createTrade(overrides = {}) {
  return {
    id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    cost1: createStack('EMERALD', 5),
    cost2: null,
    result: createStack('DIAMOND', 1),
    maxUses: -1,
    ...overrides,
  }
}

export function createShopkeeper(overrides = {}) {
  return {
    _id: `sk-${Math.random().toString(36).slice(2, 10)}`,
    name: '&aShopkeeper',
    shopType: 'admin',
    objectType: 'VILLAGER',
    villagerProfession: 'NONE',
    currencyItem: 'EMERALD',
    trades: [createTrade()],
    location: { world: 'world', x: 0, y: 64, z: 0 },
    ...overrides,
  }
}

export function createProjectState() {
  const sk = createShopkeeper({ name: '&6&lTrader' })
  return { shopkeepers: [sk], activeId: sk._id }
}

export function getActiveShopkeeper(state) {
  return state.shopkeepers.find(s => s._id === state.activeId) || state.shopkeepers[0] || null
}

export function stackToDisplayName(stack) {
  if (!stack?.material) return ''
  if (stack.name) return stack.name
  return `&f${stack.material.replace(/_/g, ' ')}`
}

export function stackToLore(stack) {
  const lines = [...(stack.lore || []).filter(Boolean)]
  if (stack.amount > 1) lines.push(`&7×${stack.amount}`)
  return lines
}

export function applyShopkeeperPreset(id) {
  switch (id) {
    case 'emerald':
      return createShopkeeper({
        name: '&a&lEmerald Trader',
        trades: [
          createTrade({ cost1: createStack('EMERALD', 1), result: createStack('DIAMOND', 1) }),
          createTrade({ cost1: createStack('DIAMOND', 1), result: createStack('EMERALD', 4) }),
        ],
      })
    case 'blacksmith':
      return createShopkeeper({
        name: '&7&lBlacksmith',
        villagerProfession: 'TOOLSMITH',
        trades: [
          createTrade({ cost1: createStack('IRON_INGOT', 8), result: createStack('IRON_SWORD', 1) }),
          createTrade({ cost1: createStack('IRON_INGOT', 5), cost2: createStack('COAL', 3), result: createStack('IRON_PICKAXE', 1) }),
        ],
      })
    case 'food':
      return createShopkeeper({
        name: '&6&lFood Stall',
        trades: [
          createTrade({ cost1: createStack('EMERALD', 2), result: createStack('BREAD', 8) }),
          createTrade({ cost1: createStack('EMERALD', 5), result: createStack('COOKED_BEEF', 16) }),
        ],
      })
    default:
      return createShopkeeper()
  }
}

export function buildTradeItemYaml(stack, indent, key) {
  if (!stack?.material) return []
  const pad = ' '.repeat(indent)
  const lines = [`${pad}${key}:`]
  lines.push(`${pad}  id: '${materialToMcId(stack.material)}'`)
  if (stack.amount && stack.amount !== 1) lines.push(`${pad}  count: ${stack.amount}`)
  if (stack.name) {
    lines.push(`${pad}  components:`)
    lines.push(`${pad}    minecraft:custom_name: '${stack.name.replace(/'/g, "\\'")}'`)
  }
  return lines
}
