import { useId, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
const CORE_HEX_R = 46
const JUNCTION_T = [0.28, 0.52, 0.76]

function polarEllipse(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + RX * Math.cos(rad), y: CY + RY * Math.sin(rad) }
}

/** Flat-top hexagon */
function hexPoints(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 180) * (60 * i - 30)
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return pts.join(' ')
}

function lerpPoint(x1, y1, x2, y2, t) {
  return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t }
}

function CursorTooltip({ t, nodeId, x, y }) {
  const node = CHIP_NODES.find(n => n.id === nodeId)
  if (!node) return null

  const pad = 14
  const maxW = 240
  const estW = 220
  const estH = 88
  let left = x + pad
  let top = y + pad
  if (typeof window !== 'undefined') {
    if (left + estW > window.innerWidth - 8) left = x - estW - pad
    if (top + estH > window.innerHeight - 8) top = y - estH - pad
    left = Math.max(8, left)
    top = Math.max(8, top)
  }

  return createPortal(
    <div
      className="ss-chip-tooltip fixed z-[10000] rounded-xl border border-emerald-400/35 bg-[#0a1612]/96 backdrop-blur-md px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.55),0_0_20px_rgba(16,185,129,0.18)] pointer-events-none"
      style={{ left, top, maxWidth: maxW }}
      role="tooltip"
    >
      <p className="text-[13px] font-semibold text-emerald-100 leading-tight">
        {t(`smartSpawner.${node.labelKey}`)}
      </p>
      <p className="text-[11px] text-white/55 mt-1.5 leading-relaxed">
        {t(`smartSpawner.${DESC_KEYS[nodeId]}`)}
      </p>
      <p className="text-[10px] text-emerald-400/50 mt-2 font-medium">{t('smartSpawner.tooltipClick')}</p>
    </div>,
    document.body,
  )
}

function HexJunction({ x, y, r, stroke, fill, opacity = 0.9 }) {
  return (
    <polygon
      points={hexPoints(x, y, r)}
      fill={fill}
      stroke={stroke}
      strokeWidth="1.2"
      strokeOpacity={opacity}
    />
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
  const [mousePos, setMousePos] = useState(null)
  const [panelHover, setPanelHover] = useState(false)

  const tooltipId = hoverId || (panelHover ? activeId : null)
  const core = CORE_COLORS.active

  const trackMouse = useCallback(e => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  const onPanelEnter = useCallback(() => setPanelHover(true), [])
  const onPanelLeave = useCallback(() => {
    setPanelHover(false)
    setHoverId(null)
    setMousePos(null)
  }, [])

  return (
    <div className="ss-chip-panel w-full max-w-[360px] mx-auto">
      <p className="text-[10px] text-white/30 text-center mb-2 px-1">{t('smartSpawner.chipHint')}</p>

      <div
        className="ss-chip-scanline relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0a120e]"
        onMouseMove={trackMouse}
        onMouseEnter={onPanelEnter}
        onMouseLeave={onPanelLeave}
      >
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
            const lit = active || hovered

            return (
              <g key={`trace-${node.id}`}>
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={CX}
                  y2={CY}
                  stroke={colors.line}
                  strokeWidth={lit ? 2 : 1}
                  strokeOpacity={lit ? 0.35 : 0.12}
                />
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={CX}
                  y2={CY}
                  stroke={colors.stroke}
                  strokeWidth={lit ? 2.5 : 1.5}
                  strokeOpacity={lit ? 0.85 : 0.28}
                  strokeDasharray="4 10"
                  className="ss-signal-line"
                  style={{ animationDelay: delay }}
                />
                {JUNCTION_T.map((jt, ji) => {
                  const j = lerpPoint(pos.x, pos.y, CX, CY, jt)
                  const jr = lit ? 5 : 3.5
                  return (
                    <HexJunction
                      key={ji}
                      x={j.x}
                      y={j.y}
                      r={jr}
                      fill={lit ? colors.fill : 'rgba(10,24,18,0.85)'}
                      stroke={colors.stroke}
                      opacity={lit ? 0.95 : 0.45}
                    />
                  )
                })}
                <HexJunction
                  x={lerpPoint(pos.x, pos.y, CX, CY, 0.12).x}
                  y={lerpPoint(pos.x, pos.y, CX, CY, 0.12).y}
                  r={4}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  opacity={lit ? 1 : 0.5}
                />
              </g>
            )
          })}

          {[CORE_HEX_R + 20, CORE_HEX_R + 10].map((r, i) => (
            <polygon
              key={r}
              points={hexPoints(CX, CY, r)}
              fill="none"
              stroke={core.stroke}
              strokeWidth="1"
              strokeOpacity={0.1 + i * 0.08}
            />
          ))}

          <polygon
            points={hexPoints(CX, CY, CORE_HEX_R)}
            fill={core.fill}
            stroke={core.stroke}
            strokeWidth="2.5"
            className="ss-core-pulse"
            style={{ '--ss-core-glow': core.glow }}
            filter={`url(#ss-glow-${uid})`}
          />
          <polygon
            points={hexPoints(CX, CY, CORE_HEX_R - 14)}
            fill="none"
            stroke={core.stroke}
            strokeWidth="1"
            strokeOpacity="0.28"
          />
          <polygon
            points={hexPoints(CX, CY, 11)}
            fill="none"
            stroke={core.stroke}
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />

          <text x={CX} y={CY - 2} textAnchor="middle" fill={core.stroke} fontSize="11" fontWeight="800"
            fontFamily="ui-monospace, monospace" pointerEvents="none">
            {coreLabel}
          </text>
          <text x={CX} y={CY + 10} textAnchor="middle" fill={core.stroke} fontSize="7" opacity="0.8"
            fontFamily="ui-monospace, monospace" pointerEvents="none">
            CORE
          </text>

          {CHIP_NODES.map((node, i) => {
            const pos = polarEllipse(node.angle)
            const active = activeId === node.id
            const hovered = hoverId === node.id
            const colors = hovered ? NODE_COLORS.hover : active ? NODE_COLORS.active : NODE_COLORS.idle
            const hr = active || hovered ? 19 : 16
            const lit = active || hovered

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
                {lit && (
                  <polygon
                    points={hexPoints(pos.x, pos.y, hr + 7)}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="1.5"
                    strokeOpacity="0.55"
                    strokeDasharray="4 5"
                    className="ss-node-ring"
                  />
                )}
                <polygon
                  points={hexPoints(pos.x, pos.y, hr)}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={lit ? 2.5 : 1.5}
                  style={{ filter: `drop-shadow(0 0 ${lit ? 12 : 5}px ${colors.glow})` }}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={lit ? '#ecfdf5' : colors.stroke}
                  fontSize="9"
                  fontWeight="800"
                  fontFamily="ui-monospace, monospace"
                  pointerEvents="none"
                  style={{ paintOrder: 'stroke fill', stroke: 'rgba(0,0,0,0.75)', strokeWidth: 2.5 }}
                >
                  {node.glyph}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {tooltipId && mousePos && (
        <CursorTooltip t={t} nodeId={tooltipId} x={mousePos.x} y={mousePos.y} />
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-1.5 mt-3 text-[10px] text-white/45">
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
