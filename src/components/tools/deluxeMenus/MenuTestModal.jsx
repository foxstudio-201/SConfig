import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { XMarkIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../../context/I18nContext'
import { getGuiLayout, CLICK_TYPES } from './deluxeMenusData'
import McMenuGui, { McText } from './McMenuGui'
import ItemCursorTooltip from './ItemCursorTooltip'
import {
  simulateSlotClick, simulateMenuOpen, simulateMenuClose,
  formatLogTime,
} from './deluxeMenusSimulator'

const CLICK_BTN = 'px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all'

function ChatBubble({ entry }) {
  return (
    <div className="flex gap-2 items-start animate-fade-in">
      <span className="text-[10px] text-white/25 font-mono shrink-0">{formatLogTime(entry.time)}</span>
      <div className="flex-1 min-w-0 rounded-lg bg-black/30 border border-white/[0.06] px-2.5 py-1.5">
        <McText text={entry.text} className="text-xs leading-relaxed" />
      </div>
    </div>
  )
}

function LogRow({ entry, t }) {
  const clickLabel = entry.clickType && entry.clickType !== 'open' && entry.clickType !== 'close'
    ? t(`deluxeMenus.${CLICK_TYPES.find(c => c.value === entry.clickType)?.labelKey || 'clickLeft'}`)
    : null

  return (
    <div className="flex gap-2 items-start py-1.5 border-b border-white/[0.04] last:border-0 animate-fade-in">
      <span className="text-[9px] text-white/20 font-mono w-14 shrink-0 pt-0.5">{formatLogTime(entry.time)}</span>
      <span className="text-sm shrink-0 w-5 text-center" style={{ color: entry.color }}>{entry.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          {entry.slot != null && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 font-mono">
              #{entry.slot}
            </span>
          )}
          {clickLabel && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-fuchsia-500/15 text-fuchsia-300/80">{clickLabel}</span>
          )}
        </div>
        {entry.itemName && (
          <McText text={entry.itemName} className="text-[10px] block text-white/50 mt-0.5" />
        )}
        {entry.kind === 'message' || entry.kind === 'broadcast' ? (
          <McText text={entry.text} className="text-xs block mt-0.5" />
        ) : (
          <p className="text-xs text-white/75 mt-0.5 font-mono break-all">{entry.text}</p>
        )}
        {entry.raw && entry.raw !== entry.text && (
          <p className="text-[9px] text-white/25 mt-0.5 font-mono truncate" title={entry.raw}>{entry.raw}</p>
        )}
      </div>
    </div>
  )
}

export default function MenuTestModal({ state, onClose }) {
  const { t } = useI18n()
  const [clickType, setClickType] = useState('left')
  const [menuOpen, setMenuOpen] = useState(true)
  const [logs, setLogs] = useState([])
  const [hoveredSlot, setHoveredSlot] = useState(null)
  const [cursorPos, setCursorPos] = useState(null)
  const [flashSlot, setFlashSlot] = useState(null)
  const logRef = useRef(null)

  const layout = useMemo(() => getGuiLayout(state.inventoryType, state.size), [state.inventoryType, state.size])
  const hoveredItem = hoveredSlot != null ? state.items[hoveredSlot] : null

  const appendLogs = useCallback(entries => {
    setLogs(prev => [...entries, ...prev].slice(0, 200))
  }, [])

  useEffect(() => {
    appendLogs(simulateMenuOpen(state))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [logs])

  const handleSlotAction = useCallback((slot, type) => {
    if (!menuOpen) return
    const item = state.items[slot]
    if (!item) {
      appendLogs([{
        id: `empty-${Date.now()}`,
        time: new Date(),
        level: 'info',
        slot,
        clickType: type,
        text: t('deluxeMenus.testEmptySlot'),
        icon: '○',
        color: '#71717a',
      }])
      return
    }

    setFlashSlot(slot)
    setTimeout(() => setFlashSlot(null), 350)

    const entries = simulateSlotClick(item, type, slot)
    appendLogs(entries)

    if (entries.some(e => e.kind === 'close')) {
      setTimeout(() => {
        setMenuOpen(false)
        appendLogs(simulateMenuClose(state))
      }, 200)
    }
  }, [menuOpen, state, appendLogs, t])

  const handleSlotClick = useCallback((slot) => {
    handleSlotAction(slot, clickType)
  }, [handleSlotAction, clickType])

  const handleReopen = useCallback(() => {
    setMenuOpen(true)
    appendLogs(simulateMenuOpen(state))
  }, [state, appendLogs])

  const handleSlotHover = useCallback((slot, e) => {
    setHoveredSlot(slot)
    if (slot == null) {
      setCursorPos(null)
    } else if (e && state.items[slot]) {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
  }, [state.items])

  const handleSlotHoverMove = useCallback((slot, e) => {
    if (slot != null && e && state.items[slot]) {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
  }, [state.items])

  const chatEntries = logs.filter(e => e.kind === 'message' || e.kind === 'broadcast')

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div
        className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-white/[0.1] bg-[#0c0c16] shadow-2xl overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-gradient-to-r from-fuchsia-500/10 to-transparent flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <PlayIcon className="w-4 h-4 text-fuchsia-400" />
              <h2 className="text-base font-bold text-white">{t('deluxeMenus.testModeTitle')}</h2>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${menuOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/[0.06] text-white/40 border border-white/[0.08]'}`}>
                {menuOpen ? t('deluxeMenus.testOpen') : t('deluxeMenus.testClosed')}
              </span>
            </div>
            <p className="text-[11px] text-white/35 mt-0.5">{t('deluxeMenus.testModeHint')}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 border-b border-white/[0.06] bg-black/20 flex-shrink-0">
          <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mr-1">{t('deluxeMenus.testClickType')}</span>
          {CLICK_TYPES.map(ct => (
            <button
              key={ct.value}
              type="button"
              onClick={() => setClickType(ct.value)}
              className={`${CLICK_BTN} ${clickType === ct.value ? 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-200' : 'border-white/[0.08] text-white/45 hover:text-white/70'}`}
            >
              {t(`deluxeMenus.${ct.labelKey}`)}
            </button>
          ))}
          <div className="flex-1" />
          {!menuOpen && (
            <button type="button" onClick={handleReopen} className={`${CLICK_BTN} bg-emerald-500/15 border-emerald-500/30 text-emerald-300`}>
              {t('deluxeMenus.testReopen')}
            </button>
          )}
          <button type="button" onClick={() => setLogs([])} className={`${CLICK_BTN} border-white/[0.08] text-white/40 hover:text-white/60 flex items-center gap-1`}>
            <TrashIcon className="w-3.5 h-3.5" />{t('deluxeMenus.testClearLog')}
          </button>
        </div>

        <div className="relative overflow-hidden">
          <div className="min-w-0 p-6 pr-[356px] sm:pr-[404px] flex flex-col items-center gap-4 bg-[#080810]/50">
            <div className={`transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
              <McMenuGui
                state={state}
                layout={layout}
                size="lg"
                interactive={menuOpen}
                hoveredSlot={hoveredSlot}
                flashSlot={flashSlot}
                onSlotClick={handleSlotClick}
                onSlotContextMenu={(slot) => handleSlotAction(slot, 'right')}
                onSlotHover={handleSlotHover}
                onSlotHoverMove={handleSlotHoverMove}
                className="w-full max-w-[520px]"
              />
            </div>

            {hoveredItem && menuOpen && cursorPos && (
              <ItemCursorTooltip
                item={hoveredItem}
                slot={hoveredSlot}
                clickType={clickType}
                cursor={cursorPos}
                t={t}
              />
            )}

            {!menuOpen && (
              <div className="text-center px-4 py-3 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] max-w-md">
                <p className="text-sm text-white/50">{t('deluxeMenus.testClosedHint')}</p>
                <button type="button" onClick={handleReopen} className="mt-2 px-4 py-1.5 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-200 text-xs font-bold">
                  {t('deluxeMenus.testReopenMenu', { cmd: state.openCommand })}
                </button>
              </div>
            )}

          </div>

          <div className="absolute inset-y-0 right-0 w-[340px] sm:w-[380px] flex flex-col min-h-0 overflow-hidden border-l border-white/[0.08] bg-[#0a0a12]">
            {chatEntries.length > 0 && (
              <div className="flex-shrink-0 border-b border-white/[0.06] p-3 max-h-[140px] overflow-y-auto custom-dropdown-scroll">
                <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-2">{t('deluxeMenus.testChat')}</p>
                <div className="flex flex-col gap-2">
                  {chatEntries.slice(0, 8).map(e => (
                    <ChatBubble key={e.id} entry={e} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col min-h-0 p-3">
              <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-2 flex items-center justify-between">
                {t('deluxeMenus.testActionLog')}
                <span className="text-white/20 normal-case">{logs.length}</span>
              </p>
              <div ref={logRef} className="flex-1 overflow-y-auto custom-dropdown-scroll rounded-xl bg-black/40 border border-white/[0.06] p-2">
                {logs.length === 0 ? (
                  <p className="text-xs text-white/25 text-center py-8">{t('deluxeMenus.testLogEmpty')}</p>
                ) : (
                  logs.map(e => (
                    e.kind !== 'message' && e.kind !== 'broadcast' ? (
                      <LogRow key={e.id} entry={e} t={t} />
                    ) : null
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
