import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import VulcanChipVisual from './VulcanChipVisual'
import {
  SECTION_INFO, CONFIG_PRESETS, createVulcanState, applyPreset as mergeVulcanPreset,
  getConfigStats, getChecksForCategory, CHECK_CATALOG,
} from './vulcanData'
import { buildConfigYaml, downloadYaml } from './vulcanYaml'
import { useI18n } from '../../../context/I18nContext'

const NODE_I18N = {
  alerts: 'nodeAlerts',
  client: 'nodeClient',
  connection: 'nodeLink',
  settings: 'nodeCore',
  combat: 'nodeCombat',
  movement: 'nodeMove',
  player: 'nodePlayer',
  discord: 'nodeDiscord',
}

const DESC_I18N = {
  alerts: 'descAlerts',
  client: 'descClient',
  connection: 'descConnection',
  settings: 'descSettings',
  combat: 'descCombat',
  movement: 'descMovement',
  player: 'descPlayer',
  discord: 'descDiscord',
}

const PRESET_I18N = {
  balanced: 'presetBalanced',
  strict: 'presetStrict',
  lenient: 'presetLenient',
}

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-orange-500/35 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3'
const sectionHead = 'text-[10px] text-white/30 uppercase tracking-widest font-semibold'

function SectionTitle({ children }) {
  return <p className={sectionHead}>{children}</p>
}

function Field({ label, children, hint }) {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      {children}
      {hint && <p className="text-[10px] text-white/25 mt-1">{hint}</p>}
    </div>
  )
}

function Block({ title, desc, children }) {
  return (
    <div className="rounded-xl border border-orange-500/10 bg-gradient-to-b from-orange-500/[0.04] to-transparent p-3 flex flex-col gap-2.5">
      {title && <p className="text-[11px] font-semibold text-orange-200/85">{title}</p>}
      {desc && <p className="text-[10px] text-white/30 leading-relaxed">{desc}</p>}
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange, desc }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-orange-500/35 bg-orange-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center transition-all ${value ? 'bg-orange-500/40 border-orange-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
        <span className={`block w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold text-white/80 block">{label}</span>
        {desc && <span className="text-[10px] text-white/35 block mt-0.5">{desc}</span>}
      </span>
    </button>
  )
}

function NumInput({ value, onChange }) {
  return <input type="text" className={inputCls} value={value} onChange={e => onChange(e.target.value)} />
}

function SectionHeader({ t, sectionId }) {
  if (!SECTION_INFO[sectionId]) return null
  return (
    <div className="rounded-xl border border-orange-500/20 bg-orange-500/8 px-3 py-2 mb-1">
      <p className="text-xs font-semibold text-orange-200/90">{t(`vulcan.${NODE_I18N[sectionId]}`)}</p>
      <p className="text-[10px] text-white/35 mt-0.5">{t(`vulcan.${DESC_I18N[sectionId]}`)}</p>
    </div>
  )
}

function ChipStatsBar({ t, stats }) {
  return (
    <div className="grid grid-cols-4 gap-1 w-full mt-1">
      {[
        [t('vulcan.statCore'), stats.core, 'text-orange-300'],
        [t('vulcan.statNodes'), stats.active, 'text-amber-300'],
        [t('vulcan.statStrict'), stats.strict, 'text-red-300'],
        [t('vulcan.statChecks'), stats.checks, 'text-orange-200'],
      ].map(([l, v, c]) => (
        <div key={l} className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-1.5 py-1 text-center">
          <p className="text-[8px] text-white/30">{l}</p>
          <p className={`text-[10px] font-mono font-semibold capitalize ${c}`}>{v}</p>
        </div>
      ))}
    </div>
  )
}

function ChecksEditor({ t, s, set, category }) {
  const [openId, setOpenId] = useState(null)
  const list = getChecksForCategory(category)
  const patchCheck = (id, p) => set({
    checks: { ...s.checks, [id]: { ...s.checks[id], ...p } },
  })
  const bulk = (p) => {
    const next = { ...s.checks }
    list.forEach(c => { next[c.id] = { ...next[c.id], ...p } })
    set({ checks: next })
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId={category} />
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => bulk({ enabled: true })} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/50`}>{t('vulcan.enableAll')}</button>
        <button type="button" onClick={() => bulk({ enabled: false })} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/50`}>{t('vulcan.disableAll')}</button>
        <button type="button" onClick={() => bulk({ maxViolations: 5 })} className={`${btnCls} bg-red-500/10 border-red-500/20 text-red-300`}>{t('vulcan.strictVl')}</button>
      </div>
      <div className="flex flex-col gap-2">
        {list.map(meta => {
          const chk = s.checks[meta.id]
          if (!chk) return null
          const open = openId === meta.id
          return (
            <div key={meta.id} className={`rounded-xl border transition-all ${chk.enabled ? 'border-orange-500/25 bg-orange-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-left"
                onClick={() => setOpenId(open ? null : meta.id)}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${chk.enabled ? 'bg-orange-400' : 'bg-white/20'}`} />
                <span className="text-[11px] font-mono font-semibold text-white/85 flex-1">{meta.label}</span>
                <span className="text-[9px] text-white/35">{t('vulcan.vlBadge', { vl: chk.maxViolations })}</span>
              </button>
              {open && (
                <div className="px-3 pb-3 pt-0 flex flex-col gap-2 border-t border-white/[0.05]">
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Toggle label={t('vulcan.toggleEnabled')} value={chk.enabled} onChange={v => patchCheck(meta.id, { enabled: v })} />
                    <Toggle label={t('vulcan.togglePunishable')} value={chk.punishable} onChange={v => patchCheck(meta.id, { punishable: v })} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Field label={t('vulcan.fieldMaxVl')}><NumInput value={chk.maxViolations} onChange={v => patchCheck(meta.id, { maxViolations: v })} /></Field>
                    <Field label={t('vulcan.fieldAlertInt')}><NumInput value={chk.alertInterval} onChange={v => patchCheck(meta.id, { alertInterval: v })} /></Field>
                    <Field label={t('vulcan.fieldDontAlert')}><NumInput value={chk.dontAlertUntil} onChange={v => patchCheck(meta.id, { dontAlertUntil: v })} /></Field>
                  </div>
                  <Field label={t('vulcan.fieldPunishmentCmds')}>
                    <textarea className={`${inputCls} min-h-[60px] font-mono text-xs`}
                      value={(chk.punishmentCommands || []).join('\n')}
                      onChange={e => patchCheck(meta.id, { punishmentCommands: e.target.value.split('\n').map(x => x.trim()).filter(Boolean) })} />
                  </Field>
                  <div className="grid grid-cols-3 gap-2">
                    <Field label={t('vulcan.fieldBufferMax')}><NumInput value={chk.bufferMax} onChange={v => patchCheck(meta.id, { bufferMax: v })} /></Field>
                    <Field label={t('vulcan.fieldBufferMultiple')}><NumInput value={chk.bufferMultiple} onChange={v => patchCheck(meta.id, { bufferMultiple: v })} /></Field>
                    <Field label={t('vulcan.fieldBufferDecay')}><NumInput value={chk.bufferDecay} onChange={v => patchCheck(meta.id, { bufferDecay: v })} /></Field>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-white/25">{t('vulcan.checksExportHint', { count: list.length })}</p>
    </div>
  )
}

function AlertsSection({ t, s, set }) {
  const a = (k, v) => set({ alerts: { ...s.alerts, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="alerts" />
      <Block title={t('vulcan.blockAlertFormat')}>
        <Field label={t('vulcan.fieldChatFormat')}><input className={inputCls} value={s.alerts.format} onChange={e => a('format', e.target.value)} /></Field>
        <Toggle label={t('vulcan.togglePrintConsole')} value={s.alerts.printToConsole} onChange={v => a('printToConsole', v)} />
        <Field label={t('vulcan.fieldConsoleFormat')}><input className={inputCls} value={s.alerts.consoleFormat} onChange={e => a('consoleFormat', e.target.value)} /></Field>
      </Block>
      <Block title={t('vulcan.blockLoggingReset')}>
        <Toggle label={t('vulcan.toggleLogFile')} value={s.logFile.enabled} onChange={v => set({ logFile: { ...s.logFile, enabled: v } })} />
        <Field label={t('vulcan.fieldResetInterval')}><NumInput value={s.violationReset.intervalMinutes} onChange={v => set({ violationReset: { ...s.violationReset, intervalMinutes: v } })} /></Field>
        <Toggle label={t('vulcan.toggleVlResetMsg')} value={s.violationReset.messageEnabled} onChange={v => set({ violationReset: { ...s.violationReset, messageEnabled: v } })} />
      </Block>
    </div>
  )
}

function ClientSection({ t, s, set }) {
  const c = (k, v) => set({ clientBrand: { ...s.clientBrand, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="client" />
      <Toggle label={t('vulcan.toggleResolveBrand')} value={s.clientBrand.resolve} onChange={v => c('resolve', v)} />
      <Toggle label={t('vulcan.toggleBrandJoinAlerts')} value={s.clientBrand.enabled} onChange={v => c('enabled', v)} />
      <Field label={t('vulcan.fieldJoinMessage')}><input className={inputCls} value={s.clientBrand.message} onChange={e => c('message', e.target.value)} /></Field>
      <Field label={t('vulcan.fieldIgnoreAlertsList')}>
        <textarea className={`${inputCls} min-h-[80px] font-mono text-xs`} value={(s.clientBrand.ignoreAlertsList || []).join('\n')}
          onChange={e => c('ignoreAlertsList', e.target.value.split('\n').map(x => x.trim()).filter(Boolean))} />
      </Field>
      <Field label={t('vulcan.fieldBlockedBrands')}>
        <textarea className={`${inputCls} min-h-[60px] font-mono text-xs`} value={(s.clientBrand.blockedBrands || []).join('\n')}
          onChange={e => c('blockedBrands', e.target.value.split('\n').map(x => x.trim()).filter(Boolean))} />
      </Field>
      <Toggle label={t('vulcan.toggleWhitelistMode')} value={s.clientBrand.whitelistEnabled} onChange={v => c('whitelistEnabled', v)} />
    </div>
  )
}

function ConnectionSection({ t, s, set }) {
  const c = (k, v) => set({ connection: { ...s.connection, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="connection" />
      <Block title={t('vulcan.blockConfirmPackets')}>
        <Field label={t('vulcan.fieldNoResponseDelay')}><NumInput value={s.connection.noResponseDelay} onChange={v => c('noResponseDelay', v)} /></Field>
        <Field label={t('vulcan.fieldMaxPending')}><NumInput value={s.connection.maxSizeAmount} onChange={v => c('maxSizeAmount', v)} /></Field>
        <Toggle label={t('vulcan.toggleKeepaliveKick')} value={s.connection.keepaliveKick} onChange={v => c('keepaliveKick', v)} />
        <Field label={t('vulcan.fieldKeepaliveMax')}><NumInput value={s.connection.keepaliveMaxDelay} onChange={v => c('keepaliveMaxDelay', v)} /></Field>
      </Block>
      <Block title={t('vulcan.blockMaxPing')}>
        <Toggle label={t('vulcan.toggleKickHighPing')} value={s.connection.maxPingKick} onChange={v => c('maxPingKick', v)} />
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('vulcan.fieldMaxPing')}><NumInput value={s.connection.maxPingValue} onChange={v => c('maxPingValue', v)} /></Field>
          <Field label={t('vulcan.fieldMaxTicks')}><NumInput value={s.connection.maxPingTicks} onChange={v => c('maxPingTicks', v)} /></Field>
        </div>
      </Block>
    </div>
  )
}

function SettingsSection({ t, s, set }) {
  const g = (k, v) => set({ settings: { ...s.settings, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="settings" />
      <Block title={t('vulcan.blockGeneral')}>
        <Field label={t('vulcan.fieldPrefix')}><input className={inputCls} value={s.prefix} onChange={e => set({ prefix: e.target.value })} /></Field>
        <Toggle label={t('vulcan.toggleAlertsOnJoin')} value={s.settings.toggleAlertsOnJoin} onChange={v => g('toggleAlertsOnJoin', v)} />
        <Toggle label={t('vulcan.toggleAsyncAlerts')} value={s.settings.asyncAlerts} onChange={v => g('asyncAlerts', v)} />
        <Toggle label={t('vulcan.toggleIgnoreFloodgate')} value={s.settings.ignoreFloodgate} onChange={v => g('ignoreFloodgate', v)} />
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('vulcan.fieldMaxAlertVl')}><NumInput value={s.settings.maxAlertViolation} onChange={v => g('maxAlertViolation', v)} /></Field>
          <Field label={t('vulcan.fieldPunishmentDelay')}><NumInput value={s.settings.punishmentDelay} onChange={v => g('punishmentDelay', v)} /></Field>
          <Field label={t('vulcan.fieldJoinCheckWait')}><NumInput value={s.settings.joinCheckWaitTime} onChange={v => g('joinCheckWaitTime', v)} /></Field>
          <Field label={t('vulcan.fieldServerName')}><NumInput value={s.settings.serverName} onChange={v => g('serverName', v)} /></Field>
        </div>
        <Toggle label={t('vulcan.toggleDebug')} value={s.settings.debug} onChange={v => g('debug', v)} />
      </Block>
    </div>
  )
}

function DiscordSection({ t, s, set }) {
  const d = (k, v) => set({ discord: { ...s.discord, [k]: v } })
  const g = (k, v) => set({ ghostBlocks: { ...s.ghostBlocks, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="discord" />
      <Block title={t('vulcan.blockDiscordWebhooks')}>
        <Toggle label={t('vulcan.toggleAlertWebhooks')} value={s.discord.alertsEnabled} onChange={v => d('alertsEnabled', v)} />
        <Field label={t('vulcan.fieldAlertsWebhook')}><input className={inputCls} value={s.discord.alertsUrl} onChange={e => d('alertsUrl', e.target.value)} /></Field>
        <Toggle label={t('vulcan.togglePunishmentWebhooks')} value={s.discord.punishmentsEnabled} onChange={v => d('punishmentsEnabled', v)} />
        <Field label={t('vulcan.fieldPunishmentsWebhook')}><input className={inputCls} value={s.discord.punishmentsUrl} onChange={e => d('punishmentsUrl', e.target.value)} /></Field>
      </Block>
      <Block title={t('vulcan.blockGhostBlocks')}>
        <Toggle label={t('vulcan.toggleGhostEnabled')} value={s.ghostBlocks.enabled} onChange={v => g('enabled', v)} />
        <Toggle label={t('vulcan.toggleGhostWater')} value={s.ghostBlocks.ghostWaterFix} onChange={v => g('ghostWaterFix', v)} />
        <Field label={t('vulcan.fieldMinimumTps')}><NumInput value={s.ghostBlocks.minimumTps} onChange={v => g('minimumTps', v)} /></Field>
        <Toggle label={t('vulcan.toggleSetback')} value={s.ghostBlocks.setback} onChange={v => g('setback', v)} />
      </Block>
    </div>
  )
}

const SECTIONS = {
  alerts: AlertsSection,
  client: ClientSection,
  connection: ConnectionSection,
  settings: SettingsSection,
  combat: props => <ChecksEditor {...props} category="combat" />,
  movement: props => <ChecksEditor {...props} category="movement" />,
  player: props => <ChecksEditor {...props} category="player" />,
  discord: DiscordSection,
}

export default function VulcanAnticheatTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(() => createVulcanState())
  const [section, setSection] = useState('alerts')
  const [copied, setCopied] = useState(false)

  const set = useCallback(patch => setState(prev => ({ ...prev, ...patch })), [])

  const stats = useMemo(() => getConfigStats(state), [state])
  const yaml = useMemo(() => buildConfigYaml(state), [state])

  const handlePreset = (id) => {
    if (!id) return
    const p = CONFIG_PRESETS.find(x => x.id === id)
    if (p) setState(prev => mergeVulcanPreset(prev, p))
  }

  const copyYaml = () => {
    navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const Active = SECTIONS[section]

  const presetOptions = useMemo(() => CONFIG_PRESETS.map(p => ({
    value: p.id,
    label: t(`vulcan.${PRESET_I18N[p.id]}`),
  })), [t])

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white">{t('vulcan.title')}</h1>
          <p className="text-xs text-white/35 mt-0.5">{t('vulcan.subtitle', { count: CHECK_CATALOG.length })}</p>
        </div>
        <CustomDropdown label="" value="" onChange={handlePreset}
          options={presetOptions}
          placeholder={t('vulcan.preset')} accent="rose" className="w-32" />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)_minmax(0,268px)] gap-4 h-full min-h-0">
          <div className={`${sectionCls} min-h-0 overflow-y-auto custom-dropdown-scroll`}>
            <SectionTitle>{t('vulcan.shieldMatrix')}</SectionTitle>
            <p className="text-[10px] text-white/30 text-center px-1">{t('vulcan.shieldHint')}</p>
            <ChipStatsBar t={t} stats={stats} />
            <VulcanChipVisual
              t={t}
              nodeStatuses={stats.nodes}
              coreStatus={stats.core}
              activeId={section}
              onSelect={setSection}
              coreLabel={t('vulcan.coreLabel')}
            />
          </div>

          <div className={`${sectionCls} min-h-0 min-w-0 overflow-hidden flex flex-col`}>
            <SectionTitle>{NODE_I18N[section] ? t(`vulcan.${NODE_I18N[section]}`) : section}</SectionTitle>
            <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
              {Active && <Active t={t} s={state} set={set} />}
            </div>
          </div>

          <div className={`${sectionCls} min-h-0 min-w-0 overflow-hidden flex flex-col`}>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <SectionTitle>{t('vulcan.yamlOutput')}</SectionTitle>
              <p className="text-[10px] font-mono text-orange-500/40 break-all">{t('vulcan.configPath')}</p>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={copyYaml} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/60`}>
                  {copied ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                  {copied ? t('vulcan.copied') : t('vulcan.copy')}
                </button>
                <button type="button" onClick={() => downloadYaml(yaml, 'config.yml')}
                  className={`${btnCls} bg-orange-500/10 border-orange-500/20 text-orange-300`}>
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('vulcan.save')}
                </button>
              </div>
            </div>
            <pre className="flex-1 min-h-0 h-0 overflow-auto p-3 rounded-xl bg-[#0d0d1a] border border-white/[0.04] text-[10px] font-mono text-orange-200/75 leading-relaxed whitespace-pre-wrap custom-dropdown-scroll">{yaml}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
