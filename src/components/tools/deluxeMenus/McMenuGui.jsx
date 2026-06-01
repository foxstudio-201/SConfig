import { useMemo } from 'react'
import { parseMcText } from '../placeholder/placeholderApiExport'
import McItemIcon from './McItemIcon'

export function McText({ text, className = '', style = {} }) {
  const parts = useMemo(() => parseMcText(text || ''), [text])
  if (!text?.trim()) return null
  return (
    <span className={`font-mono ${className}`} style={style}>
      {parts.map((p, i) => (
        <span key={i} style={{ color: p.color, ...p.style }}>{p.text}</span>
      ))}
    </span>
  )
}

const SIZE_MAP = {
  sm: { slot: 'w-9 h-9', icon: 'sm', amount: 'text-[8px]', gap: 'gap-0.5', pad: 'p-2.5' },
  md: { slot: 'w-11 h-11', icon: 'md', amount: 'text-[9px]', gap: 'gap-1', pad: 'p-3' },
  lg: { slot: 'w-12 h-12', icon: 'lg', amount: 'text-[10px]', gap: 'gap-1', pad: 'p-4' },
}

export function McMenuSlot({
  cell,
  item,
  blocked,
  size = 'md',
  interactive = false,
  selected = false,
  flash = false,
  onClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
}) {
  const s = SIZE_MAP[size] || SIZE_MAP.md

  if (cell.slot == null) {
    return <div className={s.slot} />
  }

  if (blocked) {
    return (
      <div
        className={`${s.slot} rounded border border-[#1a1a1a] bg-[#141414]/60 opacity-30`}
        title="Blocked"
      />
    )
  }

  const base = `${s.slot} rounded border relative flex items-center justify-center transition-all duration-150`
  const emptyCls = `${base} border-[#555] bg-[#373737] shadow-[inset_0_2px_0_rgba(255,255,255,0.07),inset_0_-2px_0_rgba(0,0,0,0.25)]`
  const filledCls = `${base} border-[#666] bg-[#3d3d3d] shadow-[inset_0_2px_0_rgba(255,255,255,0.08),inset_0_-2px_0_rgba(0,0,0,0.3)]`
  const ring = selected ? 'ring-2 ring-fuchsia-400/70 ring-offset-1 ring-offset-[#c6c6c6]' : ''
  const hoverCls = interactive && item ? 'hover:brightness-110 hover:border-[#888] cursor-pointer active:scale-95' : ''
  const hoverEmpty = interactive && !item ? 'hover:border-[#777] cursor-default' : ''
  const flashCls = flash ? 'animate-pulse ring-2 ring-yellow-400/60' : ''

  const inner = item ? (
    <>
      <McItemIcon material={item.material} size={s.icon} glow={item.glow} nativeTitle={!interactive} />
      {item.amount > 1 && (
        <span className={`absolute bottom-0.5 right-0.5 ${s.amount} font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] z-10`}>
          {item.amount}
        </span>
      )}
    </>
  ) : null

  const cls = `${item ? filledCls : emptyCls} ${ring} ${hoverCls} ${hoverEmpty} ${flashCls}`

  if (interactive) {
    return (
      <button
        type="button"
        className={cls}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
      >
        {inner}
      </button>
    )
  }

  return (
    <div className={cls} title={item?.material}>
      {inner}
    </div>
  )
}

export default function McMenuGui({
  state,
  layout,
  size = 'md',
  interactive = false,
  selectedSlot = null,
  hoveredSlot = null,
  flashSlot = null,
  onSlotClick,
  onSlotContextMenu,
  onSlotHover,
  onSlotHoverMove,
  className = '',
}) {
  const s = SIZE_MAP[size] || SIZE_MAP.md

  return (
    <div className={`rounded-md overflow-hidden border-[3px] border-[#1f1f1f] shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${className}`}>
      <div className="px-3 py-2 bg-gradient-to-b from-[#d4d4d4] to-[#b8b8b8] border-b-[3px] border-[#555]">
        <McText text={state.menuTitle} className="text-sm font-bold" style={{ textShadow: '1px 1px 0 #fff' }} />
      </div>
      <div className={`bg-gradient-to-b from-[#c6c6c6] to-[#a8a8a8] ${s.pad}`}>
        <div
          className={`grid ${s.gap} mx-auto w-fit`}
          style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` }}
        >
          {layout.cells.map((cell, idx) => (
            <McMenuSlot
              key={`gui-${idx}-${cell.slot}`}
              cell={cell}
              item={cell.slot != null ? state.items[cell.slot] : null}
              blocked={cell.slot != null && !cell.selectable}
              size={size}
              interactive={interactive}
              selected={selectedSlot === cell.slot}
              flash={flashSlot === cell.slot}
              onClick={cell.slot != null ? () => onSlotClick?.(cell.slot, 'left') : undefined}
              onContextMenu={cell.slot != null ? e => {
                e.preventDefault()
                onSlotContextMenu?.(cell.slot, 'right')
              } : undefined}
              onMouseEnter={cell.slot != null ? e => onSlotHover?.(cell.slot, e) : undefined}
              onMouseMove={cell.slot != null && state.items[cell.slot] ? e => onSlotHoverMove?.(cell.slot, e) : undefined}
              onMouseLeave={() => {
                onSlotHover?.(null, null)
                onSlotHoverMove?.(null, null)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
