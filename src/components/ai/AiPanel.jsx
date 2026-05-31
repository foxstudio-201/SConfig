/**
 * AiPanel — slides in from the right when user presses Shift+ArrowRight
 * while editing a file. Provides AI-powered translation with live streaming.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAiConfig, LANGUAGES } from '../../hooks/useAiConfig'
import { useI18n } from '../../context/I18nContext'
import { translateFile } from '../../services/aiService'
import {
  XMarkIcon,
  LanguageIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StopIcon,
} from '@heroicons/react/24/outline'

// ── Badge colours per change type ────────────────────────────────────────────
const BADGE_COLORS = {
  translated: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  pending:    'bg-amber-500/20  text-amber-300  border-amber-500/30',
  error:      'bg-red-500/20    text-red-300    border-red-500/30',
}

function Badge({ type, label }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${BADGE_COLORS[type]}`}>
      {type === 'translated' && <CheckCircleIcon className="w-3 h-3" />}
      {type === 'error'      && <ExclamationTriangleIcon className="w-3 h-3" />}
      {label}
    </span>
  )
}

// ── Log entry ─────────────────────────────────────────────────────────────────
function LogEntry({ entry }) {
  const icons = {
    info:    <SparklesIcon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />,
    success: <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />,
    error:   <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />,
    chunk:   <LanguageIcon className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />,
  }
  const colors = {
    info:    'text-white/60',
    success: 'text-emerald-300',
    error:   'text-red-300',
    chunk:   'text-violet-300',
  }
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
      {icons[entry.type] ?? icons.info}
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] leading-relaxed ${colors[entry.type] ?? colors.info}`}>{entry.message}</p>
        {entry.badge && (
          <div className="mt-1">
            <Badge type={entry.badge.type} label={entry.badge.label} />
          </div>
        )}
      </div>
      <span className="text-[10px] text-white/20 flex-shrink-0">{entry.time}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AiPanel({
  open,
  onClose,
  filename,
  content,
  onApplyChunk,   // (newFullContent, changedLines: Set<number>) => void
  onSave,         // () => void — called when translation completes
}) {
  const { t } = useI18n()
  const { config } = useAiConfig()
  const [targetLang, setTargetLang]   = useState(config.translateTarget || 'vi')
  const [running, setRunning]         = useState(false)
  const [progress, setProgress]       = useState({ cur: 0, total: 0 })
  const [log, setLog]                 = useState([])
  const [changedLines, setChangedLines] = useState(new Set())
  const abortRef  = useRef(null)
  const logEndRef = useRef(null)

  // Sync target lang from config
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setTargetLang(config.translateTarget || 'vi') }, [config.translateTarget])

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  // Reset log when panel opens for a new file
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLog([])
      setChangedLines(new Set())
      setProgress({ cur: 0, total: 0 })
    }
  }, [open, filename])

  function addLog(type, message, badge) {
    const time = new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setLog(prev => [...prev, { id: Date.now() + Math.random(), type, message, badge, time }])
  }

  const startTranslation = useCallback(async () => {
    if (!content) { addLog('error', 'No file content to translate.'); return }
    const activeKeys = config.keys.filter(k => k.active)
    if (activeKeys.length === 0) { addLog('error', 'No active API key. Add one in Settings → AI API.'); return }

    const langObj = LANGUAGES.find(l => l.code === targetLang)
    const langLabel = langObj?.label ?? targetLang
    const isParallel = activeKeys.length >= 2

    setRunning(true)
    setChangedLines(new Set())
    setLog([])
    addLog('info', `Starting translation → ${langLabel}`)
    if (isParallel) {
      addLog('info', `⚡ Parallel mode — ${activeKeys.length} keys working simultaneously`)
      activeKeys.forEach((k, i) => addLog('info', `  Worker ${i + 1}: ${k.provider} · ${k.label}`))
    } else {
      addLog('info', `Provider: ${activeKeys[0].provider} · Key: ${activeKeys[0].label}`)
    }
    addLog('info', `Checkpoint: ${config.checkpointSize} lines · Token limit: ${config.tokenLimit.toLocaleString()}`)

    const abort = new AbortController()
    abortRef.current = abort

    const accumulated = content.split('\n').map(() => null)
    const originalLines = content.split('\n')

    try {
      const fullTranslated = await translateFile({
        activeKeys,
        content,
        targetLang,
        targetLangLabel: langLabel,
        checkpointSize: config.checkpointSize,
        tokenLimit: config.tokenLimit,
        signal: abort.signal,

        onProgress: (cur, total) => {
          setProgress({ cur, total })
        },

        onKeyFallback: (failedKey, fallbackKey, chunkStart, err) => {
          const isTimeout = err?.message?.includes('timed out') || err?.message?.includes('timeout')
          const reason = isTimeout
            ? 'timed out (no response)'
            : (err?.message?.slice(0, 60) ?? 'error')

          if (fallbackKey) {
            addLog('info',
              `⚠ Key "${failedKey.label}" ${reason} at line ${chunkStart + 1} — switching to "${fallbackKey.label}"`,
            )
          } else {
            addLog('error',
              `All keys failed at lines ${chunkStart + 1}+ — keeping original (${reason})`,
            )
          }
        },

        onChunkDone: (translatedChunk, startLine, endLine, keyLabel) => {
          const translatedLines = translatedChunk.split('\n')
          const inputLineCount  = endLine - startLine + 1  // always matches input chunk

          // Merge translated lines into accumulated (by input position)
          for (let i = 0; i < inputLineCount; i++) {
            const lineIdx = startLine + i
            if (lineIdx < accumulated.length) {
              // If AI returned fewer lines than input, keep original for remainder
              accumulated[lineIdx] = translatedLines[i] ?? originalLines[lineIdx]
            }
          }

          const current = accumulated.map((l, i) => l ?? originalLines[i]).join('\n')

          // Mark changed lines based on INPUT range (not translated output length)
          const newChanged = new Set(changedLines)
          for (let i = 0; i < inputLineCount; i++) {
            const lineIdx = startLine + i
            const orig = originalLines[lineIdx] ?? ''
            const translated = translatedLines[i] ?? orig
            if (translated !== orig) {
              newChanged.add(lineIdx + 1) // Monaco is 1-indexed
            }
          }
          setChangedLines(newChanged)

          onApplyChunk?.(current, newChanged)
          window.dispatchEvent(new CustomEvent('monaco-reveal-line', { detail: { line: endLine + 1 } }))

          addLog('chunk',
            `Lines ${startLine + 1}–${endLine + 1}${isParallel ? ` [${keyLabel}]` : ''} translated`,
            { type: 'translated', label: `+${inputLineCount} lines` }
          )
        },
      })

      onApplyChunk?.(fullTranslated, changedLines)
      onSave?.()
      addLog('success', `Translation complete — file saved automatically.`)
    } catch (err) {
      if (err.name === 'AbortError') {
        addLog('info', 'Translation cancelled.')
      } else {
        const msg = err.message ?? String(err)
        addLog('error', msg)
        if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
          addLog('info', 'Hint: Enable "Generative Language API" in Google Cloud Console, or create a new key from aistudio.google.com/apikey')
        } else if (msg.includes('401') || msg.includes('invalid_api_key') || msg.includes('Incorrect API key')) {
          addLog('info', 'Hint: Check your API key is correct and active in Settings → AI API')
        }
      }
    }

    setRunning(false)
    abortRef.current = null
  }, [content, targetLang, config, onApplyChunk, onSave, changedLines])

  function stopTranslation() {
    abortRef.current?.abort()
  }

  const activeKeys = config.keys.filter(k => k.active)
  const hasKeys    = activeKeys.length > 0
  const isParallelReady = activeKeys.length >= 2

  if (!open) return null

  return (
    /* Panel — không có backdrop, editor vẫn tương tác được bình thường */
    <div className="absolute top-0 right-0 bottom-0 z-50 w-80 flex flex-col bg-[#0d0d1a]/95 backdrop-blur-xl border-l border-white/[0.07] shadow-2xl shadow-black/60 animate-slide-in-right pointer-events-auto">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <SparklesIcon className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">{t('aiPanel.title')}</p>
            <p className="text-[10px] text-white/30 truncate">{filename ?? t('aiPanel.noFile')}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* API key status */}
        <div className={`mx-3 mt-3 px-3 py-2 rounded-lg text-[11px] flex items-center gap-2 flex-shrink-0 ${
          hasKeys
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
        }`}>
          {hasKeys ? (
            <>
              <CheckCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {activeKeys.length === 1
                  ? t('aiPanel.activeKeys', { count: activeKeys.length })
                  : t('aiPanel.activeKeys_plural', { count: activeKeys.length })}
                {' · '}{activeKeys[0].provider}
                {isParallelReady && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/25 text-[9px] font-bold uppercase tracking-wide">
                    ⚡ {t('aiPanel.parallel')}
                  </span>
                )}
              </span>
            </>
          ) : (
            <><ExclamationTriangleIcon className="w-3.5 h-3.5 flex-shrink-0" />{t('aiPanel.noKeysWarning')}</>
          )}
        </div>

        {/* Translate section */}
        <div className="px-3 mt-3 flex-shrink-0">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center gap-2 mb-3">
              <LanguageIcon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-white/70">{t('aiPanel.autoTranslate')}</span>
              {changedLines.size > 0 && (
                <Badge type="translated" label={t('aiPanel.linesChanged', { count: changedLines.size })} />
              )}
            </div>

            {/* Target language */}
            <div className="mb-3">
              <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('aiPanel.targetLanguage')}</label>
              <select
                value={targetLang}
                onChange={e => setTargetLang(e.target.value)}
                disabled={running}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-indigo-500/40 transition-colors disabled:opacity-50"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-[#13131f]">{l.label}</option>
                ))}
              </select>
            </div>

            {/* Progress bar */}
            {running && progress.total > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-white/30 mb-1">
                  <span>{t('aiPanel.chunkProgress', { cur: progress.cur, total: progress.total })}</span>
                  <span>{Math.round((progress.cur / progress.total) * 100)}%</span>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.cur / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            {running ? (
              <button
                onClick={stopTranslation}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/15 border border-red-500/25 text-red-300 text-sm font-semibold hover:bg-red-500/25 transition-all"
              >
                <StopIcon className="w-4 h-4" />
                {t('aiPanel.stop')}
              </button>
            ) : (
              <button
                onClick={startTranslation}
                disabled={!hasKeys || !content}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/25 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <LanguageIcon className="w-4 h-4" />
                {t('aiPanel.translateFile')}
              </button>
            )}
          </div>
        </div>

        {/* Log */}
        <div className="flex-1 overflow-y-auto px-3 mt-3 pb-3 min-h-0">
          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">{t('aiPanel.activityLog')}</p>
          {log.length === 0 ? (
            <p className="text-[11px] text-white/20 text-center py-6">{t('aiPanel.logEmpty')}</p>
          ) : (
            <div className="flex flex-col">
              {log.map(entry => <LogEntry key={entry.id} entry={entry} />)}
              <div ref={logEndRef} />
            </div>
          )}
        </div>
      </div>
  )
}
