import { useState, useEffect, useCallback } from 'react'
import { storeGet, storeSet } from '../../hooks/useStore'
import { useToast } from '../../hooks/useToast'
import { useI18n } from '../../context/I18nContext'
import { LOCALES } from '../../i18n'
import { useAiConfig, PROVIDERS, LANGUAGES } from '../../hooks/useAiConfig'
import { testApiKey, fetchModels } from '../../services/aiService'
import {
  TrashIcon,
  InformationCircleIcon,
  PlusIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  SparklesIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  CloudArrowDownIcon,
} from '@heroicons/react/24/outline'

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-3.5 h-3.5 text-white/30" />}
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/80">{label}</p>
        {desc && <p className="text-xs text-white/30 mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none ${value ? 'bg-indigo-500' : 'bg-white/15'}`}
      style={{ width: 44, height: 24, flexShrink: 0 }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200"
        style={{ left: 4, transform: value ? 'translateX(20px)' : 'translateX(0px)' }}
      />
    </button>
  )
}

// ── Test status badge ─────────────────────────────────────────────────────────
function TestStatus({ status }) {
  const { t } = useI18n()
  if (!status) return null
  if (status === 'testing') return (
    <span className="inline-flex items-center gap-1 text-[10px] text-white/40">
      <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      {t('settings.aiTesting')}
    </span>
  )
  if (status.ok) return (
    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
      <CheckCircleIcon className="w-3 h-3" />
      {t('settings.aiTestOk', { model: status.model, latency: status.latency })}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
      <ExclamationTriangleIcon className="w-3 h-3" />
      {status.error}
    </span>
  )
}

// ── API Key card ──────────────────────────────────────────────────────────────
function ApiKeyCard({ entry, onRemove, onToggle, onUpdateModel }) {
  const { t } = useI18n()
  const [revealed, setRevealed]       = useState(false)
  const [testStatus, setTestStatus]   = useState(null)
  const [editModel, setEditModel]     = useState(false)
  const [fetchingModels, setFetchingModels] = useState(false)
  const [localModels, setLocalModels] = useState(entry.availableModels ?? [])
  const provider = PROVIDERS.find(p => p.id === entry.provider)
  const modelOptions = localModels.length > 0 ? localModels : (provider?.models ?? [])

  async function runTest() {
    setTestStatus('testing')
    const result = await testApiKey({ provider: entry.provider, key: entry.key })
    setTestStatus(result)
    if (result.ok) setTimeout(() => setTestStatus(null), 8000)
  }

  async function refetchModels() {
    setFetchingModels(true)
    const models = await fetchModels({ provider: entry.provider, key: entry.key })
    setLocalModels(models)
    setFetchingModels(false)
    if (models.length > 0) onUpdateModel(entry.id, { availableModels: models })
  }

  const modelLabel = !entry.model || entry.model === 'auto'
    ? (entry.provider === 'gemini' ? t('settings.aiAutoRotate') : t('settings.aiAuto'))
    : entry.model

  return (
    <div className={`flex flex-col gap-2 px-4 py-3 rounded-xl border transition-all ${
      entry.active
        ? 'bg-white/[0.04] border-white/[0.08]'
        : 'bg-white/[0.02] border-white/[0.04] opacity-50'
    }`}>
      {/* Main row */}
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.active ? 'bg-emerald-400' : 'bg-white/20'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-white/80 truncate">{entry.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
              {provider?.label ?? entry.provider}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300/70 border border-violet-500/15 font-mono truncate max-w-[140px]">
              {modelLabel}
            </span>
          </div>
          <p className="text-[11px] text-white/30 font-mono mt-0.5 truncate">
            {revealed ? entry.key : entry.key.slice(0, 8) + '••••••••' + entry.key.slice(-4)}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setRevealed(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
            title={revealed ? t('settings.aiHide') : t('settings.aiReveal')}>
            {revealed ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
          </button>
          <button onClick={runTest} disabled={testStatus === 'testing'}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-500/15 text-white/30 hover:text-indigo-400 transition-colors disabled:opacity-40"
            title={t('settings.aiTestConnection')}>
            <SignalIcon className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setEditModel(v => !v)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${editModel ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-white/10 text-white/30 hover:text-white/70'}`}
            title={t('settings.aiChangeModel')}>
            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${editModel ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => onToggle(entry.id)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
              entry.active ? 'hover:bg-amber-500/15 text-emerald-400 hover:text-amber-400' : 'hover:bg-white/10 text-white/25 hover:text-white/60'
            }`} title={entry.active ? t('settings.aiDisable') : t('settings.aiEnable')}>
            <CheckCircleIcon className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onRemove(entry.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/15 text-white/25 hover:text-red-400 transition-colors"
            title={t('settings.aiRemove')}>
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Test result */}
      {testStatus && <div className="pl-5"><TestStatus status={testStatus} /></div>}

      {/* Model editor */}
      {editModel && (
        <div className="pl-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-white/30 uppercase tracking-wider">{t('settings.aiModel')}</label>
            <button
              onClick={refetchModels}
              disabled={fetchingModels}
              className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition-colors"
            >
              <ArrowPathIcon className={`w-3 h-3 ${fetchingModels ? 'animate-spin' : ''}`} />
              {fetchingModels ? t('settings.aiFetchingModels') : t('settings.aiRefreshModels')}
            </button>
          </div>
          <div className="relative">
            <select
              value={entry.model || 'auto'}
              onChange={e => onUpdateModel(entry.id, { model: e.target.value })}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 pr-8 text-sm text-white/80 outline-none focus:border-indigo-500/40 transition-colors appearance-none"
            >
              <option value="auto" className="bg-[#13131f]">
                {entry.provider === 'gemini' ? t('settings.aiAutoGemini') : t('settings.aiAuto')}
              </option>
              {modelOptions.map(m => (
                <option key={m} value={m} className="bg-[#13131f]">{m}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
          </div>
          {entry.provider === 'gemini' && (!entry.model || entry.model === 'auto') && (
            <p className="text-[10px] text-white/25">
              {t('settings.aiRotateHint', { chain: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', '…'].join(' → ') })}
            </p>
          )}
          {localModels.length > 0 && (
            <p className="text-[10px] text-emerald-400/60">{t('settings.aiModelsFromApi', { count: localModels.length })}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Add key form ──────────────────────────────────────────────────────────────
function AddKeyForm({ onAdd, onCancel }) {
  const { t } = useI18n()
  const [provider, setProvider]           = useState('openai')
  const [key, setKey]                     = useState('')
  const [label, setLabel]                 = useState('')
  const [model, setModel]                 = useState('auto')
  const [availableModels, setAvailableModels] = useState([])
  const [fetchingModels, setFetchingModels]   = useState(false)
  const [testStatus, setTestStatus]       = useState(null)

  // Reset when provider/key changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setTestStatus(null); setModel('auto'); setAvailableModels([]) }, [key, provider])

  async function runTest() {
    if (!key.trim()) return
    setTestStatus('testing')
    const result = await testApiKey({ provider, key: key.trim() })
    setTestStatus(result)
    // Auto-fetch models on successful test
    if (result.ok) runFetchModels()
  }

  async function runFetchModels() {
    if (!key.trim()) return
    setFetchingModels(true)
    const models = await fetchModels({ provider, key: key.trim() })
    setAvailableModels(models)
    setFetchingModels(false)
  }

  function submit(e) {
    e.preventDefault()
    if (!key.trim()) return
    onAdd(provider, key.trim(), label.trim() || `${provider} key`, model, availableModels)
  }

  const providerInfo = PROVIDERS.find(p => p.id === provider)
  const modelOptions = availableModels.length > 0 ? availableModels : (providerInfo?.models ?? [])

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.03] border border-indigo-500/20">
      <p className="text-xs font-semibold text-white/60 flex items-center gap-2">
        <KeyIcon className="w-3.5 h-3.5 text-indigo-400" />
        {t('settings.aiAddApiKey')}
      </p>

      <div>
        <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('settings.aiProvider')}</label>
        <select
          value={provider}
          onChange={e => setProvider(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-indigo-500/40 transition-colors"
        >
          {PROVIDERS.map(p => (
            <option key={p.id} value={p.id} className="bg-[#13131f]">{p.label}</option>
          ))}
        </select>
      </div>

      {/* Label */}
      <div>
        <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('settings.aiLabelOptional')}</label>
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder={t('settings.aiLabelPlaceholder')}
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/40 transition-colors"
        />
      </div>

      {/* Key */}
      <div>
        <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('settings.aiApiKeyRequired')}</label>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder={t('settings.aiApiKeyPlaceholder')}
          required
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/40 transition-colors font-mono"
        />
      </div>

      {/* Model selector */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] text-white/30 uppercase tracking-wider">{t('settings.aiModel')}</label>
          <button
            type="button"
            onClick={runFetchModels}
            disabled={!key.trim() || fetchingModels}
            className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition-colors"
          >
            <ArrowPathIcon className={`w-3 h-3 ${fetchingModels ? 'animate-spin' : ''}`} />
            {fetchingModels ? t('settings.aiFetchingModels') : t('settings.aiFetchModels')}
          </button>
        </div>
        <div className="relative">
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 pr-8 text-sm text-white/80 outline-none focus:border-indigo-500/40 transition-colors appearance-none"
          >
            <option value="auto" className="bg-[#13131f]">
              {provider === 'gemini' ? t('settings.aiAutoGemini') : t('settings.aiAuto')}
            </option>
            {modelOptions.map(m => (
              <option key={m} value={m} className="bg-[#13131f]">{m}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
        </div>
        {provider === 'gemini' && model === 'auto' && (
          <p className="text-[10px] text-white/25 mt-1">{t('settings.aiAutoGeminiHint')}</p>
        )}
        {availableModels.length > 0 && (
          <p className="text-[10px] text-emerald-400/60 mt-1">{t('settings.aiModelsFetched', { count: availableModels.length })}</p>
        )}
      </div>

      {/* Test result */}
      {testStatus && (
        <div className="px-1">
          <TestStatus status={testStatus} />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={runTest}
          disabled={!key.trim() || testStatus === 'testing'}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white/50 text-sm hover:text-white/80 hover:bg-white/[0.08] transition-all disabled:opacity-40"
        >
          <SignalIcon className="w-3.5 h-3.5" />
          {t('settings.aiTest')}
        </button>
        <button
          type="submit"
          disabled={!key.trim()}
          className="flex-1 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/30 transition-all active:scale-95 disabled:opacity-40"
        >
          {t('settings.aiAddKeyBtn')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white/40 text-sm hover:text-white/70 transition-all"
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [autoScan, setAutoScan]     = useState(true)
  const [showHidden, setShowHidden] = useState(false)
  const [showAddKey, setShowAddKey] = useState(false)
  const [appVersion, setAppVersion] = useState(null)
  const toast = useToast()
  const { t, locale, setLanguage } = useI18n()
  const { config, save: saveAi, addKey, removeKey, toggleKey, updateKey } = useAiConfig()

  useEffect(() => {
    Promise.all([storeGet('autoScan', true), storeGet('showHidden', false)]).then(([a, h]) => {
      setAutoScan(a ?? true)
      setShowHidden(h ?? false)
    })
    window.sconfigAPI?.getAppInfo?.().then(info => {
      if (info?.version) setAppVersion(info.version)
    }).catch(() => {})
  }, [])

  const openUpdateWindow = useCallback(() => {
    if (window.sconfigAPI?.openUpdateWindow) {
      window.sconfigAPI.openUpdateWindow()
      return
    }
    toast.show(t('settings.updatesElectronOnly'), 'info')
  }, [toast, t])

  async function toggle(key, val, setter) {
    setter(val)
    await storeSet(key, val)
    toast.show(t('settings.settingSaved'), 'success')
  }

  async function clearData() {
    await Promise.all([
      storeSet('servers', []),
      storeSet('activeServerId', null),
      storeSet('serverPath', null),
      storeSet('plugins', []),
    ])
    toast.show(t('settings.dataCleared'), 'info')
  }

  async function changeLanguage(code) {
    if (code === locale) return
    await setLanguage(code)
    toast.show(t('settings.languageSaved'), 'success')
  }

  const handleAddKey = useCallback(async (provider, key, label, model, availableModels) => {
    await addKey(provider, key, label, model, availableModels)
    setShowAddKey(false)
    toast.show(t('settings.toastKeyAdded'), 'success')
  }, [addKey, toast, t])

  const handleRemoveKey = useCallback(async (id) => {
    await removeKey(id)
    toast.show(t('settings.toastKeyRemoved'), 'info')
  }, [removeKey, toast, t])

  const handleToggleKey = useCallback(async (id) => {
    await toggleKey(id)
  }, [toggleKey])

  const handleUpdateModel = useCallback(async (id, patch) => {
    await updateKey(id, patch)
  }, [updateKey])

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('settings.title')}</h1>
        <p className="text-sm text-white/40 mt-1">{t('settings.subtitle')}</p>
      </div>

      <Section title={t('settings.language')}>
        <Row label={t('settings.language')} desc={t('settings.languageDesc')}>
          <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            {LOCALES.map(({ code, labelKey }) => (
              <button
                key={code}
                type="button"
                onClick={() => changeLanguage(code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  locale === code
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/30'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
                }`}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section title={t('settings.sectionBehavior')}>
        <Row label={t('settings.autoScan')} desc={t('settings.autoScanDesc')}>
          <Toggle value={autoScan} onChange={v => toggle('autoScan', v, setAutoScan)} />
        </Row>
        <Row label={t('settings.showHidden')} desc={t('settings.showHiddenDesc')}>
          <Toggle value={showHidden} onChange={v => toggle('showHidden', v, setShowHidden)} />
        </Row>
      </Section>

      <Section title={t('settings.sectionAi')} icon={SparklesIcon}>
        <Row
          label={t('settings.enableAi')}
          desc={t('settings.enableAiDesc')}
        >
          <Toggle value={config.enabled} onChange={v => saveAi({ enabled: v })} />
        </Row>

        {config.enabled && (
          <>
            {/* Token limit */}
            <div className="px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-white/80">{t('settings.tokenLimit')}</p>
                  <p className="text-xs text-white/30 mt-0.5">{t('settings.tokenLimitDesc')}</p>
                </div>
                <span className="text-sm font-bold text-indigo-300">{config.tokenLimit.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={8000} max={128000} step={1000}
                value={config.tokenLimit}
                onChange={e => saveAi({ tokenLimit: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-white/20 mt-1">
                <span>8k</span><span>40k</span><span>128k</span>
              </div>
            </div>

            {/* Checkpoint size */}
            <div className="px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-white/80">{t('settings.checkpointSize')}</p>
                  <p className="text-xs text-white/30 mt-0.5">{t('settings.checkpointSizeDesc')}</p>
                </div>
                <span className="text-sm font-bold text-violet-300">{t('settings.linesUnit', { count: config.checkpointSize })}</span>
              </div>
              <input
                type="range"
                min={20} max={200} step={10}
                value={config.checkpointSize}
                onChange={e => saveAi({ checkpointSize: Number(e.target.value) })}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-white/20 mt-1">
                <span>20</span><span>80</span><span>200</span>
              </div>
            </div>

            {/* Translate settings */}
            <div className="px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white/80">{t('settings.autoTranslate')}</p>
                  <p className="text-xs text-white/30 mt-0.5">{t('settings.autoTranslateDesc')}</p>
                </div>
                <Toggle value={config.translateEnabled} onChange={v => saveAi({ translateEnabled: v })} />
              </div>
              {config.translateEnabled && (
                <div>
                  <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">{t('settings.defaultTargetLang')}</label>
                  <select
                    value={config.translateTarget}
                    onChange={e => saveAi({ translateTarget: e.target.value })}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-indigo-500/40 transition-colors"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code} className="bg-[#13131f]">{l.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* API Keys list */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-white/40 font-semibold">
                  {t('settings.apiKeys')}
                  <span className="ml-2 text-[10px] text-white/20">
                    {t('settings.apiKeysMeta', {
                      total: config.keys.length,
                      active: config.keys.filter(k => k.active).length,
                    })}
                  </span>
                </p>
                <button
                  onClick={() => setShowAddKey(v => !v)}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  {t('settings.addKey')}
                </button>
              </div>

              {showAddKey && (
                <AddKeyForm onAdd={handleAddKey} onCancel={() => setShowAddKey(false)} />
              )}

              {config.keys.length === 0 && !showAddKey && (
                <div className="flex flex-col items-center gap-2 py-6 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08]">
                  <KeyIcon className="w-6 h-6 text-white/15" />
                  <p className="text-xs text-white/25">{t('settings.noApiKeys')}</p>
                  <button
                    onClick={() => setShowAddKey(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {t('settings.addFirstKey')}
                  </button>
                </div>
              )}

              {config.keys.map(entry => (
                <ApiKeyCard
                  key={entry.id}
                  entry={entry}
                  onRemove={handleRemoveKey}
                  onToggle={handleToggleKey}
                  onUpdateModel={handleUpdateModel}
                />
              ))}
            </div>
          </>
        )}
      </Section>

      <Section title={t('settings.sectionData')}>
        <Row label={t('settings.clearData')} desc={t('settings.clearDataDesc')}>
          <button
            onClick={clearData}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all active:scale-95"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            {t('settings.clear')}
          </button>
        </Row>
      </Section>

      <Section title={t('settings.sectionUpdates')} icon={CloudArrowDownIcon}>
        <Row label={t('settings.checkUpdates')} desc={t('settings.checkUpdatesDesc')}>
          <button
            type="button"
            onClick={openUpdateWindow}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs font-semibold hover:bg-indigo-500/25 transition-all active:scale-95"
          >
            <CloudArrowDownIcon className="w-3.5 h-3.5" />
            {t('settings.openUpdateWindow')}
          </button>
        </Row>
        {appVersion && (
          <p className="text-[11px] text-white/25 font-mono px-1">
            {t('settings.installedVersion', { version: appVersion })}
          </p>
        )}
      </Section>

      <Section title={t('settings.sectionAbout')}>
        <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <InformationCircleIcon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white/80">{t('settings.aboutTitle')}</p>
            <p className="text-xs text-white/30 mt-1 leading-relaxed whitespace-pre-line">
              {t('settings.aboutBody')}
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}
