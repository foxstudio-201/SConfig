import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { useI18n } from '../../../context/I18nContext'
import CustomDropdown from '../../CustomDropdown'
import MonacoEditor from '../../MonacoEditor'
import { validateYaml, summarizeIssues, countStats, SAMPLE_PRESETS } from './yamlValidator'

const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3 min-h-0'

function StatChip({ label, value }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2.5 py-1.5 text-center min-w-[56px]">
      <p className="text-[9px] text-white/30 uppercase">{label}</p>
      <p className="text-sm font-mono font-semibold text-sky-300">{value}</p>
    </div>
  )
}

function IssueRow({ issue, t, onJump }) {
  const isError = issue.severity === 'error'
  const msg = t(`yamlValidator.${issue.key}`, issue.params || {})
  return (
    <button
      type="button"
      onClick={() => onJump(issue.line)}
      className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl border transition-all hover:brightness-110 ${
        isError
          ? 'bg-red-500/8 border-red-500/25 hover:border-red-500/40'
          : 'bg-amber-500/8 border-amber-500/25 hover:border-amber-500/40'
      }`}
    >
      <ExclamationTriangleIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isError ? 'text-red-400' : 'text-amber-400'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold uppercase ${isError ? 'text-red-300' : 'text-amber-300'}`}>
            {t('yamlValidator.jumpToLine', { line: issue.line })}
          </span>
          <span className={`text-[9px] px-1 py-0.5 rounded border ${isError ? 'bg-red-500/15 border-red-500/30 text-red-300' : 'bg-amber-500/15 border-amber-500/30 text-amber-300'}`}>
            {isError ? t('yamlValidator.filterErrors') : t('yamlValidator.filterWarnings')}
          </span>
        </div>
        <p className="text-[11px] text-white/70 mt-1 leading-relaxed">{msg}</p>
      </div>
    </button>
  )
}

export default function YamlValidatorTool({ onBack }) {
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const [editorKey, setEditorKey] = useState(0)
  const [liveValidate, setLiveValidate] = useState(true)
  const [filter, setFilter] = useState('all')
  const [debouncedInput, setDebouncedInput] = useState('')

  useEffect(() => {
    if (!liveValidate) return
    const timer = setTimeout(() => setDebouncedInput(input), 350)
    return () => clearTimeout(timer)
  }, [input, liveValidate])

  const activeText = liveValidate ? debouncedInput : input
  const issues = useMemo(() => (activeText.trim() ? validateYaml(activeText) : []), [activeText])
  const summary = useMemo(() => summarizeIssues(issues), [issues])
  const stats = useMemo(() => countStats(input), [input])

  const filteredIssues = useMemo(() => {
    if (filter === 'error') return issues.filter(i => i.severity === 'error')
    if (filter === 'warning') return issues.filter(i => i.severity === 'warning')
    return issues
  }, [issues, filter])

  const issueLines = useMemo(
    () => issues.map(i => ({ line: i.line, severity: i.severity })),
    [issues],
  )

  const sampleOptions = SAMPLE_PRESETS.map(p => ({
    value: p.id,
    label: t(`yamlValidator.${p.labelKey}`),
  }))

  const jumpToLine = useCallback((line) => {
    window.dispatchEvent(new CustomEvent('monaco-reveal-line', { detail: { line } }))
  }, [])

  const loadSample = (id) => {
    const preset = SAMPLE_PRESETS.find(p => p.id === id)
    if (!preset) return
    setInput(preset.text)
    setDebouncedInput(preset.text)
    setEditorKey(k => k + 1)
    window.dispatchEvent(new CustomEvent('monaco-set-content', { detail: { content: preset.text } }))
  }

  const clearAll = () => {
    setInput('')
    setDebouncedInput('')
    setEditorKey(k => k + 1)
    window.dispatchEvent(new CustomEvent('monaco-set-content', { detail: { content: '' } }))
  }

  const hasInput = input.trim().length > 0
  const isValid = hasInput && summary.total === 0

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0 flex-wrap">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all"
          title={t('common.back')}
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-sky-500/30 bg-sky-500/10 text-sky-300 font-semibold uppercase">
              {t('yamlValidator.badge')}
            </span>
            <h1 className="text-lg font-bold text-white">{t('yamlValidator.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('yamlValidator.subtitle')}</p>
        </div>
        <CustomDropdown
          label=""
          value=""
          onChange={loadSample}
          options={sampleOptions}
          placeholder={t('yamlValidator.loadSample')}
          accent="indigo"
          className="w-44"
        />
      </div>

      <div className="flex-1 min-h-0 p-4 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <div className={`${sectionCls} overflow-hidden`}>
          <div className="flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('yamlValidator.editorTitle')}</p>
              <p className="text-[10px] text-white/25 mt-0.5">{t('yamlValidator.editorHint')}</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setLiveValidate(v => !v)}
                className={`${btnCls} ${liveValidate ? 'bg-sky-500/15 border-sky-500/30 text-sky-300' : 'bg-white/[0.03] border-white/[0.08] text-white/50'}`}
              >
                <DocumentMagnifyingGlassIcon className="w-3.5 h-3.5" />
                {t('yamlValidator.liveValidate')}
              </button>
              {!liveValidate && (
                <button type="button" onClick={() => setDebouncedInput(input)} disabled={!hasInput} className={`${btnCls} bg-indigo-500/15 border-indigo-500/25 text-indigo-300 disabled:opacity-40`}>
                  <CheckCircleIcon className="w-3.5 h-3.5" />{t('yamlValidator.validate')}
                </button>
              )}
              <button type="button" onClick={clearAll} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/50`}>
                <ArrowPathIcon className="w-3.5 h-3.5" />{t('yamlValidator.clear')}
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-[320px]">
            <MonacoEditor
              key={editorKey}
              initialValue={input}
              filename="config.yml"
              onChange={val => setInput(val ?? '')}
              issueLines={issueLines}
            />
          </div>
        </div>

        <div className={`${sectionCls} overflow-hidden`}>
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold flex-shrink-0">{t('yamlValidator.resultsTitle')}</p>

          <div className="grid grid-cols-4 gap-1.5 flex-shrink-0">
            <StatChip label={t('yamlValidator.statLines')} value={stats.lines} />
            <StatChip label={t('yamlValidator.statKeys')} value={stats.nonEmpty} />
            <StatChip label={t('yamlValidator.statComments')} value={stats.comments} />
            <StatChip label={t('yamlValidator.statChars')} value={stats.chars} />
          </div>

          {!hasInput ? (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <p className="text-sm text-white/25">{t('yamlValidator.resultsEmpty')}</p>
            </div>
          ) : isValid ? (
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <CheckCircleIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300">{t('yamlValidator.statusValid')}</p>
                  <p className="text-[11px] text-emerald-300/60 mt-1 leading-relaxed">{t('yamlValidator.statusValidHint')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-2 min-h-0">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 flex-shrink-0">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-[11px] font-semibold text-red-300">
                  {summary.errors === 1 && summary.warnings <= 1
                    ? t('yamlValidator.statusIssues', { errors: summary.errors, warnings: summary.warnings })
                    : t('yamlValidator.statusIssues_plural', { errors: summary.errors, warnings: summary.warnings })}
                </p>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                {[
                  { id: 'all', label: t('yamlValidator.filterAll'), count: issues.length },
                  { id: 'error', label: t('yamlValidator.filterErrors'), count: summary.errors },
                  { id: 'warning', label: t('yamlValidator.filterWarnings'), count: summary.warnings },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      filter === f.id
                        ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                        : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70'
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto custom-dropdown-scroll flex flex-col gap-1.5 pr-0.5">
                {filteredIssues.map((issue, i) => (
                  <IssueRow key={`${issue.line}-${issue.key}-${i}`} issue={issue} t={t} onJump={jumpToLine} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
