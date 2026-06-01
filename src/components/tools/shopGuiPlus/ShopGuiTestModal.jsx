import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { XMarkIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../../context/I18nContext'
import { getGuiLayout } from '../deluxeMenus/deluxeMenusData'
import McMenuGui, { McText } from '../deluxeMenus/McMenuGui'
import ItemCursorTooltip from '../deluxeMenus/ItemCursorTooltip'
import { shopToMenuState } from './shopGuiPlusData'
import { formatMcPrice } from '../shopShared'
import {
  simulateBuy, simulateSell, simulateCommand, simulateShopOpen, formatLogTime,
} from './shopGuiPlusSimulator'

const CLICK_BTN = 'px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all'
const MODES = [
  { value: 'buy', labelKey: 'testModeBuy' },
  { value: 'sell', labelKey: 'testModeSell' },
]

function LogRow({ entry }) {
  return (
    <div className="flex gap-2 items-start py-1.5 border-b border-white/[0.04] last:border-0 animate-fade-in">
      <span className="text-[9px] text-white/20 font-mono w-14 shrink-0 pt-0.5">{formatLogTime(entry.time)}</span>
      <span className="text-sm shrink-0 w-5 text-center" style={{ color: entry.color }}>{entry.icon}</span>
      <p className="text-xs text-white/75 font-mono break-all flex-1">{entry.text}</p>
    </div>
  )
}

export default function ShopGuiTestModal({ shop, onClose }) {
  const { t } = useI18n()
  const [mode, setMode] = useState('buy')
  const [balance, setBalance] = useState(1000)
  const [stock, setStock] = useState(64)
  const [logs, setLogs] = useState([])
  const [hoveredSlot, setHoveredSlot] = useState(null)
  const [cursorPos, setCursorPos] = useState(null)
  const [flashSlot, setFlashSlot] = useState(null)
  const logRef = useRef(null)

  const menuState = useMemo(() => shopToMenuState(shop), [shop])
  const layout = useMemo(() => getGuiLayout('CHEST', shop.size), [shop.size])
  const shopItemBySlot = useMemo(() => {
    const m = {}
    shop.items.forEach(i => { if (i.slot != null) m[i.slot] = i })
    return m
  }, [shop.items])
  const hoveredMenuItem = hoveredSlot != null ? menuState.items[hoveredSlot] : null

  const appendLogs = useCallback(entries => setLogs(prev => [...entries, ...prev].slice(0, 200)), [])

  useEffect(() => { appendLogs(simulateShopOpen(shop, t)) }, [])
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 0 }, [logs])

  const handleSlotClick = useCallback(slot => {
    const item = shopItemBySlot[slot]
    if (!item) {
      appendLogs([{ id: `empty-${Date.now()}`, time: new Date(), kind: 'info', icon: '○', color: '#71717a', text: t('shopGuiPlus.testEmptySlot') }])
      return
    }
    setFlashSlot(slot)
    setTimeout(() => setFlashSlot(null), 350)

    let entries = []
    if (mode === 'buy') {
      entries = simulateBuy(item, balance, t)
      const delta = entries.find(e => e.balanceDelta)?.balanceDelta
      if (delta) setBalance(b => Math.max(0, b + delta))
      if (item.type === 'command') entries = [...entries, ...simulateCommand(item, t)]
    } else {
      entries = simulateSell(item, stock, t)
      const bal = entries.find(e => e.balanceDelta)?.balanceDelta
      const st = entries.find(e => e.stockDelta)?.stockDelta
      if (bal) setBalance(b => b + bal)
      if (st) setStock(s => Math.max(0, s + st))
    }
    appendLogs(entries)
  }, [shopItemBySlot, mode, balance, stock, t, appendLogs, shop])

  const handleSlotHover = useCallback((slot, e) => {
    setHoveredSlot(slot)
    if (slot == null) setCursorPos(null)
    else if (e && menuState.items[slot]) setCursorPos({ x: e.clientX, y: e.clientY })
  }, [menuState.items])

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-white/[0.1] bg-[#0c0c16] shadow-2xl overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-gradient-to-r from-emerald-500/10 to-transparent flex-shrink-0">
          <PlayIcon className="w-4 h-4 text-emerald-400" />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white">{t('shopGuiPlus.testModeTitle')}</h2>
            <p className="text-[11px] text-white/35">{t('shopGuiPlus.testModeHint')}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.08] text-white/50"><XMarkIcon className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 border-b border-white/[0.06] bg-black/20 flex-shrink-0">
          {MODES.map(m => (
            <button key={m.value} type="button" onClick={() => setMode(m.value)}
              className={`${CLICK_BTN} ${mode === m.value ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' : 'border-white/[0.08] text-white/45'}`}>
              {t(`shopGuiPlus.${m.labelKey}`)}
            </button>
          ))}
          <span className="text-[10px] text-white/40 font-mono ml-2">$ {formatMcPrice(balance)}</span>
          <span className="text-[10px] text-white/30 font-mono">{t('shopGuiPlus.testStock')}: {stock}</span>
          <div className="flex-1" />
          <button type="button" onClick={() => setLogs([])} className={`${CLICK_BTN} border-white/[0.08] text-white/40 flex items-center gap-1`}>
            <TrashIcon className="w-3.5 h-3.5" />{t('shopGuiPlus.testClearLog')}
          </button>
        </div>

        <div className="relative overflow-hidden">
          <div className="min-w-0 p-6 pr-[356px] sm:pr-[404px] flex flex-col items-center gap-3 bg-[#080810]/50">
            <McText text={shop.name} className="text-sm font-bold" />
            <McMenuGui state={menuState} layout={layout} size="lg" interactive hoveredSlot={hoveredSlot} flashSlot={flashSlot}
              onSlotClick={handleSlotClick} onSlotHover={handleSlotHover} className="w-full max-w-[520px]" />
            {hoveredMenuItem && cursorPos && (
              <ItemCursorTooltip item={hoveredMenuItem} slot={hoveredSlot} cursor={cursorPos} t={t} showCommands={false} />
            )}
          </div>
          <div className="absolute inset-y-0 right-0 w-[340px] sm:w-[380px] flex flex-col min-h-0 overflow-hidden border-l border-white/[0.08] bg-[#0a0a12] p-3">
            <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-2 flex justify-between">
              {t('shopGuiPlus.testActionLog')}<span className="text-white/20">{logs.length}</span>
            </p>
            <div ref={logRef} className="flex-1 overflow-y-auto custom-dropdown-scroll rounded-xl bg-black/40 border border-white/[0.06] p-2">
              {logs.map(e => <LogRow key={e.id} entry={e} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
