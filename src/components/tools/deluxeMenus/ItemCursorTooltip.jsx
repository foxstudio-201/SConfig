import { useState, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { McText } from './McMenuGui'
import McItemIcon from './McItemIcon'
import { CLICK_TYPE_KEYS } from './deluxeMenusSimulator'

const OFFSET = 12
const PAD = 8

function clampPosition(cursorX, cursorY, width, height) {
  let left = cursorX + OFFSET
  let top = cursorY + OFFSET
  if (left + width > window.innerWidth - PAD) left = cursorX - width - OFFSET
  if (top + height > window.innerHeight - PAD) top = cursorY - height - OFFSET
  return {
    left: Math.max(PAD, left),
    top: Math.max(PAD, top),
  }
}

export default function ItemCursorTooltip({ item, slot, clickType = 'left', cursor, t, showCommands = true }) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ left: cursor.x + OFFSET, top: cursor.y + OFFSET })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    setPos(clampPosition(cursor.x, cursor.y, width, height))
  }, [cursor.x, cursor.y, item, clickType, showCommands])

  if (!item || !cursor) return null

  const commands = item[CLICK_TYPE_KEYS[clickType]] || []

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[200] pointer-events-none animate-fade-in"
      style={{ left: pos.left, top: pos.top }}
    >
      <div className="min-w-[180px] max-w-[280px] rounded-lg border-2 border-[#500050] bg-[#100010]/95 shadow-[0_4px_24px_rgba(0,0,0,0.85)] overflow-hidden">
        <div className="px-2.5 py-2 border-b border-[#500050]/60 bg-[#180018]/80">
          <div className="flex items-center gap-2">
            <McItemIcon material={item.material} size="sm" glow={item.glow} nativeTitle={false} />
            <div className="min-w-0 flex-1">
              <McText text={item.displayName} className="text-sm font-bold block leading-tight" />
              <span className="text-[9px] text-white/30 font-mono">#{slot}</span>
            </div>
          </div>
        </div>
        {item.lore?.filter(Boolean).length > 0 && (
          <div className="px-2.5 py-1.5 space-y-0.5">
            {item.lore.filter(Boolean).map((line, i) => (
              <McText key={i} text={line} className="text-[11px] block text-white/75 leading-snug" />
            ))}
          </div>
        )}
        {showCommands && (
          <div className="px-2.5 py-1.5 border-t border-[#500050]/40 bg-black/30">
            <p className="text-[8px] text-white/25 uppercase tracking-wider mb-1">{t('deluxeMenus.testWillRun')}</p>
            {commands.length ? (
              commands.map((cmd, i) => (
                <p key={i} className="text-[10px] font-mono text-emerald-300/85 leading-relaxed break-all">{cmd}</p>
              ))
            ) : (
              <p className="text-[10px] text-white/30 italic">{t('deluxeMenus.testNoCommands')}</p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
