/**
 * Pixel Rank Generator
 * - Imports rendering engine from rankRenderer.js
 * - Imports presets/defaults from rankPresets.js
 * - Glyph grid: left-click assigns current rank to slot, right-click copies char
 * - Right panel: slot info + assigned slots list + Export ZIP
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeftIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline'
import JSZip from 'jszip'
import CustomDropdown from '../../CustomDropdown'
import { GLYPH_FILES, glyphCodeToChar, posToCode } from '../glyph/glyphData'
import { ICONS, renderRank } from './rankRenderer'
import { PRESETS, DEFAULT_STATE } from './rankPresets'
import { useI18n } from '../../../context/I18nContext'

const PRESET_I18N_KEYS = [
  'presetCrimsonRed', 'presetEmeraldGreen', 'presetCyanDiamond',
  'presetRainbow', 'presetOceanBlue', 'presetGold',
]

const TOGGLE_OPTIONS = [
  ['optShowIcon', 'showIcon'],
  ['optShowBg', 'showBg'],
  ['optBgGradient', 'showBgGradient'],
  ['optBorder', 'showBorder'],
  ['optTextShadow', 'showTextShadow'],
  ['optIconShadow', 'showIconShadow'],
  ['optGloss', 'showGloss'],
  ['optCorners', 'showCorners'],
  ['optTextGradient', 'showTextGradient'],
  ['optIconGradient', 'showIconGradient'],
  ['optIconDivider', 'showIconDivider'],
]

const BG_LABEL_KEYS = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7']

function dirOptions(t) {
  return [
    { value: 'Top to Bottom', label: t('pixelRank.dirTopBottom') },
    { value: 'Left to Right', label: t('pixelRank.dirLeftRight') },
  ]
}

function iconPosOptions(t) {
  return [
    { value: 'Left', label: t('pixelRank.iconLeft') },
    { value: 'Right', label: t('pixelRank.iconRight') },
  ]
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function Toggle({ label, value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all select-none ${
        value ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
              : 'bg-white/[0.04] border-white/[0.07] text-white/35 hover:text-white/60'
      }`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${value ? 'bg-indigo-400' : 'bg-white/20'}`} />
      {label}
    </button>
  )
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-white/30 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-lg px-2 py-1.5">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0 flex-shrink-0" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent text-[12px] font-mono text-white/70 outline-none w-0 min-w-0" />
      </div>
    </div>
  )
}

function IconPreview({ name, px = 14 }) {
  const map = ICONS[name]
  if (!map) return null
  const cell = px / 8
  return (
    <div
      className="grid flex-shrink-0 rounded-sm overflow-hidden border border-white/10"
      style={{ width: px, height: px, gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(8, 1fr)' }}
    >
      {map.flat().map((on, i) => (
        <div key={i} style={{ width: cell, height: cell }} className={on ? 'bg-indigo-300' : 'bg-white/[0.04]'} />
      ))}
    </div>
  )
}

function iconDropdownRender(opt, selected) {
  return (
    <>
      <IconPreview name={opt.value} px={16} />
      <span className="flex-1 truncate">{opt.label}</span>
      {selected && <CheckIcon className="w-4 h-4 flex-shrink-0 text-indigo-300" />}
    </>
  )
}

function iconDropdownValue(opt) {
  if (!opt) return null
  return (
    <span className="flex items-center gap-2 min-w-0">
      <IconPreview name={opt.value} px={14} />
      <span className="truncate">{opt.label}</span>
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PixelRankTool({ onBack }) {
  const { t } = useI18n()
  const [s, setS] = useState(DEFAULT_STATE)
  const exportRef  = useRef(null)
  const previewRef = useRef(null)

  // Glyph browser state
  const [glyphCategory, setGlyphCategory] = useState('E0')
  const [copiedGlyph, setCopiedGlyph]     = useState(null)
  const [glyphGridSize, setGlyphGridSize] = useState(256)
  const [hoveredCell, setHoveredCell]     = useState(null) // code string

  // glyphSlots: Map<code, { rankState }>
  const [glyphSlots, setGlyphSlots] = useState(new Map())

  const set = useCallback((patch) => setS(prev => ({ ...prev, ...patch })), [])

  useEffect(() => {
    if (previewRef.current) renderRank(previewRef.current, s, 3)
    if (exportRef.current)  renderRank(exportRef.current,  s, 8)
  }, [s])

  function applyPreset(p) {
    const bgColors = [...DEFAULT_STATE.bgColors]
    p.bg.forEach((c, i) => { bgColors[i] = c })
    set({ bgColors, bgColorCount: p.bg.length, textColor: p.text,
          textGrad1: p.tg1, textGrad2: p.tg2,
          borderColor: p.border, shadowColor: p.shadow,
          iconColor: p.icon, dividerColor: p.divider })
  }

  function setBgColor(idx, val) {
    const next = [...s.bgColors]; next[idx] = val; set({ bgColors: next })
  }

  function savePng() {
    if (!exportRef.current) return
    const a = document.createElement('a')
    a.download = `rank_${s.rankText.toLowerCase()}.png`
    a.href = exportRef.current.toDataURL('image/png')
    a.click()
  }

  function copyPng() {
    if (!exportRef.current) return
    exportRef.current.toBlob(blob => {
      if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).catch(() => {})
    })
  }

  function copyGlyph(text, id) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedGlyph(id)
    setTimeout(() => setCopiedGlyph(null), 1500)
  }

  /**
   * Calculate how many 16px-wide cells a rank needs at a given pixel scale.
   * Rank is always 9px tall. Width depends on text + icon.
   * Returns { cellCount, rankW, rankH, pixelScale }
   */
  function calcRankCells(rankState, cellPx) {
    const nativeH     = 9
    const pixelScale  = Math.max(1, Math.floor(cellPx / nativeH))
    const tmp = document.createElement('canvas')
    renderRank(tmp, rankState, pixelScale)
    const rankW = tmp.width
    const rankH = tmp.height
    const cellCount = Math.ceil(rankW / cellPx)
    return { cellCount, rankW, rankH, tmp }
  }

  /**
   * Get all codes occupied by a slot centered at `centerCode`.
   * Rank is centered on the selected cell, overflow goes left and right.
   * Returns array of codes in order (left → right).
   */
  function getSlotCodes(centerCode, rankW, cellPx) {
    const fileId  = centerCode.slice(0, 2)
    const centerPos = parseInt(centerCode.slice(2), 16)

    // How many cells to the left and right of center
    const halfRank  = rankW / 2
    const cellsLeft  = Math.ceil(Math.max(0, halfRank - cellPx / 2) / cellPx)
    const cellsRight = Math.ceil(Math.max(0, halfRank - cellPx / 2) / cellPx)
    const totalCells = cellsLeft + 1 + cellsRight

    const codes = []
    for (let i = -cellsLeft; i <= cellsRight; i++) {
      const pos = centerPos + i
      if (pos < 0 || pos > 255) continue
      codes.push(fileId + pos.toString(16).toUpperCase().padStart(2, '0'))
    }
    return { codes, cellsLeft, totalCells }
  }

  // Left-click: assign current rank state centered on the clicked cell
  function assignSlot(code) {
    const cellPx = glyphGridSize / 16
    const nativeH = 9
    const pixelScale = Math.max(1, Math.floor(cellPx / nativeH))
    const tmp = document.createElement('canvas')
    renderRank(tmp, s, pixelScale)
    const rankW = tmp.width

    const { codes, cellsLeft } = getSlotCodes(code, rankW, cellPx)

    setGlyphSlots(prev => {
      const next = new Map(prev)
      // Remove any existing slots that overlap
      codes.forEach(c => {
        const existing = next.get(c)
        if (existing && !existing.secondary) {
          existing.codes?.forEach(ec => next.delete(ec))
          next.delete(c)
        } else if (existing?.secondary) {
          const primary = next.get(existing.startCode)
          primary?.codes?.forEach(ec => next.delete(ec))
          next.delete(existing.startCode)
        }
      })
      // Store primary on the center cell
      next.set(code, { rankState: { ...s }, codes, cellsLeft, startCode: code })
      // Mark other cells as secondary
      codes.filter(c => c !== code).forEach(c =>
        next.set(c, { secondary: true, startCode: code })
      )
      return next
    })
  }

  // Remove a slot and all its secondary cells
  function removeSlot(startCode) {
    setGlyphSlots(prev => {
      const slot = prev.get(startCode)
      const next = new Map(prev)
      next.delete(startCode)
      if (slot?.codes) slot.codes.forEach(c => next.delete(c))
      return next
    })
  }

  /** Primary slot for a cell (secondary cells point to startCode). */
  function getPrimarySlot(code) {
    const entry = glyphSlots.get(code)
    if (!entry) return null
    if (entry.secondary) return glyphSlots.get(entry.startCode) ?? null
    return entry
  }

  /**
   * Export ZIP: one glyph_XX.png per file that has assigned slots,
   * plus a glyph_codes.txt listing.
   */
  async function exportZip() {
    if (glyphSlots.size === 0) return
    const zip = new JSZip()

    // Group PRIMARY slots by file prefix
    const byFile = new Map()
    for (const [code, slot] of glyphSlots) {
      if (slot.secondary) continue
      const fileId = code.slice(0, 2)
      if (!byFile.has(fileId)) byFile.set(fileId, [])
      byFile.get(fileId).push({ code, slot })
    }

    const gridPx = glyphGridSize
    const cellPx = gridPx / 16

    for (const [fileId, entries] of byFile) {
      const out = document.createElement('canvas')
      out.width  = gridPx
      out.height = gridPx
      const ctx  = out.getContext('2d')
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, gridPx, gridPx)

      for (const { code, slot } of entries) {
        if (slot.secondary) continue

        const { rankW, rankH, tmp } = calcRankCells(slot.rankState, cellPx)
        const codes     = slot.codes ?? [code]
        const cellsLeft = slot.cellsLeft ?? 0

        // The rank is centered: pixel offset of rank start relative to first cell's left edge
        // rankStart = firstCell.left + (cellsLeft * cellPx) - (rankW/2 - cellPx/2)
        // Simplified: rankStart within the first cell = -(cellsLeft * cellPx) + floor((cellPx - rankW) / 2 + cellsLeft * cellPx)
        // Actually: rank center aligns with center cell (index cellsLeft in codes array)
        // So rank pixel 0 starts at: centerCell.left + floor(cellPx/2) - floor(rankW/2)
        const centerCellIdx = cellsLeft
        const centerCode2   = codes[centerCellIdx] ?? codes[0]
        const centerPosNum  = parseInt(centerCode2.slice(2), 16)
        const centerCol     = centerPosNum % 16
        const centerRow     = Math.floor(centerPosNum / 16)
        const centerCellX   = centerCol * cellPx
        const centerCellY   = centerRow * cellPx

        // Rank top-left in grid coordinates
        const rankStartX = centerCellX + Math.floor(cellPx / 2) - Math.floor(rankW / 2)
        const rankStartY = centerCellY + Math.floor((cellPx - rankH) / 2)

        // Draw each cell's slice
        for (let i = 0; i < codes.length; i++) {
          const sliceCode = codes[i]
          const posNum = parseInt(sliceCode.slice(2), 16)
          const row    = Math.floor(posNum / 16)
          const col    = posNum % 16
          const cellX  = col * cellPx
          const _cellY = row * cellPx

          // Which part of the rank image falls inside this cell?
          const srcX = cellX - rankStartX
          const srcW = Math.min(cellPx, rankW - srcX, rankW)
          if (srcX >= rankW || srcW <= 0) continue

          const destX = Math.max(cellX, rankStartX)
          const destY = rankStartY

          ctx.drawImage(tmp, Math.max(0, srcX), 0, srcW, rankH, destX, destY, srcW, rankH)
        }
      }

      // Convert canvas to blob and add to zip
      const blob = await new Promise(resolve => out.toBlob(resolve, 'image/png'))
      zip.file(`glyph_${fileId}.png`, blob)
    }

    // Build glyph_codes.txt
    const lines = []
    const seen = new Set()
    for (const [code, slot] of glyphSlots) {
      if (slot.secondary) continue
      const startCode = slot.startCode ?? code
      if (seen.has(startCode)) continue
      seen.add(startCode)
      const codes = slot.codes ?? [code]
      const chars = codes.map(c => glyphCodeToChar(c)).join('')
      const escaped = codes.map(c => `\\u${c}`).join('')
      lines.push(`${codes.join('+')} → ${chars} (${escaped}) — ${slot.rankState.rankText} [${codes.length} cell${codes.length > 1 ? 's' : ''}]`)
    }
    zip.file('glyph_codes.txt', lines.join('\n'))

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.download = 'bedrock_glyphs.zip'
    a.href = URL.createObjectURL(zipBlob)
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const glyphFile = GLYPH_FILES.find(f => f.id === glyphCategory) ?? GLYPH_FILES[0]
  const HEX = '0123456789ABCDEF'.split('')
  const directions = dirOptions(t)
  const iconPositions = iconPosOptions(t)

  // Hovered cell info
  const hoveredChar = hoveredCell ? glyphCodeToChar(hoveredCell) : null
  const hoveredUni  = hoveredCell ? `\\u${hoveredCell}` : null

  // Preview: how many cells current rank needs (computed from state, not ref)
  const previewCellCount = (() => {
    const cellPx = glyphGridSize / 16
    const nativeH = 9
    const _pixelScale = Math.max(1, Math.floor(cellPx / nativeH))
    const tmp = document.createElement('canvas')
    renderRank(tmp, s, _pixelScale)
    return Math.ceil(tmp.width / cellPx)
  })()

  const primarySlots = [...glyphSlots.entries()].filter(([, v]) => !v.secondary)
  const exportZipLabel = primarySlots.length === 1
    ? t('pixelRank.exportZip', { count: primarySlots.length })
    : t('pixelRank.exportZip_plural', { count: primarySlots.length })

  function cellTooltip(code, knownLabel) {
    const labelSuffix = knownLabel ? t('pixelRank.cellTitleLabel', { label: knownLabel }) : ''
    const key = previewCellCount === 1 ? 'pixelRank.cellTitle' : 'pixelRank.cellTitle_plural'
    return t(key, { code, label: labelSuffix, cells: previewCellCount })
  }

  return (
    <div className="flex-1 flex overflow-hidden animate-fade-in min-h-0">

      {/* ── Left scrollable panel ── */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-5 flex flex-col gap-5 pb-8">

          {/* Header */}
          <div className="flex items-center gap-3">
            <button onClick={onBack}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm flex-shrink-0">
              <ArrowLeftIcon className="w-4 h-4" />{t('common.back')}
            </button>
            <div className="w-px h-4 bg-white/10 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-indigo-400/70 uppercase tracking-widest font-semibold">{t('pixelRank.badge')}</p>
              <h1 className="text-xl font-bold text-white leading-tight">{t('pixelRank.title')}</h1>
              <p className="text-xs text-white/35 mt-0.5">{t('pixelRank.subtitle')}</p>
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">{t('pixelRank.livePreview')}</p>
                <p className="text-[10px] text-white/25">{t('pixelRank.livePreviewHint')}</p>
              </div>
              <button onClick={() => setS(DEFAULT_STATE)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white/40 text-xs hover:text-white/70 transition-all">
                <ArrowPathIcon className="w-3.5 h-3.5" />{t('pixelRank.reset')}
              </button>
            </div>
            <div className="flex items-center justify-center min-h-[72px] bg-[#0d0d1a] rounded-xl border border-white/[0.04]">
              <canvas ref={previewRef} style={{ imageRendering: 'pixelated' }} />
            </div>
          </div>

          {/* Presets */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-2">{t('pixelRank.presets')}</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-xs text-white/60 hover:text-white/90 hover:bg-white/[0.08] transition-all">
                  {t(`pixelRank.${PRESET_I18N_KEYS[i]}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-2">{t('pixelRank.options')}</p>
            <div className="flex flex-wrap gap-2">
              {TOGGLE_OPTIONS.map(([lblKey, key]) => (
                <Toggle key={key} label={t(`pixelRank.${lblKey}`)} value={s[key]} onChange={v => set({ [key]: v })} />
              ))}
            </div>
          </div>

          {/* Text & Icon */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-3">{t('pixelRank.textAndIcon')}</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('pixelRank.rankText')}</label>
                <input value={s.rankText} onChange={e => set({ rankText: e.target.value.toUpperCase() })}
                  className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 font-mono outline-none focus:border-indigo-500/30 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CustomDropdown
                  label={t('pixelRank.icon')}
                  value={s.icon}
                  onChange={v => set({ icon: v })}
                  options={Object.keys(ICONS)}
                  searchable
                  renderOption={iconDropdownRender}
                  renderValue={iconDropdownValue}
                  menuMinWidth={220}
                />
                <CustomDropdown
                  label={t('pixelRank.iconPosition')}
                  value={s.iconPosition}
                  onChange={v => set({ iconPosition: v })}
                  options={iconPositions}
                />
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('pixelRank.paddingX', { px: s.paddingX })}</label>
                <input type="range" min={1} max={12} value={s.paddingX} onChange={e => set({ paddingX: +e.target.value })}
                  className="w-full accent-indigo-500" />
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('pixelRank.iconGap', { px: s.iconGap ?? 1 })}</label>
                <input type="range" min={0} max={4} value={s.iconGap ?? 1} onChange={e => set({ iconGap: +e.target.value })}
                  className="w-full accent-violet-500" />
              </div>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex gap-3">
            <button onClick={copyPng}
              className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/60 text-sm font-semibold hover:text-white/90 hover:bg-white/[0.10] transition-all active:scale-95">
              {t('pixelRank.copyPng')}
            </button>
            <button onClick={savePng}
              className="flex-[2] py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/30 transition-all active:scale-95">
              {t('pixelRank.savePng')}
            </button>
          </div>

          {/* ── Glyph Browser (2-column: grid left, slot panel right) ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('pixelRank.glyphSlots')}</p>
              <span className="text-[10px] text-white/20">{t('pixelRank.glyphHint')}</span>
            </div>

            {/* Grid size + file selector row */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="w-36">
                <CustomDropdown
                  label={t('pixelRank.gridSize')}
                  value={glyphGridSize}
                  onChange={v => setGlyphGridSize(+v)}
                  options={[256, 512, 1024].map(n => ({ value: n, label: t('pixelRank.gridSizePx', { n }) }))}
                />
              </div>
              <div className="text-[10px] text-white/25">
                {t('pixelRank.cellSize', { w: glyphGridSize / 16, h: glyphGridSize / 16 })}
              </div>
            </div>

            {/* File selector */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {GLYPH_FILES.map(f => (
                <button key={f.id} onClick={() => setGlyphCategory(f.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                    glyphCategory === f.id
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      : f.vanilla
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-300/60 hover:text-amber-300'
                        : 'bg-white/[0.04] border-white/[0.07] text-white/30 hover:text-white/60'
                  }`}>
                  {f.id}
                </button>
              ))}
            </div>

            {/* File badge */}
            <div className="flex items-center gap-2 mb-2 text-[10px]">
              <span className="font-mono text-white/40">{glyphFile.label}</span>
              {glyphFile.vanilla
                ? <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">{t('pixelRank.vanillaAvoid')}</span>
                : <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">{t('pixelRank.freeSafe')}</span>
              }
            </div>

            {/* 2-column layout: grid + slot info panel */}
            <div className="flex gap-3 items-start">

              {/* 16×16 compact grid */}
              <div className="overflow-x-auto flex-shrink-0">
                <div className="flex mb-0.5 ml-5">
                  {HEX.map(d => (
                    <div key={d} className="w-6 text-center text-[8px] text-white/15 font-mono flex-shrink-0">{d}</div>
                  ))}
                </div>
                {HEX.map((rowHex, row) => (
                  <div key={rowHex} className="flex items-center mb-0.5">
                    <div className="w-5 text-[8px] text-white/15 font-mono flex-shrink-0 text-right pr-1">{rowHex}</div>
                    {HEX.map((_, col) => {
                      const code    = posToCode(glyphCategory, row, col)
                      const pos     = code.slice(2)
                      const label   = glyphFile.known?.[pos]
                      const char    = glyphCodeToChar(code)
                      const slotEntry = glyphSlots.get(code)
                      const hasSlot   = !!slotEntry
                      const isSecondary = slotEntry?.secondary
                      const isCopied  = copiedGlyph === code
                      return (
                        <button
                          key={col}
                          onClick={() => assignSlot(code)}
                          onContextMenu={e => { e.preventDefault(); copyGlyph(char, code) }}
                          onMouseEnter={() => setHoveredCell(code)}
                          onMouseLeave={() => setHoveredCell(null)}
                          title={cellTooltip(code, label)}
                          className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded text-sm transition-all border relative ${
                            isSecondary
                              ? 'bg-emerald-500/10 border-emerald-400/30'
                              : hasSlot
                                ? 'bg-emerald-500/20 border-emerald-400/50 hover:bg-emerald-500/30 hover:scale-110'
                                : isCopied
                                  ? 'bg-indigo-500/30 border-indigo-400/60 scale-110'
                                  : label
                                    ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:scale-110'
                                    : 'bg-white/[0.03] border-white/[0.04] hover:bg-indigo-500/15 hover:border-indigo-500/30 hover:scale-110'
                          }`}
                        >
                          <span className="text-xs select-none">{char}</span>
                          {hasSlot && !isSecondary && (
                            <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 translate-x-0.5 -translate-y-0.5" />
                          )}
                          {isSecondary && (
                            <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-300/50 translate-x-0.5 -translate-y-0.5" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
                <div className="mt-2">
                  <p className="text-[10px] text-white/20">{t('pixelRank.gridLegend')}</p>
                </div>
              </div>

              {/* Slot info panel (w-64) */}
              <div className="w-64 flex-shrink-0 flex flex-col gap-3">

                {/* Hovered / selected cell info */}
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3 flex flex-col gap-2">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">{t('pixelRank.cellInfo')}</p>
                  {hoveredCell ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white/80">{hoveredCell}</span>
                        <span className="text-lg leading-none">{hoveredChar}</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => copyGlyph(hoveredChar, hoveredCell + '_char')}
                          className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] text-white/60 hover:text-white/90 transition-all">
                          {t('pixelRank.copyChar')}
                        </button>
                        <button
                          onClick={() => copyGlyph(hoveredUni, hoveredCell + '_uni')}
                          className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] font-mono text-white/60 hover:text-white/90 transition-all">
                          {t('pixelRank.copyUni', { uni: hoveredUni })}
                        </button>
                      </div>
                      {(() => {
                        const primary = hoveredCell ? getPrimarySlot(hoveredCell) : null
                        const rankLabel = primary?.rankState?.rankText
                        return rankLabel ? (
                          <p className="text-[10px] text-emerald-400">{t('pixelRank.assigned', { name: rankLabel })}</p>
                        ) : null
                      })()}
                    </>
                  ) : (
                    <p className="text-[10px] text-white/20">{t('pixelRank.hoverCellHint')}</p>
                  )}
                </div>

                {/* Assigned slots list */}
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                      {t('pixelRank.assignedSlots', { count: primarySlots.length })}
                    </p>
                    {primarySlots.length > 0 && (
                      <button onClick={() => setGlyphSlots(new Map())}
                        className="text-[10px] text-white/25 hover:text-red-400 transition-colors">
                        {t('pixelRank.clearAll')}
                      </button>
                    )}
                  </div>
                  {primarySlots.length === 0 ? (
                    <p className="text-[10px] text-white/20">{t('pixelRank.noSlotsYet')}</p>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                      {primarySlots.map(([code, slot]) => (
                        <div key={code} className="flex items-center justify-between gap-2 py-1 border-b border-white/[0.05] last:border-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-[11px] text-white/50 flex-shrink-0">{code}</span>
                            <span className="text-sm leading-none flex-shrink-0">{glyphCodeToChar(code)}</span>
                            <span className="text-[11px] text-white/60 truncate">{slot.rankState.rankText}</span>
                            {slot.codes?.length > 1 && (
                              <span className="text-[9px] text-emerald-400/70 flex-shrink-0">{slot.codes.length}c</span>
                            )}
                          </div>
                          <button onClick={() => removeSlot(code)}
                            className="text-[10px] text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export ZIP button */}
                <button
                  onClick={exportZip}
                  disabled={primarySlots.length === 0}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/30 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed">
                  {exportZipLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right fixed color panel ── */}
      <div className="w-60 flex-shrink-0 border-l border-white/[0.06] overflow-y-auto">
        <div className="p-4 flex flex-col gap-3">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('pixelRank.colors')}</p>
            <p className="text-[10px] text-white/20 mt-0.5">{t('pixelRank.colorsHint')}</p>
          </div>

          <CustomDropdown
            label={t('pixelRank.bgGradientCount')}
            value={s.bgColorCount}
            onChange={v => set({ bgColorCount: +v })}
            options={[2, 3, 4, 5, 6, 7].map(n => ({ value: n, label: t('pixelRank.colorsN', { n }) }))}
          />

          {Array.from({ length: s.bgColorCount }).map((_, i) => (
            <ColorRow key={i} label={t(`pixelRank.${BG_LABEL_KEYS[i]}`)} value={s.bgColors[i]} onChange={v => setBgColor(i, v)} />
          ))}

          <CustomDropdown
            label={t('pixelRank.bgDirection')}
            value={s.bgDir}
            onChange={v => set({ bgDir: v })}
            options={directions}
          />

          <ColorRow label={t('pixelRank.textColor')} value={s.textColor} onChange={v => set({ textColor: v })} />

          {s.showTextGradient && <>
            <ColorRow label={t('pixelRank.textGrad1')} value={s.textGrad1} onChange={v => set({ textGrad1: v })} />
            <ColorRow label={t('pixelRank.textGrad2')} value={s.textGrad2} onChange={v => set({ textGrad2: v })} />
            <CustomDropdown
              label={t('pixelRank.textDirection')}
              value={s.textGradDir}
              onChange={v => set({ textGradDir: v })}
              options={directions}
            />
          </>}

          <ColorRow label={t('pixelRank.shadowColor')} value={s.shadowColor} onChange={v => set({ shadowColor: v })} />

          <ColorRow label={t('pixelRank.iconColor')} value={s.iconColor} onChange={v => set({ iconColor: v })} />

          {s.showIconGradient && <>
            <ColorRow label={t('pixelRank.iconGrad1')} value={s.iconGrad1} onChange={v => set({ iconGrad1: v })} />
            <ColorRow label={t('pixelRank.iconGrad2')} value={s.iconGrad2} onChange={v => set({ iconGrad2: v })} />
            <CustomDropdown
              label={t('pixelRank.iconDirection')}
              value={s.iconGradDir ?? 'Top to Bottom'}
              onChange={v => set({ iconGradDir: v })}
              options={directions}
            />
          </>}

          <ColorRow label={t('pixelRank.borderColor')} value={s.borderColor} onChange={v => set({ borderColor: v })} />

          <ColorRow label={t('pixelRank.dividerColor')} value={s.dividerColor} onChange={v => set({ dividerColor: v })} />
        </div>
      </div>

      {/* Hidden export canvas */}
      <canvas ref={exportRef} style={{ display: 'none', imageRendering: 'pixelated' }} />
    </div>
  )
}
