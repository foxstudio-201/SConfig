import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  PlusIcon, TrashIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import {
  STAT_CATEGORIES, BUILTIN_SKILLS, TRIGGERS, PARTICLES,
  EXP_SOURCE_PRESETS, CLASS_PRESETS, PROFESSION_PRESETS,
  createClassState, createProfessionState, createSkillEntry, createSkillSlot,
  presetToClass, presetToProfession, emptyScaled, uid,
} from './mmoCoreData'
import {
  buildClassYaml, buildProfessionYaml, buildProjectYaml,
  getClassFileName, getProfessionFileName, downloadYaml,
} from './mmoCoreYaml'
import { useI18n } from '../../../context/I18nContext'

const CLASS_TAB_DEFS = [
  { id: 'display', labelKey: 'tabDisplay' },
  { id: 'progression', labelKey: 'tabProgression' },
  { id: 'stats', labelKey: 'tabStats' },
  { id: 'skills', labelKey: 'tabSkills' },
  { id: 'slots', labelKey: 'tabSlots' },
  { id: 'advanced', labelKey: 'tabAdvanced' },
]

const PROF_TAB_DEFS = [
  { id: 'basic', labelKey: 'tabBasic' },
  { id: 'exp', labelKey: 'tabExp' },
]

const PROGRESSION_OPTS = [
  ['default', 'optDefault'],
  ['display', 'optDisplay'],
  ['offCombatHealthRegen', 'optOffCombatHp'],
  ['offCombatManaRegen', 'optOffCombatMana'],
  ['offCombatStaminaRegen', 'optOffCombatStamina'],
  ['needsPermission', 'optNeedsPermission'],
]

const STAT_CAT_I18N = { vanilla: 'statCatVanilla', resources: 'statCatResources', combat: 'statCatCombat', utility: 'statCatUtility' }

function presetI18nKey(id) {
  return `preset${id.charAt(0).toUpperCase()}${id.slice(1)}`
}

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-orange-500/30 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3'
const sectionHead = 'text-[10px] text-white/30 uppercase tracking-widest font-semibold'

const MC_COLORS = {
  '0': '#555555', '1': '#5555FF', '2': '#55FF55', '3': '#55FFFF',
  '4': '#FF5555', '5': '#FF55FF', '6': '#FFAA00', '7': '#AAAAAA',
  '8': '#555555', '9': '#5555FF', a: '#55FF55', b: '#55FFFF',
  c: '#FF5555', d: '#FF55FF', e: '#FFFF55', f: '#FFFFFF',
}

function parseMcText(text) {
  if (!text) return [{ t: '', c: '#AAAAAA' }]
  const parts = []
  let color = '#AAAAAA'
  let bold = false
  let i = 0
  while (i < text.length) {
    if (text[i] === '&' && i + 1 < text.length) {
      const code = text[i + 1].toLowerCase()
      if (code === 'l') bold = true
      else if (code === 'r') { color = '#AAAAAA'; bold = false }
      else if (MC_COLORS[code]) { color = MC_COLORS[code]; bold = false }
      i += 2
      continue
    }
    let j = i
    while (j < text.length && !(text[j] === '&' && j + 1 < text.length)) j++
    if (j > i) parts.push({ t: text.slice(i, j), c: color, b: bold })
    i = j
  }
  return parts.length ? parts : [{ t: text, c: '#AAAAAA' }]
}

function McText({ text, className = '' }) {
  return (
    <span className={className}>
      {parseMcText(text).map((p, i) => (
        <span key={i} style={{ color: p.c, fontWeight: p.b ? 700 : 400 }}>{p.t}</span>
      ))}
    </span>
  )
}

function SectionTitle({ children }) {
  return <p className={sectionHead}>{children}</p>
}

function Field({ label, children }) {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      {children}
    </div>
  )
}

function ListEditor({ items, onChange, placeholder }) {
  const text = (items || []).join('\n')
  return (
    <textarea value={text} onChange={e => onChange(e.target.value.split('\n'))} rows={4} spellCheck={false}
      className={`${inputCls} font-mono text-xs resize-y`} placeholder={placeholder} />
  )
}

function ScaledField({ t, label, value, onChange }) {
  const v = value || emptyScaled()
  const fieldLabels = { base: 'scaledBase', perLevel: 'scaledPerLevel', min: 'scaledMin', max: 'scaledMax' }
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-orange-300/80">{label}</span>
        <button type="button" onClick={() => onChange({ ...v, useFormula: !v.useFormula })}
          className={`text-[9px] px-2 py-0.5 rounded border ${v.useFormula ? 'border-orange-500/40 text-orange-300 bg-orange-500/15' : 'border-white/[0.08] text-white/35'}`}>
          {t('mmoCore.scaledFormula')}
        </button>
      </div>
      {v.useFormula ? (
        <input className={`${inputCls} font-mono text-xs`} value={v.formula}
          onChange={e => onChange({ ...v, formula: e.target.value })}
          placeholder="min(100, 19 + {level} * {level})" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['base', 'perLevel', 'min', 'max'].map(f => (
            <Field key={f} label={t(`mmoCore.${fieldLabels[f]}`)}>
              <input className={`${inputCls} text-xs font-mono`} value={v[f] ?? ''}
                onChange={e => onChange({ ...v, [f]: e.target.value })} />
            </Field>
          ))}
        </div>
      )}
    </div>
  )
}

function ConfigList({ t, mode, entries, activeId, onSelect, onDelete, onAdd, onDuplicate }) {
  const listTitle = mode === 'class' ? t('mmoCore.listClasses') : t('mmoCore.listProfessions')
  const countLabel = entries.length === 1
    ? t('mmoCore.configCount', { count: entries.length })
    : t('mmoCore.configCount_plural', { count: entries.length })
  return (
    <div className={`${sectionCls} min-h-0 overflow-hidden flex flex-col flex-1`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <SectionTitle>{listTitle}</SectionTitle>
          <p className="text-[10px] text-white/25 mt-0.5">{countLabel}</p>
        </div>
        <button type="button" onClick={onAdd} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('mmoCore.new')}
        </button>
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
        {entries.map(entry => {
          const active = entry._id === activeId
          const title = mode === 'class' ? (entry.display?.name || entry.fileId) : entry.name
          const file = mode === 'class' ? getClassFileName(entry) : getProfessionFileName(entry)
          const sub = mode === 'class'
            ? t('mmoCore.listClassSub', { skills: entry.skills?.length || 0, max: entry.maxLevel ?? '?' })
            : t('mmoCore.listProfSub', { sources: entry.expSources?.length || 0, max: entry.maxLevel ?? '?' })
          return (
            <div key={entry._id}
              className={`group flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                active ? 'border-orange-500/35 bg-orange-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
              }`}>
              <button type="button" onClick={() => onSelect(entry._id)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-mono font-semibold text-white/85 truncate">{title}</span>
                </div>
                <McText text={mode === 'class' ? (entry.display?.lore?.[0] || '') : t('mmoCore.professionLine', { name: entry.name })} className="text-[10px] truncate block text-white/40" />
                <div className="flex gap-1.5 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-300/70 font-mono">{file}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-white/40">{sub}</span>
                </div>
              </button>
              <div className="flex flex-col gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => onDuplicate(entry._id)} title={t('mmoCore.duplicate')}
                  className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white/80 transition-all">
                  <PlusIcon className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => onDelete(entry._id)} disabled={entries.length <= 1}
                  className="p-1.5 rounded-lg border border-red-500/15 bg-red-500/5 text-red-400/70 hover:text-red-300 transition-all disabled:opacity-25">
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ClassPreview({ t, cls }) {
  const statCount = Object.keys(cls.stats || {}).filter(k => {
    const v = cls.stats[k]
    return v?.base || v?.perLevel || v?.formula
  }).length
  return (
    <div className={`${sectionCls} flex-shrink-0`}>
      <SectionTitle>{t('mmoCore.classPreview')}</SectionTitle>
      <div className="rounded-xl bg-[#0d0d1a] border border-white/[0.04] p-4 flex flex-col gap-2">
        <McText text={cls.display?.name || cls.fileId} className="text-base font-bold" />
        {(cls.display?.lore || []).slice(0, 3).map((l, i) => (
          <McText key={i} text={l} className="text-[11px] text-white/50 leading-relaxed" />
        ))}
        <div className="flex flex-wrap gap-1.5 mt-1">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300">{t('mmoCore.badgeStats', { count: statCount })}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">{t('mmoCore.badgeSkills', { count: cls.skills?.length || 0 })}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">{t('mmoCore.badgeMaxLv', { level: cls.maxLevel })}</span>
        </div>
        {cls.mana?.name && (
          <p className="text-[10px] text-white/35">{t('mmoCore.resourceLine')} <McText text={`${cls.mana.icon || ''} ${cls.mana.name}`} className="inline" /></p>
        )}
        <p className="text-[10px] font-mono text-white/25 pt-2 mt-1 border-t border-white/[0.04]">{t('mmoCore.pathClass', { file: getClassFileName(cls) })}</p>
      </div>
    </div>
  )
}

function DisplayTab({ t, s, set }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionClassIdentity')}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t('mmoCore.fieldFileId')}>
            <input className={`${inputCls} font-mono`} value={s.fileId}
              onChange={e => set({ fileId: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })} />
          </Field>
          <Field label={t('mmoCore.fieldDisplayName')}>
            <input className={inputCls} value={s.display?.name || ''}
              onChange={e => set({ display: { ...s.display, name: e.target.value } })} />
          </Field>
        </div>
        <Field label={t('mmoCore.fieldDescLore')}>
          <ListEditor items={s.display?.lore} onChange={lore => set({ display: { ...s.display, lore } })} placeholder={t('mmoCore.placeholderDescLore')} />
        </Field>
        <Field label={t('mmoCore.fieldAttrLore')}>
          <ListEditor items={s.display?.attributeLore} onChange={attributeLore => set({ display: { ...s.display, attributeLore } })} placeholder={t('mmoCore.placeholderAttrLore')} />
        </Field>
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionClassIcon')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('mmoCore.fieldMaterial')}>
            <input className={`${inputCls} font-mono`} value={s.display?.itemMaterial || ''}
              onChange={e => set({ display: { ...s.display, itemMaterial: e.target.value.toUpperCase() } })} placeholder="BLAZE_POWDER" />
          </Field>
          <Field label={t('mmoCore.fieldCustomModel')}>
            <input className={inputCls} value={s.display?.itemCmd || ''}
              onChange={e => set({ display: { ...s.display, itemCmd: e.target.value } })} placeholder="10" />
          </Field>
          <Field label={t('mmoCore.fieldItemModel')}>
            <input className={inputCls} value={s.display?.itemModel || ''}
              onChange={e => set({ display: { ...s.display, itemModel: e.target.value } })} />
          </Field>
          <Field label={t('mmoCore.fieldSkullTexture')}>
            <input className={inputCls} value={s.display?.skullTexture || ''}
              onChange={e => set({ display: { ...s.display, skullTexture: e.target.value } })} />
          </Field>
        </div>
      </div>
    </div>
  )
}

function ProgressionTab({ t, s, set }) {
  const toggleOpt = (key) => set({ options: { ...s.options, [key]: !s.options?.[key] } })
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionLeveling')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('mmoCore.fieldMaxLevel')}>
            <input type="number" className={inputCls} value={s.maxLevel ?? 100}
              onChange={e => set({ maxLevel: Number(e.target.value) || 1 })} />
          </Field>
          <Field label={t('mmoCore.fieldExpCurve')}>
            <input className={`${inputCls} font-mono`} value={s.expCurve || ''}
              onChange={e => set({ expCurve: e.target.value })} placeholder="levels" />
          </Field>
          <Field label={t('mmoCore.fieldExpTable')}>
            <input className={`${inputCls} font-mono`} value={s.expTable || ''}
              onChange={e => set({ expTable: e.target.value })} placeholder="class_exp_table" />
          </Field>
        </div>
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionOptions')}</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {PROGRESSION_OPTS.map(([key, labelKey]) => (
            <button key={key} type="button" onClick={() => toggleOpt(key)}
              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                s.options?.[key] ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-white/[0.03] border-white/[0.08] text-white/40'
              }`}>{t(`mmoCore.${labelKey}`)}</button>
          ))}
        </div>
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionMana')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('mmoCore.fieldResourceName')}><input className={inputCls} value={s.mana?.name || ''} onChange={e => set({ mana: { ...s.mana, name: e.target.value } })} /></Field>
          <Field label={t('mmoCore.fieldBarChar')}><input className={inputCls} value={s.mana?.char || ''} onChange={e => set({ mana: { ...s.mana, char: e.target.value } })} /></Field>
          <Field label={t('mmoCore.fieldActionBarIcon')}><input className={inputCls} value={s.mana?.icon || ''} onChange={e => set({ mana: { ...s.mana, icon: e.target.value } })} placeholder="&9♦" /></Field>
          <Field label={t('mmoCore.fieldColorFull')}><input className={inputCls} value={s.mana?.colorFull || ''} onChange={e => set({ mana: { ...s.mana, colorFull: e.target.value.toUpperCase() } })} placeholder="DARK_BLUE" /></Field>
          <Field label={t('mmoCore.fieldColorHalf')}><input className={inputCls} value={s.mana?.colorHalf || ''} onChange={e => set({ mana: { ...s.mana, colorHalf: e.target.value.toUpperCase() } })} /></Field>
          <Field label={t('mmoCore.fieldColorEmpty')}><input className={inputCls} value={s.mana?.colorEmpty || ''} onChange={e => set({ mana: { ...s.mana, colorEmpty: e.target.value.toUpperCase() } })} /></Field>
        </div>
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionSubclasses')}</SectionTitle>
        <p className="text-[10px] text-white/30">{t('mmoCore.sectionSubclassesHint')}</p>
        {(s.subclasses || []).map(sub => (
          <div key={sub._id} className="grid grid-cols-[1fr_80px_auto] gap-2 items-end">
            <Field label={t('mmoCore.fieldSubclassId')}><input className={`${inputCls} font-mono`} value={sub.id} onChange={e => set({ subclasses: s.subclasses.map(x => x._id === sub._id ? { ...x, id: e.target.value.toUpperCase() } : x) })} /></Field>
            <Field label={t('mmoCore.fieldLevel')}><input type="number" className={inputCls} value={sub.level} onChange={e => set({ subclasses: s.subclasses.map(x => x._id === sub._id ? { ...x, level: Number(e.target.value) } : x) })} /></Field>
            <button type="button" onClick={() => set({ subclasses: s.subclasses.filter(x => x._id !== sub._id) })} className="p-2 text-red-400/60 mb-0.5"><TrashIcon className="w-4 h-4" /></button>
          </div>
        ))}
        <button type="button" onClick={() => set({ subclasses: [...(s.subclasses || []), { _id: uid(), id: 'SUBCLASS', level: 10 }] })}
          className={`${btnCls} self-start bg-orange-500/10 border-orange-500/20 text-orange-300`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('mmoCore.addSubclass')}
        </button>
        <Field label={t('mmoCore.fieldSkillTrees')}>
          <ListEditor items={s.skillTrees} onChange={skillTrees => set({ skillTrees })} placeholder={t('mmoCore.placeholderSkillTrees')} />
        </Field>
      </div>
    </div>
  )
}

const ALL_STATS_FROM_CATS = STAT_CATEGORIES.flatMap(c => c.stats)

function StatsTab({ t, s, set, statFilter, statCat, onStatCatChange }) {
  const filtered = useMemo(() => {
    const cat = statCat === 'all' ? null : STAT_CATEGORIES.find(c => c.id === statCat)
    const list = cat ? cat.stats : ALL_STATS_FROM_CATS
    const q = statFilter.trim().toLowerCase()
    if (!q) return list
    return list.filter(st => st.key.includes(q) || st.label.toLowerCase().includes(q))
  }, [statCat, statFilter])

  const toggleStat = (key) => {
    const stats = { ...s.stats }
    if (stats[key]) delete stats[key]
    else stats[key] = emptyScaled()
    set({ stats })
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] text-white/30">{t('mmoCore.statsHint')}</p>
      <div className="flex flex-wrap gap-1">
        <button type="button" onClick={() => onStatCatChange('all')}
          className={`px-2 py-1 rounded-lg border text-[10px] font-semibold ${statCat === 'all' ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'border-white/[0.08] text-white/40'}`}>{t('mmoCore.statCatAll')}</button>
        {STAT_CATEGORIES.map(c => (
          <button key={c.id} type="button" onClick={() => onStatCatChange(c.id)}
            className={`px-2 py-1 rounded-lg border text-[10px] font-semibold ${statCat === c.id ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'border-white/[0.08] text-white/40'}`}>{t(`mmoCore.${STAT_CAT_I18N[c.id]}`)}</button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map(st => {
          const active = !!s.stats?.[st.key]
          return (
            <div key={st.key}>
              <button type="button" onClick={() => toggleStat(st.key)}
                className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all ${
                  active ? 'border-orange-500/30 bg-orange-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}>
                <span className="text-[11px] font-mono text-white/75">{st.key}</span>
                <span className="text-[10px] text-white/35">{st.label}</span>
              </button>
              {active && (
                <div className="mt-1.5 ml-2">
                  <ScaledField t={t} label={st.key} value={s.stats[st.key]}
                    onChange={val => set({ stats: { ...s.stats, [st.key]: val } })} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SkillsTab({ t, s, set, skillSearch }) {
  const addSkill = (skillId) => {
    if (s.skills?.some(sk => sk.skillId === skillId)) return
    set({ skills: [...(s.skills || []), createSkillEntry(skillId)] })
  }

  const filteredSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase()
    if (!q) return BUILTIN_SKILLS
    return BUILTIN_SKILLS.filter(sk => sk.id.toLowerCase().includes(q) || sk.label.toLowerCase().includes(q))
  }, [skillSearch])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionTitle>{t('mmoCore.sectionClassSkills')}</SectionTitle>
        <button type="button" onClick={() => set({ skills: [...(s.skills || []), createSkillEntry('CUSTOM_SKILL')] })}
          className={`${btnCls} bg-orange-500/10 border-orange-500/20 text-orange-300`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('mmoCore.custom')}
        </button>
      </div>
      {(s.skills || []).map(sk => (
        <div key={sk._id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input className={`${inputCls} font-mono flex-1`} value={sk.skillId}
              onChange={e => set({ skills: s.skills.map(x => x._id === sk._id ? { ...x, skillId: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') } : x) })} />
            <button type="button" onClick={() => set({ skills: s.skills.filter(x => x._id !== sk._id) })} className="p-1.5 text-red-400/60"><TrashIcon className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Field label={t('mmoCore.fieldUnlockLevel')}><input type="number" className={inputCls} value={sk.level} onChange={e => set({ skills: s.skills.map(x => x._id === sk._id ? { ...x, level: Number(e.target.value) } : x) })} /></Field>
            <Field label={t('mmoCore.fieldMaxSkillLevel')}><input type="number" className={inputCls} value={sk.maxLevel} onChange={e => set({ skills: s.skills.map(x => x._id === sk._id ? { ...x, maxLevel: Number(e.target.value) } : x) })} /></Field>
            <CustomDropdown label={t('mmoCore.fieldTrigger')} value={sk.trigger || ''} onChange={v => set({ skills: s.skills.map(x => x._id === sk._id ? { ...x, trigger: v } : x) })} options={TRIGGERS} accent="orange" />
            {sk.trigger === 'TIMER' && (
              <Field label={t('mmoCore.fieldTimerSec')}><input className={inputCls} value={sk.timer} onChange={e => set({ skills: s.skills.map(x => x._id === sk._id ? { ...x, timer: e.target.value } : x) })} /></Field>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => set({ skills: s.skills.map(x => x._id === sk._id ? { ...x, unlockedByDefault: !x.unlockedByDefault } : x) })}
              className={`text-[10px] px-2 py-1 rounded border ${sk.unlockedByDefault ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10' : 'border-white/[0.08] text-white/40'}`}>
              {t('mmoCore.unlockedByDefault')}
            </button>
            <button type="button" onClick={() => set({ skills: s.skills.map(x => x._id === sk._id ? { ...x, needsBound: !x.needsBound } : x) })}
              className={`text-[10px] px-2 py-1 rounded border ${sk.needsBound ? 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10' : 'border-white/[0.08] text-white/40'}`}>
              {t('mmoCore.needsBound')}
            </button>
            <button type="button" onClick={() => set({ skills: s.skills.map(x => x._id === sk._id ? { ...x, modifiers: [...(x.modifiers || []), { key: 'damage', ...emptyScaled() }] } : x) })}
              className="text-[10px] px-2 py-1 rounded border border-white/[0.08] text-white/40">{t('mmoCore.addModifier')}</button>
          </div>
          {(sk.modifiers || []).map((m, mi) => (
            <div key={`${sk._id}_m_${mi}`} className="ml-2">
              <div className="flex gap-2 items-center mb-1">
                <input className={`${inputCls} font-mono text-xs flex-1`} value={m.key}
                  onChange={e => set({ skills: s.skills.map(x => x._id === sk._id ? { ...x, modifiers: x.modifiers.map((mod, idx) => idx === mi ? { ...mod, key: e.target.value } : mod) } : x) })} placeholder="damage" />
                <button type="button" onClick={() => set({ skills: s.skills.map(x => x._id === sk._id ? { ...x, modifiers: x.modifiers.filter((_, idx) => idx !== mi) } : x) })} className="text-red-400/60 p-1"><TrashIcon className="w-3.5 h-3.5" /></button>
              </div>
              <ScaledField t={t} label={m.key || 'modifier'} value={m}
                onChange={val => set({ skills: s.skills.map(x => x._id === sk._id ? { ...x, modifiers: x.modifiers.map((mod, idx) => idx === mi ? { ...mod, ...val } : mod) } : x) })} />
            </div>
          ))}
        </div>
      ))}
      <SectionTitle>{t('mmoCore.sectionBuiltinSkills')}</SectionTitle>
      <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto custom-dropdown-scroll pr-0.5">
        {filteredSkills.map(sk => {
          const has = s.skills?.some(x => x.skillId === sk.id)
          return (
            <button key={sk.id} type="button" disabled={has} onClick={() => addSkill(sk.id)}
              className={`flex items-center justify-between rounded-lg border px-3 py-1.5 text-left text-[11px] ${
                has ? 'opacity-50 border-emerald-500/20' : 'border-white/[0.06] hover:bg-orange-500/10'
              }`}>
              <span className="font-mono text-white/75">{sk.id}</span>
              <span className="text-white/35">{sk.label}{sk.passive ? t('mmoCore.passiveSuffix') : ''}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SlotsTab({ t, s, set }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionTitle>{t('mmoCore.sectionSkillSlots')}</SectionTitle>
        <button type="button" onClick={() => set({ skillSlots: [...(s.skillSlots || []), createSkillSlot(String((s.skillSlots?.length || 0) + 1))] })}
          className={`${btnCls} bg-orange-500/10 border-orange-500/20 text-orange-300`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('mmoCore.addSlot')}
        </button>
      </div>
      {(s.skillSlots || []).length === 0 && <p className="text-[11px] text-white/25 text-center py-4">{t('mmoCore.noCustomSlots')}</p>}
      {(s.skillSlots || []).map(slot => (
        <div key={slot._id} className="rounded-xl border border-white/[0.06] p-3 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label={t('mmoCore.fieldSlotId')}><input className={inputCls} value={slot.slotId} onChange={e => set({ skillSlots: s.skillSlots.map(x => x._id === slot._id ? { ...x, slotId: e.target.value } : x) })} /></Field>
            <Field label={t('mmoCore.fieldMaterial')}><input className={`${inputCls} font-mono`} value={slot.material} onChange={e => set({ skillSlots: s.skillSlots.map(x => x._id === slot._id ? { ...x, material: e.target.value.toUpperCase() } : x) })} /></Field>
            <Field label={t('mmoCore.fieldName')}><input className={inputCls} value={slot.name} onChange={e => set({ skillSlots: s.skillSlots.map(x => x._id === slot._id ? { ...x, name: e.target.value } : x) })} /></Field>
            <Field label={t('mmoCore.fieldFormula')}><input className={`${inputCls} font-mono text-xs`} value={slot.formula} onChange={e => set({ skillSlots: s.skillSlots.map(x => x._id === slot._id ? { ...x, formula: e.target.value } : x) })} placeholder="<PASSIVE>" /></Field>
          </div>
          <Field label={t('mmoCore.fieldLore')}><ListEditor items={slot.lore} onChange={lore => set({ skillSlots: s.skillSlots.map(x => x._id === slot._id ? { ...x, lore } : x) })} /></Field>
          <button type="button" onClick={() => set({ skillSlots: s.skillSlots.filter(x => x._id !== slot._id) })} className={`${btnCls} self-start border-red-500/20 text-red-300 bg-red-500/5`}><TrashIcon className="w-3.5 h-3.5" />{t('mmoCore.remove')}</button>
        </div>
      ))}
    </div>
  )
}

function AdvancedTab({ t, s, set }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionCastParticle')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <CustomDropdown label={t('mmoCore.fieldParticle')} value={s.castParticle?.particle || ''} onChange={v => set({ castParticle: { ...s.castParticle, particle: v } })} options={PARTICLES.map(p => ({ value: p, label: p }))} searchable accent="orange" />
          <Field label={t('mmoCore.fieldBlockMaterial')}><input className={inputCls} value={s.castParticle?.material || ''} onChange={e => set({ castParticle: { ...s.castParticle, material: e.target.value.toUpperCase() } })} /></Field>
          <Field label={t('mmoCore.fieldColorR')}><input className={inputCls} value={s.castParticle?.colorR ?? ''} onChange={e => set({ castParticle: { ...s.castParticle, colorR: e.target.value } })} /></Field>
          <Field label={t('mmoCore.fieldColorG')}><input className={inputCls} value={s.castParticle?.colorG ?? ''} onChange={e => set({ castParticle: { ...s.castParticle, colorG: e.target.value } })} /></Field>
          <Field label={t('mmoCore.fieldColorB')}><input className={inputCls} value={s.castParticle?.colorB ?? ''} onChange={e => set({ castParticle: { ...s.castParticle, colorB: e.target.value } })} /></Field>
        </div>
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionResourceRegen')}</SectionTitle>
        <textarea value={s.resourceYaml || ''} onChange={e => set({ resourceYaml: e.target.value })} rows={6} spellCheck={false}
          className={`${inputCls} font-mono text-xs resize-y`} placeholder={'resource:\n  health:\n    type: MAX'} />
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionClassScripts')}</SectionTitle>
        <textarea value={s.scriptsYaml || ''} onChange={e => set({ scriptsYaml: e.target.value })} rows={6} spellCheck={false}
          className={`${inputCls} font-mono text-xs resize-y`} placeholder={'scripts:\n  ATTACK:\n    mechanics: ...'} />
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionExtraYaml')}</SectionTitle>
        <textarea value={s.extraYaml || ''} onChange={e => set({ extraYaml: e.target.value })} rows={4} spellCheck={false}
          className={`${inputCls} font-mono text-xs resize-y`} />
      </div>
    </div>
  )
}

function ProfessionBasicTab({ t, s, set }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionProfessionIdentity')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('mmoCore.fieldFileId')}><input className={`${inputCls} font-mono`} value={s.fileId} onChange={e => set({ fileId: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })} /></Field>
          <Field label={t('mmoCore.fieldDisplayName')}><input className={inputCls} value={s.name} onChange={e => set({ name: e.target.value })} /></Field>
          <Field label={t('mmoCore.fieldMaxLevel')}><input type="number" className={inputCls} value={s.maxLevel} onChange={e => set({ maxLevel: Number(e.target.value) })} /></Field>
          <Field label={t('mmoCore.fieldExpCurve')}><input className={`${inputCls} font-mono`} value={s.expCurve} onChange={e => set({ expCurve: e.target.value })} /></Field>
          <Field label={t('mmoCore.fieldExpTable')}><input className={`${inputCls} font-mono`} value={s.expTable} onChange={e => set({ expTable: e.target.value })} /></Field>
        </div>
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoCore.sectionClassExpReward')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('mmoCore.fieldBase')}><input className={inputCls} value={s.classExp?.base ?? ''} onChange={e => set({ classExp: { ...s.classExp, base: e.target.value } })} /></Field>
          <Field label={t('mmoCore.fieldPerProfLevel')}><input className={inputCls} value={s.classExp?.perLevel ?? ''} onChange={e => set({ classExp: { ...s.classExp, perLevel: e.target.value } })} /></Field>
        </div>
      </div>
    </div>
  )
}

function ProfessionExpTab({ t, s, set }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionTitle>{t('mmoCore.sectionExpSources')}</SectionTitle>
        <button type="button" onClick={() => set({ expSources: [...(s.expSources || []), 'mineblock{type=STONE;amount=1}'] })}
          className={`${btnCls} bg-orange-500/10 border-orange-500/20 text-orange-300`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('mmoCore.add')}
        </button>
      </div>
      <p className="text-[10px] text-white/30">{t('mmoCore.sectionExpSourcesHint')}</p>
      {(s.expSources || []).map((src, i) => (
        <div key={i} className="flex gap-2">
          <input className={`${inputCls} font-mono text-xs flex-1`} value={src}
            onChange={e => set({ expSources: s.expSources.map((x, idx) => idx === i ? e.target.value : x) })} />
          <button type="button" onClick={() => set({ expSources: s.expSources.filter((_, idx) => idx !== i) })} className="p-2 text-red-400/60"><TrashIcon className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <SectionTitle>{t('mmoCore.sectionPresets')}</SectionTitle>
      <div className="flex flex-col gap-1">
        {EXP_SOURCE_PRESETS.map(p => (
          <button key={p.value} type="button" onClick={() => {
            if (s.expSources?.includes(p.value)) return
            set({ expSources: [...(s.expSources || []), p.value] })
          }}
            className="text-left rounded-lg border border-white/[0.06] px-3 py-2 hover:bg-orange-500/10 transition-all">
            <span className="text-[11px] text-white/70">{p.label}</span>
            <p className="text-[9px] font-mono text-white/30 truncate mt-0.5">{p.value}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MMOCoreTool({ onBack }) {
  const { t } = useI18n()
  const [mode, setMode] = useState('class')
  const [classes, setClasses] = useState(() => [presetToClass(CLASS_PRESETS[0])])
  const [professions, setProfessions] = useState(() => [presetToProfession(PROFESSION_PRESETS[0])])
  const [activeClassId, setActiveClassId] = useState(() => classes[0]?._id)
  const [activeProfId, setActiveProfId] = useState(() => professions[0]?._id)
  const [tab, setTab] = useState('display')
  const [copied, setCopied] = useState(false)
  const [statFilter, setStatFilter] = useState('')
  const [statCat, setStatCat] = useState('all')
  const [skillSearch, setSkillSearch] = useState('')
  const [yamlView, setYamlView] = useState('active')

  const entries = mode === 'class' ? classes : professions
  const activeId = mode === 'class' ? activeClassId : activeProfId
  const setActiveId = mode === 'class' ? setActiveClassId : setActiveProfId
  const setEntries = mode === 'class' ? setClasses : setProfessions

  const active = useMemo(() => entries.find(e => e._id === activeId) ?? entries[0], [entries, activeId])

  const set = useCallback((patch) => {
    setEntries(prev => prev.map(e => (e._id === activeId ? { ...e, ...patch } : e)))
  }, [activeId, setEntries])

  const yaml = useMemo(() => {
    if (yamlView === 'all') return buildProjectYaml(mode, entries, activeId)
    if (mode === 'class' && active) return buildClassYaml(active)
    if (mode === 'profession' && active) return buildProfessionYaml(active)
    return ''
  }, [mode, entries, activeId, active, yamlView])

  const copyYaml = useCallback(() => {
    navigator.clipboard.writeText(yaml).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [yaml])

  const addEntry = useCallback(() => {
    const e = mode === 'class'
      ? createClassState({ fileId: `class${classes.length + 1}`, display: { name: `Class ${classes.length + 1}`, lore: [], attributeLore: [], itemMaterial: 'PAPER' } })
      : createProfessionState({ fileId: `prof${professions.length + 1}`, name: `Profession ${professions.length + 1}` })
    setEntries(prev => [...prev, e])
    setActiveId(e._id)
  }, [mode, classes.length, professions.length, setEntries, setActiveId])

  const deleteEntry = useCallback((id) => {
    setEntries(prev => {
      const next = prev.filter(e => e._id !== id)
      if (activeId === id && next.length) setActiveId(next[0]._id)
      return next.length ? next : [mode === 'class' ? createClassState() : createProfessionState()]
    })
  }, [activeId, mode, setEntries, setActiveId])

  const duplicateEntry = useCallback((id) => {
    setEntries(prev => {
      const src = prev.find(e => e._id === id)
      if (!src) return prev
      const copy = { ...JSON.parse(JSON.stringify(src)), _id: uid(), fileId: `${src.fileId}_copy` }
      setActiveId(copy._id)
      return [...prev, copy]
    })
  }, [setEntries, setActiveId])

  const applyPreset = useCallback((presetId) => {
    if (mode === 'class') {
      const p = CLASS_PRESETS.find(x => x.id === presetId)
      if (p) { const c = presetToClass(p); setClasses([c]); setActiveClassId(c._id) }
    } else {
      const p = PROFESSION_PRESETS.find(x => x.id === presetId)
      if (p) { const pr = presetToProfession(p); setProfessions([pr]); setActiveProfId(pr._id) }
    }
    setTab(mode === 'class' ? 'display' : 'basic')
  }, [mode])

  const handleModeChange = (m) => {
    setMode(m)
    setTab(m === 'class' ? 'display' : 'basic')
  }

  const saveName = mode === 'class' && active ? getClassFileName(active) : active ? getProfessionFileName(active) : 'export.yml'
  const folder = mode === 'class' ? t('mmoCore.folderClass') : t('mmoCore.folderProfession')

  const modeOptions = useMemo(() => [
    { value: 'class', label: t('mmoCore.modeClasses') },
    { value: 'profession', label: t('mmoCore.modeProfessions') },
  ], [t])

  const presetOptions = useMemo(() => (
    (mode === 'class' ? CLASS_PRESETS : PROFESSION_PRESETS).map(p => ({
      value: p.id,
      label: t(`mmoCore.${presetI18nKey(p.id)}`),
    }))
  ), [mode, t])

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white">{t('mmoCore.title')}</h1>
          <p className="text-xs text-white/35 mt-0.5">{t('mmoCore.subtitle')}</p>
        </div>
        <CustomDropdown label="" value={mode} onChange={handleModeChange} options={modeOptions} accent="orange" className="w-32" />
        <CustomDropdown label="" value="" onChange={applyPreset}
          options={presetOptions}
          placeholder={t('mmoCore.loadPreset')} accent="orange" className="w-36" />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_280px] gap-3 flex-1 min-h-0 xl:items-stretch">
          <div className="min-h-0 flex flex-col overflow-hidden">
          <ConfigList t={t} mode={mode} entries={entries} activeId={activeId} onSelect={setActiveId}
            onDelete={deleteEntry} onAdd={addEntry} onDuplicate={duplicateEntry} />
          </div>

          <div className={`${sectionCls} min-h-0 overflow-hidden flex flex-col`}>
            {active && mode === 'class' && (
              <>
                <div className="flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
                  <SectionTitle>{active.display?.name || active.fileId}</SectionTitle>
                  <div className="flex gap-1 flex-wrap">
                    {CLASS_TAB_DEFS.map(tabDef => (
                      <button key={tabDef.id} type="button" onClick={() => setTab(tabDef.id)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${
                          tab === tabDef.id ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-white/[0.03] border-white/[0.08] text-white/40'
                        }`}>{t(`mmoCore.${tabDef.labelKey}`)}</button>
                    ))}
                  </div>
                </div>
                {(tab === 'stats' || tab === 'skills') && (
                  <div className="relative flex-shrink-0">
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input className={`${inputCls} pl-8 text-xs`} value={tab === 'stats' ? statFilter : skillSearch}
                      onChange={e => (tab === 'stats' ? setStatFilter(e.target.value) : setSkillSearch(e.target.value))}
                      placeholder={tab === 'stats' ? t('mmoCore.searchStats') : t('mmoCore.searchSkills')} />
                  </div>
                )}
                <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
                  {tab === 'display' && <DisplayTab t={t} s={active} set={set} />}
                  {tab === 'progression' && <ProgressionTab t={t} s={active} set={set} />}
                  {tab === 'stats' && <StatsTab t={t} s={active} set={set} statFilter={statFilter} statCat={statCat} onStatCatChange={setStatCat} />}
                  {tab === 'skills' && <SkillsTab t={t} s={active} set={set} skillSearch={skillSearch} />}
                  {tab === 'slots' && <SlotsTab t={t} s={active} set={set} />}
                  {tab === 'advanced' && <AdvancedTab t={t} s={active} set={set} />}
                </div>
              </>
            )}
            {active && mode === 'profession' && (
              <>
                <div className="flex gap-1 flex-shrink-0">
                  {PROF_TAB_DEFS.map(tabDef => (
                    <button key={tabDef.id} type="button" onClick={() => setTab(tabDef.id)}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold ${
                        tab === tabDef.id ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-white/[0.03] border-white/[0.08] text-white/40'
                      }`}>{t(`mmoCore.${tabDef.labelKey}`)}</button>
                  ))}
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
                  {tab === 'basic' && <ProfessionBasicTab t={t} s={active} set={set} />}
                  {tab === 'exp' && <ProfessionExpTab t={t} s={active} set={set} />}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 min-h-0 overflow-hidden flex-1">
            {mode === 'class' && active && <ClassPreview t={t} cls={active} />}
            <div className={`${sectionCls} flex-1 min-h-0 overflow-hidden flex flex-col`}>
              <div className="flex items-center justify-between gap-2 flex-shrink-0">
                <div>
                  <SectionTitle>{t('mmoCore.yamlOutput')}</SectionTitle>
                  <p className="text-[10px] font-mono text-white/25 mt-0.5">{folder}{yamlView === 'active' ? saveName : 'project.yml'}</p>
                </div>
                <div className="flex gap-1.5">
                  <button type="button" onClick={copyYaml} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/60`}>
                    {copied ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                    {copied ? t('mmoCore.copied') : t('mmoCore.copy')}
                  </button>
                  <button type="button" onClick={() => downloadYaml(yaml, yamlView === 'active' ? saveName : 'mmocore-export.yml')}
                    className={`${btnCls} bg-orange-500/10 border-orange-500/20 text-orange-300`}>
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('mmoCore.save')}
                  </button>
                </div>
              </div>
              <CustomDropdown label={t('mmoCore.yamlView')} value={yamlView} onChange={setYamlView}
                options={[{ value: 'active', label: t('mmoCore.yamlActive') }, { value: 'all', label: t('mmoCore.yamlAll') }]} accent="orange" />
              <pre className="flex-1 min-h-0 overflow-auto p-3 rounded-xl bg-[#0d0d1a] border border-white/[0.04] text-[10px] font-mono text-orange-200/75 leading-relaxed whitespace-pre-wrap custom-dropdown-scroll">{yaml}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
