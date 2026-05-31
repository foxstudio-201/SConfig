import { useState, useEffect, useCallback, useRef } from 'react'
import { storeGet } from '../../hooks/useStore'
import { useToast } from '../../hooks/useToast'
import { useI18n } from '../../context/I18nContext'
import MonacoEditor from '../MonacoEditor'
import AiPanel from '../ai/AiPanel'
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

const isElectron = typeof window !== 'undefined' && window.sconfigAPI

const TEXT_EXTS = ['.yml','.yaml','.json','.toml','.properties','.conf','.cfg','.txt','.log','.sh','.bat','.xml','.ini']

function isTextFile(name) {
  return TEXT_EXTS.some(ext => name.toLowerCase().endsWith(ext))
}

function FileIcon({ entry }) {
  if (entry.isDir) return <FolderIcon className="w-4 h-4 text-amber-400/70" />
  if (isTextFile(entry.name)) return <DocumentTextIcon className="w-4 h-4 text-indigo-400/70" />
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-white/25">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

export default function FilesPage() {
  const { t } = useI18n()
  const [rootPath, setRootPath]               = useState(null)
  const [currentPath, setCurrent]             = useState(null)
  const [history, setHistory]                 = useState([])
  const [entries, setEntries]                 = useState([])
  const [loading, setLoading]                 = useState(false)
  const [openFile, setOpenFile]               = useState(null)
  const [fileContent, setFileContent]         = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [saving, setSaving]                   = useState(false)
  const [aiPanelOpen, setAiPanelOpen]         = useState(false)
  const [changedLines, setChangedLines]       = useState(new Set())
  const toast = useToast()
  const showToast = useRef(toast.show)
  // eslint-disable-next-line react-hooks/refs
  showToast.current = toast.show

  // fileContent = source of truth for Save button / dirty check
  // AI updates push to Monaco via event AND update fileContent ref directly
  const fileContentRef = useRef('')  // always in sync with Monaco model

  const loadDir = useCallback(async (path) => {
    if (!isElectron) return
    setLoading(true)
    const res = await window.sconfigAPI.listDir(path)
    setLoading(false)
    if (res.ok) {
      const sorted = [...res.entries].sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
        return a.name.localeCompare(b.name)
      })
      setEntries(sorted)
      setCurrent(path)
    } else {
      showToast.current(t('files.toastReadDirFailed', { error: res.error }), 'error')
    }
  }, [t])

  useEffect(() => {
    storeGet('serverPath').then(p => {
      if (p) { setRootPath(p); loadDir(p) }
    })
  }, [loadDir])

  function navigate(entry) {
    if (entry.isDir) {
      setHistory(h => [...h, currentPath])
      loadDir(entry.path)
    } else if (isTextFile(entry.name)) {
      openTextFile(entry)
    } else {
      showToast.current(t('files.binaryFile'), 'warning')
    }
  }

  async function openTextFile(entry) {
    if (!isElectron) return
    const res = await window.sconfigAPI.readFile(entry.path)
    if (res.ok) {
      setOpenFile(entry)
      setFileContent(res.data)
      setOriginalContent(res.data)
      fileContentRef.current = res.data
      setChangedLines(new Set())
      setAiPanelOpen(false)
    } else {
      showToast.current(t('files.toastReadFileFailed', { error: res.error }), 'error')
    }
  }

  function goBack() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    loadDir(prev)
  }

  const saveFile = useCallback(async (contentToSave) => {
    if (!isElectron || !openFile) return
    const data = contentToSave ?? fileContentRef.current
    setSaving(true)
    const res = await window.sconfigAPI.writeFile(openFile.path, data)
    setSaving(false)
    if (res.ok) {
      setOriginalContent(data)
      setFileContent(data)
      showToast.current(t('files.toastSaved'), 'success')
    } else {
      showToast.current(t('files.toastSaveFailed', { error: res.error }), 'error')
    }
  }, [openFile, t])

  const isDirty = fileContent !== originalContent
  const relPath = currentPath && rootPath ? currentPath.replace(rootPath, '') || '/' : '/'

  // Ctrl+S from Monaco
  useEffect(() => {
    const handler = () => { if (isDirty) saveFile() }
    window.addEventListener('monaco-save', handler)
    return () => window.removeEventListener('monaco-save', handler)
  }, [isDirty, saveFile])

  // monaco-user-edit: fired after revert-line click in MonacoEditor
  useEffect(() => {
    const handler = (e) => {
      const { content: newContent, revertedLine } = e.detail ?? {}
      if (typeof newContent !== 'string') return
      fileContentRef.current = newContent
      setFileContent(newContent)
      // Remove reverted line from changedLines
      if (typeof revertedLine === 'number') {
        setChangedLines(prev => {
          const next = new Set(prev)
          next.delete(revertedLine)
          return next
        })
      }
    }
    window.addEventListener('monaco-user-edit', handler)
    return () => window.removeEventListener('monaco-user-edit', handler)
  }, [])

  // Shift+ArrowRight → open AI panel (only when editing a file)
  useEffect(() => {
    if (!openFile) return
    const handler = (e) => {
      if (e.shiftKey && e.key === 'ArrowRight') {
        e.preventDefault()
        setAiPanelOpen(v => !v)
      }
      if (e.key === 'Escape') setAiPanelOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openFile])

  // AI panel callbacks — push content directly to Monaco via event, update ref + state for dirty check
  const handleAiChunk = useCallback((newContent, newChangedLines) => {
    // 1. Push to Monaco model directly (no React state round-trip)
    window.dispatchEvent(new CustomEvent('monaco-set-content', { detail: { content: newContent } }))
    // 2. Keep ref in sync for Save
    fileContentRef.current = newContent
    // 3. Update state only for dirty indicator and badge count (lightweight)
    setFileContent(newContent)
    setChangedLines(newChangedLines)
  }, [])

  const handleAiSave = useCallback(() => {
    saveFile(fileContentRef.current)
  }, [saveFile])

  // ── File editor view ──────────────────────────────────────────────────────
  if (openFile) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden animate-fade-in relative">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.05] bg-black/20 flex-shrink-0">
          <button
            onClick={() => { setOpenFile(null); setAiPanelOpen(false) }}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {t('files.back')}
          </button>
          <div className="w-px h-4 bg-white/10" />
          <DocumentTextIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-white/80 truncate max-w-xs">{openFile.name}</span>
          {isDirty && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title={t('files.unsaved')} />}
          {changedLines.size > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
              {t('files.aiEdits', { count: changedLines.size })}
            </span>
          )}
          <div className="flex-1" />
          <span className="text-[11px] text-white/20 hidden sm:block">{t('files.aiHint')}</span>
          <button
            onClick={() => setAiPanelOpen(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              aiPanelOpen
                ? 'bg-violet-500/25 border border-violet-500/40 text-violet-300'
                : 'bg-white/[0.05] border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/[0.08]'
            }`}
            title="Toggle AI Panel (Shift+→)"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            {t('files.ai')}
          </button>
          <span className="text-[11px] text-white/20 hidden sm:block">{t('files.ctrlSave')}</span>
          <button
            onClick={() => saveFile()}
            disabled={!isDirty || saving}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all active:scale-95 flex-shrink-0 ${
              isDirty
                ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30'
                : 'bg-white/5 border border-white/10 text-white/25 cursor-not-allowed'
            }`}
          >
            {saving ? t('files.saving') : t('files.save')}
          </button>
        </div>

        {/* Editor + AI panel side by side */}
        <div className="flex-1 overflow-hidden flex relative">
          <div className="flex-1 overflow-hidden p-3">
            <MonacoEditor
              initialValue={fileContent}
              originalContent={originalContent}
              onChange={val => {
                const v = val ?? ''
                fileContentRef.current = v
                setFileContent(v)
              }}
              filename={openFile.name}
              changedLines={changedLines}
            />
          </div>

          {/* AI Panel — absolute overlay, không chặn editor */}
          <AiPanel
            open={aiPanelOpen}
            onClose={() => setAiPanelOpen(false)}
            filename={openFile.name}
            content={fileContent}
            onApplyChunk={handleAiChunk}
            onSave={handleAiSave}
          />
        </div>
      </div>
    )
  }

  // ── Directory browser ─────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('files.title')}</h1>
          <p className="text-sm text-white/40 mt-1 font-mono">{relPath}</p>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm hover:bg-white/8 hover:text-white/80 transition-all"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t('files.back')}
            </button>
          )}
          <button
            onClick={() => currentPath && loadDir(currentPath)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
            title={t('files.refresh')}
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {!rootPath ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <FolderOpenIcon className="w-12 h-12 text-white/15" />
          <p className="text-white/30 text-sm">{t('files.noServer')}</p>
          <p className="text-white/20 text-xs">{t('files.noServerHint')}</p>
        </div>
      ) : entries.length === 0 && !loading ? (
        <p className="text-center text-white/25 text-sm py-12">{t('files.emptyFolder')}</p>
      ) : (
        <div className="flex flex-col gap-1">
          {entries.map(entry => (
            <button
              key={entry.path}
              onClick={() => navigate(entry)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group text-left"
            >
              <FileIcon entry={entry} />
              <span className={`text-sm flex-1 truncate ${entry.isDir ? 'text-white/70 font-medium' : 'text-white/55 font-mono'}`}>
                {entry.name}
              </span>
              {entry.isDir && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-colors">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
