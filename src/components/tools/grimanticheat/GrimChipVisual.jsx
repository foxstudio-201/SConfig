import { useId } from 'react'
import { CHIP_NODES, NODE_COLORS, CORE_COLORS } from './grimData'

const NODE_LABEL_KEYS = {
  alerts: 'nodeAlerts',
  spectators: 'nodeSpectate',
  network: 'nodeNetwork',
  simulation: 'nodeSim',
  movement: 'nodeMove',
  combat: 'nodeCombat',
  exploit: 'nodeExploit',
  system: 'nodeSystem',
}

const NODE_DESC_KEYS = {
  alerts: 'descAlerts',
  spectators: 'descSpectators',
  network: 'descNetwork',
  simulation: 'descSimulation',
  movement: 'descMovement',
  combat: 'descCombat',
  exploit: 'descExploit',
  system: 'descSystem',
}

const STATUS_KEYS = {
  idle: 'statusIdle',
  active: 'statusActive',
  strict: 'statusStrict',
  warning: 'statusWarning',
  experimental: 'statusExperimental',
}

const CX = 180
const CY = 180
const R = 118
const CORE_R = 48

function polar(angleDeg, radius = R) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) }
}

function hexPoints(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 180) * (60 * i - 30)
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return pts.join(' ')
}

function midPoint(ax, ay, bx, by, t = 0.55) {
  const mx = ax + (bx - ax) * t
  const my = ay + (by - ay) * t
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len * 12
  const ny = dx / len * 12
  return { x: mx + nx, y: my + ny }
}

export default function GrimChipVisual({
  t,
  nodeStatuses = {},
  coreStatus = 'idle',
  activeId,
  onSelect,
  coreLabel = 'GRIM',
  customNodes = null,
}) {
  const uid = useId().replace(/:/g, '')
  const nodes = customNodes || CHIP_NODES.map(n => ({
    ...n,
    status: nodeStatuses[n.id] || 'idle',
  }))

  const core = CORE_COLORS[coreStatus] || CORE_COLORS.idle
  const activeNode = nodes.find(n => n.id === activeId)
  const activeColors = activeNode ? (NODE_COLORS[activeNode.status] || NODE_COLORS.idle) : null

  return (
    <div className="grim-chip-panel relative w-full max-w-[340px] mx-auto">
      <div className="grim-scanline relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0d0d1a]">
        <div
          className="grim-chip-core-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none blur-2xl"
          style={{ background: core.glow }}
        />

        <svg viewBox="0 0 360 360" className="w-full h-full relative z-[1]" aria-hidden>
          <defs>
            <filter id={`grim-glow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id={`grim-grid-${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34,211,238,0.06)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id={`grim-bg-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.12)" />
              <stop offset="100%" stopColor="rgba(4,6,12,0)" />
            </radialGradient>
          </defs>

          <rect width="360" height="360" fill={`url(#grim-grid-${uid})`} />
          <circle cx={CX} cy={CY} r="130" fill={`url(#grim-bg-${uid})`} />

          {[0, 45, 90, 135].map(deg => {
            const a = (deg * Math.PI) / 180
            const x2 = CX + 140 * Math.cos(a)
            const y2 = CY + 140 * Math.sin(a)
            return (
              <line key={deg} x1={CX} y1={CY} x2={x2} y2={y2}
                stroke="rgba(34,211,238,0.04)" strokeWidth="1" />
            )
          })}

          {nodes.map((node, i) => {
            const pos = polar(node.angle ?? CHIP_NODES[i]?.angle ?? i * 45 - 90)
            const colors = NODE_COLORS[node.status] || NODE_COLORS.idle
            const active = activeId === node.id
            const delay = `${i * 0.28}s`
            const bend = midPoint(pos.x, pos.y, CX, CY)

            return (
              <g key={`trace-${node.id}`}>
                <path
                  d={`M ${pos.x} ${pos.y} Q ${bend.x} ${bend.y} ${CX} ${CY}`}
                  fill="none"
                  stroke={colors.line}
                  strokeWidth={active ? 2 : 1}
                  strokeOpacity={active ? 0.5 : 0.2}
                />
                <path
                  d={`M ${pos.x} ${pos.y} Q ${bend.x} ${bend.y} ${CX} ${CY}`}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth={active ? 2.5 : 1.5}
                  strokeOpacity={active ? 0.9 : 0.35}
                  strokeDasharray="4 12"
                  className="grim-signal-line"
                  style={{ animationDelay: delay }}
                />
                <path
                  d={`M ${pos.x} ${pos.y} Q ${bend.x} ${bend.y} ${CX} ${CY}`}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth="2"
                  strokeOpacity="0"
                  strokeDasharray="8 120"
                  className="grim-signal-packet"
                  style={{ animationDelay: delay }}
                />
                <circle cx={bend.x} cy={bend.y} r="2" fill={colors.stroke} opacity={active ? 0.8 : 0.25} />
              </g>
            )
          })}

          <polygon
            points={hexPoints(CX, CY, CORE_R + 14)}
            fill="none"
            stroke={core.stroke}
            strokeWidth="1"
            strokeOpacity="0.2"
          />
          <polygon
            points={hexPoints(CX, CY, CORE_R + 6)}
            fill="#030308"
            stroke={core.stroke}
            strokeWidth="1.5"
            strokeOpacity="0.35"
          />
          <polygon
            points={hexPoints(CX, CY, CORE_R)}
            fill={core.fill}
            stroke={core.stroke}
            strokeWidth="2.5"
            className="grim-chip-core-pulse"
            style={{ '--grim-core-glow': core.glow }}
            filter={`url(#grim-glow-${uid})`}
          />
          {[0, 1, 2].map(i => (
            <polygon
              key={i}
              points={hexPoints(CX, CY, CORE_R - 10 - i * 8)}
              fill="none"
              stroke={core.stroke}
              strokeOpacity={0.08 + i * 0.05}
              strokeWidth="0.75"
            />
          ))}

          <text x={CX} y={CY - 6} textAnchor="middle" fill={core.stroke} fontSize="13" fontWeight="800"
            fontFamily="ui-monospace, monospace" className="grim-core-label">
            {coreLabel}
          </text>
          <text x={CX} y={CY + 10} textAnchor="middle" fill={core.stroke} fontSize="8" opacity="0.75"
            fontFamily="ui-monospace, monospace">
            {(t && STATUS_KEYS[coreStatus] ? t(`grim.${STATUS_KEYS[coreStatus]}`) : coreStatus) || 'CORE'}
          </text>

          {nodes.map((node, i) => {
            const pos = polar(node.angle ?? CHIP_NODES[i]?.angle ?? i * 45 - 90)
            const colors = NODE_COLORS[node.status] || NODE_COLORS.idle
            const active = activeId === node.id
            const nr = active ? 20 : 16

            return (
              <g
                key={`node-${node.id}`}
                className="cursor-pointer outline-none"
                onClick={() => onSelect?.(node.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(node.id) } }}
              >
                {active && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nr + 10}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    strokeDasharray="6 10"
                    className="grim-node-ring"
                  />
                )}
                <circle cx={pos.x} cy={pos.y} r={nr + 8} fill="transparent" />
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nr}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={active ? 2.5 : 1.5}
                  style={{ filter: active ? `drop-shadow(0 0 12px ${colors.glow})` : `drop-shadow(0 0 4px ${colors.glow})` }}
                />
                <circle cx={pos.x} cy={pos.y} r="3.5" fill={colors.stroke} className="grim-node-dot" style={{ animationDelay: `${i * 0.35}s` }} />
                <text x={pos.x} y={pos.y + nr + 13} textAnchor="middle"
                  fill={active ? colors.stroke : '#94a3b8'}
                  fontSize="9" fontWeight={active ? '700' : '500'} fontFamily="system-ui, sans-serif">
                  {t && NODE_LABEL_KEYS[node.id] ? t(`grim.${NODE_LABEL_KEYS[node.id]}`) : node.label}
                </text>
                {active && (
                  <text x={pos.x} y={pos.y + nr + 24} textAnchor="middle" fill={colors.stroke}
                    fontSize="7" opacity="0.85" fontFamily="ui-monospace, monospace">
                    {t && STATUS_KEYS[node.status] ? t(`grim.${STATUS_KEYS[node.status]}`) : node.status}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {activeColors && activeNode && (
        <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-center">
          <p className="text-[10px] font-semibold text-cyan-300/90">
            {t && NODE_LABEL_KEYS[activeNode.id] ? t(`grim.${NODE_LABEL_KEYS[activeNode.id]}`) : activeNode.label}
          </p>
          <p className="text-[9px] text-white/35 mt-0.5">
            {(t && STATUS_KEYS[activeNode.status] ? t(`grim.${STATUS_KEYS[activeNode.status]}`) : activeNode.status)}
            {' · '}
            {t && NODE_DESC_KEYS[activeNode.id] ? t(`grim.${NODE_DESC_KEYS[activeNode.id]}`) : (activeNode.desc || (t ? t('grim.configBlockFallback') : 'Config block'))}
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-3 px-1">
        {Object.entries(NODE_COLORS).filter(([k]) => k !== 'warning').map(([key, c]) => (
          <span key={key} className="flex items-center gap-1.5 text-[9px] text-white/40">
            <span className="w-2 h-2 rounded-sm border rotate-45" style={{ borderColor: c.stroke, background: c.fill }} />
            {(t && STATUS_KEYS[key] ? t(`grim.${STATUS_KEYS[key]}`) : key)}
          </span>
        ))}
      </div>
    </div>
  )
}
