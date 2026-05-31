import { useState, useEffect, useCallback, useRef } from 'react'
import { storeGet } from '../../hooks/useStore'
import { useToast } from '../../hooks/useToast'
import { useI18n } from '../../context/I18nContext'
import MonacoEditor from '../MonacoEditor'
import {
  PuzzlePieceIcon,
  MagnifyingGlassIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

const isElectron = typeof window !== 'undefined' && window.sconfigAPI

const CONFIG_EXTS = ['.yml', '.yaml', '.json', '.toml', '.properties', '.conf', '.cfg', '.txt']

// ── Config file editor (Monaco) ───────────────────────────────────────────────
function ConfigEditor({ file, onBack }) {
  const { t } = useI18n()
  const [content, setContent]   = useState('')
  const [original, setOriginal] = useState('')
  const [saving, setSaving]     = useState(false)
  const toast = useToast()
  // Stable ref updated via layout effect (before paint, safe for closures)
  const showToast = useRef(toast.show)
  // eslint-disable-next-line react-hooks/refs
  showToast.current = toast.show

  const isDirty = content !== original

  useEffect(() => {
    if (!isElectron) return
    window.sconfigAPI.readFile(file.path).then(res => {
      if (res.ok) { setContent(res.data); setOriginal(res.data) }
      else showToast.current(t('plugins.toastReadFailed', { error: res.error }), 'error')
    })
  }, [file.path, t])

  const save = useCallback(async () => {
    if (!isElectron) return
    setSaving(true)
    const res = await window.sconfigAPI.writeFile(file.path, content)
    setSaving(false)
    if (res.ok) { setOriginal(content); showToast.current(t('plugins.toastSaved'), 'success') }
    else showToast.current(t('files.toastSaveFailed', { error: res.error }), 'error')
  }, [file.path, content, t])

  // Ctrl+S from Monaco
  useEffect(() => {
    const handler = () => { if (isDirty) save() }
    window.addEventListener('monaco-save', handler)
    return () => window.removeEventListener('monaco-save', handler)
  }, [isDirty, save])

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.05] bg-black/20 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm">
          <ArrowLeftIcon className="w-4 h-4" />
          {t('common.back')}
        </button>
        <div className="w-px h-4 bg-white/10" />
        <DocumentTextIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-white/80 truncate max-w-xs">{file.name}</span>
        {isDirty && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title={t('files.unsaved')} />}
        <div className="flex-1" />
        <span className="text-[11px] text-white/20 hidden sm:block">{t('files.ctrlSave')}</span>
        <button
          onClick={save}
          disabled={!isDirty || saving}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all active:scale-95 flex-shrink-0 ${
            isDirty
              ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30'
              : 'bg-white/5 border border-white/10 text-white/25 cursor-not-allowed'
          }`}
        >
          {saving ? t('common.saving') : t('common.save')}
        </button>
      </div>
      <div className="flex-1 overflow-hidden p-3">
        <MonacoEditor value={content} onChange={val => setContent(val ?? '')} filename={file.name} />
      </div>
    </div>
  )
}

// ── Plugin card ───────────────────────────────────────────────────────────────
function PluginCard({ plugin, onSelect }) {
  const { t } = useI18n()
  const n = plugin.configFiles.length
  const countLabel = n === 1
    ? t('plugins.configFileCount', { count: n })
    : t('plugins.configFileCount_plural', { count: n })
  return (
    <button
      onClick={() => onSelect(plugin)}
      className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all group text-left w-full"
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center flex-shrink-0">
        <PuzzlePieceIcon className="w-5 h-5 text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90">{plugin.name}</p>
        <p className="text-xs text-white/30 mt-0.5">{countLabel}</p>
      </div>
      <ChevronRightIcon className="w-4 h-4 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
    </button>
  )
}

// ── Plugin detail ─────────────────────────────────────────────────────────────
function PluginDetail({ plugin, onBack, onOpenFile }) {
  const { t } = useI18n()
  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm">
          <ArrowLeftIcon className="w-4 h-4" />
          {t('plugins.backToPlugins')}
        </button>
        <ChevronRightIcon className="w-3.5 h-3.5 text-white/20" />
        <span className="text-sm font-semibold text-white/80">{plugin.name}</span>
      </div>
      <h2 className="text-lg font-bold text-white mb-1">{plugin.name}</h2>
      <p className="text-xs text-white/30 mb-6 font-mono">{plugin.path}</p>
      <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">{t('plugins.configFiles')}</h3>
      {plugin.configFiles.length === 0 ? (
        <p className="text-sm text-white/25 py-8 text-center">{t('plugins.noConfigFiles')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {plugin.configFiles.map(f => (
            <button
              key={f.path}
              onClick={() => onOpenFile(f)}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all group text-left"
            >
              <DocumentTextIcon className="w-4 h-4 text-indigo-400/70 flex-shrink-0" />
              <span className="text-sm text-white/70 font-mono flex-1 truncate">{f.name}</span>
              <ChevronRightIcon className="w-3.5 h-3.5 text-white/20 group-hover:text-indigo-400 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PluginsPage() {
  const { t } = useI18n()
  const [plugins, setPlugins]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)
  const [openFile, setOpenFile] = useState(null)
  const toast = useToast()
  const showToast = useRef(toast.show)
  // eslint-disable-next-line react-hooks/refs
  showToast.current = toast.show

  const scanPlugins = useCallback(async () => {
    const serverPath = await storeGet('serverPath')
    if (!serverPath) {
      showToast.current(t('plugins.toastNoServer'), 'warning')
      return
    }
    if (!isElectron) {
      showToast.current(t('plugins.toastElectronOnly'), 'warning')
      return
    }
    setLoading(true)
    try {
      const pluginsDir = serverPath.replace(/[\\/]$/, '') + '/plugins'
      const listing = await window.sconfigAPI.listDir(pluginsDir)
      if (!listing.ok) {
        showToast.current(t('plugins.toastScanFailed', { error: listing.error }), 'error')
        setLoading(false)
        return
      }
      const dirs = listing.entries.filter(e => e.isDir)
      const result = []
      for (const dir of dirs) {
        const inner = await window.sconfigAPI.listDir(dir.path)
        const configFiles = inner.ok
          ? inner.entries.filter(e => !e.isDir && CONFIG_EXTS.some(ext => e.name.toLowerCase().endsWith(ext)))
          : []
        result.push({ name: dir.name, path: dir.path, configFiles })
      }
      setPlugins(result)
      const n = result.length
      showToast.current(
        n === 1 ? t('plugins.toastFound', { count: n }) : t('plugins.toastFound_plural', { count: n }),
        'success',
      )
    } catch (e) {
      showToast.current(t('plugins.toastScanError', { error: e.message }), 'error')
    }
    setLoading(false)
  }, [t])

  // Run once on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    scanPlugins()
  }, [scanPlugins])

  const filtered = plugins.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  if (openFile) return <ConfigEditor file={openFile} onBack={() => setOpenFile(null)} />
  if (selected) return <PluginDetail plugin={selected} onBack={() => setSelected(null)} onOpenFile={setOpenFile} />

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('plugins.title')}</h1>
          <p className="text-sm text-white/40 mt-1">{t('plugins.subtitle')}</p>
        </div>
        <button
          onClick={scanPlugins}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <FolderOpenIcon className="w-4 h-4" />
          )}
          {loading ? t('plugins.scanning') : t('plugins.rescan')}
        </button>
      </div>

      <div className="relative mb-5">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('plugins.searchPlaceholder')}
          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder-white/25 outline-none focus:border-indigo-500/30 transition-colors"
        />
      </div>

      {plugins.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
            <PuzzlePieceIcon className="w-8 h-8 text-indigo-400/50" />
          </div>
          <p className="text-white/30 text-sm">{t('plugins.empty')}</p>
          <p className="text-white/20 text-xs">{t('plugins.emptyHint')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(plugin => (
            <PluginCard key={plugin.path} plugin={plugin} onSelect={setSelected} />
          ))}
          {filtered.length === 0 && search && (
            <p className="text-center text-white/25 text-sm py-8">{t('plugins.noMatch', { query: search })}</p>
          )}
        </div>
      )}
    </div>
  )
}
