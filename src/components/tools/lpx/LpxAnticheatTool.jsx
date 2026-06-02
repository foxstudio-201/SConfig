import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import LpxChipVisual from './LpxChipVisual'
import {
  CONFIG_PRESETS, CHECK_CATALOG_UNIQUE,
  createLpxState, applyPreset as mergeLpxPreset,
  getConfigStats, getCheckCategoriesForSection,
} from './lpxData'
import { buildConfigYaml, downloadYaml } from './lpxYaml'
import { useI18n } from '../../../context/I18nContext'

const NODE_I18N = {
  messages: 'nodeMessages',
  options: 'nodeOptions',
  printer: 'nodePrinter',
  mechanics: 'nodeMechanics',
  logger: 'nodeLogger',
  discord: 'nodeDiscord',
  'checks-core': 'nodePackets',
  'checks-traffic': 'nodeTraffic',
}

const PRESET_I18N = {
  balanced: 'presetBalanced',
  strict: 'presetStrict',
  lenient: 'presetLenient',
}

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-violet-500/35 transition-colors'
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
    <div className="rounded-xl border border-violet-500/12 bg-gradient-to-b from-violet-500/[0.05] to-transparent p-3 flex flex-col gap-2.5">
      {title && <p className="text-[11px] font-semibold text-violet-200/85">{title}</p>}
      {desc && <p className="text-[10px] text-white/30 leading-relaxed">{desc}</p>}
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange, desc }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-violet-500/35 bg-violet-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center transition-all ${value ? 'bg-violet-500/40 border-violet-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
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

function ChipStatsBar({ t, stats }) {
  return (
    <div className="grid grid-cols-4 gap-1 w-full mt-1">
      {[
        [t('lpx.statCore'), stats.core, 'text-violet-300 capitalize'],
        [t('lpx.statModules'), stats.active, 'text-fuchsia-300'],
        [t('lpx.statChecks'), stats.checks, 'text-purple-200'],
        [t('lpx.statPunish'), stats.punish, 'text-pink-300'],
      ].map(([l, v, c]) => (
        <div key={l} className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-1.5 py-1 text-center">
          <p className="text-[8px] text-white/30">{l}</p>
          <p className={`text-[10px] font-mono font-semibold ${c}`}>{v}</p>
        </div>
      ))}
    </div>
  )
}

function MessagesSection({ t, s, set }) {
  const m = (k, v) => set({ messages: { ...s.messages, [k]: v } })
  const a = (k, v) => set({ messages: { ...s.messages, alerts: { ...s.messages.alerts, [k]: v } } })
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/8 px-3 py-2 mb-1">
        <p className="text-xs font-semibold text-violet-200/90">{t('lpx.nodeMessages')}</p>
        <p className="text-[10px] text-white/35 mt-0.5">{t('lpx.descMessages')}</p>
      </div>
      <Block title={t('lpx.blockColors')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('lpx.fieldMainColor')}><input className={inputCls} value={s.messages.mainColor} onChange={e => m('mainColor', e.target.value)} /></Field>
          <Field label={t('lpx.fieldSecondColor')}><input className={inputCls} value={s.messages.secondColor} onChange={e => m('secondColor', e.target.value)} /></Field>
        </div>
        <Field label={t('lpx.fieldPrefix')}><input className={inputCls} value={s.messages.prefix} onChange={e => m('prefix', e.target.value)} /></Field>
      </Block>
      <Block title={t('lpx.blockKickMessages')}>
        <Field label={t('lpx.fieldKick')}><input className={inputCls} value={s.messages.kick} onChange={e => m('kick', e.target.value)} /></Field>
        <Field label={t('lpx.fieldKickAlert')}><input className={inputCls} value={s.messages.kickAlert} onChange={e => m('kickAlert', e.target.value)} /></Field>
        <Field label={t('lpx.fieldNullAddress')}><input className={inputCls} value={s.messages.nullAddress} onChange={e => m('nullAddress', e.target.value)} /></Field>
      </Block>
      <Block title={t('lpx.blockStaffAlerts')}>
        <Field label={t('lpx.fieldAlertFormat')}><input className={inputCls} value={s.messages.alerts.format} onChange={e => a('format', e.target.value)} /></Field>
        <Field label={t('lpx.fieldAlertPermission')}><input className={inputCls} value={s.messages.alerts.permission} onChange={e => a('permission', e.target.value)} /></Field>
        <Field label={t('lpx.fieldHoverLines')} hint={t('lpx.hintHoverLines')}>
          <textarea className={`${inputCls} min-h-[90px] font-mono text-xs`}
            value={(s.messages.alerts.hover || []).join('\n')}
            onChange={e => a('hover', e.target.value.split('\n'))} />
        </Field>
      </Block>
    </div>
  )
}

function OptionsSection({ t, s, set }) {
  const o = (k, v) => set({ options: { ...s.options, [k]: v } })
  const ct = (k, v) => set({ options: { ...s.options, clearTask: { ...s.options.clearTask, [k]: v } } })
  const al = (k, v) => set({ options: { ...s.options, alerts: { ...s.options.alerts, [k]: v } } })
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/8 px-3 py-2 mb-1">
        <p className="text-xs font-semibold text-violet-200/90">{t('lpx.nodeOptions')}</p>
        <p className="text-[10px] text-white/35 mt-0.5">{t('lpx.descOptions')}</p>
      </div>
      <Block title={t('lpx.blockLicense')}>
        <Field label={t('lpx.fieldLicense')}><input className={inputCls} value={s.license} onChange={e => set({ license: e.target.value })} /></Field>
        <Toggle label={t('lpx.toggleForceFallback')} value={s.forceFallback} onChange={v => set({ forceFallback: v })} desc={t('lpx.toggleForceFallbackDesc')} />
      </Block>
      <Block title={t('lpx.blockGeneral')}>
        <Toggle label={t('lpx.toggleSilentFailures')} value={s.options.silentFailures} onChange={v => o('silentFailures', v)} />
        <Toggle label={t('lpx.toggleKickOnException')} value={s.options.kickOnException} onChange={v => o('kickOnException', v)} />
        <Field label={t('lpx.fieldItemDecoding')}>
          <CustomDropdown label="" value={s.options.disableItemDecoding} onChange={v => o('disableItemDecoding', v)}
            options={[
              { value: 'ALL', label: 'ALL' },
              { value: 'BOOKS', label: 'BOOKS' },
              { value: 'NONE', label: 'NONE' },
            ]}
            accent="indigo" className="w-full" />
        </Field>
        <Toggle label={t('lpx.toggleHiddenCommand')} value={s.options.hiddenCommand} onChange={v => o('hiddenCommand', v)} />
        <Toggle label={t('lpx.toggleBypass')} value={s.options.bypassPermission} onChange={v => o('bypassPermission', v)} />
        <Toggle label={t('lpx.toggleGeyser')} value={s.options.geyser} onChange={v => o('geyser', v)} />
        <Toggle label={t('lpx.toggleCheckUpdates')} value={s.options.checkUpdates} onChange={v => o('checkUpdates', v)} />
        <Toggle label={t('lpx.toggleBstats')} value={s.options.bstats} onChange={v => o('bstats', v)} />
        <Toggle label={t('lpx.toggleClearTask')} value={s.options.clearTask.enabled} onChange={v => ct('enabled', v)} />
        <Field label={t('lpx.fieldClearDelay')}><NumInput value={s.options.clearTask.delay} onChange={v => ct('delay', v)} /></Field>
        <Field label={t('lpx.fieldServerName')}><input className={inputCls} value={s.options.server} onChange={e => o('server', e.target.value)} /></Field>
        <Field label={t('lpx.fieldPunishDelay')}><NumInput value={s.options.punishDelay} onChange={v => o('punishDelay', v)} /></Field>
        <Toggle label={t('lpx.toggleDebug')} value={s.options.debug} onChange={v => o('debug', v)} />
        <Toggle label={t('lpx.toggleExternalConfig')} value={s.options.externalConfig} onChange={v => o('externalConfig', v)} />
      </Block>
      <Block title={t('lpx.blockAlertStorage')}>
        <Toggle label={t('lpx.toggleAlertStore')} value={s.options.alerts.store} onChange={v => al('store', v)} />
        <Field label={t('lpx.fieldAlertDays')}><NumInput value={s.options.alerts.days} onChange={v => al('days', v)} /></Field>
      </Block>
    </div>
  )
}

function PrinterSection({ t, s, set }) {
  const p = (k, v) => set({ options: { ...s.options, printer: { ...s.options.printer, [k]: v } } })
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/8 px-3 py-2 mb-1">
        <p className="text-xs font-semibold text-violet-200/90">{t('lpx.nodePrinter')}</p>
        <p className="text-[10px] text-white/35 mt-0.5">{t('lpx.descPrinter')}</p>
      </div>
      <Block title={t('lpx.blockPrinterMode')} desc={t('lpx.blockPrinterModeDesc')}>
        <Toggle label={t('lpx.togglePrinterAuto')} value={s.options.printer.automatic} onChange={v => p('automatic', v)} />
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('lpx.fieldPlaceThreshold')}><NumInput value={s.options.printer.placeThreshold} onChange={v => p('placeThreshold', v)} /></Field>
          <Field label={t('lpx.fieldDisableDelay')}><NumInput value={s.options.printer.disableDelay} onChange={v => p('disableDelay', v)} /></Field>
        </div>
        <Toggle label={t('lpx.togglePrinterAlerts')} value={s.options.printer.alerts} onChange={v => p('alerts', v)} />
        <Field label={t('lpx.fieldPrinterPermission')}><input className={inputCls} value={s.options.printer.permission} onChange={e => p('permission', e.target.value)} /></Field>
        <Field label={t('lpx.fieldPrinterJoin')}><input className={inputCls} value={s.options.printer.join} onChange={e => p('join', e.target.value)} /></Field>
        <Field label={t('lpx.fieldPrinterLeave')}><input className={inputCls} value={s.options.printer.leave} onChange={e => p('leave', e.target.value)} /></Field>
      </Block>
    </div>
  )
}

function MechanicsSection({ t, s, set }) {
  const m = (k, v) => set({ options: { ...s.options, mechanics: { ...s.options.mechanics, [k]: v } } })
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/8 px-3 py-2 mb-1">
        <p className="text-xs font-semibold text-violet-200/90">{t('lpx.nodeMechanics')}</p>
        <p className="text-[10px] text-white/35 mt-0.5">{t('lpx.descMechanics')}</p>
      </div>
      <Block title={t('lpx.blockMechanics')}>
        <Field label={t('lpx.fieldPortalDelay')} hint={t('lpx.hintPortalDelay')}><NumInput value={s.options.mechanics.netherPortalDelay} onChange={v => m('netherPortalDelay', v)} /></Field>
        <Field label={t('lpx.fieldMaxArrow')} hint={t('lpx.hintDisable')}><NumInput value={s.options.mechanics.maxArrowVelocity} onChange={v => m('maxArrowVelocity', v)} /></Field>
        <Field label={t('lpx.fieldShearsCooldown')}><NumInput value={s.options.mechanics.shearsCooldown} onChange={v => m('shearsCooldown', v)} /></Field>
        <Toggle label={t('lpx.toggleBreakCloseInv')} value={s.options.mechanics.breakCloseInventory} onChange={v => m('breakCloseInventory', v)} />
        <Toggle label={t('lpx.toggleTrapdoorRedstone')} value={s.options.mechanics.trapdoorRailRedstone} onChange={v => m('trapdoorRailRedstone', v)} />
        <Field label={t('lpx.fieldContainerDelay')}><NumInput value={s.options.mechanics.interactContainerDelay} onChange={v => m('interactContainerDelay', v)} /></Field>
      </Block>
    </div>
  )
}

function LoggerSection({ t, s, set }) {
  const p = (k, v) => set({ packetLogger: { ...s.packetLogger, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/8 px-3 py-2 mb-1">
        <p className="text-xs font-semibold text-violet-200/90">{t('lpx.nodeLogger')}</p>
        <p className="text-[10px] text-white/35 mt-0.5">{t('lpx.descLogger')}</p>
      </div>
      <Block title={t('lpx.blockPacketLogger')}>
        <Field label={t('lpx.fieldHeavyThreshold')} hint={t('lpx.hintHeavyThreshold')}><NumInput value={s.packetLogger.heavyPacketThreshold} onChange={v => p('heavyPacketThreshold', v)} /></Field>
        <Toggle label={t('lpx.toggleLoggerEnabled')} value={s.packetLogger.enabled} onChange={v => p('enabled', v)} />
        <Field label={t('lpx.fieldPlayerMode')}>
          <CustomDropdown label="" value={s.packetLogger.playerMode} onChange={v => p('playerMode', v)}
            options={[{ value: 'whitelist', label: 'whitelist' }, { value: 'blacklist', label: 'blacklist' }]}
            accent="indigo" className="w-full" />
        </Field>
        <Field label={t('lpx.fieldLoggerPlayers')}>
          <textarea className={`${inputCls} min-h-[60px] font-mono text-xs`} value={(s.packetLogger.players || []).join('\n')}
            onChange={e => p('players', e.target.value.split('\n').map(x => x.trim()).filter(Boolean))} />
        </Field>
        <Field label={t('lpx.fieldPacketMode')}>
          <CustomDropdown label="" value={s.packetLogger.packetMode} onChange={v => p('packetMode', v)}
            options={[{ value: 'whitelist', label: 'whitelist' }, { value: 'blacklist', label: 'blacklist' }]}
            accent="indigo" className="w-full" />
        </Field>
        <Field label={t('lpx.fieldPackets')} hint={t('lpx.hintPackets')}>
          <textarea className={`${inputCls} min-h-[100px] font-mono text-xs`} value={(s.packetLogger.packets || []).join('\n')}
            onChange={e => p('packets', e.target.value.split('\n').map(x => x.trim()).filter(Boolean))} />
        </Field>
      </Block>
    </div>
  )
}

function DiscordSection({ t, s, set }) {
  const d = (k, v) => set({ discord: { ...s.discord, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/8 px-3 py-2 mb-1">
        <p className="text-xs font-semibold text-violet-200/90">{t('lpx.nodeDiscord')}</p>
        <p className="text-[10px] text-white/35 mt-0.5">{t('lpx.descDiscord')}</p>
      </div>
      <Block title={t('lpx.blockDiscord')}>
        <Toggle label={t('lpx.toggleDiscord')} value={s.discord.enabled} onChange={v => d('enabled', v)} />
        <Field label={t('lpx.fieldWebhookUrl')}><input className={inputCls} value={s.discord.url} onChange={e => d('url', e.target.value)} /></Field>
        <Field label={t('lpx.fieldEmbedColor')}><input className={inputCls} value={s.discord.color} onChange={e => d('color', e.target.value)} /></Field>
        <Field label={t('lpx.fieldEmbedContent')}>
          <textarea className={`${inputCls} min-h-[100px] font-mono text-xs`} value={(s.discord.content || []).join('\n')}
            onChange={e => d('content', e.target.value.split('\n'))} />
        </Field>
      </Block>
    </div>
  )
}

function ChecksEditor({ t, s, set, section }) {
  const [openId, setOpenId] = useState(null)
  const categories = getCheckCategoriesForSection(section)

  const patchCheck = (id, p) => set({
    checks: { ...s.checks, [id]: { ...s.checks[id], ...p } },
  })

  const bulk = (p) => {
    const next = { ...s.checks }
    CHECK_CATALOG_UNIQUE.filter(c => c.section === section).forEach(c => {
      next[c.id] = { ...next[c.id], ...p }
    })
    set({ checks: next })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/8 px-3 py-2 mb-1">
        <p className="text-xs font-semibold text-violet-200/90">{t(`lpx.${NODE_I18N[section]}`)}</p>
        <p className="text-[10px] text-white/35 mt-0.5">{t(section === 'checks-core' ? 'lpx.descPackets' : 'lpx.descTraffic')}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => bulk({ enabled: true })} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/50`}>{t('lpx.enableAll')}</button>
        <button type="button" onClick={() => bulk({ enabled: false })} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/50`}>{t('lpx.disableAll')}</button>
        <button type="button" onClick={() => bulk({ punish: true, maxVl: 3 })} className={`${btnCls} bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300`}>{t('lpx.strictAll')}</button>
      </div>
      {categories.map(cat => {
        const list = CHECK_CATALOG_UNIQUE.filter(c => c.section === section && c.category === cat)
        return (
          <div key={cat} className="flex flex-col gap-2">
            <p className="text-[10px] font-mono font-semibold text-violet-300/80 uppercase tracking-wider">{cat}</p>
            {list.map(meta => {
              const chk = s.checks[meta.id]
              if (!chk) return null
              const open = openId === meta.id
              return (
                <div key={meta.id} className={`rounded-xl border transition-all ${chk.enabled ? 'border-violet-500/25 bg-violet-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                  <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-left"
                    onClick={() => setOpenId(open ? null : meta.id)}>
                    <span className={`w-2 h-2 rounded-sm flex-shrink-0 ${chk.enabled ? 'bg-violet-400' : 'bg-white/20'}`} />
                    <span className="text-[11px] font-mono font-semibold text-white/85 flex-1">{meta.label}</span>
                    <span className="text-[9px] text-white/35">{t('lpx.vlBadge', { vl: chk.maxVl, punish: chk.punish ? '✓' : '—' })}</span>
                  </button>
                  {open && (
                    <div className="px-3 pb-3 pt-0 flex flex-col gap-2 border-t border-white/[0.05]">
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Toggle label={t('lpx.toggleEnabled')} value={chk.enabled} onChange={v => patchCheck(meta.id, { enabled: v })} />
                        <Toggle label={t('lpx.togglePunish')} value={chk.punish} onChange={v => patchCheck(meta.id, { punish: v })} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label={t('lpx.fieldMaxVl')}><NumInput value={chk.maxVl} onChange={v => patchCheck(meta.id, { maxVl: v })} /></Field>
                        <Field label={t('lpx.fieldMinVl')}><NumInput value={chk.minVl} onChange={v => patchCheck(meta.id, { minVl: v })} /></Field>
                      </div>
                      <Field label={t('lpx.fieldPunishCmds')}>
                        <textarea className={`${inputCls} min-h-[60px] font-mono text-xs`}
                          value={(chk.punishCommands || []).join('\n')}
                          onChange={e => patchCheck(meta.id, { punishCommands: e.target.value.split('\n').map(x => x.trim()).filter(Boolean) })} />
                      </Field>
                      {chk.buffer && (
                        <div className="grid grid-cols-3 gap-2">
                          <Field label={t('lpx.fieldBufferMax')}><NumInput value={chk.buffer.max} onChange={v => patchCheck(meta.id, { buffer: { ...chk.buffer, max: v } })} /></Field>
                          <Field label={t('lpx.fieldBufferMul')}><NumInput value={chk.buffer.multiply} onChange={v => patchCheck(meta.id, { buffer: { ...chk.buffer, multiply: v } })} /></Field>
                          <Field label={t('lpx.fieldBufferDecay')}><NumInput value={chk.buffer.decay} onChange={v => patchCheck(meta.id, { buffer: { ...chk.buffer, decay: v } })} /></Field>
                        </div>
                      )}
                      {chk.options && Object.keys(chk.options).length > 0 && (
                        <Field label={t('lpx.fieldOptionsYaml')} hint={t('lpx.hintOptionsYaml')}>
                          <textarea className={`${inputCls} min-h-[80px] font-mono text-xs`}
                            value={Object.entries(chk.options).map(([k, val]) => {
                              if (Array.isArray(val)) return `${k}:\n${val.map(x => `  - ${x}`).join('\n')}`
                              return `${k}: ${val}`
                            }).join('\n')}
                            onChange={e => {
                              const opts = {}
                              e.target.value.split('\n').forEach(line => {
                                const m = line.match(/^(\w+):\s*(.*)$/)
                                if (m && !line.startsWith('  ')) opts[m[1]] = m[2]
                                else if (line.trim().startsWith('- ')) {
                                  const key = Object.keys(opts).pop()
                                  if (!key) return
                                  if (!Array.isArray(opts[key])) opts[key] = []
                                  opts[key].push(line.replace(/^\s*-\s*/, '').trim())
                                }
                              })
                              patchCheck(meta.id, { options: opts })
                            }} />
                        </Field>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
      <p className="text-[10px] text-white/25">{t('lpx.checksHint', { count: CHECK_CATALOG_UNIQUE.filter(c => c.section === section).length })}</p>
    </div>
  )
}

const SECTIONS = {
  messages: MessagesSection,
  options: OptionsSection,
  printer: PrinterSection,
  mechanics: MechanicsSection,
  logger: LoggerSection,
  discord: DiscordSection,
  'checks-core': props => <ChecksEditor {...props} section="checks-core" />,
  'checks-traffic': props => <ChecksEditor {...props} section="checks-traffic" />,
}

export default function LpxAnticheatTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(() => createLpxState())
  const [section, setSection] = useState('messages')
  const [copied, setCopied] = useState(false)

  const set = useCallback(patch => setState(prev => ({ ...prev, ...patch })), [])

  const stats = useMemo(() => getConfigStats(state), [state])
  const yaml = useMemo(() => buildConfigYaml(state), [state])

  const handlePreset = (id) => {
    if (!id) return
    const p = CONFIG_PRESETS.find(x => x.id === id)
    if (p) setState(prev => mergeLpxPreset(prev, p))
  }

  const copyYaml = () => {
    navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const Active = SECTIONS[section]

  const presetOptions = useMemo(() => CONFIG_PRESETS.map(p => ({
    value: p.id,
    label: t(`lpx.${PRESET_I18N[p.id]}`),
  })), [t])

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0 flex-wrap">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-violet-500/30 bg-violet-500/10 text-violet-300 font-semibold uppercase">{t('lpx.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('lpx.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('lpx.subtitle', { count: CHECK_CATALOG_UNIQUE.length })}</p>
        </div>
        <CustomDropdown label="" value="" onChange={handlePreset}
          options={presetOptions}
          placeholder={t('lpx.preset')} accent="indigo" className="w-32" />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)_minmax(0,268px)] gap-4 h-full min-h-0">
          <div className={`${sectionCls} min-h-0 overflow-y-auto custom-dropdown-scroll`}>
            <SectionTitle>{t('lpx.packetMatrix')}</SectionTitle>
            <p className="text-[10px] text-white/30 text-center px-1">{t('lpx.matrixHint')}</p>
            <ChipStatsBar t={t} stats={stats} />
            <LpxChipVisual
              t={t}
              nodeStatuses={stats.nodes}
              coreStatus={stats.core}
              activeId={section}
              onSelect={setSection}
              coreLabel={t('lpx.coreLabel')}
            />
          </div>

          <div className={`${sectionCls} min-h-0 min-w-0 overflow-hidden flex flex-col`}>
            <SectionTitle>{NODE_I18N[section] ? t(`lpx.${NODE_I18N[section]}`) : section}</SectionTitle>
            <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
              {Active && <Active t={t} s={state} set={set} />}
            </div>
          </div>

          <div className={`${sectionCls} min-h-0 min-w-0 overflow-hidden flex flex-col`}>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <SectionTitle>{t('lpx.yamlOutput')}</SectionTitle>
              <p className="text-[10px] font-mono text-violet-400/50 break-all">{t('lpx.configPath')}</p>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={copyYaml} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/60`}>
                  {copied ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                  {copied ? t('lpx.copied') : t('lpx.copy')}
                </button>
                <button type="button" onClick={() => downloadYaml(yaml, 'config.yml')}
                  className={`${btnCls} bg-violet-500/10 border-violet-500/20 text-violet-300`}>
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('lpx.save')}
                </button>
              </div>
            </div>
            <pre className="flex-1 min-h-0 h-0 overflow-auto p-3 rounded-xl bg-[#0a0612] border border-white/[0.04] text-[10px] font-mono text-violet-200/75 leading-relaxed whitespace-pre-wrap custom-dropdown-scroll">{yaml}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
