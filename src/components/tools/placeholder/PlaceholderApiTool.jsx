import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useI18n } from '../../../context/I18nContext'
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  EXPANSIONS,
  DEFAULT_INPUT,
  DEFAULT_SIMULATION_VARS,
  MESSAGE_PRESETS,
  CONFIG_PRESETS,
  STORE_KEY,
  createConfigState,
  presetToConfig,
  isBuiltinVar,
} from './placeholderApiData'
import CustomDropdown from '../../CustomDropdown'
import {
  simulatePlaceholders,
  findUnresolvedPlaceholders,
  parseMcTextWithUnresolved,
  buildConfigYaml,
  buildTabPluginSnippet,
  buildScoreboardSnippet,
  buildEssentialsJoinSnippet,
  buildDeluxeMenusItemSnippet,
  downloadText,
} from './placeholderApiExport'

const MAIN_TABS = [
  { id: 'simulator', labelKey: 'tabSimulator' },
  { id: 'presets', labelKey: 'tabPresets' },
  { id: 'config', labelKey: 'tabConfig' },
  { id: 'export', labelKey: 'tabExport' },
]

const CLOUD_SORT_OPTIONS = [
  { value: 'name', label: 'name' },
  { value: 'author', label: 'author' },
  { value: 'version', label: 'version' },
]

const EXPORT_TYPES = [
  { id: 'raw', labelKey: 'exportTypeRaw', descKey: 'exportTypeRawDesc' },
  { id: 'tab', labelKey: 'exportTypeTab', descKey: 'exportTypeTabDesc' },
  { id: 'scoreboard', labelKey: 'exportTypeScoreboard', descKey: 'exportTypeScoreboardDesc' },
  { id: 'join', labelKey: 'exportTypeJoin', descKey: 'exportTypeJoinDesc' },
  { id: 'deluxe', labelKey: 'exportTypeDeluxe', descKey: 'exportTypeDeluxeDesc' },
]

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-indigo-500/40 transition-colors'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'bg-black/40 border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-3'

function Toggle({ label, value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-indigo-500/35 bg-indigo-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}
    >
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center transition-all ${value ? 'bg-indigo-500/40 border-indigo-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
        <span className={`block w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="text-[11px] font-semibold text-white/80">{label}</span>
    </button>
  )
}

export default function PlaceholderApiTool({ onBack }) {
  const { t } = useI18n()
  const [mainTab, setMainTab] = useState('simulator')
  const [inputText, setInputText] = useState(DEFAULT_INPUT)
  const [vars, setVars] = useState(DEFAULT_SIMULATION_VARS)
  const [config, setConfig] = useState(createConfigState())
  const [searchQuery, setSearchQuery] = useState('')
  const [activeExpTab, setActiveExpTab] = useState('all')
  const [copiedId, setCopiedId] = useState(null)
  const [exportType, setExportType] = useState('raw')
  const [showAddVar, setShowAddVar] = useState(false)
  const [newVarName, setNewVarName] = useState('')
  const [newVarValue, setNewVarValue] = useState('')
  const [hydrated, setHydrated] = useState(false)

  const textareaRef = useRef(null)

  useEffect(() => {
    const api = window.sconfigAPI
    if (!api?.storeGet) {
      setHydrated(true)
      return
    }
    api.storeGet(STORE_KEY).then(saved => {
      if (saved?.inputText) setInputText(saved.inputText)
      if (saved?.vars) setVars(prev => ({ ...prev, ...saved.vars }))
      if (saved?.config) setConfig(prev => ({ ...prev, ...saved.config }))
      setHydrated(true)
    }).catch(() => setHydrated(true))
  }, [])

  const persist = useCallback((nextInput, nextVars, nextConfig) => {
    window.sconfigAPI?.storeSet?.(STORE_KEY, {
      inputText: nextInput,
      vars: nextVars,
      config: nextConfig,
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const timer = setTimeout(() => persist(inputText, vars, config), 400)
    return () => clearTimeout(timer)
  }, [inputText, vars, config, hydrated, persist])

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const simulatedOutput = useMemo(
    () => simulatePlaceholders(inputText, vars),
    [inputText, vars],
  )

  const unresolved = useMemo(
    () => findUnresolvedPlaceholders(simulatedOutput),
    [simulatedOutput],
  )

  const previewSpans = useMemo(
    () => parseMcTextWithUnresolved(simulatedOutput),
    [simulatedOutput],
  )

  const configYaml = useMemo(() => buildConfigYaml(config), [config])

  const tabHeaderPreset = MESSAGE_PRESETS.find(p => p.id === 'tablist-header')?.text || ''
  const tabFooterPreset = MESSAGE_PRESETS.find(p => p.id === 'tablist-footer')?.text || ''
  const scoreTitlePreset = MESSAGE_PRESETS.find(p => p.id === 'scoreboard-title')?.text || ''
  const scoreLinesPreset = MESSAGE_PRESETS.find(p => p.id === 'scoreboard-lines')?.text || ''
  const joinPreset = MESSAGE_PRESETS.find(p => p.id === 'join-message')?.text || ''

  const exportContent = useMemo(() => {
    switch (exportType) {
      case 'tab':
        return buildTabPluginSnippet(
          simulatePlaceholders(tabHeaderPreset, vars),
          simulatePlaceholders(tabFooterPreset, vars),
        )
      case 'scoreboard':
        return buildScoreboardSnippet(
          simulatePlaceholders(scoreTitlePreset, vars),
          simulatePlaceholders(scoreLinesPreset, vars),
        )
      case 'join':
        return buildEssentialsJoinSnippet(simulatePlaceholders(joinPreset, vars))
      case 'deluxe': {
        const lines = inputText.split('\n')
        const name = simulatePlaceholders(lines[0] || '', vars)
        const lore = simulatePlaceholders(lines.slice(1).join('\n'), vars)
        return buildDeluxeMenusItemSnippet(name, lore)
      }
      default:
        return simulatedOutput
    }
  }, [exportType, simulatedOutput, inputText, vars, tabHeaderPreset, tabFooterPreset, scoreTitlePreset, scoreLinesPreset, joinPreset])

  const filteredExpansions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return EXPANSIONS.map(exp => {
      if (activeExpTab !== 'all' && exp.id !== activeExpTab) return null
      const matchedPlaceholders = exp.placeholders.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.desc.toLowerCase().includes(query),
      )
      if (matchedPlaceholders.length === 0 && !exp.name.toLowerCase().includes(query)) return null
      return { ...exp, placeholders: query ? matchedPlaceholders : exp.placeholders }
    }).filter(Boolean)
  }, [searchQuery, activeExpTab])

  const handleVarChange = (name, value) => {
    setVars(prev => ({ ...prev, [name]: value }))
  }

  const handleDeleteVar = (name) => {
    if (isBuiltinVar(name)) return
    setVars(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handleAddCustomVar = () => {
    const cleaned = newVarName.replace(/%/g, '').trim().toLowerCase()
    if (!cleaned) return
    setVars(prev => ({ ...prev, [cleaned]: newVarValue }))
    setNewVarName('')
    setNewVarValue('')
    setShowAddVar(false)
  }

  const handleInsertPlaceholder = (placeholder) => {
    if (!textareaRef.current) return
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const before = inputText.substring(0, start)
    const after = inputText.substring(end)
    setInputText(before + placeholder + after)
    setTimeout(() => {
      textareaRef.current?.focus()
      const pos = start + placeholder.length
      textareaRef.current?.setSelectionRange(pos, pos)
    }, 50)
  }

  const loadPreset = (text) => {
    setInputText(text)
    setMainTab('simulator')
  }

  const applyConfigPreset = (id) => {
    setConfig(presetToConfig(id))
  }

  const unresolvedLabel = unresolved.length === 1
    ? t('placeholderApi.unresolvedCount', { count: unresolved.length })
    : t('placeholderApi.unresolvedCount_plural', { count: unresolved.length })

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all"
          title={t('common.back')}
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-violet-500/30 bg-violet-500/10 text-violet-300 font-semibold uppercase">
              {t('placeholderApi.badge')}
            </span>
            <h1 className="text-lg font-bold text-white">{t('placeholderApi.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('placeholderApi.subtitle')}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {MAIN_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMainTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                mainTab === tab.id
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                  : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70'
              }`}
            >
              {t(`placeholderApi.${tab.labelKey}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4 overflow-hidden">
        {mainTab === 'simulator' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 h-full min-h-0">
            <div className="flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
              <div className={sectionCls}>
                <div className="flex justify-between items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('placeholderApi.simulatorInput')}</span>
                  <div className="flex gap-1.5 flex-wrap">
                    <button type="button" onClick={() => setInputText(DEFAULT_INPUT)} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/50`}>
                      <ArrowPathIcon className="w-3.5 h-3.5" />{t('placeholderApi.resetInput')}
                    </button>
                    <button type="button" onClick={() => handleCopy(simulatedOutput, 'output')} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
                      {copiedId === 'output' ? <CheckIcon className="w-3.5 h-3.5" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                      {t('placeholderApi.copyOutput')}
                    </button>
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  rows={5}
                  spellCheck={false}
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-sm font-mono text-white/80 resize-none outline-none focus:border-indigo-500/40 transition-colors leading-relaxed"
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('placeholderApi.parsedOutput')}</span>
                    {unresolved.length > 0 && (
                      <span className="text-[10px] text-orange-400 font-semibold">{unresolvedLabel}</span>
                    )}
                  </div>
                  <div className="bg-[#0f0f1b] border border-white/[0.06] rounded-xl px-4 py-3 min-h-[72px] font-mono text-sm leading-relaxed whitespace-pre-wrap break-all shadow-inner">
                    {!inputText.trim() ? (
                      <span className="text-white/20">{t('placeholderApi.placeholderHint')}</span>
                    ) : (
                      previewSpans.map((part, i) => (
                        <span key={i} style={{ color: part.color, ...part.style }}>{part.text}</span>
                      ))
                    )}
                  </div>
                  <p className="text-[10px] text-white/25 leading-relaxed">{t('placeholderApi.simNote')}</p>
                </div>
              </div>

              <div className={`${sectionCls} min-h-0 flex-1`}>
                <div className="flex justify-between items-center border-b border-white/[0.06] pb-2 gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <AdjustmentsHorizontalIcon className="w-4 h-4 text-sky-400" />
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('placeholderApi.variablesTitle')}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => setVars({ ...DEFAULT_SIMULATION_VARS })} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/50`}>
                      <ArrowPathIcon className="w-3.5 h-3.5" />{t('placeholderApi.resetVars')}
                    </button>
                    <button type="button" onClick={() => setShowAddVar(true)} className={`${btnCls} bg-sky-500/10 border-sky-500/20 text-sky-300`}>
                      <PlusIcon className="w-3.5 h-3.5" />{t('placeholderApi.addVar')}
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-dropdown-scroll pr-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                    {Object.entries(vars).map(([name, val]) => (
                      <div key={name} className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2 flex flex-col gap-1 hover:bg-white/[0.04] transition-all">
                        <div className="flex justify-between items-center gap-1">
                          <span className="text-[11px] font-mono text-sky-300/80 font-semibold truncate" title={`%${name}%`}>%{name}%</span>
                          <div className="flex gap-0.5">
                            <button type="button" onClick={() => handleCopy(`%${name}%`, name)} className="text-white/20 hover:text-white/60 p-0.5 rounded" title={t('placeholderApi.copyPlaceholderName')}>
                              {copiedId === name ? <CheckIcon className="w-3 h-3 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3 h-3" />}
                            </button>
                            {!isBuiltinVar(name) && (
                              <button type="button" onClick={() => handleDeleteVar(name)} className="text-white/20 hover:text-red-400 p-0.5 rounded" title={t('placeholderApi.deleteVar')}>
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <input type="text" value={val} onChange={e => handleVarChange(name, e.target.value)} className="bg-white/[0.03] border border-white/[0.07] rounded-lg px-2.5 py-1 text-xs text-white/70 font-mono focus:border-sky-500/30 outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${sectionCls} min-h-0`}>
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('placeholderApi.directoryTitle')}</span>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-white/25" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('placeholderApi.searchPlaceholder')} className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2 text-xs text-white/80 outline-none focus:border-indigo-500/40" />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                <button type="button" onClick={() => setActiveExpTab('all')} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap ${activeExpTab === 'all' ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-white/[0.02] border-white/[0.06] text-white/40'}`}>
                  {t('placeholderApi.categoryAll')}
                </button>
                {EXPANSIONS.map(e => (
                  <button key={e.id} type="button" onClick={() => setActiveExpTab(e.id)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap ${activeExpTab === e.id ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' : 'bg-white/[0.02] border-white/[0.06] text-white/40'}`}>
                    {e.name}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto custom-dropdown-scroll pr-1 flex flex-col gap-3 min-h-0">
                {filteredExpansions.length === 0 ? (
                  <div className="text-center text-xs text-white/20 py-8">{t('placeholderApi.noPlaceholdersFound')}</div>
                ) : filteredExpansions.map(exp => (
                  <div key={exp.id} className="border border-white/[0.05] rounded-xl bg-white/[0.01] p-3 flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-xs font-bold text-white/80 block">{t('placeholderApi.expansionLabel', { name: exp.name })}</span>
                        <span className="text-[9px] text-white/30">{t('placeholderApi.expansionBy')} {exp.author}</span>
                      </div>
                      <span className="text-[9px] bg-white/[0.05] border border-white/[0.07] px-2 py-0.5 rounded text-white/40 font-mono">%{exp.id}_*%</span>
                    </div>
                    <p className="text-[10px] text-white/35">{exp.description}</p>
                    <div className="flex flex-col gap-1.5 mt-1 border-t border-white/[0.04] pt-2">
                      {exp.placeholders.map(p => (
                        <div key={p.name} className="group/item rounded-lg hover:bg-white/[0.02] p-1.5 border border-transparent hover:border-white/[0.04]">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[11px] font-mono text-indigo-300 cursor-pointer hover:underline font-semibold truncate" onClick={() => handleInsertPlaceholder(p.name)} title={t('placeholderApi.clickToInsert')}>{p.name}</span>
                            <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <button type="button" onClick={() => handleInsertPlaceholder(p.name)} className="text-[9px] bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 px-1 py-0.5 rounded font-bold">{t('placeholderApi.insert')}</button>
                              <button type="button" onClick={() => handleCopy(p.name, p.name)} className="text-white/30 hover:text-white/80 p-0.5 rounded">
                                {copiedId === p.name ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <span className="text-[10px] text-white/35 block mt-0.5">{p.desc}</span>
                          <span className="text-[9px] font-mono text-white/20">{t('placeholderApi.exampleLabel')} {p.example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mainTab === 'presets' && (
          <div className="h-full overflow-y-auto custom-dropdown-scroll max-w-4xl">
            <div className={sectionCls}>
              <div>
                <h2 className="text-sm font-bold text-white/90">{t('placeholderApi.presetsTitle')}</h2>
                <p className="text-xs text-white/35 mt-1">{t('placeholderApi.presetsHint')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MESSAGE_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => loadPreset(preset.text)}
                    className="text-left rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-indigo-500/10 hover:border-indigo-500/25 p-4 transition-all group"
                  >
                    <span className="text-sm font-semibold text-white/85 group-hover:text-indigo-200">{t(`placeholderApi.${preset.labelKey}`)}</span>
                    <p className="text-[11px] text-white/35 mt-1 mb-2">{t(`placeholderApi.${preset.descKey}`)}</p>
                    <pre className="text-[10px] font-mono text-white/25 bg-black/30 rounded-lg p-2 whitespace-pre-wrap line-clamp-3">{preset.text}</pre>
                    <span className="text-[10px] text-indigo-400 font-bold mt-2 inline-block">{t('placeholderApi.loadPreset')} →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mainTab === 'config' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4 h-full min-h-0">
            <div className={`${sectionCls} overflow-y-auto custom-dropdown-scroll`}>
              <div>
                <h2 className="text-sm font-bold text-white/90">{t('placeholderApi.configTitle')}</h2>
                <p className="text-xs text-white/35 mt-1">{t('placeholderApi.configHint')}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CONFIG_PRESETS.map(p => (
                  <button key={p.id} type="button" onClick={() => applyConfigPreset(p.id)} className={`${btnCls} bg-violet-500/10 border-violet-500/20 text-violet-300`}>
                    {t(`placeholderApi.${p.labelKey}`)}
                  </button>
                ))}
              </div>
              <Toggle label={t('placeholderApi.checkUpdates')} value={config.checkUpdates} onChange={v => setConfig(c => ({ ...c, checkUpdates: v }))} />
              <Toggle label={t('placeholderApi.cloudEnabled')} value={config.cloudEnabled} onChange={v => setConfig(c => ({ ...c, cloudEnabled: v }))} />
              <Toggle label={t('placeholderApi.cloudAllowExpansionDownload')} value={config.cloudAllowExpansionDownload} onChange={v => setConfig(c => ({ ...c, cloudAllowExpansionDownload: v }))} />
              <Toggle label={t('placeholderApi.cloudAllowUnverified')} value={config.cloudAllowUnverifiedExpansions} onChange={v => setConfig(c => ({ ...c, cloudAllowUnverifiedExpansions: v }))} />
              <Toggle label={t('placeholderApi.debug')} value={config.debug} onChange={v => setConfig(c => ({ ...c, debug: v }))} />
              <CustomDropdown
                label={t('placeholderApi.cloudSorting')}
                value={config.cloudSorting}
                onChange={v => setConfig(c => ({ ...c, cloudSorting: v }))}
                options={CLOUD_SORT_OPTIONS}
                accent="indigo"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('placeholderApi.booleanTrue')}</label>
                  <input value={config.booleanTrue} onChange={e => setConfig(c => ({ ...c, booleanTrue: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('placeholderApi.booleanFalse')}</label>
                  <input value={config.booleanFalse} onChange={e => setConfig(c => ({ ...c, booleanFalse: e.target.value }))} className={inputCls} />
                </div>
              </div>
            </div>
            <div className={`${sectionCls} min-h-0`}>
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">config.yml</span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => handleCopy(configYaml, 'config-yaml')} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/60`}>
                    {copiedId === 'config-yaml' ? <CheckIcon className="w-3.5 h-3.5" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                    {t('placeholderApi.copyYaml')}
                  </button>
                  <button type="button" onClick={() => downloadText(configYaml, 'config.yml')} className={`${btnCls} bg-violet-500/10 border-violet-500/20 text-violet-300`}>
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('placeholderApi.downloadYaml')}
                  </button>
                </div>
              </div>
              <pre className="flex-1 overflow-auto custom-dropdown-scroll bg-[#0f0f1b] border border-white/[0.06] rounded-xl p-4 text-xs font-mono text-emerald-300/90 whitespace-pre-wrap">{configYaml}</pre>
            </div>
          </div>
        )}

        {mainTab === 'export' && (
          <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4 h-full min-h-0">
            <div className={`${sectionCls} overflow-y-auto custom-dropdown-scroll`}>
              <div>
                <h2 className="text-sm font-bold text-white/90">{t('placeholderApi.exportTitle')}</h2>
                <p className="text-xs text-white/35 mt-1">{t('placeholderApi.exportHint')}</p>
              </div>
              <div className="flex flex-col gap-2">
                {EXPORT_TYPES.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExportType(opt.id)}
                    className={`text-left rounded-xl border px-3 py-2.5 transition-all ${
                      exportType === opt.id
                        ? 'border-indigo-500/35 bg-indigo-500/10'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-white/85 block">{t(`placeholderApi.${opt.labelKey}`)}</span>
                    <span className="text-[10px] text-white/35 mt-0.5 block">{t(`placeholderApi.${opt.descKey}`)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={`${sectionCls} min-h-0`}>
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('placeholderApi.exportPreview')}</span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => handleCopy(exportContent, 'export')} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/60`}>
                    {copiedId === 'export' ? <CheckIcon className="w-3.5 h-3.5" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                    {t('placeholderApi.copyRaw')}
                  </button>
                  <button type="button" onClick={() => downloadText(exportContent, `placeholderapi-${exportType}.yml`)} className={`${btnCls} bg-indigo-500/10 border-indigo-500/20 text-indigo-300`}>
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('placeholderApi.downloadSnippet')}
                  </button>
                </div>
              </div>
              <pre className="flex-1 overflow-auto custom-dropdown-scroll bg-[#0f0f1b] border border-white/[0.06] rounded-xl p-4 text-xs font-mono text-sky-300/90 whitespace-pre-wrap">{exportContent}</pre>
            </div>
          </div>
        )}
      </div>

      {showAddVar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddVar(false)}>
          <div className="bg-[#12121f] border border-white/[0.08] rounded-2xl p-5 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white">{t('placeholderApi.customVarTitle')}</h3>
              <button type="button" onClick={() => setShowAddVar(false)} className="text-white/40 hover:text-white p-1"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('placeholderApi.customVarName')}</label>
                <input value={newVarName} onChange={e => setNewVarName(e.target.value)} placeholder={t('placeholderApi.customVarNameHint')} className={inputCls} />
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('placeholderApi.customVarValue')}</label>
                <input value={newVarValue} onChange={e => setNewVarValue(e.target.value)} className={inputCls} />
              </div>
              <button type="button" onClick={handleAddCustomVar} className={`${btnCls} justify-center bg-sky-500/15 border-sky-500/30 text-sky-300 w-full py-2`}>
                <PlusIcon className="w-4 h-4" />{t('placeholderApi.addVarConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
