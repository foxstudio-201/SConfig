import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  PlusIcon, TrashIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import { useI18n } from '../../../context/I18nContext'
import {
  createEnchantmentState, createLevel, applyPreset, uid,
  GROUPS, TRIGGERS, EFFECTS, TARGETS, APPLIES_SHORTCUTS, PRESETS, CONDITIONS, ENCHANTMENT_NAMES,
  getGroupCssColor,
} from './advancedEnchantmentsData'
import { buildEnchantmentYaml, downloadYaml } from './advancedEnchantmentsYaml'

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-emerald-500/35 transition-colors font-mono text-xs'
const inputWideCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-emerald-500/35 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'

function Toggle({ label, value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-emerald-500/35 bg-emerald-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center transition-all ${value ? 'bg-emerald-500/40 border-emerald-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
        <span className={`block w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="text-[11px] font-semibold text-white/80">{label}</span>
    </button>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      {children}
      {hint && <p className="text-[10px] text-white/25 mt-1">{hint}</p>}
    </div>
  )
}

function TagList({ items, onRemove, accent = 'emerald' }) {
  if (!items?.length) return <p className="text-[10px] text-white/20 italic">None</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-${accent}-500/10 border border-${accent}-500/20 text-${accent}-300`}>
          {item}
          <button type="button" onClick={() => onRemove(i)} className="text-white/30 hover:text-red-300 ml-0.5">&times;</button>
        </span>
      ))}
    </div>
  )
}

// ── Effect Builder with dynamic param inputs ─────────────────────────────────
function EffectBuilder({ onAdd, t }) {
  const [selectedEffect, setSelectedEffect] = useState(null)
  const [params, setParams] = useState({})
  const [target, setTarget] = useState('@Victim')

  function handleSelectEffect(effectId) {
    const eff = EFFECTS.find(e => e.id === effectId)
    if (!eff) return
    setSelectedEffect(eff)
    // Reset params to placeholders
    const defaults = {}
    eff.params.forEach(p => { defaults[p.key] = '' })
    setParams(defaults)
  }

  function buildEffectString() {
    if (!selectedEffect) return ''
    const parts = [selectedEffect.id]
    selectedEffect.params.forEach(p => {
      parts.push(params[p.key] || p.placeholder)
    })
    return parts.join(':') + ' ' + target
  }

  function handleAdd() {
    const result = buildEffectString()
    if (result.trim()) {
      onAdd(result)
      setSelectedEffect(null)
      setParams({})
    }
  }

  return (
    <div className="flex flex-col gap-2.5 mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-3">
      <p className="text-[9px] text-emerald-300/50 uppercase tracking-wider font-semibold">{t('advancedEnchantments.addEffectTitle')}</p>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <CustomDropdown label="" value="" onChange={handleSelectEffect}
          options={EFFECTS.map(e => ({ value: e.id, label: e.label + (e.params.length ? ' (' + e.params.map(p => p.key).join(', ') + ')' : '') }))}
          placeholder={t('advancedEnchantments.selectEffect')} accent="emerald" className="w-full" searchable />
        <CustomDropdown label="" value={target} onChange={v => setTarget(v)}
          options={TARGETS.map(tg => ({ value: tg, label: tg }))}
          accent="emerald" className="w-32" />
      </div>
      {selectedEffect && selectedEffect.params.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {selectedEffect.params.map(p => (
            <div key={p.key}>
              <label className="text-[9px] text-white/30 uppercase mb-0.5 block">{p.key}</label>
              <input className={inputCls} placeholder={p.placeholder} value={params[p.key] || ''}
                onChange={e => setParams(prev => ({ ...prev, [p.key]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd() }} />
              <p className="text-[8px] text-white/20 mt-0.5">{p.hint}</p>
            </div>
          ))}
        </div>
      )}
      {selectedEffect && (
        <div className="flex items-center gap-2">
          <code className="flex-1 text-[10px] font-mono text-emerald-300/80 bg-black/30 rounded-lg px-3 py-2 border border-white/[0.05]">
            {buildEffectString()}
          </code>
          <button type="button" onClick={handleAdd}
            className={`${btnCls} bg-emerald-500/15 border-emerald-500/30 text-emerald-300`}>
            <PlusIcon className="w-3.5 h-3.5" /> {t('advancedEnchantments.addEffect')}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Condition Builder with dynamic param inputs ──────────────────────────────
function ConditionBuilder({ onAdd, t }) {
  const [selectedCond, setSelectedCond] = useState(null)
  const [params, setParams] = useState({})

  function handleSelectCondition(condId) {
    const cond = CONDITIONS.find(c => c.id === condId)
    if (!cond) return
    setSelectedCond(cond)
    const defaults = {}
    cond.params.forEach(p => { defaults[p.key] = '' })
    setParams(defaults)
  }

  function buildConditionString() {
    if (!selectedCond) return ''
    if (selectedCond.params.length === 0) return selectedCond.format
    let result = selectedCond.format
    selectedCond.params.forEach(p => {
      result = result.replace(`{${p.key}}`, params[p.key] || p.placeholder)
    })
    return result
  }

  function handleAdd() {
    const result = buildConditionString()
    if (result.trim()) {
      onAdd(result)
      setSelectedCond(null)
      setParams({})
    }
  }

  return (
    <div className="flex flex-col gap-2.5 mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-3">
      <p className="text-[9px] text-emerald-300/50 uppercase tracking-wider font-semibold">{t('advancedEnchantments.addConditionTitle')}</p>
      <CustomDropdown label="" value="" onChange={handleSelectCondition}
        options={CONDITIONS.map(c => ({ value: c.id, label: c.label + (c.params.length ? ' (' + c.params.map(p => p.key).join(', ') + ')' : '') }))}
        placeholder={t('advancedEnchantments.selectCondition')} accent="emerald" className="w-full" searchable />
      {selectedCond && selectedCond.params.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {selectedCond.params.map(p => (
            <div key={p.key}>
              <label className="text-[9px] text-white/30 uppercase mb-0.5 block">{p.key}</label>
              <input className={inputCls} placeholder={p.placeholder} value={params[p.key] || ''}
                onChange={e => setParams(prev => ({ ...prev, [p.key]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd() }} />
              <p className="text-[8px] text-white/20 mt-0.5">{p.hint}</p>
            </div>
          ))}
        </div>
      )}
      {selectedCond && (
        <div className="flex items-center gap-2">
          <code className="flex-1 text-[10px] font-mono text-emerald-300/80 bg-black/30 rounded-lg px-3 py-2 border border-white/[0.05]">
            {buildConditionString()}
          </code>
          <button type="button" onClick={handleAdd}
            className={`${btnCls} bg-emerald-500/15 border-emerald-500/30 text-emerald-300`}>
            <PlusIcon className="w-3.5 h-3.5" /> {t('advancedEnchantments.addCondition')}
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdvancedEnchantmentsTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(createEnchantmentState)
  const [copied, setCopied] = useState(false)
  const [presetApplied, setPresetApplied] = useState('')
  const [editorTab, setEditorTab] = useState('basic')

  const activeLevelId = state.activeLevelId || state.levels[0]?.id || null
  const activeLevel = useMemo(() => state.levels.find(l => l.id === activeLevelId) || state.levels[0] || null, [state.levels, activeLevelId])
  const yamlContent = useMemo(() => buildEnchantmentYaml(state), [state])

  const update = useCallback((patch) => {
    setState(prev => ({ ...prev, ...patch }))
  }, [])

  const updateSettings = useCallback((patch) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }, [])

  const updateLevel = useCallback((levelId, patch) => {
    setState(prev => ({
      ...prev,
      levels: prev.levels.map(l => l.id === levelId ? { ...l, ...patch } : l),
    }))
  }, [])

  const addLevel = useCallback(() => {
    const nextNum = state.levels.length > 0 ? Math.max(...state.levels.map(l => l.level)) + 1 : 1
    const newLevel = createLevel(nextNum)
    setState(prev => ({ ...prev, levels: [...prev.levels, newLevel], activeLevelId: newLevel.id }))
  }, [state.levels])

  const removeLevel = useCallback((levelId) => {
    setState(prev => {
      const levels = prev.levels.filter(l => l.id !== levelId)
      const newActiveId = levels.length > 0 ? levels[0].id : null
      return { ...prev, levels, activeLevelId: newActiveId }
    })
  }, [])

  const selectLevel = useCallback((levelId) => {
    setState(prev => ({ ...prev, activeLevelId: levelId }))
  }, [])

  // Effects CRUD for active level
  const addEffect = useCallback((effect) => {
    if (!activeLevel || !effect.trim()) return
    updateLevel(activeLevel.id, { effects: [...(activeLevel.effects || []), effect.trim()] })
  }, [activeLevel, updateLevel])

  const removeEffect = useCallback((idx) => {
    if (!activeLevel) return
    updateLevel(activeLevel.id, { effects: activeLevel.effects.filter((_, i) => i !== idx) })
  }, [activeLevel, updateLevel])

  const updateEffect = useCallback((idx, value) => {
    if (!activeLevel) return
    const effects = [...activeLevel.effects]
    effects[idx] = value
    updateLevel(activeLevel.id, { effects })
  }, [activeLevel, updateLevel])

  // Conditions CRUD for active level
  const addCondition = useCallback((condition) => {
    if (!activeLevel || !condition.trim()) return
    updateLevel(activeLevel.id, { conditions: [...(activeLevel.conditions || []), condition.trim()] })
  }, [activeLevel, updateLevel])

  const removeCondition = useCallback((idx) => {
    if (!activeLevel) return
    updateLevel(activeLevel.id, { conditions: activeLevel.conditions.filter((_, i) => i !== idx) })
  }, [activeLevel, updateLevel])

  // Applies CRUD
  const addApplies = useCallback((material) => {
    if (!material || state.applies.includes(material)) return
    update({ applies: [...state.applies, material] })
  }, [state.applies, update])

  const removeApplies = useCallback((idx) => {
    update({ applies: state.applies.filter((_, i) => i !== idx) })
  }, [state.applies, update])

  // Settings arrays CRUD
  const addToSettingsArray = useCallback((key, value) => {
    if (!value.trim()) return
    const arr = state.settings[key] || []
    if (arr.includes(value.trim())) return
    updateSettings({ [key]: [...arr, value.trim()] })
  }, [state.settings, updateSettings])

  const removeFromSettingsArray = useCallback((key, idx) => {
    updateSettings({ [key]: (state.settings[key] || []).filter((_, i) => i !== idx) })
  }, [state.settings, updateSettings])

  // Preset
  const loadPreset = useCallback((presetId) => {
    if (!presetId) return
    const data = applyPreset(presetId)
    setState(prev => ({ ...data, activeLevelId: data.levels[0]?.id || null }))
    setPresetApplied(presetId)
    setTimeout(() => setPresetApplied(''), 2000)
  }, [])

  // Copy / Download
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(yamlContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [yamlContent])

  const handleDownload = useCallback(() => {
    downloadYaml(yamlContent, `${state.name || 'enchantment'}.yml`)
  }, [yamlContent, state.name])

  // New input states
  const [newApplies, setNewApplies] = useState('')
  const [newSettingsItem, setNewSettingsItem] = useState({ key: '', value: '' })
  const [enchantPick, setEnchantPick] = useState({ name: '', level: '' })
  const [incompatPick, setIncompatPick] = useState({ name: '', level: '' })
  const [removedPick, setRemovedPick] = useState({ name: '', level: '' })

  const groupColor = getGroupCssColor(state.group)

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0 flex-wrap">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-semibold uppercase">{t('advancedEnchantments.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('advancedEnchantments.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('advancedEnchantments.subtitle')}</p>
        </div>
        <CustomDropdown
          label=""
          value=""
          onChange={loadPreset}
          options={PRESETS.map(p => ({ value: p.id, label: t(`advancedEnchantments.${p.labelKey}`) }))}
          placeholder={t('advancedEnchantments.presetPlaceholder')}
          accent="emerald"
          className="w-48"
        />
        {presetApplied && (
          <span className="text-[10px] text-emerald-300 animate-pulse">{t('advancedEnchantments.presetApplied')}</span>
        )}
      </div>

      {/* 3-column layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)_320px] min-h-0 overflow-hidden gap-0">

        {/* Left sidebar */}
        <div className="hidden xl:flex flex-col border-r border-white/[0.06] p-3 overflow-y-auto custom-dropdown-scroll gap-3 min-h-0">
          {/* Enchantment info card */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-2 ring-white/10" style={{ backgroundColor: groupColor }} />
              <span className="text-[12px] font-bold text-white/90 truncate">{state.display || state.name}</span>
            </div>
            <div className="h-px w-full bg-white/[0.06]" />
            <div className="flex flex-col gap-1.5 text-[10px] text-white/40">
              <span>{t('advancedEnchantments.levelsCount')}: <strong className="text-emerald-300">{state.levels.length}</strong></span>
              <span>{t('advancedEnchantments.triggerLabel')}: <strong className="text-white/70">{state.type}</strong></span>
              <span>{t('advancedEnchantments.groupLabel')}: <strong style={{ color: groupColor }}>{state.group}</strong></span>
            </div>
          </div>

          {/* Level list */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-white/40 uppercase font-semibold">{t('advancedEnchantments.levels')}</p>
            <button type="button" onClick={addLevel} className="p-1 rounded hover:bg-white/[0.06] text-emerald-300" title={t('advancedEnchantments.addLevel')}>
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {state.levels.map(lvl => (
              <div key={lvl.id} className="flex items-center gap-1">
                <button type="button" onClick={() => selectLevel(lvl.id)}
                  className={`flex-1 text-left rounded-lg border px-2.5 py-2 transition-all text-[11px] ${
                    lvl.id === activeLevelId ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200 font-bold' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-white/60'
                  }`}>
                  <span>{t('advancedEnchantments.levelPrefix')} {lvl.level}</span>
                  <span className="ml-2 text-[9px] text-white/30">{lvl.chance}% · {lvl.cooldown}s</span>
                </button>
                <button type="button" onClick={() => removeLevel(lvl.id)}
                  disabled={state.levels.length <= 1}
                  className="p-1 text-red-300/50 hover:text-red-300 disabled:opacity-20">
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Center editor */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          {/* Sub tabs */}
          <div className="flex gap-1 px-5 pt-4 pb-2 border-b border-white/[0.06] flex-shrink-0 overflow-x-auto custom-dropdown-scroll">
            {[
              { id: 'basic', label: t('advancedEnchantments.sectionBasicInfo') },
              { id: 'triggers', label: t('advancedEnchantments.sectionTriggers') },
              { id: 'applies', label: t('advancedEnchantments.sectionApplies') },
              { id: 'settings', label: t('advancedEnchantments.sectionSettings') },
              { id: 'levels', label: t('advancedEnchantments.sectionLevelEditor') },
            ].map(tab => (
              <button key={tab.id} type="button" onClick={() => setEditorTab(tab.id)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl border text-[11px] font-semibold transition-all whitespace-nowrap ${
                  editorTab === tab.id
                    ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-200'
                    : 'border-white/[0.05] bg-white/[0.02] text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content with scroll */}
          <div className="flex-1 overflow-y-auto custom-dropdown-scroll p-5 min-h-0">
            {editorTab === 'basic' && (
              <div className="flex flex-col gap-3 ">
                <Field label={t('advancedEnchantments.nameLabel')} hint={t('advancedEnchantments.nameHint')}>
                  <input className={inputCls} value={state.name} onChange={e => update({ name: e.target.value.toLowerCase().replace(/\s+/g, '_') })} spellCheck={false} />
                </Field>
                <Field label={t('advancedEnchantments.displayLabel')} hint={t('advancedEnchantments.displayHint')}>
                  <input className={inputWideCls} value={state.display} onChange={e => update({ display: e.target.value })} spellCheck={false} />
                </Field>
                <Field label={t('advancedEnchantments.descriptionLabel')}>
                  <input className={inputWideCls} value={state.description} onChange={e => update({ description: e.target.value })} />
                </Field>
                <Field label={t('advancedEnchantments.appliesToVisual')} hint={t('advancedEnchantments.appliesToVisualHint')}>
                  <input className={inputWideCls} value={state.appliesTo} onChange={e => update({ appliesTo: e.target.value })} />
                </Field>
                <CustomDropdown label={t('advancedEnchantments.groupLabel')} value={state.group} onChange={v => update({ group: v })} options={GROUPS.map(g => ({ value: g.id, label: `${g.id} (${g.color}, weight: ${g.weight})` }))} accent="emerald" />
              </div>
            )}

            {editorTab === 'triggers' && (
              <div className="flex flex-col gap-4 ">
                <Field label={t('advancedEnchantments.typeLabel')} hint={t('advancedEnchantments.typeHint')}>
                  <input className={inputCls} value={state.type} onChange={e => update({ type: e.target.value })} spellCheck={false} placeholder="ATTACK;DEFENSE" />
                </Field>
                <div>
                  <label className={labelCls}>Click to toggle triggers</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TRIGGERS.map(trigger => (
                      <button key={trigger} type="button"
                        onClick={() => {
                          const types = state.type.split(';').map(s => s.trim()).filter(Boolean)
                          if (types.includes(trigger)) update({ type: types.filter(t => t !== trigger).join(';') })
                          else update({ type: [...types, trigger].join(';') })
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                          state.type.split(';').map(s => s.trim()).includes(trigger)
                            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                            : 'border-white/[0.08] bg-white/[0.02] text-white/40 hover:text-white/60'
                        }`}>
                        {trigger}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label={t('advancedEnchantments.targetsLabel')}>
                  <div className="flex flex-wrap gap-1.5">
                    {TARGETS.map(target => (
                      <span key={target} className="px-2.5 py-1 rounded-lg text-[10px] font-mono border border-white/[0.08] bg-white/[0.02] text-white/50">
                        {target}
                      </span>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {editorTab === 'applies' && (
              <div className="flex flex-col gap-3 ">
                <TagList items={state.applies} onRemove={removeApplies} />
                <div className="flex gap-2">
                  <CustomDropdown label="" value={newApplies} onChange={v => { addApplies(v); setNewApplies('') }}
                    options={APPLIES_SHORTCUTS.map(s => ({ value: s, label: s }))}
                    placeholder={t('advancedEnchantments.addAppliesPlaceholder')} accent="emerald" className="flex-1" searchable />
                </div>
              </div>
            )}

            {editorTab === 'settings' && (
              <div className="flex flex-col gap-4 ">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Toggle label={t('advancedEnchantments.showActionBar')} value={!!state.settings.showActionBar} onChange={v => updateSettings({ showActionBar: v })} />
                  <Toggle label={t('advancedEnchantments.removeable')} value={state.settings.removeable !== false} onChange={v => updateSettings({ removeable: v })} />
                  <Toggle label={t('advancedEnchantments.disableInEnchanter')} value={!!state.settings.disableInEnchanter} onChange={v => updateSettings({ disableInEnchanter: v })} />
                </div>

                <Field label={t('advancedEnchantments.disabledWorlds')}>
                  <TagList items={state.settings.disabledWorlds} onRemove={(idx) => removeFromSettingsArray('disabledWorlds', idx)} />
                  <div className="flex gap-2 mt-2">
                    <input className={inputCls + ' flex-1'} placeholder={t('advancedEnchantments.worldPlaceholder')}
                      value={newSettingsItem.key === 'disabledWorlds' ? newSettingsItem.value : ''}
                      onChange={e => setNewSettingsItem({ key: 'disabledWorlds', value: e.target.value })}
                      onKeyDown={e => { if (e.key === 'Enter') { addToSettingsArray('disabledWorlds', newSettingsItem.value); setNewSettingsItem({ key: '', value: '' }) } }} />
                    <button type="button" onClick={() => { addToSettingsArray('disabledWorlds', newSettingsItem.value); setNewSettingsItem({ key: '', value: '' }) }}
                      className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}><PlusIcon className="w-3.5 h-3.5" /></button>
                  </div>
                </Field>

                <Field label={t('advancedEnchantments.requiredEnchants')}>
                  <TagList items={state.settings.requiredEnchants} onRemove={(idx) => removeFromSettingsArray('requiredEnchants', idx)} />
                  <div className="flex gap-2 mt-2 items-end">
                    <CustomDropdown label="" value={enchantPick.name} onChange={v => setEnchantPick(p => ({ ...p, name: v }))}
                      options={ENCHANTMENT_NAMES.map(e => ({ value: e, label: e }))}
                      placeholder={t('advancedEnchantments.selectEnchant')} accent="emerald" className="flex-1" searchable />
                    <div className="w-20">
                      <label className="text-[9px] text-white/30 uppercase block mb-0.5">Level</label>
                      <input type="number" min="1" max="10" className={inputCls} value={enchantPick.level} onChange={e => setEnchantPick(p => ({ ...p, level: e.target.value }))} placeholder="any" />
                    </div>
                    <button type="button" onClick={() => { if (enchantPick.name) { const val = enchantPick.level ? `${enchantPick.name}:${enchantPick.level}` : enchantPick.name; addToSettingsArray('requiredEnchants', val); setEnchantPick({ name: '', level: '' }) } }}
                      className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300 h-[38px]`}><PlusIcon className="w-3.5 h-3.5" /></button>
                  </div>
                </Field>

                <Field label={t('advancedEnchantments.notApplyableWith')}>
                  <TagList items={state.settings.notApplyableWith} onRemove={(idx) => removeFromSettingsArray('notApplyableWith', idx)} />
                  <div className="flex gap-2 mt-2 items-end">
                    <CustomDropdown label="" value={incompatPick.name} onChange={v => setIncompatPick(p => ({ ...p, name: v }))}
                      options={ENCHANTMENT_NAMES.map(e => ({ value: e, label: e }))}
                      placeholder={t('advancedEnchantments.selectEnchant')} accent="emerald" className="flex-1" searchable />
                    <div className="w-20">
                      <label className="text-[9px] text-white/30 uppercase block mb-0.5">Level</label>
                      <input type="number" min="1" max="10" className={inputCls} value={incompatPick.level} onChange={e => setIncompatPick(p => ({ ...p, level: e.target.value }))} placeholder="any" />
                    </div>
                    <button type="button" onClick={() => { if (incompatPick.name) { const val = incompatPick.level ? `${incompatPick.name}:${incompatPick.level}` : incompatPick.name; addToSettingsArray('notApplyableWith', val); setIncompatPick({ name: '', level: '' }) } }}
                      className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300 h-[38px]`}><PlusIcon className="w-3.5 h-3.5" /></button>
                  </div>
                </Field>

                <Field label={t('advancedEnchantments.removedEnchants')}>
                  <TagList items={state.settings.removedEnchants} onRemove={(idx) => removeFromSettingsArray('removedEnchants', idx)} />
                  <div className="flex gap-2 mt-2 items-end">
                    <CustomDropdown label="" value={removedPick.name} onChange={v => setRemovedPick(p => ({ ...p, name: v }))}
                      options={ENCHANTMENT_NAMES.map(e => ({ value: e, label: e }))}
                      placeholder={t('advancedEnchantments.selectEnchant')} accent="emerald" className="flex-1" searchable />
                    <div className="w-20">
                      <label className="text-[9px] text-white/30 uppercase block mb-0.5">Level</label>
                      <input type="number" min="1" max="10" className={inputCls} value={removedPick.level} onChange={e => setRemovedPick(p => ({ ...p, level: e.target.value }))} placeholder="any" />
                    </div>
                    <button type="button" onClick={() => { if (removedPick.name) { const val = removedPick.level ? `${removedPick.name}:${removedPick.level}` : removedPick.name; addToSettingsArray('removedEnchants', val); setRemovedPick({ name: '', level: '' }) } }}
                      className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300 h-[38px]`}><PlusIcon className="w-3.5 h-3.5" /></button>
                  </div>
                </Field>
              </div>
            )}

            {editorTab === 'levels' && (
              <div className="flex flex-col gap-4 ">
                {/* Level selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  {state.levels.map(lvl => (
                    <button key={lvl.id} type="button" onClick={() => selectLevel(lvl.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                        lvl.id === activeLevelId ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-white/[0.08] text-white/40 hover:bg-white/[0.04]'
                      }`}>
                      Lv.{lvl.level} <span className="text-[9px] font-normal text-white/30 ml-1">{lvl.chance}%</span>
                    </button>
                  ))}
                  <button type="button" onClick={addLevel} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-emerald-300">
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                {activeLevel ? (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label={t('advancedEnchantments.levelNum')}>
                        <input type="number" min={1} className={inputWideCls} value={activeLevel.level}
                          onChange={e => updateLevel(activeLevel.id, { level: Number(e.target.value) || 1 })} />
                      </Field>
                      <Field label={t('advancedEnchantments.chance')}>
                        <input type="number" min={0} max={100} className={inputWideCls} value={activeLevel.chance}
                          onChange={e => updateLevel(activeLevel.id, { chance: Number(e.target.value) || 0 })} />
                      </Field>
                      <Field label={t('advancedEnchantments.cooldown')}>
                        <input type="number" min={0} className={inputWideCls} value={activeLevel.cooldown}
                          onChange={e => updateLevel(activeLevel.id, { cooldown: Number(e.target.value) || 0 })} />
                      </Field>
                    </div>

                    {/* Effects */}
                    <Field label={t('advancedEnchantments.effectsLabel')}>
                      <div className="flex flex-col gap-1.5">
                        {(activeLevel.effects || []).map((eff, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input className={inputCls + ' flex-1'} value={eff} onChange={e => updateEffect(idx, e.target.value)} spellCheck={false} />
                            <button type="button" onClick={() => removeEffect(idx)} className="p-1 text-red-300/50 hover:text-red-300"><TrashIcon className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                      {/* Effect builder */}
                      <EffectBuilder onAdd={addEffect} t={t} />
                    </Field>

                    {/* Conditions */}
                    <Field label={t('advancedEnchantments.conditionsLabel')}>
                      <div className="flex flex-col gap-1.5">
                        {(activeLevel.conditions || []).map((cond, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input className={inputCls + ' flex-1'} value={cond}
                              onChange={e => { const conditions = [...activeLevel.conditions]; conditions[idx] = e.target.value; updateLevel(activeLevel.id, { conditions }) }} spellCheck={false} />
                            <button type="button" onClick={() => removeCondition(idx)} className="p-1 text-red-300/50 hover:text-red-300"><TrashIcon className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                      {/* Condition builder */}
                      <ConditionBuilder onAdd={addCondition} t={t} />
                    </Field>

                    <button type="button" onClick={() => removeLevel(activeLevel.id)} disabled={state.levels.length <= 1}
                      className={`${btnCls} border-red-500/20 bg-red-500/5 text-red-300/70 hover:bg-red-500/10 w-fit disabled:opacity-30`}>
                      <TrashIcon className="w-3.5 h-3.5" /> Remove this level
                    </button>
                  </>
                ) : (
                  <p className="text-[11px] text-white/30 italic">{t('advancedEnchantments.noLevels')}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right panel - YAML preview */}
        <div className="hidden xl:flex flex-col border-l border-white/[0.06] p-4 overflow-hidden gap-3 min-h-0">
          <div className="flex items-center justify-between flex-shrink-0">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{t('advancedEnchantments.yamlOutput')}</p>
            <div className="flex gap-1.5">
              <button type="button" onClick={handleCopy} className={`${btnCls} text-[9px] py-1 ${copied ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/[0.08] text-white/45 hover:text-white/70'}`}>
                {copied ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                {copied ? t('advancedEnchantments.copied') : t('advancedEnchantments.copy')}
              </button>
              <button type="button" onClick={handleDownload} className={`${btnCls} text-[9px] py-1 bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/15`}>
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('advancedEnchantments.download')}
              </button>
            </div>
          </div>
          <pre className="flex-1 overflow-auto custom-dropdown-scroll bg-[#0a0f14] border border-white/[0.08] rounded-2xl p-4 text-[11px] font-mono text-emerald-200/80 leading-relaxed whitespace-pre-wrap break-words min-h-0">
            {yamlContent}
          </pre>
        </div>

      </div>
    </div>
  )
}
