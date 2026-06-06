import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  PlusIcon, TrashIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import { useI18n } from '../../../context/I18nContext'
import {
  MODULES, PRESETS, applyPreset, createCrateState, createKey, createReward, createMilestone,
  RARITIES, ANIMATIONS, PARTICLES, KEY_TYPES, COST_TYPES, REWARD_TYPES, COOLDOWN_UNITS,
} from './excellentCratesData'
import { buildCrateYaml, downloadYaml, countRewards } from './excellentCratesYaml'

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-amber-500/35 transition-colors font-mono'
const inputClsPlain = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-amber-500/35 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/35 border border-white/[0.06] p-4'

function Field({ label, children, hint }) {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      {children}
      {hint && <p className="text-[10px] text-white/25 mt-1">{hint}</p>}
    </div>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${value ? 'border-amber-500/35 bg-amber-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center ${value ? 'bg-amber-500/40 border-amber-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
        <span className={`block w-3.5 h-3.5 rounded-full bg-white/90 transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="text-[11px] font-semibold text-white/80">{label}</span>
    </button>
  )
}

function SectionTitle({ children }) {
  return <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-3">{children}</p>
}

function parseLines(v) { return String(v || '').split('\n').map(x => x.trimEnd()).filter((x, i, arr) => x || (i < arr.length - 1)) }
function toLines(list) { return (list || []).join('\n') }

function LineEditor({ label, value, onChange, rows = 4, hint }) {
  return (
    <Field label={label} hint={hint}>
      <textarea className={inputCls} style={{ minHeight: rows * 22 }} value={toLines(value)} onChange={e => onChange(parseLines(e.target.value))} spellCheck={false} />
    </Field>
  )
}

function ListItem({ active, label, sub, onClick, onDelete, color }) {
  return (
    <div className={`flex items-center gap-1 rounded-xl border transition-all ${active ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
      <button type="button" onClick={onClick} className="flex-1 flex items-center gap-2 px-3 py-2 text-left min-w-0">
        {color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-white/80 truncate">{label}</p>
          {sub && <p className="text-[10px] text-white/30 truncate">{sub}</p>}
        </div>
        <ChevronRightIcon className="w-3 h-3 text-white/20 flex-shrink-0 ml-auto" />
      </button>
      {onDelete && (
        <button type="button" onClick={onDelete} className="p-2 text-white/25 hover:text-red-400 transition-colors flex-shrink-0">
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ── Horizontal Tab Bar ───────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange, t }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 custom-dropdown-scroll">
      {tabs.map(tab => (
        <button key={tab.id} type="button" onClick={() => onChange(tab.id)}
          className={`flex-shrink-0 px-3.5 py-2 rounded-xl border text-[11px] font-semibold transition-all whitespace-nowrap ${
            active === tab.id
              ? 'border-amber-500/40 bg-amber-500/12 text-amber-200'
              : 'border-white/[0.05] bg-white/[0.02] text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
          }`}>
          {t(`excellentCrates.${tab.labelKey}`)}
        </button>
      ))}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function ExcellentCratesTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(() => createCrateState())
  const [module, setModule] = useState('general')
  const [selectedKey, setSelectedKey] = useState(0)
  const [selectedReward, setSelectedReward] = useState(0)
  const [selectedMilestone, setSelectedMilestone] = useState(0)
  const [copied, setCopied] = useState(false)
  const [presetNotice, setPresetNotice] = useState(null)

  const yaml = useMemo(() => buildCrateYaml(state), [state])
  const stats = useMemo(() => countRewards(state), [state])

  const presetOptions = useMemo(() => PRESETS.map(p => ({ value: p.id, label: t(`excellentCrates.${p.labelKey}`) })), [t])
  const rarityOptions = useMemo(() => RARITIES.map(r => ({ value: r.id, label: t(`excellentCrates.${r.labelKey}`) })), [t])
  const animationOptions = useMemo(() => ANIMATIONS.map(a => ({ value: a.id, label: t(`excellentCrates.${a.labelKey}`) })), [t])
  const particleOptions = useMemo(() => PARTICLES.map(p => ({ value: p, label: p })), [])
  const keyTypeOptions = useMemo(() => KEY_TYPES.map(k => ({ value: k.value, label: t(`excellentCrates.${k.labelKey}`) })), [t])
  const costTypeOptions = useMemo(() => COST_TYPES.map(c => ({ value: c.value, label: t(`excellentCrates.${c.labelKey}`) })), [t])
  const rewardTypeOptions = useMemo(() => REWARD_TYPES.map(r => ({ value: r.value, label: t(`excellentCrates.${r.labelKey}`) })), [t])
  const cooldownUnitOptions = useMemo(() => COOLDOWN_UNITS.map(u => ({ value: u.value, label: t(`excellentCrates.${u.labelKey}`) })), [t])

  // State updaters
  const updateGeneral = patch => setState(p => ({ ...p, general: { ...p.general, ...patch } }))
  const updateCost = patch => setState(p => ({ ...p, cost: { ...p.cost, ...patch } }))
  const updateCooldown = patch => setState(p => ({ ...p, cooldown: { ...p.cooldown, ...patch } }))
  const updateAnimation = patch => setState(p => ({ ...p, animation: { ...p.animation, ...patch } }))
  const updatePreview = patch => setState(p => ({ ...p, preview: { ...p.preview, ...patch } }))
  const updateEffects = patch => setState(p => ({ ...p, effects: { ...p.effects, ...patch } }))
  const updateHologram = patch => setState(p => ({ ...p, hologram: { ...p.hologram, ...patch } }))
  const updatePushback = patch => setState(p => ({ ...p, pushback: { ...p.pushback, ...patch } }))
  const updateMassOpen = patch => setState(p => ({ ...p, massOpen: { ...p.massOpen, ...patch } }))

  const updateKey = useCallback((idx, patch) => {
    setState(p => { const keys = [...p.keys]; keys[idx] = { ...keys[idx], ...patch }; return { ...p, keys } })
  }, [])
  const updateReward = useCallback((idx, patch) => {
    setState(p => { const rewards = [...p.rewards]; rewards[idx] = { ...rewards[idx], ...patch }; return { ...p, rewards } })
  }, [])
  const updateMilestone = useCallback((idx, patch) => {
    setState(p => { const milestones = [...p.milestones]; milestones[idx] = { ...milestones[idx], ...patch }; return { ...p, milestones } })
  }, [])

  // CRUD
  const addKey = () => { setState(p => ({ ...p, keys: [...p.keys, createKey()] })); setSelectedKey(state.keys.length) }
  const addReward = (type = 'item') => { setState(p => ({ ...p, rewards: [...p.rewards, createReward(type)] })); setSelectedReward(state.rewards.length) }
  const addMilestone = () => { setState(p => ({ ...p, milestones: [...p.milestones, createMilestone()] })); setSelectedMilestone(state.milestones.length) }
  const removeKey = idx => { setState(p => ({ ...p, keys: p.keys.filter((_, i) => i !== idx) })); setSelectedKey(Math.max(0, idx - 1)) }
  const removeReward = idx => { setState(p => ({ ...p, rewards: p.rewards.filter((_, i) => i !== idx) })); setSelectedReward(Math.max(0, idx - 1)) }
  const removeMilestone = idx => { setState(p => ({ ...p, milestones: p.milestones.filter((_, i) => i !== idx) })); setSelectedMilestone(Math.max(0, idx - 1)) }

  const applyPresetHandler = presetId => {
    if (!presetId) return
    setState(applyPreset(presetId))
    setModule('general'); setSelectedKey(0); setSelectedReward(0); setSelectedMilestone(0)
    setPresetNotice(t('excellentCrates.presetApplied'))
    setTimeout(() => setPresetNotice(null), 2500)
  }

  const copyYaml = () => { navigator.clipboard.writeText(yaml); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const key = state.keys[selectedKey]
  const reward = state.rewards[selectedReward]
  const milestone = state.milestones[selectedMilestone]

  // ── Editors ────────────────────────────────────────────────────────────────
  const renderGeneral = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('excellentCrates.fieldCrateId')}><input className={inputCls} value={state.general.id} onChange={e => updateGeneral({ id: e.target.value })} /></Field>
        <Field label={t('excellentCrates.fieldDisplayName')}><input className={inputCls} value={state.general.displayName} onChange={e => updateGeneral({ displayName: e.target.value })} /></Field>
      </div>
      <LineEditor label={t('excellentCrates.fieldDescription')} value={state.general.description} onChange={v => updateGeneral({ description: v })} rows={2} />
      <Toggle label={t('excellentCrates.fieldPermissionRequired')} value={state.general.permissionRequired} onChange={v => updateGeneral({ permissionRequired: v })} />
      {state.general.permissionRequired && (
        <Field label={t('excellentCrates.fieldPermission')}><input className={inputClsPlain} value={state.general.permission} onChange={e => updateGeneral({ permission: e.target.value })} placeholder="excellentcrates.crate.my_crate" /></Field>
      )}
      {/* Open cost */}
      <div className="rounded-xl border border-white/[0.06] p-3 space-y-2 mt-2">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">{t('excellentCrates.sectionOpenCost')}</p>
        <div className="grid grid-cols-2 gap-2">
          <CustomDropdown label={t('excellentCrates.fieldCostType')} value={state.cost.type} onChange={v => updateCost({ type: v })} options={costTypeOptions} accent="amber" className="w-full" />
          {state.cost.type !== 'none' && <Field label={t('excellentCrates.fieldCostAmount')}><input type="number" min="0" className={inputClsPlain} value={state.cost.amount} onChange={e => updateCost({ amount: Number(e.target.value) || 0 })} /></Field>}
        </div>
      </div>
      {/* Cooldown */}
      <div className="rounded-xl border border-white/[0.06] p-3 space-y-2">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">{t('excellentCrates.sectionCooldown')}</p>
        <Toggle label={t('excellentCrates.fieldCooldownEnabled')} value={state.cooldown.enabled} onChange={v => updateCooldown({ enabled: v })} />
        {state.cooldown.enabled && (
          <div className="grid grid-cols-2 gap-2">
            <Field label={t('excellentCrates.fieldCooldownAmount')}><input type="number" min="0" className={inputClsPlain} value={state.cooldown.amount} onChange={e => updateCooldown({ amount: Number(e.target.value) || 0 })} /></Field>
            <CustomDropdown label={t('excellentCrates.fieldCooldownUnit')} value={state.cooldown.unit} onChange={v => updateCooldown({ unit: v })} options={cooldownUnitOptions} accent="amber" className="w-full" />
          </div>
        )}
      </div>
      {/* Mass open & pushback */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.06] p-3 space-y-2">
          <Toggle label={t('excellentCrates.fieldMassOpenEnabled')} value={state.massOpen.enabled} onChange={v => updateMassOpen({ enabled: v })} />
          {state.massOpen.enabled && <Field label={t('excellentCrates.fieldMassOpenMax')}><input type="number" min="1" className={inputClsPlain} value={state.massOpen.maxAmount} onChange={e => updateMassOpen({ maxAmount: Number(e.target.value) || 1 })} /></Field>}
        </div>
        <div className="rounded-xl border border-white/[0.06] p-3 space-y-2">
          <Toggle label={t('excellentCrates.fieldPushbackEnabled')} value={state.pushback.enabled} onChange={v => updatePushback({ enabled: v })} />
          {state.pushback.enabled && <Field label={t('excellentCrates.fieldPushbackStrength')}><input type="number" min="0" step="0.1" className={inputClsPlain} value={state.pushback.strength} onChange={e => updatePushback({ strength: parseFloat(e.target.value) || 0 })} /></Field>}
        </div>
      </div>
    </div>
  )

  const renderKeys = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={addKey} className={`${btnCls} border-amber-500/25 bg-amber-500/10 text-amber-300`}><PlusIcon className="w-3.5 h-3.5" /> {t('excellentCrates.addKey')}</button>
        <span className="text-[10px] text-white/30">{state.keys.length} key(s)</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[180px_1fr] gap-3">
        {/* Key list */}
        <div className="space-y-1.5">
          {state.keys.map((k, i) => (
            <ListItem key={k.id} active={selectedKey === i} label={k.name} sub={`${k.type} • ${k.material}`} onClick={() => setSelectedKey(i)} onDelete={() => removeKey(i)} />
          ))}
        </div>
        {/* Key editor */}
        {key ? (
          <div className="rounded-xl border border-white/[0.06] p-3 space-y-3">
            <Field label={t('excellentCrates.fieldKeyName')}><input className={inputClsPlain} value={key.name} onChange={e => updateKey(selectedKey, { name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <CustomDropdown label={t('excellentCrates.fieldKeyType')} value={key.type} onChange={v => updateKey(selectedKey, { type: v })} options={keyTypeOptions} accent="amber" className="w-full" />
              <Field label={t('excellentCrates.fieldMaterial')}><input className={inputCls} value={key.material} onChange={e => updateKey(selectedKey, { material: e.target.value })} /></Field>
            </div>
            <Field label={t('excellentCrates.fieldDisplayName')}><input className={inputCls} value={key.displayName} onChange={e => updateKey(selectedKey, { displayName: e.target.value })} /></Field>
            <LineEditor label={t('excellentCrates.fieldLore')} value={key.lore} onChange={v => updateKey(selectedKey, { lore: v })} rows={2} />
            <Toggle label={t('excellentCrates.fieldGlowing')} value={key.glowing} onChange={v => updateKey(selectedKey, { glowing: v })} />
          </div>
        ) : <p className="text-white/30 text-sm">{t('excellentCrates.noKeys')}</p>}
      </div>
    </div>
  )

  const renderRewards = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <button type="button" onClick={() => addReward('item')} className={`${btnCls} border-amber-500/25 bg-amber-500/10 text-amber-300`}><PlusIcon className="w-3.5 h-3.5" /> {t('excellentCrates.addItemReward')}</button>
        <button type="button" onClick={() => addReward('command')} className={`${btnCls} border-amber-500/25 bg-amber-500/10 text-amber-300`}><PlusIcon className="w-3.5 h-3.5" /> {t('excellentCrates.addCmdReward')}</button>
        <span className="text-[10px] text-white/30 ml-auto">{stats.total} reward(s) • {stats.items} items • {stats.commands} cmds</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-3">
        {/* Reward list */}
        <div className="space-y-1.5 max-h-[480px] overflow-y-auto custom-dropdown-scroll pr-1">
          {state.rewards.map((r, i) => {
            const rar = RARITIES.find(x => x.id === r.rarity)
            return <ListItem key={r.id} active={selectedReward === i} label={r.name} sub={`${r.type} • ${r.rarity} • w:${r.weight}`} color={rar?.color} onClick={() => setSelectedReward(i)} onDelete={() => removeReward(i)} />
          })}
          {state.rewards.length === 0 && <p className="text-[10px] text-white/25 text-center py-4">{t('excellentCrates.noRewards')}</p>}
        </div>
        {/* Reward editor */}
        {reward ? (
          <div className="rounded-xl border border-white/[0.06] p-3 space-y-3 max-h-[480px] overflow-y-auto custom-dropdown-scroll">
            <Toggle label={t('excellentCrates.fieldEnabled')} value={reward.enabled} onChange={v => updateReward(selectedReward, { enabled: v })} />
            <div className="grid grid-cols-3 gap-2">
              <CustomDropdown label={t('excellentCrates.fieldRewardType')} value={reward.type} onChange={v => updateReward(selectedReward, { type: v })} options={rewardTypeOptions} accent="amber" className="w-full" />
              <CustomDropdown label={t('excellentCrates.fieldRarity')} value={reward.rarity} onChange={v => updateReward(selectedReward, { rarity: v })} options={rarityOptions} accent="amber" className="w-full" />
              <Field label={t('excellentCrates.fieldWeight')}><input type="number" min="0" className={inputClsPlain} value={reward.weight} onChange={e => updateReward(selectedReward, { weight: Number(e.target.value) || 0 })} /></Field>
            </div>
            <Field label={t('excellentCrates.fieldRewardName')}><input className={inputClsPlain} value={reward.name} onChange={e => updateReward(selectedReward, { name: e.target.value })} /></Field>
            <Toggle label={t('excellentCrates.fieldBroadcast')} value={reward.broadcast} onChange={v => updateReward(selectedReward, { broadcast: v })} />

            {reward.type === 'item' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Field label={t('excellentCrates.fieldMaterial')}><input className={inputCls} value={reward.material} onChange={e => updateReward(selectedReward, { material: e.target.value })} /></Field>
                  <Field label={t('excellentCrates.fieldAmount')}><input type="number" min="1" className={inputClsPlain} value={reward.amount} onChange={e => updateReward(selectedReward, { amount: Number(e.target.value) || 1 })} /></Field>
                </div>
                <Field label={t('excellentCrates.fieldDisplayName')}><input className={inputCls} value={reward.displayName} onChange={e => updateReward(selectedReward, { displayName: e.target.value })} /></Field>
                <LineEditor label={t('excellentCrates.fieldLore')} value={reward.lore} onChange={v => updateReward(selectedReward, { lore: v })} rows={2} />
                <div className="space-y-2">
                  <label className={labelCls}>{t('excellentCrates.fieldEnchantments')}</label>
                  {(reward.enchantments || []).map((ench, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={`${inputCls} flex-1`} placeholder="SHARPNESS" value={ench.name} onChange={e => { const enchantments = [...reward.enchantments]; enchantments[i] = { ...enchantments[i], name: e.target.value }; updateReward(selectedReward, { enchantments }) }} />
                      <input type="number" min="1" className={`${inputClsPlain} w-16`} value={ench.level} onChange={e => { const enchantments = [...reward.enchantments]; enchantments[i] = { ...enchantments[i], level: Number(e.target.value) || 1 }; updateReward(selectedReward, { enchantments }) }} />
                      <button type="button" onClick={() => updateReward(selectedReward, { enchantments: reward.enchantments.filter((_, j) => j !== i) })} className="p-1.5 text-white/25 hover:text-red-400"><TrashIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => updateReward(selectedReward, { enchantments: [...(reward.enchantments || []), { name: '', level: 1 }] })} className={`${btnCls} border-amber-500/25 bg-amber-500/10 text-amber-300 w-full justify-center`}><PlusIcon className="w-3.5 h-3.5" /> {t('excellentCrates.addEnchantment')}</button>
                </div>
              </>
            )}

            {reward.type === 'command' && (
              <LineEditor label={t('excellentCrates.fieldCommands')} value={reward.commands} onChange={v => updateReward(selectedReward, { commands: v })} rows={4} hint={t('excellentCrates.hintCommands')} />
            )}

            {/* Win limits */}
            <div className="rounded-xl border border-white/[0.06] p-3 space-y-2 mt-2">
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">{t('excellentCrates.sectionWinLimit')}</p>
              <Toggle label={t('excellentCrates.fieldWinLimitEnabled')} value={reward.winLimitEnabled} onChange={v => updateReward(selectedReward, { winLimitEnabled: v })} />
              {reward.winLimitEnabled && (
                <div className="grid grid-cols-3 gap-2">
                  <Field label={t('excellentCrates.fieldWinLimitAmount')}><input type="number" min="1" className={inputClsPlain} value={reward.winLimitAmount} onChange={e => updateReward(selectedReward, { winLimitAmount: Number(e.target.value) || 1 })} /></Field>
                  <Field label={t('excellentCrates.fieldWinLimitCooldown')}><input type="number" min="0" className={inputClsPlain} value={reward.winLimitCooldown} onChange={e => updateReward(selectedReward, { winLimitCooldown: Number(e.target.value) || 0 })} /></Field>
                  <CustomDropdown label={t('excellentCrates.fieldCooldownUnit')} value={reward.winLimitCooldownUnit} onChange={v => updateReward(selectedReward, { winLimitCooldownUnit: v })} options={cooldownUnitOptions} accent="amber" className="w-full" />
                </div>
              )}
            </div>
          </div>
        ) : <p className="text-white/30 text-sm">{t('excellentCrates.noRewards')}</p>}
      </div>
    </div>
  )

  const renderAnimation = () => (
    <div className="space-y-3 max-w-lg">
      <Toggle label={t('excellentCrates.fieldAnimationEnabled')} value={state.animation.enabled} onChange={v => updateAnimation({ enabled: v })} />
      {state.animation.enabled && (
        <>
          <CustomDropdown label={t('excellentCrates.fieldAnimationType')} value={state.animation.type} onChange={v => updateAnimation({ type: v })} options={animationOptions} accent="amber" className="w-full" />
          <Toggle label={t('excellentCrates.fieldPreventSkip')} value={state.animation.preventSkip} onChange={v => updateAnimation({ preventSkip: v })} />
        </>
      )}
    </div>
  )

  const renderPreviewModule = () => (
    <div className="space-y-3 max-w-lg">
      <Toggle label={t('excellentCrates.fieldPreviewEnabled')} value={state.preview.enabled} onChange={v => updatePreview({ enabled: v })} />
      {state.preview.enabled && (
        <>
          <Field label={t('excellentCrates.fieldPreviewTitle')}><input className={inputCls} value={state.preview.title} onChange={e => updatePreview({ title: e.target.value })} /></Field>
          <Field label={t('excellentCrates.fieldPreviewRows')} hint={t('excellentCrates.hintPreviewRows')}><input type="number" min="1" max="6" className={inputClsPlain} value={state.preview.rows} onChange={e => updatePreview({ rows: Number(e.target.value) || 1 })} /></Field>
        </>
      )}
    </div>
  )

  const renderMilestones = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <button type="button" onClick={addMilestone} className={`${btnCls} border-amber-500/25 bg-amber-500/10 text-amber-300`}><PlusIcon className="w-3.5 h-3.5" /> {t('excellentCrates.addMilestone')}</button>
        <span className="text-[10px] text-white/30">{state.milestones.length} milestone(s)</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[160px_1fr] gap-3">
        <div className="space-y-1.5">
          {state.milestones.map((ms, i) => (
            <ListItem key={ms.id} active={selectedMilestone === i} label={`${ms.openings} opens`} sub={`${ms.rewards.length} reward(s)`} onClick={() => setSelectedMilestone(i)} onDelete={() => removeMilestone(i)} />
          ))}
          {state.milestones.length === 0 && <p className="text-[10px] text-white/25 text-center py-4">{t('excellentCrates.noMilestones')}</p>}
        </div>
        {milestone ? (
          <div className="rounded-xl border border-white/[0.06] p-3 space-y-3">
            <Field label={t('excellentCrates.fieldOpenings')}><input type="number" min="1" className={inputClsPlain} value={milestone.openings} onChange={e => updateMilestone(selectedMilestone, { openings: Number(e.target.value) || 1 })} /></Field>
            {(milestone.rewards || []).map((rwd, i) => (
              <div key={i} className="rounded-lg border border-white/[0.05] p-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40">{t('excellentCrates.milestoneReward')} #{i + 1}</span>
                  <button type="button" onClick={() => updateMilestone(selectedMilestone, { rewards: milestone.rewards.filter((_, j) => j !== i) })} className="p-1 text-white/25 hover:text-red-400"><TrashIcon className="w-3 h-3" /></button>
                </div>
                <Field label={t('excellentCrates.fieldRewardName')}><input className={inputClsPlain} value={rwd.name} onChange={e => { const rewards = [...milestone.rewards]; rewards[i] = { ...rewards[i], name: e.target.value }; updateMilestone(selectedMilestone, { rewards }) }} /></Field>
                <LineEditor label={t('excellentCrates.fieldCommands')} value={rwd.commands} onChange={v => { const rewards = [...milestone.rewards]; rewards[i] = { ...rewards[i], commands: v }; updateMilestone(selectedMilestone, { rewards }) }} rows={2} />
              </div>
            ))}
            <button type="button" onClick={() => updateMilestone(selectedMilestone, { rewards: [...(milestone.rewards || []), createReward('command')] })} className={`${btnCls} border-amber-500/25 bg-amber-500/10 text-amber-300 w-full justify-center`}><PlusIcon className="w-3.5 h-3.5" /> {t('excellentCrates.addMilestoneReward')}</button>
          </div>
        ) : null}
      </div>
    </div>
  )

  const renderEffects = () => (
    <div className="space-y-3 max-w-2xl">
      <div className="grid grid-cols-2 gap-3">
        <CustomDropdown label={t('excellentCrates.fieldParticle')} value={state.effects.particle} onChange={v => updateEffects({ particle: v })} options={particleOptions} accent="amber" className="w-full" searchable />
        <Field label={t('excellentCrates.fieldParticleData')} hint={t('excellentCrates.hintParticleData')}><input className={inputCls} value={state.effects.particleData} onChange={e => updateEffects({ particleData: e.target.value })} placeholder="255,100,0" /></Field>
      </div>
      <div className="rounded-xl border border-white/[0.06] p-3 space-y-3 mt-2">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">{t('excellentCrates.sectionHologram')}</p>
        <Toggle label={t('excellentCrates.fieldHologramEnabled')} value={state.hologram.enabled} onChange={v => updateHologram({ enabled: v })} />
        {state.hologram.enabled && (
          <>
            <LineEditor label={t('excellentCrates.fieldHologramLines')} value={state.hologram.lines} onChange={v => updateHologram({ lines: v })} rows={3} />
            <Field label={t('excellentCrates.fieldHologramOffset')}><input type="number" step="0.1" className={inputClsPlain} value={state.hologram.offsetY} onChange={e => updateHologram({ offsetY: parseFloat(e.target.value) || 0 })} /></Field>
          </>
        )}
      </div>
    </div>
  )

  const renderEditor = () => {
    if (module === 'general') return renderGeneral()
    if (module === 'keys') return renderKeys()
    if (module === 'rewards') return renderRewards()
    if (module === 'animation') return renderAnimation()
    if (module === 'preview') return renderPreviewModule()
    if (module === 'milestones') return renderMilestones()
    if (module === 'effects') return renderEffects()
    return null
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all"><ArrowLeftIcon className="w-4 h-4" /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 font-semibold uppercase">{t('excellentCrates.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('excellentCrates.title')}</h1>
            {presetNotice && <span className="text-[10px] text-emerald-400 animate-fade-in">{presetNotice}</span>}
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('excellentCrates.subtitle')}</p>
        </div>
        <CustomDropdown label="" value="" onChange={applyPresetHandler} options={presetOptions} accent="amber" className="w-44" placeholder={t('excellentCrates.preset')} />
      </div>

      {/* Tab bar */}
      <div className="px-5 py-2 border-b border-white/[0.06] flex-shrink-0">
        <TabBar tabs={MODULES} active={module} onChange={setModule} t={t} />
      </div>

      {/* Body: 2-col (editor + yaml) */}
      <div className="flex-1 min-h-0 overflow-hidden p-4">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)] gap-4 h-full min-h-0">
          {/* Editor area */}
          <section className={`${sectionCls} overflow-y-auto min-h-0 custom-dropdown-scroll`}>
            {renderEditor()}
          </section>

          {/* YAML preview */}
          <section className={`${sectionCls} flex flex-col min-h-0 overflow-hidden p-0`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">{t('excellentCrates.yamlOutput')}</p>
                <p className="text-[10px] text-white/20 mt-0.5">crates/{state.general.id}.yml</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={copyYaml} className={`${btnCls} ${copied ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-amber-500/25 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15'}`}>
                  {copied ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                  {copied ? t('excellentCrates.copied') : t('excellentCrates.copy')}
                </button>
                <button type="button" onClick={() => downloadYaml(yaml, state.general.id)} className={`${btnCls} border-orange-500/25 bg-orange-500/10 text-orange-300 hover:bg-orange-500/15`}>
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" /> {t('excellentCrates.download')}
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto px-4 py-3 text-[11px] leading-relaxed text-amber-100/75 font-mono custom-dropdown-scroll whitespace-pre-wrap break-words">
              {yaml}
            </pre>
          </section>
        </div>
      </div>
    </div>
  )
}
