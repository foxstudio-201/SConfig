import { useId, useState } from 'react'
import { CHIP_NODES, NODE_COLORS, CORE_COLORS } from './smartSpawnerData'

const DESC_KEYS = {
  general: 'descGeneral',
  spawner: 'descSpawner',
  break: 'descBreak',
  economy: 'descEconomy',
  hopper: 'descHopper',
  bedrock: 'descBedrock',
  visual: 'descVisual',
  logging: 'descLogging',
  database: 'descDatabase',
  performance: 'descPerformance',
}

const CX = 180
const CY = 180
const RX = 120
const RY = 102
const CORE_R = 44

function polarEllipse(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + RX * Math.cos(rad), y: CY + RY * Math.sin(rad) }
}

function roundedRectPath(cx, cy, w, h, r) {
  const x = cx - w / 2
  const y = cy - h / 2
  return `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`
}

function ChipTooltip({ t, nodeId, visible }) {
  if (!visible || !nodeId) return null
  const node = CHIP_NODES.find(n => n.id === nodeId)
  if (!node) return null
  return (
    <div
      className="ss-chip-tooltip rounded-xl border border-emerald-400/35 bg-[#0a1612]/95 backdrop-blur-md px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.15)] pointer-events-none"
      role="tooltip"
    >
      <p className="text-[13px] font-semibold text-emerald-100 leading-tight">
        {t(`smartSpawner.${node.labelKey}`)}
      </p>
      <p className="text-[11px] text-white/55 mt-1.5 leading-relaxed max-w-[220px]">
        {t(`smartSpawner.${DESC_KEYS[nodeId]}`)}
      </p>
      <p className="text-[10px] text-emerald-400/50 mt-2 font-medium">{t('smartSpawner.tooltipClick')}</p>
    </div>
  )
}

export default function SmartSpawnerChipVisual({
  t,
  activeId,
  onSelect,
  coreLabel = 'SS',
  stats,
}) {
  const uid = useId().replace(/:/g, '')
  const [hoverId, setHoverId] = useState(null)
  const tooltipId = hoverId || activeId
  const core = CORE_COLORS.active

  return (
    <div className="ss-chip-panel w-full max-w-[360px] mx-auto">
      <p className="text-[10px] text-white/30 text-center mb-2 px-1">{t('smartSpawner.chipHint')}</p>

      <div className="ss-chip-scanline relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0a120e]">
        <div
          className="ss-chip-core-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none blur-3xl"
          style={{ background: core.glow }}
        />

        <svg viewBox="0 0 360 360" className="w-full h-full relative z-[1]" aria-hidden>
          <defs>
            <filter id={`ss-glow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id={`ss-grid-${uid}`} width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(16,185,129,0.06)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id={`ss-bg-${uid}`} cx="50%" cy="48%" r="52%">
              <stop offset="0%" stopColor="rgba(16,185,129,0.16)" />
              <stop offset="100%" stopColor="rgba(10,18,14,0)" />
            </radialGradient>
          </defs>

          <rect width="360" height="360" fill={`url(#ss-grid-${uid})`} />
          <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill={`url(#ss-bg-${uid})`} />

          <ellipse
            cx={CX}
            cy={CY}
            rx={RX}
            ry={RY}
            fill="none"
            stroke="rgba(16,185,129,0.14)"
            strokeWidth="1"
            strokeDasharray="5 8"
            className="ss-orbit-ring"
          />

          {CHIP_NODES.map((node, i) => {
            const pos = polarEllipse(node.angle)
            const active = activeId === node.id
            const hovered = hoverId === node.id
            const colors = hovered ? NODE_COLORS.hover : active ? NODE_COLORS.active : NODE_COLORS.idle
            const delay = `${i * 0.2}s`

            return (
              <g key={`trace-${node.id}`}>
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={CX}
                  y2={CY}
                  stroke={colors.line}
                  strokeWidth={active || hovered ? 2 : 1}
                  strokeOpacity={active || hovered ? 0.4 : 0.15}
                />
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={CX}
                  y2={CY}
                  stroke={colors.stroke}
                  strokeWidth={active || hovered ? 2.5 : 1.5}
                  strokeOpacity={active || hovered ? 0.85 : 0.3}
                  strokeDasharray="4 10"
                  className="ss-signal-line"
                  style={{ animationDelay: delay }}
                />
              </g>
            )
          })}

          <circle
            cx={CX}
            cy={CY}
            r={CORE_R}
            fill={core.fill}
            stroke={core.stroke}
            strokeWidth="2.5"
            className="ss-core-pulse"
            style={{ '--ss-core-glow': core.glow }}
            filter={`url(#ss-glow-${uid})`}
          />
          <circle cx={CX} cy={CY} r={CORE_R - 14} fill="none" stroke={core.stroke} strokeWidth="1" strokeOpacity="0.25" />
          <rect
            x={CX - 10}
            y={CY - 10}
            width="20"
            height="20"
            rx="3"
            fill="none"
            stroke={core.stroke}
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          <text x={CX} y={CY - 2} textAnchor="middle" fill={core.stroke} fontSize="11" fontWeight="800"
            fontFamily="ui-monospace, monospace">
            {coreLabel}
          </text>
          <text x={CX} y={CY + 10} textAnchor="middle" fill={core.stroke} fontSize="7" opacity="0.8"
            fontFamily="ui-monospace, monospace">
            CORE
          </text>

          {CHIP_NODES.map((node, i) => {
            const pos = polarEllipse(node.angle)
            const active = activeId === node.id
            const hovered = hoverId === node.id
            const colors = hovered ? NODE_COLORS.hover : active ? NODE_COLORS.active : NODE_COLORS.idle
            const nw = active || hovered ? 34 : 30
            const nh = active || hovered ? 28 : 24

            return (
              <g
                key={`node-${node.id}`}
                className="cursor-pointer outline-none"
                onClick={() => onSelect?.(node.id)}
                onMouseEnter={() => setHoverId(node.id)}
                onMouseLeave={() => setHoverId(null)}
                role="button"
                tabIndex={0}
                aria-label={t(`smartSpawner.${node.labelKey}`)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect?.(node.id)
                  }
                }}
              >
                {(active || hovered) && (
                  <path
                    d={roundedRectPath(pos.x, pos.y, nw + 8, nh + 8, 6)}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="1.5"
                    strokeOpacity="0.55"
                    strokeDasharray="4 5"
                    className="ss-node-ring"
                  />
                )}
                <path
                  d={roundedRectPath(pos.x, pos.y, nw, nh, 5)}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={active || hovered ? 2.5 : 1.5}
                  style={{ filter: `drop-shadow(0 0 ${active || hovered ? 12 : 5}px ${colors.glow})` }}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={active || hovered ? '#ecfdf5' : colors.stroke}
                  fontSize="9"
                  fontWeight="800"
                  fontFamily="ui-monospace, monospace"
                >
                  {node.glyph}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-3 min-h-[72px] flex items-start justify-center px-1">
        <ChipTooltip t={t} nodeId={tooltipId} visible={!!tooltipId} />
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-1.5 mt-1 text-[10px] text-white/45">
          <span>{t('smartSpawner.statMobs')}: <strong className="text-emerald-300/90">{stats.mobs}</strong></span>
          <span>{t('smartSpawner.statDatabase')}: <strong className="text-emerald-300/90">{stats.db}</strong></span>
          <span className={stats.sell ? 'text-emerald-400/80' : ''}>
            {t('smartSpawner.statSell')}: {stats.sell ? t('smartSpawner.on') : t('smartSpawner.off')}
          </span>
          <span>{t('smartSpawner.statLootMobs')}: <strong className="text-white/70">{stats.lootMobs}</strong></span>
        </div>
      )}
    </div>
  )
}
