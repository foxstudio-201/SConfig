import { useState, useMemo } from 'react'
import { ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import { useI18n } from '../../../context/I18nContext'
import {
  FILE_MODES, CHECK_SECTIONS, CHECK_LABEL_KEYS, CHECK_FIELD_MAP, createTotemGuardState,
} from './totemGuardData'
import {
  buildSettingsYaml, buildChecksYaml, buildMessagesYaml, buildWebhooksYaml, downloadYaml,
} from './totemGuardYaml'

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-sky-500/35 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'

function Field({ label, children }) {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-sky-500/35 bg-sky-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}
    >
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center ${value ? 'bg-sky-500/40 border-sky-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
        <span className={`block w-3.5 h-3.5 rounded-full bg-white/90 transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="text-[11px] font-semibold text-white/80">{label}</span>
    </button>
  )
}

function parseLines(v) {
  return String(v || '').split('\n').map(x => x.trim()).filter(Boolean)
}

function toLines(list) {
  return (list || []).join('\n')
}

export default function TotemGuardTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(() => createTotemGuardState())
  const [fileMode, setFileMode] = useState('settings')
  const [copied, setCopied] = useState(false)
  const [checkId, setCheckId] = useState('AutoTotemA')

  const yaml = useMemo(() => {
    if (fileMode === 'checks') return buildChecksYaml(state.checks)
    if (fileMode === 'messages') return buildMessagesYaml(state.messages)
    if (fileMode === 'webhooks') return buildWebhooksYaml(state.webhooks)
    return buildSettingsYaml(state.settings)
  }, [fileMode, state])

  const fileModeOptions = FILE_MODES.map(x => ({ value: x.value, label: t(`totemGuard.${x.labelKey}`) }))
  const checkOptions = CHECK_SECTIONS.flatMap(sec => sec.checks.map(c => ({ value: c, label: t(`totemGuard.${CHECK_LABEL_KEYS[c]}`) })))
  const currentCheck = state.checks.map[checkId]
  const dynamicFields = CHECK_FIELD_MAP[checkId] || []

  const updateSettings = (patch) => setState(prev => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  const updateCheck = (patch) => setState(prev => ({
    ...prev,
    checks: { ...prev.checks, map: { ...prev.checks.map, [checkId]: { ...prev.checks.map[checkId], ...patch } } },
  }))
  const updateMessages = (patch) => setState(prev => ({ ...prev, messages: { ...prev.messages, ...patch } }))
  const updateWebhooks = (key, patch) => setState(prev => ({ ...prev, webhooks: { ...prev.webhooks, [key]: { ...prev.webhooks[key], ...patch } } }))

  const copyYaml = () => {
    navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fileName = fileMode === 'checks'
    ? 'checks.yml'
    : fileMode === 'messages'
      ? 'messages.yml'
      : fileMode === 'webhooks'
        ? 'webhooks.yml'
        : 'config.yml'

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-sky-500/30 bg-sky-500/10 text-sky-300 font-semibold uppercase">{t('totemGuard.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('totemGuard.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('totemGuard.subtitle')}</p>
        </div>
        <CustomDropdown label="" value={fileMode} onChange={setFileMode} options={fileModeOptions} accent="indigo" className="w-44" />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,330px)_minmax(0,1fr)_minmax(0,320px)] gap-4 h-full min-h-0">
          <section className="rounded-2xl bg-black/35 border border-white/[0.06] p-3.5 overflow-y-auto min-h-0 custom-dropdown-scroll">
            {fileMode === 'settings' && (
              <div className="space-y-3">
                <Toggle label={t('totemGuard.fieldApi')} value={state.settings.api} onChange={v => updateSettings({ api: v })} />
                <Field label={t('totemGuard.fieldServer')}><input className={inputCls} value={state.settings.server} onChange={e => updateSettings({ server: e.target.value })} /></Field>
                <Field label={t('totemGuard.fieldCommand')}><input className={inputCls} value={state.settings.command} onChange={e => updateSettings({ command: e.target.value })} /></Field>
                <Field label={t('totemGuard.fieldAliases')}><textarea className={`${inputCls} min-h-16`} value={toLines(state.settings.commandAliases)} onChange={e => updateSettings({ commandAliases: parseLines(e.target.value) })} /></Field>
                <Field label="Redis host"><input className={inputCls} value={state.settings.redis.host} onChange={e => updateSettings({ redis: { ...state.settings.redis, host: e.target.value } })} /></Field>
                <Field label="Database type"><input className={inputCls} value={state.settings.database.type} onChange={e => updateSettings({ database: { ...state.settings.database, type: e.target.value } })} /></Field>
                <Field label="Database name"><input className={inputCls} value={state.settings.database.name} onChange={e => updateSettings({ database: { ...state.settings.database, name: e.target.value } })} /></Field>
              </div>
            )}

            {fileMode === 'checks' && (
              <div className="space-y-3">
                <CustomDropdown label={t('totemGuard.fieldCheck')} value={checkId} onChange={setCheckId} options={checkOptions} accent="indigo" className="w-full" />
                <Toggle label={t('totemGuard.fieldEnabled')} value={currentCheck.enabled} onChange={v => updateCheck({ enabled: v })} />
                <Toggle label={t('totemGuard.fieldPunishable')} value={currentCheck.punishable} onChange={v => updateCheck({ punishable: v })} />
                <Field label={t('totemGuard.fieldPunishDelay')}><input className={inputCls} value={currentCheck.punishmentDelayInSeconds} onChange={e => updateCheck({ punishmentDelayInSeconds: e.target.value })} /></Field>
                <Field label={t('totemGuard.fieldMaxVl')}><input className={inputCls} value={currentCheck.maxViolations} onChange={e => updateCheck({ maxViolations: e.target.value })} /></Field>
                <Field label={t('totemGuard.fieldPunishCmds')}>
                  <textarea className={`${inputCls} min-h-20`} value={toLines(currentCheck.punishmentCommands)} onChange={e => updateCheck({ punishmentCommands: parseLines(e.target.value) })} />
                </Field>
                {dynamicFields.map(field => (
                  <Field key={field} label={t(`totemGuard.field_${field}`)}>
                    {Array.isArray(currentCheck[field]) ? (
                      <textarea className={`${inputCls} min-h-16`} value={toLines(currentCheck[field])} onChange={e => updateCheck({ [field]: parseLines(e.target.value) })} />
                    ) : (
                      <input className={inputCls} value={currentCheck[field]} onChange={e => updateCheck({ [field]: e.target.value })} />
                    )}
                  </Field>
                ))}
              </div>
            )}

            {fileMode === 'messages' && (
              <div className="space-y-3">
                <Field label="Format"><input className={inputCls} value={state.messages.format} onChange={e => updateMessages({ format: e.target.value })} /></Field>
                <Field label="Prefix"><input className={inputCls} value={state.messages.prefix} onChange={e => updateMessages({ prefix: e.target.value })} /></Field>
                <Field label="Alert format"><input className={inputCls} value={state.messages.alertFormat.alertFormat} onChange={e => updateMessages({ alertFormat: { ...state.messages.alertFormat, alertFormat: e.target.value } })} /></Field>
                <Field label="Alert hover message"><textarea className={`${inputCls} min-h-24`} value={state.messages.alertFormat.alertHoverMessage} onChange={e => updateMessages({ alertFormat: { ...state.messages.alertFormat, alertHoverMessage: e.target.value } })} /></Field>
                <Field label="Click command"><input className={inputCls} value={state.messages.alertFormat.alertClickCommand} onChange={e => updateMessages({ alertFormat: { ...state.messages.alertFormat, alertClickCommand: e.target.value } })} /></Field>
              </div>
            )}

            {fileMode === 'webhooks' && (
              <div className="space-y-3">
                {['alert', 'punishment'].map(key => (
                  <div key={key} className="rounded-xl border border-white/[0.08] p-3">
                    <p className="text-xs font-semibold text-sky-200 mb-2">{key}</p>
                    <Toggle label="Enabled" value={state.webhooks[key].enabled} onChange={v => updateWebhooks(key, { enabled: v })} />
                    <div className="mt-2 space-y-2">
                      <Field label="URL"><input className={inputCls} value={state.webhooks[key].url} onChange={e => updateWebhooks(key, { url: e.target.value })} /></Field>
                      <Field label="Title"><input className={inputCls} value={state.webhooks[key].title} onChange={e => updateWebhooks(key, { title: e.target.value })} /></Field>
                      <Field label="Color"><input className={inputCls} value={state.webhooks[key].color} onChange={e => updateWebhooks(key, { color: e.target.value })} /></Field>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-black/35 border border-white/[0.06] p-4 overflow-y-auto min-h-0 custom-dropdown-scroll">
            <p className="text-[11px] text-white/40 mb-2">{t(`totemGuard.path${fileMode[0].toUpperCase()}${fileMode.slice(1)}`)}</p>
            <pre className="whitespace-pre-wrap break-words text-[12px] leading-relaxed text-white/80 font-mono">{yaml}</pre>
          </section>

          <aside className="rounded-2xl bg-black/35 border border-white/[0.06] p-4 flex flex-col gap-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">{t('totemGuard.yamlOutput')}</p>
            <div className="text-xs text-white/40">{fileName}</div>
            <button type="button" onClick={copyYaml} className={`${btnCls} border-sky-500/25 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20`}>
              {copied ? <CheckCircleIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
              {copied ? t('totemGuard.copied') : t('totemGuard.copy')}
            </button>
            <button type="button" onClick={() => downloadYaml(yaml, fileName)} className={`${btnCls} border-indigo-500/25 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20`}>
              <ArrowDownTrayIcon className="w-4 h-4" />
              {t('totemGuard.save')}
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}
