import { useId } from 'react'
import { CHIP_NODES, NODE_COLORS, CORE_COLORS } from './lpxData'

const NODE_LABEL_KEYS = {
  messages: 'nodeMessages',
  options: 'nodeOptions',
  printer: 'nodePrinter',
  mechanics: 'nodeMechanics',
  logger: 'nodeLogger',
  discord: 'nodeDiscord',
  'checks-core': 'nodePackets',
  'checks-traffic': 'nodeTraffic',
}

const NODE_DESC_KEYS = {
  messages: 'descMessages',
  options: 'descOptions',
  printer: 'descPrinter',
  mechanics: 'descMechanics',
  logger: 'descLogger',
  discord: 'descDiscord',
  'checks-core': 'descPackets',
  'checks-traffic': 'descTraffic',
}

const STATUS_KEYS = {
  idle: 'statusIdle',
  active: 'statusActive',
  strict: 'statusStrict',
  warning: 'statusWarning',
  lenient: 'statusLenient',
}

/** Short glyph inside hex — language-neutral */
const NODE_GLYPH = {
  messages: 'MSG',
  options: 'CFG',
  printer: 'PRT',
  mechanics: 'MCH',
  logger: 'LOG',
  discord: 'DSC',
  'checks-core': 'PKT',
  'checks-traffic': 'FLD',
}

const CX = 180
const CY = 180
const RX = 118
const RY = 96
const CORE_R = 40

function polarEllipse(angleDeg, rx = RX, ry = RY) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + rx * Math.cos(rad), y: CY + ry * Math.sin(rad) }
}

/** Flat-top hexagon — distinct from Grim circles & Vulcan diamonds */
function hexPoints(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 180) * (60 * i - 30)
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return pts.join(' ')
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = (startDeg * Math.PI) / 180
  const e = (endDeg * Math.PI) / 180
  const x1 = cx + r * Math.cos(s)
  const y1 = cy + r * Math.sin(s)
  const x2 = cx + r * Math.cos(e)
  const y2 = cy + r * Math.sin(e)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

export default function LpxChipVisual({
  t,
  nodeStatuses = {},
  coreStatus = 'idle',
  activeId,
  onSelect,
  coreLabel = 'LPX',
}) {
  const uid = useId().replace(/:/g, '')
  const nodes = CHIP_NODES.map(n => ({
    ...n,
    status: nodeStatuses[n.id] || 'idle',
  }))

  const core = CORE_COLORS[coreStatus] || CORE_COLORS.idle
  const activeNode = nodes.find(n => n.id === activeId)
  const activeColors = activeNode ? (NODE_COLORS[activeNode.status] || NODE_COLORS.idle) : null

  const nodeLabel = (node) => (
    t && NODE_LABEL_KEYS[node.id] ? t(`lpx.${NODE_LABEL_KEYS[node.id]}`) : node.label
  )

  return (
    <div className="lpx-chip-panel relative w-full max-w-[360px] mx-auto">
      <div className="lpx-scanline relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0a0612]">
        <div
          className="lpx-core-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none blur-3xl"
          style={{ background: core.glow }}
        />

        <svg viewBox="0 0 360 360" className="w-full h-full relative z-[1]" aria-hidden>
          <defs>
            <filter id={`lpx-glow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id={`lpx-grid-${uid}`} width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.6" fill="rgba(168,85,247,0.08)" />
            </pattern>
            <radialGradient id={`lpx-bg-${uid}`} cx="50%" cy="48%" r="52%">
              <stop offset="0%" stopColor="rgba(168,85,247,0.18)" />
              <stop offset="100%" stopColor="rgba(10,6,18,0)" />
            </radialGradient>
          </defs>

          <rect width="360" height="360" fill={`url(#lpx-grid-${uid})`} />
          <ellipse cx={CX} cy={CY} rx={RX + 8} ry={RY + 8} fill={`url(#lpx-bg-${uid})`} />

          <ellipse
            cx={CX}
            cy={CY}
            rx={RX}
            ry={RY}
            fill="none"
            stroke="rgba(168,85,247,0.12)"
            strokeWidth="1"
            strokeDasharray="6 10"
            className="lpx-orbit-ring"
          />

          {nodes.map((node, i) => {
            const pos = polarEllipse(node.angle ?? CHIP_NODES[i]?.angle ?? i * 45 - 90)
            const colors = NODE_COLORS[node.status] || NODE_COLORS.idle
            const active = activeId === node.id
            const delay = `${i * 0.22}s`
            const midAngle = (node.angle ?? -90) + 180
            const arc = arcPath(CX, CY, (RX + RY) / 2 - 10, node.angle ?? -90, midAngle)

            return (
              <g key={`trace-${node.id}`}>
                <path
                  d={arc}
                  fill="none"
                  stroke={colors.line}
                  strokeWidth={active ? 2 : 1}
                  strokeOpacity={active ? 0.35 : 0.12}
                  strokeLinecap="round"
                />
                <path
                  d={arc}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth={active ? 2.5 : 1.5}
                  strokeOpacity={active ? 0.85 : 0.3}
                  strokeDasharray="5 14"
                  strokeLinecap="round"
                  className="lpx-arc-flow"
                  style={{ animationDelay: delay }}
                />
                <circle
                  cx={pos.x + (CX - pos.x) * 0.45}
                  cy={pos.y + (CY - pos.y) * 0.45}
                  r="2.5"
                  fill={colors.stroke}
                  className="lpx-packet-orb"
                  style={{ animationDelay: delay }}
                />
              </g>
            )
          })}

          {[CORE_R + 22, CORE_R + 14, CORE_R + 6].map((r, i) => (
            <circle
              key={r}
              cx={CX}
              cy={CY}
              r={r}
              fill="none"
              stroke={core.stroke}
              strokeWidth="1"
              strokeOpacity={0.08 + i * 0.06}
              className={i === 0 ? 'lpx-shield-ring-outer' : i === 1 ? 'lpx-shield-ring-mid' : ''}
            />
          ))}

          <circle
            cx={CX}
            cy={CY}
            r={CORE_R}
            fill={core.fill}
            stroke={core.stroke}
            strokeWidth="2.5"
            className="lpx-core-pulse"
            style={{ '--lpx-core-glow': core.glow }}
            filter={`url(#lpx-glow-${uid})`}
          />
          <circle cx={CX} cy={CY} r={CORE_R - 12} fill="none" stroke={core.stroke} strokeWidth="1" strokeOpacity="0.25" />

          <text x={CX} y={CY - 2} textAnchor="middle" fill={core.stroke} fontSize="13" fontWeight="800"
            fontFamily="ui-monospace, monospace" className="lpx-core-label">
            {coreLabel}
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" fill={core.stroke} fontSize="8" opacity="0.85"
            fontFamily="ui-monospace, monospace">
            {(t && STATUS_KEYS[coreStatus] ? t(`lpx.${STATUS_KEYS[coreStatus]}`) : coreStatus) || 'CORE'}
          </text>

          {nodes.map((node, i) => {
            const pos = polarEllipse(node.angle ?? CHIP_NODES[i]?.angle ?? i * 45 - 90)
            const colors = NODE_COLORS[node.status] || NODE_COLORS.idle
            const active = activeId === node.id
            const hr = active ? 20 : 17
            const glyph = NODE_GLYPH[node.id] || '?'

            return (
              <g
                key={`node-${node.id}`}
                className="cursor-pointer outline-none"
                onClick={() => onSelect?.(node.id)}
                role="button"
                tabIndex={0}
                aria-label={nodeLabel(node)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect?.(node.id)
                  }
                }}
              >
                {active && (
                  <polygon
                    points={hexPoints(pos.x, pos.y, hr + 7)}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    strokeDasharray="4 5"
                    className="lpx-node-pulse"
                  />
                )}
                <polygon
                  points={hexPoints(pos.x, pos.y, hr)}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={active ? 2.5 : 1.5}
                  style={{ filter: `drop-shadow(0 0 ${active ? 14 : 6}px ${colors.glow})` }}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={active ? '#f5f3ff' : colors.stroke}
                  fontSize="7"
                  fontWeight="800"
                  fontFamily="ui-monospace, monospace"
                  style={{ paintOrder: 'stroke fill', stroke: 'rgba(0,0,0,0.85)', strokeWidth: 3 }}
                >
                  {glyph}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Readable module labels — HTML, not tiny SVG text */}
      <div className="grid grid-cols-2 gap-1.5 mt-2.5 px-0.5">
        {nodes.map(node => {
          const colors = NODE_COLORS[node.status] || NODE_COLORS.idle
          const active = activeId === node.id
          const statusText = t && STATUS_KEYS[node.status] ? t(`lpx.${STATUS_KEYS[node.status]}`) : node.status
          return (
            <button
              key={`pill-${node.id}`}
              type="button"
              onClick={() => onSelect?.(node.id)}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all min-w-0 ${
                active
                  ? 'border-violet-400/50 bg-violet-500/15 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                  : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15'
              }`}
            >
              <span
                className="w-3 h-3 flex-shrink-0 rotate-[30deg]"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: colors.fill,
                  boxShadow: `0 0 6px ${colors.glow}`,
                  border: `1px solid ${colors.stroke}`,
                }}
                aria-hidden
              />
              <span className="flex-1 min-w-0">
                <span className={`block text-[11px] font-semibold leading-tight truncate ${active ? 'text-violet-100' : 'text-white/85'}`}>
                  {nodeLabel(node)}
                </span>
                <span className="block text-[9px] text-white/40 mt-0.5">{statusText}</span>
              </span>
            </button>
          )
        })}
      </div>

      {activeColors && activeNode && (
        <div className="mt-2.5 rounded-xl border border-violet-500/25 bg-violet-500/8 px-3 py-2.5">
          <p className="text-xs font-semibold text-violet-100">
            {nodeLabel(activeNode)}
          </p>
          <p className="text-[10px] text-white/45 mt-1 leading-relaxed">
            <span className="text-violet-300/90 font-medium">
              {(t && STATUS_KEYS[activeNode.status] ? t(`lpx.${STATUS_KEYS[activeNode.status]}`) : activeNode.status)}
            </span>
            {' · '}
            {t && NODE_DESC_KEYS[activeNode.id] ? t(`lpx.${NODE_DESC_KEYS[activeNode.id]}`) : (activeNode.desc || '')}
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2.5 px-1">
        {Object.entries(NODE_COLORS).map(([key, c]) => (
          <span key={key} className="flex items-center gap-1.5 text-[10px] text-white/50">
            <span
              className="w-2.5 h-2.5 flex-shrink-0"
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                background: c.fill,
                border: `1px solid ${c.stroke}`,
              }}
            />
            {(t && STATUS_KEYS[key] ? t(`lpx.${STATUS_KEYS[key]}`) : key)}
          </span>
        ))}
      </div>
    </div>
  )
}
