import { useMemo, useState, useCallback } from 'react'
import { PlayIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../../context/I18nContext'
import { getGuiLayout } from './deluxeMenusData'
import McMenuGui from './McMenuGui'
import ItemCursorTooltip from './ItemCursorTooltip'

export default function MenuPreview({ state, selectedSlot, onSelectSlot, onOpenTest }) {
  const { t } = useI18n()
  const [hoveredSlot, setHoveredSlot] = useState(null)
  const [cursorPos, setCursorPos] = useState(null)

  const layout = useMemo(
    () => getGuiLayout(state.inventoryType, state.size),
    [state.inventoryType, state.size],
  )

  const hoveredItem = hoveredSlot != null ? state.items[hoveredSlot] : null
  const itemCount = Object.keys(state.items || {}).length

  const handleSlotClick = useCallback((slot) => {
    onSelectSlot?.(slot)
  }, [onSelectSlot])

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

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0a0a14]/80 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-fuchsia-300/90 uppercase tracking-wide">{t('deluxeMenus.previewTitle')}</p>
          <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{t('deluxeMenus.previewHint')}</p>
        </div>
        <button
          type="button"
          onClick={onOpenTest}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-200 text-[10px] font-bold hover:bg-fuchsia-500/25 transition-all"
        >
          <PlayIcon className="w-3.5 h-3.5" />
          {t('deluxeMenus.openTestMode')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-dropdown-scroll p-4 flex flex-col gap-4">
        <McMenuGui
          state={state}
          layout={layout}
          size="md"
          interactive
          selectedSlot={selectedSlot}
          hoveredSlot={hoveredSlot}
          onSlotClick={handleSlotClick}
          onSlotHover={handleSlotHover}
          onSlotHoverMove={handleSlotHoverMove}
          className="w-full"
        />

        {hoveredItem && cursorPos && (
          <ItemCursorTooltip
            item={hoveredItem}
            slot={hoveredSlot}
            cursor={cursorPos}
            t={t}
            showCommands={false}
          />
        )}

        <div className="mt-auto pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-[10px] text-white/30">
          <span className="font-mono">{state.inventoryType}</span>
          <span>/{state.openCommand}</span>
          <span>{t('deluxeMenus.previewItemCount', { count: itemCount })}</span>
        </div>
      </div>
    </div>
  )
}
