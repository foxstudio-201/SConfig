import { useState } from 'react'
import { ArrowLeftIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'

const MC_COLORS = [
  { code: '0', hex: '#000000', name: 'Black' },
  { code: '1', hex: '#0000AA', name: 'Dark Blue' },
  { code: '2', hex: '#00AA00', name: 'Dark Green' },
  { code: '3', hex: '#00AAAA', name: 'Dark Aqua' },
  { code: '4', hex: '#AA0000', name: 'Dark Red' },
  { code: '5', hex: '#AA00AA', name: 'Dark Purple' },
  { code: '6', hex: '#FFAA00', name: 'Gold' },
  { code: '7', hex: '#AAAAAA', name: 'Gray' },
  { code: '8', hex: '#555555', name: 'Dark Gray' },
  { code: '9', hex: '#5555FF', name: 'Blue' },
  { code: 'a', hex: '#55FF55', name: 'Green' },
  { code: 'b', hex: '#55FFFF', name: 'Aqua' },
  { code: 'c', hex: '#FF5555', name: 'Red' },
  { code: 'd', hex: '#FF55FF', name: 'Light Purple' },
  { code: 'e', hex: '#FFFF55', name: 'Yellow' },
  { code: 'f', hex: '#FFFFFF', name: 'White' },
]
const MC_FORMATS = [
  { code: 'l', label: 'Bold',          style: { fontWeight: 'bold' } },
  { code: 'o', label: 'Italic',        style: { fontStyle: 'italic' } },
  { code: 'n', label: 'Underline',     style: { textDecoration: 'underline' } },
  { code: 'm', label: 'Strikethrough', style: { textDecoration: 'line-through' } },
  { code: 'k', label: 'Obfuscated',    style: { filter: 'blur(3px)' } },
  { code: 'r', label: 'Reset',         style: {} },
]

function parseMcText(text) {
  const parts = []
  const regex = /[&§]([0-9a-fk-orA-FK-OR])/g
  let last = 0, currentColor = '#FFFFFF', currentStyle = {}
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), color: currentColor, style: { ...currentStyle } })
    const code = match[1].toLowerCase()
    const color = MC_COLORS.find(c => c.code === code)
    const fmt   = MC_FORMATS.find(f => f.code === code)
    if (color) { currentColor = color.hex; currentStyle = {} }
    else if (fmt) { if (code === 'r') { currentColor = '#FFFFFF'; currentStyle = {} } else currentStyle = { ...currentStyle, ...fmt.style } }
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), color: currentColor, style: { ...currentStyle } })
  return parts
}

export default function ColorPreviewTool({ onBack }) {
  const [input, setInput] = useState('&6Hello &aWorld&r! &lBold &cRed')
  const [copied, setCopied] = useState(false)
  const parts = parseMcText(input)

  function copy() { navigator.clipboard.writeText(input); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  function insertCode(code) { setInput(v => v + `&${code}`) }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0 flex-wrap">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-semibold uppercase">Text Tool</span>
            <h1 className="text-lg font-bold text-white">Color Code Preview</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">Preview Minecraft &amp; color codes in real time</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl flex flex-col gap-5">
        <div>
          <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">Input text with &amp; codes</label>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 font-mono outline-none focus:border-indigo-500/40 transition-colors" />
            <button onClick={copy} className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/80 transition-colors flex items-center gap-1.5 text-xs">
              <ClipboardDocumentIcon className="w-3.5 h-3.5" />{copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div>
          <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">Preview</label>
          <div className="bg-[#1a1a2e] border border-white/[0.06] rounded-xl px-4 py-3 min-h-[44px] font-mono text-sm leading-relaxed">
            {parts.length === 0 ? <span className="text-white/20">Type something above…</span>
              : parts.map((p, i) => <span key={i} style={{ color: p.color, ...p.style }}>{p.text}</span>)}
          </div>
        </div>
        <div>
          <label className="text-[10px] text-white/30 uppercase tracking-wider mb-2 block">Color codes — click to insert</label>
          <div className="flex flex-wrap gap-1.5">
            {MC_COLORS.map(c => (
              <button key={c.code} onClick={() => insertCode(c.code)} title={`&${c.code} — ${c.name}`}
                className="w-7 h-7 rounded-lg border border-white/10 hover:scale-110 transition-transform flex items-center justify-center text-[10px] font-bold"
                style={{ background: c.hex, color: ['f','e','a','b'].includes(c.code) ? '#000' : '#fff' }}>
                {c.code}
              </button>
            ))}
            {MC_FORMATS.map(f => (
              <button key={f.code} onClick={() => insertCode(f.code)} title={`&${f.code} — ${f.label}`}
                className="px-2 h-7 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] transition-colors text-[10px] font-bold text-white/60">
                &amp;{f.code}
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
