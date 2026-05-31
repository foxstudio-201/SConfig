import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  PlusIcon, TrashIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import GrimChipVisual from './GrimChipVisual'
import {
  SECTION_INFO, CONFIG_PRESETS, PUNISHMENT_PRESETS,
  createGrimState, applyPreset as mergeGrimPreset, applyPunishmentPreset,
  getConfigStats, emptyPunishmentCategory,
} from './grimData'
import { buildConfigYaml, buildPunishmentsYaml, downloadYaml } from './grimYaml'
import { useI18n } from '../../../context/I18nContext'

const NODE_I18N = {
  alerts: 'nodeAlerts',
  spectators: 'nodeSpectate',
  network: 'nodeNetwork',
  simulation: 'nodeSim',
  movement: 'nodeMove',
  combat: 'nodeCombat',
  exploit: 'nodeExploit',
  system: 'nodeSystem',
}

const DESC_I18N = {
  alerts: 'descAlerts',
  spectators: 'descSpectators',
  network: 'descNetwork',
  simulation: 'descSimulation',
  movement: 'descMovement',
  combat: 'descCombat',
  exploit: 'descExploit',
  system: 'descSystem',
}

const CONFIG_PRESET_I18N = {
  balanced: 'presetBalanced',
  strict: 'presetStrict',
  lenient: 'presetLenient',
}

const PUNISH_PRESET_I18N = {
  full: 'punishFull',
  minimal: 'punishMinimal',
}

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-cyan-500/35 transition-colors'
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
    <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-3 flex flex-col gap-2.5">
      {title && <p className="text-[11px] font-semibold text-cyan-200/80">{title}</p>}
      {desc && <p className="text-[10px] text-white/30 leading-relaxed">{desc}</p>}
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange, desc }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-cyan-500/35 bg-cyan-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center transition-all ${value ? 'bg-cyan-500/40 border-cyan-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
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
    <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-3 py-2 mb-1">
      <p className="text-xs font-semibold text-cyan-200/90">{t(`grim.${NODE_I18N[sectionId]}`)}</p>
      <p className="text-[10px] text-white/35 mt-0.5">{t(`grim.${DESC_I18N[sectionId]}`)}</p>
    </div>
  )
}

function ChipStatsBar({ t, stats }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 w-full mt-1">
      <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2 py-1.5 text-center">
        <p className="text-[9px] text-white/30">{t('grim.statCore')}</p>
        <p className="text-[10px] font-mono font-semibold text-cyan-300 capitalize">{stats.core}</p>
      </div>
      <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2 py-1.5 text-center">
        <p className="text-[9px] text-white/30">{t('grim.statActive')}</p>
        <p className="text-[10px] font-mono font-semibold text-emerald-300">{stats.active}</p>
      </div>
      <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2 py-1.5 text-center">
        <p className="text-[9px] text-white/30">{t('grim.statStrict')}</p>
        <p className="text-[10px] font-mono font-semibold text-rose-300">{stats.strict}</p>
      </div>
    </div>
  )
}

function AlertsSection({ t, s, set }) {
  const a = (k, v) => set({ alerts: { ...s.alerts, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="alerts" />
      <Block title={t('grim.blockStaffAlerts')} desc={t('grim.blockStaffAlertsDesc')}>
        <Toggle label={t('grim.togglePrintConsole')} value={s.alerts.printToConsole} onChange={v => a('printToConsole', v)} />
        <Toggle label={t('grim.toggleProxySend')} value={s.alerts.proxySend} onChange={v => a('proxySend', v)} desc={t('grim.toggleProxySendDesc')} />
        <Toggle label={t('grim.toggleProxyReceive')} value={s.alerts.proxyReceive} onChange={v => a('proxyReceive', v)} />
      </Block>
      <Block title={t('grim.blockVerboseUpdates')}>
        <Toggle label={t('grim.toggleVerboseConsole')} value={s.verbose.printToConsole} onChange={v => set({ verbose: { printToConsole: v } })} />
        <Toggle label={t('grim.toggleCheckUpdates')} value={s.checkForUpdates} onChange={v => set({ checkForUpdates: v })} />
      </Block>
    </div>
  )
}

function SpectatorsSection({ t, s, set }) {
  const sp = (k, v) => set({ spectators: { ...s.spectators, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="spectators" />
      <Block title={t('grim.blockSpectatorHandling')}>
        <Toggle label={t('grim.toggleHideSpectators')} value={s.spectators.hideRegardless} onChange={v => sp('hideRegardless', v)} desc={t('grim.toggleHideSpectatorsDesc')} />
        <Field label={t('grim.fieldAllowedWorlds')} hint={t('grim.hintAllowedWorlds')}>
          <textarea className={`${inputCls} min-h-[80px] font-mono text-xs`}
            value={(s.spectators.allowedWorlds || []).join('\n')}
            onChange={e => sp('allowedWorlds', e.target.value.split('\n').map(x => x.trim()).filter(Boolean))} />
        </Field>
      </Block>
    </div>
  )
}

function NetworkSection({ t, s, set }) {
  const g = (k, v) => set({ general: { ...s.general, [k]: v } })
  const f = (k, v) => set({ flags: { ...s.flags, [k]: v } })
  const b = (k, v) => set({ clientBrand: { ...s.clientBrand, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="network" />
      <Block title={t('grim.blockConnectionPackets')}>
        <Field label={t('grim.fieldMaxTransaction')}><NumInput value={s.general.maxTransactionTime} onChange={v => g('maxTransactionTime', v)} /></Field>
        <Field label={t('grim.fieldPacketSpam')}><NumInput value={s.flags.packetSpamThreshold} onChange={v => f('packetSpamThreshold', v)} /></Field>
        <Toggle label={t('grim.toggleDisablePong')} value={s.general.disablePongCancelling} onChange={v => g('disablePongCancelling', v)} desc={t('grim.toggleDisablePongDesc')} />
        <Toggle label={t('grim.toggleDisableResync')} value={s.general.disableDefaultResyncHandler} onChange={v => g('disableDefaultResyncHandler', v)} desc={t('grim.toggleDisableResyncDesc')} />
        <Toggle label={t('grim.toggleCancelDuplicate')} value={s.general.cancelDuplicatePacket} onChange={v => g('cancelDuplicatePacket', v)} />
        <Toggle label={t('grim.toggleIgnoreDupRotation')} value={s.general.ignoreDuplicatePacketRotation} onChange={v => g('ignoreDuplicatePacketRotation', v)} />
      </Block>
      <Block title={t('grim.blockClientBrand')} desc={t('grim.blockClientBrandDesc')}>
        <Toggle label={t('grim.toggleDisconnectForge')} value={s.clientBrand.disconnectBlacklistedForge} onChange={v => b('disconnectBlacklistedForge', v)} />
        <Field label={t('grim.fieldIgnoredClients')}>
          <textarea className={`${inputCls} min-h-[120px] font-mono text-xs`}
            value={(s.clientBrand.ignoredClients || []).join('\n')}
            onChange={e => b('ignoredClients', e.target.value.split('\n').map(x => x.trim()).filter(Boolean))} />
        </Field>
      </Block>
    </div>
  )
}

function SimulationSection({ t, s, set }) {
  const sim = (k, v) => set({ simulation: { ...s.simulation, [k]: v } })
  const ph = (k, v) => set({ phase: { ...s.phase, [k]: v } })
  const kb = (k, v) => set({ knockback: { ...s.knockback, [k]: v } })
  const ex = (k, v) => set({ explosion: { ...s.explosion, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="simulation" />
      <Block title={t('grim.blockSimulation')} desc={t('grim.blockSimulationDesc')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('grim.fieldThreshold')}><NumInput value={s.simulation.threshold} onChange={v => sim('threshold', v)} /></Field>
          <Field label={t('grim.fieldMaxAdvantage')}><NumInput value={s.simulation.maxAdvantage} onChange={v => sim('maxAdvantage', v)} /></Field>
          <Field label={t('grim.fieldMaxCeiling')}><NumInput value={s.simulation.maxCeiling} onChange={v => sim('maxCeiling', v)} /></Field>
          <Field label={t('grim.fieldSetbackDecay')}><NumInput value={s.simulation.setbackDecayMultiplier} onChange={v => sim('setbackDecayMultiplier', v)} /></Field>
          <Field label={t('grim.fieldImmediateSetback')} hint={t('grim.hintImmediateSetback')}>
            <NumInput value={s.simulation.immediateSetbackThreshold} onChange={v => sim('immediateSetbackThreshold', v)} />
          </Field>
          <Field label={t('grim.fieldSetbackVl')}><NumInput value={s.simulation.setbackViolationThreshold} onChange={v => sim('setbackViolationThreshold', v)} /></Field>
        </div>
      </Block>
      <Block title={t('grim.blockPhase')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('grim.fieldSetbackVl')}><NumInput value={s.phase.setbackvl} onChange={v => ph('setbackvl', v)} /></Field>
          <Field label={t('grim.fieldDecay')}><NumInput value={s.phase.decay} onChange={v => ph('decay', v)} /></Field>
        </div>
      </Block>
      <Block title={t('grim.blockKnockback')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('grim.fieldThreshold')}><NumInput value={s.knockback.threshold} onChange={v => kb('threshold', v)} /></Field>
          <Field label={t('grim.fieldMaxAdvantage')}><NumInput value={s.knockback.maxAdvantage} onChange={v => kb('maxAdvantage', v)} /></Field>
          <Field label={t('grim.fieldMaxCeiling')}><NumInput value={s.knockback.maxCeiling} onChange={v => kb('maxCeiling', v)} /></Field>
          <Field label={t('grim.fieldImmediateSetback')}><NumInput value={s.knockback.immediateSetbackThreshold} onChange={v => kb('immediateSetbackThreshold', v)} /></Field>
          <Field label={t('grim.fieldSetbackDecay')}><NumInput value={s.knockback.setbackDecayMultiplier} onChange={v => kb('setbackDecayMultiplier', v)} /></Field>
        </div>
      </Block>
      <Block title={t('grim.blockExplosion')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('grim.fieldThreshold')}><NumInput value={s.explosion.threshold} onChange={v => ex('threshold', v)} /></Field>
          <Field label={t('grim.fieldSetbackVl')}><NumInput value={s.explosion.setbackvl} onChange={v => ex('setbackvl', v)} /></Field>
        </div>
      </Block>
    </div>
  )
}

function MovementSection({ t, s, set }) {
  const ns = (k, v) => set({ noSlow: { ...s.noSlow, [k]: v } })
  const tm = (k, v) => set({ timer: { ...s.timer, [k]: v } })
  const po = (k, v) => set({ packetOrder: { ...s.packetOrder, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="movement" />
      <Block title={t('grim.blockNoSlow')}>
        <div className="grid grid-cols-3 gap-2">
          <Field label={t('grim.fieldThreshold')}><NumInput value={s.noSlow.threshold} onChange={v => ns('threshold', v)} /></Field>
          <Field label={t('grim.fieldSetbackVl')}><NumInput value={s.noSlow.setbackvl} onChange={v => ns('setbackvl', v)} /></Field>
          <Field label={t('grim.fieldDecay')}><NumInput value={s.noSlow.decay} onChange={v => ns('decay', v)} /></Field>
        </div>
      </Block>
      <Block title={t('grim.blockTimerChecks')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('grim.fieldTimerASetback')}><NumInput value={s.timer.timerASetbackvl} onChange={v => tm('timerASetbackvl', v)} /></Field>
          <Field label={t('grim.fieldTimerADrift')}><NumInput value={s.timer.drift} onChange={v => tm('drift', v)} /></Field>
          <Field label={t('grim.fieldTimerLimit')} hint={t('grim.hintTimerLimit')}>
            <NumInput value={s.timer.timerLimitPingThreshold} onChange={v => tm('timerLimitPingThreshold', v)} />
          </Field>
          <Field label={t('grim.fieldNegativeTimer')}><NumInput value={s.timer.negativeTimerDrift} onChange={v => tm('negativeTimerDrift', v)} /></Field>
          <Field label={t('grim.fieldVehicleTimer')}><NumInput value={s.timer.vehicleTimerSetbackvl} onChange={v => tm('vehicleTimerSetbackvl', v)} /></Field>
        </div>
      </Block>
      <Block title={t('grim.blockPacketOrder')}>
        <Toggle label={t('grim.toggleExemptPlacing')} value={s.packetOrder.exemptPlacingWhileDigging} onChange={v => po('exemptPlacingWhileDigging', v)} desc={t('grim.toggleExemptPlacingDesc')} />
      </Block>
    </div>
  )
}

function CombatSection({ t, s, set }) {
  const r = (k, v) => set({ reach: { ...s.reach, [k]: v } })
  const p = (k, v) => set({ place: { ...s.place, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="combat" />
      <Block title={t('grim.blockReach')} desc={t('grim.blockReachDesc')}>
        <Field label={t('grim.fieldThreshold')}><NumInput value={s.reach.threshold} onChange={v => r('threshold', v)} /></Field>
        <Toggle label={t('grim.toggleBlockImpossible')} value={s.reach.blockImpossibleHits} onChange={v => r('blockImpossibleHits', v)} />
        <Toggle label={t('grim.togglePostPacket')} value={s.reach.enablePostPacket} onChange={v => r('enablePostPacket', v)} desc={t('grim.togglePostPacketDesc')} />
      </Block>
      <Block title={t('grim.blockPlacement')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('grim.fieldAirLiquid')}><NumInput value={s.place.airLiquidCancelvl} onChange={v => p('airLiquidCancelvl', v)} /></Field>
          <Field label={t('grim.fieldFabricated')}><NumInput value={s.place.fabricatedCancelvl} onChange={v => p('fabricatedCancelvl', v)} /></Field>
          <Field label={t('grim.fieldFarPlace')}><NumInput value={s.place.farCancelvl} onChange={v => p('farCancelvl', v)} /></Field>
          <Field label={t('grim.fieldPositionPlace')}><NumInput value={s.place.positionCancelvl} onChange={v => p('positionCancelvl', v)} /></Field>
          <Field label={t('grim.fieldRotationPlace')}><NumInput value={s.place.rotationCancelvl} onChange={v => p('rotationCancelvl', v)} /></Field>
        </div>
      </Block>
    </div>
  )
}

function ExploitSection({ t, s, set }) {
  const e = (k, v) => set({ exploit: { ...s.exploit, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="exploit" />
      <Block title={t('grim.blockExploitMitigation')}>
        <Toggle label={t('grim.toggleSprintJumpElytra')} value={s.exploit.allowSprintJumpElytra} onChange={v => e('allowSprintJumpElytra', v)} />
        <Toggle label={t('grim.toggleGhostblocks')} value={s.exploit.allowBuildingGhostblocks} onChange={v => e('allowBuildingGhostblocks', v)} desc={t('grim.toggleGhostblocksDesc')} />
        <Field label={t('grim.fieldGhostDistance')}><NumInput value={s.exploit.distanceGhostblocks} onChange={v => e('distanceGhostblocks', v)} /></Field>
      </Block>
    </div>
  )
}

function SystemSection({ t, s, set }) {
  const f = (k, v) => set({ flags: { ...s.flags, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} sectionId="system" />
      <Block title={t('grim.blockDebugExperimental')}>
        <Toggle label={t('grim.toggleExperimental')} value={s.flags.experimentalChecks} onChange={v => f('experimentalChecks', v)} />
        <Toggle label={t('grim.toggleDebugPipeline')} value={s.flags.debugPipelineOnJoin} onChange={v => f('debugPipelineOnJoin', v)} />
        <Toggle label={t('grim.toggleDebugPacket')} value={s.flags.debugPacketCancel} onChange={v => f('debugPacketCancel', v)} />
      </Block>
      <Block title={t('grim.blockPingLimits')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('grim.fieldMaxPingFlying')} hint={t('grim.hintMaxPingFlying')}>
            <NumInput value={s.flags.maxPingOutOfFlying} onChange={v => f('maxPingOutOfFlying', v)} />
          </Field>
          <Field label={t('grim.fieldMaxPingFirework')}><NumInput value={s.flags.maxPingFireworkBoost} onChange={v => f('maxPingFireworkBoost', v)} /></Field>
        </div>
      </Block>
      <Block title={t('grim.blockItemReset')}>
        <Toggle label={t('grim.toggleResetUpdate')} value={s.flags.resetItemOnUpdate} onChange={v => f('resetItemOnUpdate', v)} />
        <Toggle label={t('grim.toggleResetAttack')} value={s.flags.resetItemOnAttack} onChange={v => f('resetItemOnAttack', v)} />
        <Toggle label={t('grim.toggleResetSlot')} value={s.flags.resetItemOnSlotChange} onChange={v => f('resetItemOnSlotChange', v)} />
        <Toggle label={t('grim.toggleResetUse')} value={s.flags.resetItemOnItemUse} onChange={v => f('resetItemOnItemUse', v)} />
      </Block>
      <Block title={t('grim.blockConfigMeta')} desc={t('grim.blockConfigMetaDesc')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('grim.fieldConfigFlavor')}><NumInput value={s.configFlavor} onChange={v => set({ configFlavor: v })} /></Field>
          <Field label={t('grim.fieldConfigVersion')}><NumInput value={s.configVersion} onChange={v => set({ configVersion: v })} /></Field>
        </div>
      </Block>
    </div>
  )
}

function PunishmentEditor({ t, s, set, categoryId }) {
  const cat = (s.punishments || []).find(c => c.id === categoryId)
  if (!cat) return <p className="text-xs text-white/35">{t('grim.selectCategory')}</p>

  const patch = p => set({
    punishments: s.punishments.map(c => (c.id === categoryId ? { ...c, ...p } : c)),
  })

  const listPatch = (key, text) => {
    patch({ [key]: text.split('\n').map(x => x.trim()).filter(Boolean) })
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('grim.fieldCategoryName')}>
        <input className={inputCls} value={cat.name} onChange={e => patch({ name: e.target.value.replace(/\s/g, '') })} />
      </Field>
      <Field label={t('grim.fieldRemoveViolations')}>
        <NumInput value={cat.removeViolationsAfter} onChange={v => patch({ removeViolationsAfter: v })} />
      </Field>
      <Field label={t('grim.fieldChecksList')} hint={t('grim.hintChecksList')}>
        <textarea className={`${inputCls} min-h-[110px] font-mono text-xs`}
          value={(cat.checks || []).join('\n')} onChange={e => listPatch('checks', e.target.value)} />
      </Field>
      <Field label={t('grim.fieldCommandsList')} hint={t('grim.hintCommandsList')}>
        <textarea className={`${inputCls} min-h-[110px] font-mono text-xs`}
          value={(cat.commands || []).join('\n')} onChange={e => listPatch('commands', e.target.value)} />
      </Field>
      <button type="button" onClick={() => set({ punishments: s.punishments.filter(c => c.id !== categoryId) })}
        disabled={(s.punishments || []).length <= 1}
        className={`${btnCls} border-red-500/20 text-red-300 bg-red-500/10 self-start disabled:opacity-30`}>
        <TrashIcon className="w-3.5 h-3.5" />{t('grim.deleteCategory')}
      </button>
    </div>
  )
}

function PunishmentList({ t, s, set, activeId, onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      {(s.punishments || []).map(cat => (
        <button key={cat.id} type="button" onClick={() => onSelect(cat.id)}
          className={`rounded-xl border px-3 py-2 text-left transition-all ${
            activeId === cat.id ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
          }`}>
          <span className="text-[11px] font-mono font-semibold text-white/85">{cat.name}</span>
          <p className="text-[10px] text-white/35 mt-0.5">{t('grim.categoryMeta', { checks: (cat.checks || []).length, cmds: (cat.commands || []).length })}</p>
        </button>
      ))}
      <button type="button"
        onClick={() => {
          const cat = emptyPunishmentCategory(`Category_${(s.punishments?.length || 0) + 1}`)
          set({ punishments: [...(s.punishments || []), cat] })
          onSelect(cat.id)
        }}
        className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300 w-full justify-center`}>
        <PlusIcon className="w-3.5 h-3.5" />{t('grim.addCategory')}
      </button>
    </div>
  )
}

const CONFIG_SECTIONS = {
  alerts: AlertsSection,
  spectators: SpectatorsSection,
  network: NetworkSection,
  simulation: SimulationSection,
  movement: MovementSection,
  combat: CombatSection,
  exploit: ExploitSection,
  system: SystemSection,
}

export default function GrimAnticheatTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(() => createGrimState())
  const [fileMode, setFileMode] = useState('config')
  const [section, setSection] = useState('alerts')
  const [punishId, setPunishId] = useState(() => state.punishments[0]?.id)
  const [copied, setCopied] = useState(false)

  const set = useCallback(patch => setState(prev => ({ ...prev, ...patch })), [])

  const stats = useMemo(() => getConfigStats(state), [state])

  const nodeStatuses = useMemo(() => stats.nodes, [stats])

  const punishNodes = useMemo(() => {
    const cats = state.punishments || []
    const n = Math.min(cats.length, 8)
    if (!n) return [{ id: 'empty', label: t('grim.chipAdd'), angle: -90, status: 'idle' }]
    return cats.slice(0, 8).map((cat, i) => ({
      id: cat.id,
      label: (cat.name || 'Cat').slice(0, 8),
      angle: -90 + (360 / n) * i,
      status: cat.checks?.length && cat.commands?.length ? 'active' : 'idle',
      desc: `${cat.checks?.length || 0} checks`,
    }))
  }, [state.punishments, t])

  const fileModeOptions = useMemo(() => [
    { value: 'config', label: t('grim.fileConfig') },
    { value: 'punishments', label: t('grim.filePunishments') },
  ], [t])

  const configPresetOptions = useMemo(() => CONFIG_PRESETS.map(p => ({
    value: p.id,
    label: t(`grim.${CONFIG_PRESET_I18N[p.id]}`),
  })), [t])

  const punishPresetOptions = useMemo(() => PUNISHMENT_PRESETS.map(p => ({
    value: p.id,
    label: t(`grim.${PUNISH_PRESET_I18N[p.id]}`),
  })), [t])

  const yaml = useMemo(() => (
    fileMode === 'punishments' ? buildPunishmentsYaml(state) : buildConfigYaml(state)
  ), [state, fileMode])

  const handlePreset = (id) => {
    if (!id) return
    const p = CONFIG_PRESETS.find(x => x.id === id)
    if (p) setState(prev => mergeGrimPreset(prev, p))
  }

  const handlePunishPreset = (id) => {
    if (!id) return
    setState(prev => {
      const next = applyPunishmentPreset(prev, id)
      setPunishId(next.punishments[0]?.id)
      return next
    })
  }

  const copyYaml = () => {
    navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeChipId = fileMode === 'punishments' ? punishId : section
  const handleChipSelect = (id) => {
    if (fileMode === 'punishments' && id !== 'empty') setPunishId(id)
    else if (fileMode === 'config') setSection(id)
  }

  const ActiveSection = CONFIG_SECTIONS[section]

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white">{t('grim.title')}</h1>
          <p className="text-xs text-white/35 mt-0.5">{t('grim.subtitle')}</p>
        </div>
        <CustomDropdown label="" value={fileMode} onChange={v => { setFileMode(v); if (v === 'config') setSection('alerts') }} options={fileModeOptions} accent="cyan" className="w-36" />
        {fileMode === 'config' ? (
          <CustomDropdown label="" value="" onChange={handlePreset}
            options={configPresetOptions}
            placeholder={t('grim.preset')} accent="cyan" className="w-32" />
        ) : (
          <CustomDropdown label="" value="" onChange={handlePunishPreset}
            options={punishPresetOptions}
            placeholder={t('grim.preset')} accent="cyan" className="w-32" />
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)_minmax(0,268px)] gap-4 h-full min-h-0">
          <div className={`${sectionCls} min-h-0 overflow-y-auto custom-dropdown-scroll`}>
            <SectionTitle>{t('grim.signalMatrix')}</SectionTitle>
            <p className="text-[10px] text-white/30 text-center px-1">
              {fileMode === 'config' ? t('grim.signalHintConfig') : t('grim.signalHintPunish', { count: state.punishments.length })}
            </p>
            <ChipStatsBar t={t} stats={stats} />
            <GrimChipVisual
              t={t}
              nodeStatuses={fileMode === 'config' ? nodeStatuses : undefined}
              customNodes={fileMode === 'punishments' ? punishNodes : null}
              coreStatus={fileMode === 'config' ? stats.core : (punishNodes.some(n => n.status === 'active') ? 'active' : 'idle')}
              activeId={activeChipId}
              onSelect={handleChipSelect}
              coreLabel={fileMode === 'punishments' ? t('grim.corePunish') : t('grim.coreGrim')}
            />
          </div>

          <div className={`${sectionCls} min-h-0 min-w-0 overflow-hidden flex flex-col`}>
            <SectionTitle>
              {fileMode === 'punishments'
                ? (state.punishments.find(c => c.id === punishId)?.name || t('grim.punishments'))
                : (NODE_I18N[section] ? t(`grim.${NODE_I18N[section]}`) : section)}
            </SectionTitle>
            <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
              {fileMode === 'config' && ActiveSection && <ActiveSection t={t} s={state} set={set} />}
              {fileMode === 'punishments' && (
                <div className="grid grid-cols-1 md:grid-cols-[148px_1fr] gap-4">
                  <PunishmentList t={t} s={state} set={set} activeId={punishId} onSelect={setPunishId} />
                  <PunishmentEditor t={t} s={state} set={set} categoryId={punishId} />
                </div>
              )}
            </div>
          </div>

          <div className={`${sectionCls} min-h-0 min-w-0 overflow-hidden flex flex-col`}>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <SectionTitle>{t('grim.yamlOutput')}</SectionTitle>
              <p className="text-[10px] font-mono text-cyan-500/40 break-all">
                {t('grim.configPath', { file: fileMode === 'punishments' ? 'punishments.yml' : 'config.yml' })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={copyYaml} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/60`}>
                  {copied ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                  {copied ? t('grim.copy') : t('grim.copyBtn')}
                </button>
                <button type="button" onClick={() => downloadYaml(yaml, fileMode === 'punishments' ? 'punishments.yml' : 'config.yml')}
                  className={`${btnCls} bg-cyan-500/10 border-cyan-500/20 text-cyan-300`}>
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('grim.save')}
                </button>
              </div>
            </div>
            <pre className="flex-1 min-h-0 h-0 overflow-auto p-3 rounded-xl bg-[#0d0d1a] border border-white/[0.04] text-[10px] font-mono text-cyan-200/75 leading-relaxed whitespace-pre-wrap custom-dropdown-scroll">{yaml}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
