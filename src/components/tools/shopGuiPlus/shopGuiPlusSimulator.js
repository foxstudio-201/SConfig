import { formatMcPrice, formatLogTime } from '../shopShared'

export { formatLogTime }

export function simulateBuy(item, balance, t) {
  const time = new Date()
  if (item.type !== 'item') {
    return [{
      id: `buy-${Date.now()}`,
      time,
      kind: 'info',
      icon: '○',
      color: '#71717a',
      text: t('shopGuiPlus.testNotBuyable'),
    }]
  }
  if (item.buyOnly === false && item.buyPrice < 0) {
    return [{ id: `nb-${Date.now()}`, time, kind: 'info', icon: '○', color: '#71717a', text: t('shopGuiPlus.testBuyDisabled') }]
  }
  if (item.sellOnly) {
    return [{ id: `so-${Date.now()}`, time, kind: 'info', icon: '○', color: '#71717a', text: t('shopGuiPlus.testSellOnly') }]
  }
  const cost = item.buyPrice ?? 0
  if (balance < cost) {
    return [{
      id: `poor-${Date.now()}`, time, kind: 'error', icon: '✕', color: '#f87171',
      text: t('shopGuiPlus.testNotEnoughMoney', { need: formatMcPrice(cost), have: formatMcPrice(balance) }),
    }]
  }
  return [{
    id: `buy-${Date.now()}`, time, kind: 'success', icon: '↓', color: '#34d399',
    text: t('shopGuiPlus.testBought', { item: item.material, qty: item.quantity || 1, price: formatMcPrice(cost) }),
    balanceDelta: -cost,
  }]
}

export function simulateSell(item, stock, t) {
  const time = new Date()
  if (item.type !== 'item') {
    return [{ id: `ns-${Date.now()}`, time, kind: 'info', icon: '○', color: '#71717a', text: t('shopGuiPlus.testNotSellable') }]
  }
  if (item.sellPrice < 0 || item.buyOnly) {
    return [{ id: `bd-${Date.now()}`, time, kind: 'info', icon: '○', color: '#71717a', text: t('shopGuiPlus.testSellDisabled') }]
  }
  const qty = item.quantity || 1
  if (stock < qty) {
    return [{ id: `nost-${Date.now()}`, time, kind: 'error', icon: '✕', color: '#f87171', text: t('shopGuiPlus.testNoStock') }]
  }
  const gain = item.sellPrice ?? 0
  return [{
    id: `sell-${Date.now()}`, time, kind: 'success', icon: '↑', color: '#fcd34d',
    text: t('shopGuiPlus.testSold', { item: item.material, qty, price: formatMcPrice(gain) }),
    balanceDelta: gain,
    stockDelta: -qty,
  }]
}

export function simulateCommand(item, t) {
  if (item.type !== 'command') return []
  const time = new Date()
  return (item.commands || []).filter(Boolean).map((cmd, i) => ({
    id: `cmd-${Date.now()}-${i}`,
    time,
    kind: 'command',
    icon: '⚡',
    color: '#a78bfa',
    text: t('shopGuiPlus.testRunCommand', { cmd }),
    raw: cmd,
  }))
}

export function simulateShopOpen(shop, t) {
  return [{
    id: 'open',
    time: new Date(),
    kind: 'info',
    icon: '●',
    color: '#10b981',
    text: t('shopGuiPlus.testOpened', { shop: shop.shopId }),
  }]
}
