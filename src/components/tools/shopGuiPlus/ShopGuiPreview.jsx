import { PlayIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../../context/I18nContext'
import { getGuiLayout } from '../deluxeMenus/deluxeMenusData'
import McMenuGui from '../deluxeMenus/McMenuGui'
import ItemCursorTooltip from '../deluxeMenus/ItemCursorTooltip'
import { shopToMenuState } from './shopGuiPlusData'
import { useState, useMemo, useCallback } from 'react'

export default function ShopGuiPreview({ shop, onOpenTest }) {
  const { t } = useI18n()
  const [hoveredSlot, setHoveredSlot] = useState(null)
  const [cursorPos, setCursorPos] = useState(null)

  const menuState = useMemo(() => shopToMenuState(shop), [shop])
  const layout = useMemo(() => getGuiLayout('CHEST', shop.size), [shop.size])
  const hoveredItem = hoveredSlot != null ? menuState.items[hoveredSlot] : null

  const handleSlotHover = useCallback((slot, e) => {
    setHoveredSlot(slot)
    if (slot == null) setCursorPos(null)
    else if (e && menuState.items[slot]) setCursorPos({ x: e.clientX, y: e.clientY })
  }, [menuState.items])

  const handleSlotHoverMove = useCallback((slot, e) => {
    if (slot != null && e && menuState.items[slot]) setCursorPos({ x: e.clientX, y: e.clientY })
  }, [menuState.items])

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0a0a14]/80 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-emerald-300/90 uppercase tracking-wide">{t('shopGuiPlus.previewTitle')}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{t('shopGuiPlus.previewHint')}</p>
        </div>
        <button type="button" onClick={onOpenTest}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-[10px] font-bold hover:bg-emerald-500/25 transition-all">
          <PlayIcon className="w-3.5 h-3.5" />{t('shopGuiPlus.openTestMode')}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-dropdown-scroll p-4">
        <McMenuGui
          state={menuState}
          layout={layout}
          size="md"
          interactive
          hoveredSlot={hoveredSlot}
          onSlotHover={handleSlotHover}
          onSlotHoverMove={handleSlotHoverMove}
          className="w-full"
        />
        {hoveredItem && cursorPos && (
          <ItemCursorTooltip item={hoveredItem} slot={hoveredSlot} cursor={cursorPos} t={t} showCommands={false} />
        )}
        <div className="mt-3 pt-2 border-t border-white/[0.04] flex justify-between text-[10px] text-white/30 font-mono">
          <span>/{shop.shopId}</span>
          <span>{shop.items.length} items</span>
        </div>
      </div>
    </div>
  )
}
