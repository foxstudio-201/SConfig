/**
 * Bedrock Glyph Tool
 * - Convert glyph code (e.g. E102) → Unicode character to paste in Minecraft
 * - Browse 16×16 grid per glyph file
 * - Shows vanilla known labels for E0/E1
 * - Copy char or \uXXXX escape code
 */
import { useState } from 'react'
import { ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { GLYPH_FILES, glyphCodeToChar, posToCode, posToRowCol } from './glyphData'

const HEX_DIGITS = '0123456789ABCDEF'.split('')

function useCopy() {
  const [copied, setCopied] = useState(null)
  function copy(text, id) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }
  return { copied, copy }
}

// ── Converter section ─────────────────────────────────────────────────────────
function Converter() {
  const [input, setInput] = useState('E102')
  const { copied, copy } = useCopy()

  const clean = input.trim().toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 4)
  const char  = clean.length === 4 ? glyphCodeToChar(clean) : ''
  const escape = clean.length === 4 ? `\\u${clean}` : ''
  const file  = GLYPH_FILES.find(f => f.id === clean.slice(0, 2))
  const pos   = clean.length === 4 ? clean.slice(2) : ''
  const { row, col } = pos ? posToRowCol(pos) : { row: -1, col: -1 }
  const label = file?.known?.[pos] ?? null

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold text-white/70 mb-0.5">Glyph Code Converter</p>
        <p className="text-[11px] text-white/35">Enter a 4-char hex code like <span className="font-mono text-indigo-300">E102</span> → get the Unicode character to paste in Minecraft.</p>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Glyph Code (e.g. E102)</label>
          <input
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            maxLength={4}
            placeholder="E102"
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 font-mono outline-none focus:border-indigo-500/40 transition-colors tracking-widest"
          />
        </div>
        {/* Result */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/30 border border-white/[0.06] min-w-[120px]">
          <span className="text-2xl select-all">{char || <span className="text-white/15 text-sm">—</span>}</span>
          {char && (
            <div className="flex flex-col gap-1">
              <button onClick={() => copy(char, 'char')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                  copied === 'char' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-white/[0.06] border-white/10 text-white/50 hover:text-white/80'
                }`}>
                {copied === 'char' ? <CheckCircleIcon className="w-3 h-3" /> : <ClipboardDocumentIcon className="w-3 h-3" />}
                Char
              </button>
              <button onClick={() => copy(escape, 'esc')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                  copied === 'esc' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-white/[0.06] border-white/10 text-white/50 hover:text-white/80'
                }`}>
                {copied === 'esc' ? <CheckCircleIcon className="w-3 h-3" /> : <span className="font-mono text-[9px]">\u</span>}
                Code
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      {clean.length === 4 && (
        <div className="flex flex-wrap gap-3 text-[11px]">
          <span className="text-white/40">File: <span className="text-white/70 font-mono">{file?.label ?? '?'}</span></span>
          <span className="text-white/40">Row: <span className="text-white/70">{row}</span></span>
          <span className="text-white/40">Col: <span className="text-white/70">{col}</span></span>
          {label && <span className="text-white/40">Label: <span className="text-indigo-300">{label}</span></span>}
          {file && !file.vanilla && <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">Free slot</span>}
          {file?.vanilla && <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">Vanilla</span>}
        </div>
      )}
    </div>
  )
}

// ── Grid browser ──────────────────────────────────────────────────────────────
function GridBrowser() {
  const [fileId, setFileId] = useState('E0')
  const [hovered, setHovered] = useState(null)
  const { copied, copy } = useCopy()

  const file = GLYPH_FILES.find(f => f.id === fileId)

  function handleCell(row, col) {
    const code = posToCode(fileId, row, col)
    const char = glyphCodeToChar(code)
    copy(char, code)
  }

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold text-white/70 mb-0.5">Glyph Grid Browser</p>
        <p className="text-[11px] text-white/35">Click any cell to copy its character. Hover to see the code.</p>
      </div>

      {/* File selector */}
      <div className="flex flex-wrap gap-1.5">
        {GLYPH_FILES.map(f => (
          <button key={f.id} onClick={() => setFileId(f.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
              fileId === f.id
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : f.vanilla
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-300/70 hover:text-amber-300'
                  : 'bg-white/[0.04] border-white/[0.07] text-white/35 hover:text-white/60'
            }`}>
            {f.id}
          </button>
        ))}
      </div>

      {/* File info */}
      <div className="flex items-center gap-3 text-[11px]">
        <span className="font-mono text-white/60">{file?.label}</span>
        {file?.vanilla
          ? <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">Vanilla — some cells occupied</span>
          : <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">Free — safe for custom glyphs</span>
        }
      </div>

      {/* 16×16 grid */}
      <div className="overflow-x-auto">
        {/* Column headers */}
        <div className="flex mb-1 ml-8">
          {HEX_DIGITS.map(d => (
            <div key={d} className="w-8 text-center text-[9px] text-white/20 font-mono flex-shrink-0">{d}</div>
          ))}
        </div>
        {/* Rows */}
        {HEX_DIGITS.map((rowHex, row) => (
          <div key={rowHex} className="flex items-center mb-0.5">
            {/* Row label */}
            <div className="w-8 text-[9px] text-white/20 font-mono flex-shrink-0 text-right pr-1">{rowHex}</div>
            {/* Cells */}
            {HEX_DIGITS.map((colHex, col) => {
              const code  = posToCode(fileId, row, col)
              const pos   = code.slice(2)
              const label = file?.known?.[pos]
              const char  = glyphCodeToChar(code)
              const isKnown = !!label
              const isCopied = copied === code

              return (
                <button
                  key={colHex}
                  onClick={() => handleCell(row, col)}
                  onMouseEnter={() => setHovered({ code, label, char })}
                  onMouseLeave={() => setHovered(null)}
                  title={`${code}${label ? ' — ' + label : ''}`}
                  className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-base transition-all border ${
                    isCopied
                      ? 'bg-emerald-500/25 border-emerald-500/40 scale-110'
                      : isKnown
                        ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:scale-110'
                        : 'bg-white/[0.03] border-white/[0.05] hover:bg-indigo-500/15 hover:border-indigo-500/30 hover:scale-110'
                  }`}
                >
                  <span className="text-sm select-none">{char}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Hover info */}
      <div className="h-8 flex items-center gap-3 text-[11px]">
        {hovered ? (
          <>
            <span className="text-xl">{hovered.char}</span>
            <span className="font-mono text-indigo-300">\u{hovered.code}</span>
            {hovered.label && <span className="text-white/50">{hovered.label}</span>}
            <span className="text-white/25">Click to copy</span>
          </>
        ) : (
          <span className="text-white/20">Hover a cell to preview</span>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GlyphTool({ onBack }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm">
          <ArrowLeftIcon className="w-4 h-4" />Back
        </button>
        <div className="w-px h-4 bg-white/10" />
        <div>
          <h1 className="text-xl font-bold text-white">Bedrock Glyph Tool</h1>
          <p className="text-xs text-white/35 mt-0.5">
            Convert glyph codes to Unicode characters for use in Minecraft Bedrock resource packs.
            Based on <span className="text-indigo-300">wiki.bedrock.dev/text/custom-emojis</span>
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-5 px-4 py-3 rounded-xl bg-indigo-500/8 border border-indigo-500/20 text-[11px] text-indigo-300/80 leading-relaxed">
        <p className="font-semibold text-indigo-300 mb-1">How Bedrock glyphs work</p>
        <p>Glyphs are stored in <span className="font-mono bg-black/20 px-1 rounded">RP/font/glyph_E0.png</span>, <span className="font-mono bg-black/20 px-1 rounded">glyph_E1.png</span>, etc.
        Each file is a 16×16 grid. A code like <span className="font-mono bg-black/20 px-1 rounded">E102</span> means file <span className="font-mono">E1</span>, row 0, col 2.
        Vanilla uses E0 and E1. Files E2–F8 are free for custom use.</p>
      </div>

      <div className="flex flex-col gap-5">
        <Converter />
        <GridBrowser />
      </div>
    </div>
  )
}
