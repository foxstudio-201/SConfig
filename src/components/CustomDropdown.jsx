import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function normalizeOptions(options) {
  return options.map(o => {
    if (typeof o === 'string' || typeof o === 'number') return { value: o, label: String(o) }
    return { value: o.value, label: o.label ?? String(o.value), disabled: o.disabled }
  })
}

export default function CustomDropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  className = '',
  menuClassName = '',
  menuMinWidth = 0,
  disabled = false,
  searchable = false,
  renderOption,
  renderValue,
  accent = 'indigo',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const items = useMemo(() => normalizeOptions(options), [options])
  const selected = items.find(o => o.value === value)
  const accentRing = accent === 'rose' ? 'focus:border-rose-500/40 border-rose-500/30' : 'focus:border-indigo-500/40 border-indigo-500/30'
  const accentActive = accent === 'rose' ? 'bg-rose-500/20 text-rose-200' : 'bg-indigo-500/20 text-indigo-200'
  const accentCheck = accent === 'rose' ? 'text-rose-300' : 'text-indigo-300'

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return items
    const q = query.trim().toLowerCase()
    return items.filter(o => o.label.toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q))
  }, [items, query, searchable])

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setMenuStyle({
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, menuMinWidth),
    })
  }, [menuMinWidth])

  function toggle() {
    if (disabled) return
    if (!open) updateMenuPosition()
    setOpen(v => !v)
    if (open) setQuery('')
  }

  function pick(opt) {
    if (opt.disabled) return
    onChange(opt.value)
    setOpen(false)
    setQuery('')
  }

  useEffect(() => {
    if (!open) return
    updateMenuPosition()
    function onPointer(e) {
      const t = triggerRef.current
      const m = menuRef.current
      if (t?.contains(e.target) || m?.contains(e.target)) return
      setOpen(false)
      setQuery('')
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    function onScroll() {
      updateMenuPosition()
    }
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open, updateMenuPosition])

  const menu = open && createPortal(
    <div
      ref={menuRef}
      style={{ top: menuStyle.top, left: menuStyle.left, width: menuStyle.width }}
      className={`fixed z-[9999] rounded-xl border border-white/[0.10] bg-[#12121c]/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.55)] overflow-hidden animate-fade-in ${menuClassName}`}
    >
      {searchable && (
        <div className="p-2 border-b border-white/[0.06]">
          <div className="relative">
            <MagnifyingGlassIcon className="w-3.5 h-3.5 text-white/25 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg pl-8 pr-2 py-1.5 text-xs text-white/80 outline-none focus:border-indigo-500/30"
            />
          </div>
        </div>
      )}
      <ul className="max-h-56 overflow-y-auto py-1.5 custom-dropdown-scroll">
        {filtered.length === 0 && (
          <li className="px-3 py-2 text-xs text-white/30 text-center">No results</li>
        )}
        {filtered.map(opt => {
          const isSelected = opt.value === value
          return (
            <li key={String(opt.value)}>
              <button
                type="button"
                disabled={opt.disabled}
                onClick={() => pick(opt)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                  opt.disabled
                    ? 'opacity-30 cursor-not-allowed'
                    : isSelected
                      ? accentActive
                      : 'text-white/70 hover:bg-white/[0.06] hover:text-white/95'
                }`}
              >
                {renderOption ? (
                  renderOption(opt, isSelected)
                ) : (
                  <>
                    <span className="flex-1 truncate">{opt.label}</span>
                    {isSelected && <CheckIcon className={`w-4 h-4 flex-shrink-0 ${accentCheck}`} />}
                  </>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>,
    document.body,
  )

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-[10px] text-white/30 uppercase tracking-wider">{label}</label>
      )}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left transition-all outline-none ${
          disabled
            ? 'opacity-40 cursor-not-allowed bg-white/[0.02] border-white/[0.05] text-white/30'
            : open
              ? `bg-white/[0.07] ${accentRing} text-white/90 shadow-[0_0_0_1px_rgba(99,102,241,0.15)]`
              : 'bg-white/[0.04] border-white/[0.08] text-white/80 hover:bg-white/[0.06] hover:border-white/[0.12]'
        }`}
      >
        <span className="flex-1 min-w-0 truncate">
          {renderValue
            ? renderValue(selected)
            : selected?.label ?? <span className="text-white/30">{placeholder}</span>}
        </span>
        <ChevronDownIcon className={`w-4 h-4 flex-shrink-0 text-white/35 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {menu}
    </div>
  )
}
