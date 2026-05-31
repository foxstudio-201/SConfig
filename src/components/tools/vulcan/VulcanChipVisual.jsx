import { useId } from 'react'
import { CHIP_NODES, NODE_COLORS, CORE_COLORS } from './vulcanData'

const NODE_LABEL_KEYS = {
  alerts: 'nodeAlerts',
  client: 'nodeClient',
  connection: 'nodeLink',
  settings: 'nodeCore',
  combat: 'nodeCombat',
  movement: 'nodeMove',
  player: 'nodePlayer',
  discord: 'nodeDiscord',
}

const NODE_DESC_KEYS = {
  alerts: 'descAlerts',
  client: 'descClient',
  connection: 'descConnection',
  settings: 'descSettings',
  combat: 'descCombat',
  movement: 'descMovement',
  player: 'descPlayer',
  discord: 'descDiscord',
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
const R = 116
const CORE = 38

function polar(angleDeg, radius = R) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) }
}

function diamondPoints(cx, cy, r) {
  return `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`
}

export default function VulcanChipVisual({
  t,
  nodeStatuses = {},
  coreStatus = 'idle',
  activeId,
  onSelect,
  coreLabel = 'VULCAN',
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
    <div className="vulcan-chip-panel relative w-full max-w-[340px] mx-auto">
      <div className="vulcan-scanline relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0d0d1a]">
        <div
          className="vulcan-core-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 pointer-events-none blur-3xl"
          style={{ background: core.glow }}
        />

        <svg viewBox="0 0 360 360" className="w-full h-full relative z-[1]" aria-hidden>
          <defs>
            <filter id={`vulcan-glow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id={`vulcan-grid-${uid}`} width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(249,115,22,0.05)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id={`vulcan-bg-${uid}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="rgba(249,115,22,0.15)" />
              <stop offset="100%" stopColor="rgba(10,8,6,0)" />
            </radialGradient>
          </defs>

          <rect width="360" height="360" fill={`url(#vulcan-grid-${uid})`} />
          <circle cx={CX} cy={CY} r="128" fill={`url(#vulcan-bg-${uid})`} />

          <g className="vulcan-ring-outer" style={{ transformOrigin: `${CX}px ${CY}px` }}>
            <circle cx={CX} cy={CY} r={CORE + 28} fill="none" stroke={core.stroke} strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 8" />
          </g>
          <g className="vulcan-ring-inner" style={{ transformOrigin: `${CX}px ${CY}px` }}>
            <circle cx={CX} cy={CY} r={CORE + 18} fill="none" stroke={core.stroke} strokeWidth="1" strokeOpacity="0.25" strokeDasharray="2 6" />
          </g>

          {nodes.map((node, i) => {
            const pos = polar(node.angle ?? CHIP_NODES[i]?.angle ?? i * 45 - 90)
            const colors = NODE_COLORS[node.status] || NODE_COLORS.idle
            const active = activeId === node.id
            const delay = `${i * 0.25}s`

            return (
              <g key={`trace-${node.id}`}>
                <line x1={pos.x} y1={pos.y} x2={CX} y2={CY}
                  stroke={colors.line} strokeWidth={active ? 2 : 1} strokeOpacity={active ? 0.45 : 0.18} />
                <line x1={pos.x} y1={pos.y} x2={CX} y2={CY}
                  stroke={colors.stroke} strokeWidth={active ? 2.5 : 1.5}
                  strokeOpacity={active ? 0.95 : 0.4}
                  strokeDasharray="3 10"
                  className="vulcan-signal-line"
                  style={{ animationDelay: delay }} />
                <line x1={pos.x} y1={pos.y} x2={CX} y2={CY}
                  stroke={colors.stroke} strokeWidth="2"
                  strokeDasharray="6 100"
                  className="vulcan-signal-packet"
                  style={{ animationDelay: delay }} />
                {[0.35, 0.65].map((t, j) => (
                  <circle key={j}
                    cx={pos.x + (CX - pos.x) * t}
                    cy={pos.y + (CY - pos.y) * t}
                    r="2"
                    fill={colors.stroke}
                    opacity={active ? 0.7 : 0.25}
                    className="vulcan-trace-dot"
                    style={{ animationDelay: `${i * 0.2 + j * 0.15}s` }}
                  />
                ))}
              </g>
            )
          })}

          <polygon points={diamondPoints(CX, CY, CORE + 12)} fill="#0a0806" stroke={core.stroke} strokeWidth="1.5" strokeOpacity="0.35" />
          <polygon
            points={diamondPoints(CX, CY, CORE)}
            fill={core.fill}
            stroke={core.stroke}
            strokeWidth="2.5"
            className="vulcan-core-pulse"
            style={{ '--vulcan-core-glow': core.glow }}
            filter={`url(#vulcan-glow-${uid})`}
          />
          <polygon points={diamondPoints(CX, CY, CORE - 14)} fill="none" stroke={core.stroke} strokeWidth="0.75" strokeOpacity="0.2" />
          <path
            d={`M ${CX} ${CY - CORE + 8} L ${CX + 4} ${CY - 2} L ${CX} ${CY + 6} L ${CX - 4} ${CY - 2} Z`}
            fill={core.stroke}
            fillOpacity="0.35"
            className="vulcan-flame"
          />

          <text x={CX} y={CY + 22} textAnchor="middle" fill={core.stroke} fontSize="10" fontWeight="800"
            fontFamily="ui-monospace, monospace" className="vulcan-core-label">
            {coreLabel}
          </text>
          <text x={CX} y={CY + 34} textAnchor="middle" fill={core.stroke} fontSize="7" opacity="0.75"
            fontFamily="ui-monospace, monospace">
            {(t && STATUS_KEYS[coreStatus] ? t(`vulcan.${STATUS_KEYS[coreStatus]}`) : coreStatus) || 'CORE'}
          </text>

          {nodes.map((node, i) => {
            const pos = polar(node.angle ?? CHIP_NODES[i]?.angle ?? i * 45 - 90)
            const colors = NODE_COLORS[node.status] || NODE_COLORS.idle
            const active = activeId === node.id
            const nr = active ? 19 : 15

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
                  <polygon
                    points={diamondPoints(pos.x, pos.y, nr + 8)}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    className="vulcan-node-ring"
                  />
                )}
                <polygon
                  points={diamondPoints(pos.x, pos.y, nr)}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={active ? 2.5 : 1.5}
                  style={{ filter: `drop-shadow(0 0 ${active ? 14 : 6}px ${colors.glow})` }}
                />
                <circle cx={pos.x} cy={pos.y} r="3" fill={colors.stroke} className="vulcan-node-dot" style={{ animationDelay: `${i * 0.3}s` }} />
                <text x={pos.x} y={pos.y + nr + 12} textAnchor="middle"
                  fill={active ? colors.stroke : '#a8a29e'}
                  fontSize="9" fontWeight={active ? '700' : '500'}>
                  {t && NODE_LABEL_KEYS[node.id] ? t(`vulcan.${NODE_LABEL_KEYS[node.id]}`) : node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {activeColors && activeNode && (
        <div className="mt-3 rounded-xl border border-orange-500/25 bg-orange-500/8 px-3 py-2 text-center">
          <p className="text-[10px] font-semibold text-orange-300/95">
            {t && NODE_LABEL_KEYS[activeNode.id] ? t(`vulcan.${NODE_LABEL_KEYS[activeNode.id]}`) : activeNode.label}
          </p>
          <p className="text-[9px] text-white/35 mt-0.5">
            {(t && STATUS_KEYS[activeNode.status] ? t(`vulcan.${STATUS_KEYS[activeNode.status]}`) : activeNode.status)}
            {' · '}
            {t && NODE_DESC_KEYS[activeNode.id] ? t(`vulcan.${NODE_DESC_KEYS[activeNode.id]}`) : (activeNode.desc || '')}
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-3 px-1">
        {Object.entries(NODE_COLORS).filter(([k]) => k !== 'experimental').map(([key, c]) => (
          <span key={key} className="flex items-center gap-1.5 text-[9px] text-white/40">
            <span className="w-2 h-2 rotate-45 border" style={{ borderColor: c.stroke, background: c.fill }} />
            {(t && STATUS_KEYS[key] ? t(`vulcan.${STATUS_KEYS[key]}`) : key)}
          </span>
        ))}
      </div>
    </div>
  )
}
