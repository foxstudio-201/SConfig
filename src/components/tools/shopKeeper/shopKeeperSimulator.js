import { formatLogTime } from '../shopShared'

export { formatLogTime }

export function simulateTrade(trade, t) {
  const time = new Date()
  const c1 = trade.cost1
  const c2 = trade.cost2
  const r = trade.result
  if (!c1?.material || !r?.material) {
    return [{ id: `bad-${Date.now()}`, time, kind: 'error', icon: '✕', color: '#f87171', text: t('shopKeeper.testInvalidTrade') }]
  }
  const costText = c2?.material
    ? `${c1.amount}× ${c1.material} + ${c2.amount}× ${c2.material}`
    : `${c1.amount}× ${c1.material}`
  return [{
    id: `trade-${Date.now()}`,
    time,
    kind: 'success',
    icon: '⇄',
    color: '#fbbf24',
    text: t('shopKeeper.testTraded', { cost: costText, result: `${r.amount}× ${r.material}` }),
  }]
}

export function simulateOpen(sk, t) {
  return [{
    id: 'open',
    time: new Date(),
    kind: 'info',
    icon: '●',
    color: '#f59e0b',
    text: t('shopKeeper.testOpened', { name: sk.name.replace(/&[0-9a-fk-or]/gi, '') }),
  }]
}
