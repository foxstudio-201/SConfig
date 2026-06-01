import { useMemo } from 'react'
import { useI18n } from '../../../context/I18nContext'
import { getGuiLayout } from './deluxeMenusData'
import McItemIcon from './McItemIcon'

const SLOT_CLS = 'relative w-9 h-9 rounded border flex items-center justify-center text-[9px] font-mono transition-all select-none'
const ITEM_DOT = 'absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'

export default function GuiSlotPicker({
  inventoryType,
  size,
  items,
  selectedSlot,
  onSelectSlot,
  onRemoveItem,
}) {
  const { t } = useI18n()
  const layout = useMemo(() => getGuiLayout(inventoryType, size), [inventoryType, size])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{t('deluxeMenus.slotPicker')}</p>
        <div className="flex items-center gap-3 text-[9px] text-white/35">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-violet-500/50 bg-violet-500/20" /> {t('deluxeMenus.legendSelectable')}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-white/[0.04] bg-white/[0.02] opacity-40" /> {t('deluxeMenus.legendBlocked')}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded border border-emerald-500/40 bg-emerald-500/10 relative"><span className={ITEM_DOT} /></span> {t('deluxeMenus.legendHasItem')}</span>
        </div>
      </div>
      <div
        className="inline-grid gap-1 p-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] mx-auto"
        style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 2.25rem))` }}
      >
        {layout.cells.map((cell, idx) => {
          if (cell.slot == null) {
            return (
              <div
                key={`sp-${idx}`}
                className="w-9 h-9 rounded border border-transparent bg-transparent"
                title={cell.labelKey && cell.labelKey !== 'spacer' ? t(`deluxeMenus.${cell.labelKey}`) : undefined}
              />
            )
          }

          const hasItem = items[cell.slot] != null
          const selected = selectedSlot === cell.slot
          const blocked = !cell.selectable

          if (blocked) {
            return (
              <div
                key={`blk-${cell.slot}`}
                className={`${SLOT_CLS} border-white/[0.04] bg-white/[0.02] opacity-35 cursor-not-allowed`}
                title={cell.labelKey ? t(`deluxeMenus.${cell.labelKey}`) : t('deluxeMenus.slotBlocked')}
              >
                <span className="text-white/20">×</span>
              </div>
            )
          }

          return (
            <button
              key={`slot-${cell.slot}`}
              type="button"
              onClick={() => onSelectSlot(cell.slot)}
              onContextMenu={e => {
                if (hasItem) {
                  e.preventDefault()
                  onRemoveItem?.(cell.slot)
                }
              }}
              className={`${SLOT_CLS} ${
                selected
                  ? 'border-violet-400 bg-violet-500/25 ring-2 ring-violet-500/40 text-violet-200'
                  : hasItem
                    ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400/50'
                    : 'border-[#555] bg-[#373737] hover:border-violet-500/40 hover:bg-violet-500/10 text-white/50'
              }`}
              title={`${t('deluxeMenus.slot')} ${cell.slot}${hasItem ? ` · ${items[cell.slot].material}` : ''}`}
            >
              {hasItem ? (
                <>
                  <McItemIcon material={items[cell.slot].material} size="sm" />
                  <span className={ITEM_DOT} />
                </>
              ) : (
                cell.slot
              )}
            </button>
          )
        })}
      </div>
      <p className="text-[9px] text-white/25 text-center">{t('deluxeMenus.slotPickerHint')}</p>
    </div>
  )
}
