import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  PlusIcon, TrashIcon, MagnifyingGlassIcon, ArrowPathIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import {
  ITEM_TYPES, TYPE_TO_FILE, TIERS, MATERIALS, NUMERIC_STATS, BOOLEAN_STATS,
  STAT_CATEGORIES, ABILITY_MODES, COMMON_ABILITIES, ELEMENTS, ENCHANTMENTS,
  POTION_EFFECTS, PARTICLE_TYPES, ITEM_PRESETS, createItemState,
  emptyScaled, emptyAbility, emptyElement, emptyModifier, emptyCommand,
} from './mmoItemsData'
import { buildFileYaml, buildProjectYaml, getItemFileKey, downloadYaml } from './mmoItemsYaml'
import { useI18n } from '../../../context/I18nContext'

const TAB_DEFS = [
  { id: 'basic', labelKey: 'tabBasic' },
  { id: 'stats', labelKey: 'tabStats' },
  { id: 'flags', labelKey: 'tabFlags' },
  { id: 'enchants', labelKey: 'tabEnchants' },
  { id: 'elements', labelKey: 'tabElements' },
  { id: 'abilities', labelKey: 'tabAbilities' },
  { id: 'modifiers', labelKey: 'tabModifiers' },
  { id: 'consumable', labelKey: 'tabEffects' },
  { id: 'particles', labelKey: 'tabParticles' },
  { id: 'upgrade', labelKey: 'tabUpgrade' },
  { id: 'advanced', labelKey: 'tabAdvanced' },
]

const PRESET_I18N_KEYS = ['presetIronSword', 'presetEpicBow', 'presetHealthPotion']

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-indigo-500/30 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3'
const sectionHead = 'text-[10px] text-white/30 uppercase tracking-widest font-semibold'

const MC_COLORS = {
  '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
  '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
  '8': '#555555', '9': '#5555FF', a: '#55FF55', b: '#55FFFF',
  c: '#FF5555', d: '#FF55FF', e: '#FFFF55', f: '#FFFFFF',
}

function parseMcText(text) {
  if (!text) return [{ t: '', c: '#FFFFFF' }]
  const parts = []
  let color = '#FFFFFF'
  let bold = false
  let i = 0
  while (i < text.length) {
    if (text[i] === '&' && i + 1 < text.length) {
      const code = text[i + 1].toLowerCase()
      if (code === 'l') bold = true
      else if (code === 'r') { color = '#FFFFFF'; bold = false }
      else if (MC_COLORS[code]) { color = MC_COLORS[code]; bold = false }
      i += 2
      continue
    }
    let j = i
    while (j < text.length && !(text[j] === '&' && j + 1 < text.length)) j++
    if (j > i) parts.push({ t: text.slice(i, j), c: color, b: bold })
    i = j
  }
  return parts.length ? parts : [{ t: text, c: '#FFFFFF' }]
}

function McText({ text, className = '' }) {
  const parts = parseMcText(text)
  return (
    <span className={className}>
      {parts.map((p, i) => (
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

function ItemList({ t, items, activeId, duplicateIds, onSelect, onDelete, onAdd, onDuplicate }) {
  const countLabel = items.length === 1
    ? t('mmoItems.itemsInProject', { count: items.length })
    : t('mmoItems.itemsInProject_plural', { count: items.length })
  return (
    <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3 h-full min-h-[200px]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <SectionTitle>{t('mmoItems.itemList')}</SectionTitle>
          <p className="text-[10px] text-white/25 mt-0.5">{countLabel}</p>
        </div>
        <button onClick={onAdd} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('mmoItems.new')}
        </button>
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
        {items.map(item => {
          const active = item._id === activeId
          const dup = duplicateIds.has(item.itemId)
          const file = getItemFileKey(item)
          return (
            <div key={item._id}
              className={`group flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                active ? 'border-indigo-500/35 bg-indigo-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
              }`}>
              <button type="button" onClick={() => onSelect(item._id)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-mono font-semibold text-white/85 truncate">{item.itemId}</span>
                  {dup && <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-300 flex-shrink-0">{t('mmoItems.dup')}</span>}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/35">
                  <McText text={item.name || item.itemId} className="truncate flex-1" />
                </div>
                <div className="flex gap-1.5 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-white/40 font-mono">{item.itemType}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300/70 font-mono">{file}.yml</span>
                </div>
              </button>
              <div className="flex flex-col gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => onDuplicate(item._id)} title={t('mmoItems.duplicate')}
                  className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all">
                  <PlusIcon className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => onDelete(item._id)} disabled={items.length <= 1} title={t('mmoItems.delete')}
                  className="p-1.5 rounded-lg border border-red-500/15 bg-red-500/5 text-red-400/70 hover:text-red-300 hover:bg-red-500/15 transition-all disabled:opacity-25 disabled:cursor-not-allowed">
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
function ItemPreview({ t, s }) {
  const statCount = Object.keys(s.numericStats || {}).length
  const flagCount = Object.keys(s.booleanStats || {}).length
  const targetFile = TYPE_TO_FILE[s.itemType] || 'sword'

  return (
    <div className="rounded-2xl bg-black/40 border border-white/[0.06] p-4 h-full min-h-[200px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">{t('mmoItems.itemPreview')}</p>
          <p className="text-[10px] text-white/25">{t('mmoItems.liveTooltip')}</p>
        </div>
        <span className="text-[10px] font-mono text-indigo-300/70 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
          {targetFile}.yml
        </span>
      </div>
      <div className="flex gap-4 items-start bg-[#0d0d1a] rounded-xl border border-white/[0.04] p-4 flex-1 min-h-[120px]">
        <div className="w-12 h-12 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] font-mono text-white/30 text-center leading-tight px-0.5">
            {s.material?.slice(0, 4)}
          </span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <McText text={s.name || s.itemId} className="text-sm font-semibold leading-snug" />
          {s.tier && <span className="text-[10px] text-amber-400/80 font-semibold">{s.tier}</span>}
          {s.lore.filter(Boolean).map((line, i) => (
            <McText key={i} text={line} className="text-[11px] leading-relaxed" />
          ))}
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/[0.05]">
            {statCount > 0 && <Badge>{t('mmoItems.badgeStats', { count: statCount })}</Badge>}
            {flagCount > 0 && <Badge>{t('mmoItems.badgeFlags', { count: flagCount })}</Badge>}
            {s.enchants.length > 0 && <Badge>{t('mmoItems.badgeEnchants', { count: s.enchants.length })}</Badge>}
            {s.abilities.length > 0 && <Badge>{t('mmoItems.badgeAbilities', { count: s.abilities.length })}</Badge>}
            {s.elements.length > 0 && <Badge>{t('mmoItems.badgeElements', { count: s.elements.length })}</Badge>}
            {s.gemSockets.length > 0 && <Badge>{t('mmoItems.badgeSockets', { count: s.gemSockets.length })}</Badge>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ children }) {
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300/80 font-semibold">
      {children}
    </span>
  )
}

function ScaledEditor({ t, value, onChange, compact }) {
  const v = value || emptyScaled()
  const set = (k, val) => onChange({ ...v, [k]: val })
  if (compact) {
    return (
      <div className="grid grid-cols-4 gap-1.5">
        {['base', 'scale', 'spread', 'maxSpread'].map(k => (
          <input key={k} value={v[k]} onChange={e => set(k, e.target.value)} placeholder={k === 'maxSpread' ? t('mmoItems.scaledMax') : k}
            className="bg-white/[0.04] border border-white/[0.07] rounded px-2 py-1 text-[11px] font-mono text-white/70 outline-none focus:border-indigo-500/30" />
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Field label={t('mmoItems.fieldBase')}><input value={v.base} onChange={e => set('base', e.target.value)} className={inputCls} placeholder="10" /></Field>
      <Field label={t('mmoItems.fieldScale')}><input value={v.scale} onChange={e => set('scale', e.target.value)} className={inputCls} placeholder="1" /></Field>
      <Field label={t('mmoItems.fieldSpread')}><input value={v.spread} onChange={e => set('spread', e.target.value)} className={inputCls} placeholder="0.1" /></Field>
      <Field label={t('mmoItems.fieldMaxSpread')}><input value={v.maxSpread} onChange={e => set('maxSpread', e.target.value)} className={inputCls} placeholder="0.3" /></Field>
    </div>
  )
}

function ListEditor({ items, onChange, placeholder }) {
  const text = items.join('\n')
  return (
    <textarea value={text} onChange={e => onChange(e.target.value.split('\n'))} rows={4} spellCheck={false}
      placeholder={placeholder}
      className={`${inputCls} font-mono text-xs resize-y leading-relaxed`} />
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-semibold border transition-all ${
        active
          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.12)]'
          : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.05]'
      }`}>{children}</button>
  )
}

function BasicTab({ t, s, set }) {
  const targetFile = TYPE_TO_FILE[s.itemType] || 'sword'
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <SectionTitle>{t('mmoItems.sectionIdentity')}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t('mmoItems.fieldItemId')}>
            <input value={s.itemId} onChange={e => set({ itemId: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })} className={`${inputCls} font-mono`} />
          </Field>
          <CustomDropdown label={t('mmoItems.fieldItemType')} value={s.itemType} onChange={v => set({ itemType: v })} options={ITEM_TYPES} searchable accent="indigo" menuMinWidth={200} />
          <Field label={t('mmoItems.fieldMaterial')}>
            <input list="mmo-materials" value={s.material} onChange={e => set({ material: e.target.value.toUpperCase() })} className={`${inputCls} font-mono`} />
            <datalist id="mmo-materials">{MATERIALS.map(m => <option key={m} value={m} />)}</datalist>
          </Field>
          <CustomDropdown label={t('mmoItems.fieldTier')} value={s.tier} onChange={v => set({ tier: v })} options={TIERS.map(tier => ({ value: tier, label: tier || t('mmoItems.tierNone') }))} accent="indigo" />
        </div>
        <p className="text-[10px] text-white/25">{t('mmoItems.saveTo')} <span className="font-mono text-indigo-300/80">plugins/MMOItems/item/{targetFile}.yml</span></p>
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoItems.sectionDisplay')}</SectionTitle>
        <Field label={t('mmoItems.fieldName')}><input value={s.name} onChange={e => set({ name: e.target.value })} className={inputCls} placeholder="&fMy Sword" /></Field>
        <Field label={t('mmoItems.fieldLore')}><ListEditor items={s.lore} onChange={lore => set({ lore })} placeholder={t('mmoItems.placeholderLore')} /></Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t('mmoItems.fieldCustomModel')}><input value={s.numericStats['custom-model-data']?.base ?? ''} onChange={e => set({ numericStats: { ...s.numericStats, 'custom-model-data': { ...emptyScaled(), base: e.target.value } } })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldItemModel')}><input value={s.itemModel} onChange={e => set({ itemModel: e.target.value })} className={inputCls} placeholder="minecraft:diamond_sword" /></Field>
          <Field label={t('mmoItems.fieldSkullTexture')}><input value={s.skullTexture} onChange={e => set({ skullTexture: e.target.value })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldTooltipId')}><input value={s.tooltip} onChange={e => set({ tooltip: e.target.value })} className={inputCls} placeholder="COMMON" /></Field>
          <Field label={t('mmoItems.fieldLoreFormat')}><input value={s.loreFormat} onChange={e => set({ loreFormat: e.target.value })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldItemSet')}><input value={s.itemSet} onChange={e => set({ itemSet: e.target.value })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldRevisionId')}><input value={s.revisionId} onChange={e => set({ revisionId: e.target.value })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldDyeColor')}><input value={s.dyeColor} onChange={e => set({ dyeColor: e.target.value })} className={inputCls} placeholder="100 100 100" /></Field>
          <Field label={t('mmoItems.fieldTrimMaterial')}><input value={s.trimMaterial} onChange={e => set({ trimMaterial: e.target.value })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldTrimPattern')}><input value={s.trimPattern} onChange={e => set({ trimPattern: e.target.value })} className={inputCls} /></Field>
        </div>
        <Field label={t('mmoItems.fieldRequiredClass')}><ListEditor items={s.requiredClass} onChange={requiredClass => set({ requiredClass })} placeholder={t('mmoItems.placeholderWarrior')} /></Field>
        <Field label={t('mmoItems.fieldPermission')}><ListEditor items={s.permission} onChange={permission => set({ permission })} /></Field>
      </div>
    </div>
  )
}

function StatsTab({ t, s, set, statFilter, setStatFilter, statCat, setStatCat }) {
  const filtered = NUMERIC_STATS.filter(st => {
    if (statCat !== 'all' && st.cat !== statCat) return false
    if (statFilter && !st.label.toLowerCase().includes(statFilter.toLowerCase()) && !st.key.includes(statFilter.toLowerCase())) return false
    return true
  })

  function toggleStat(key) {
    const next = { ...s.numericStats }
    if (next[key]) delete next[key]
    else next[key] = emptyScaled()
    set({ numericStats: next })
  }

  function updateStat(key, val) {
    set({ numericStats: { ...s.numericStats, [key]: val } })
  }

  return (
    <div className={sectionCls}>
      <SectionTitle>{t('mmoItems.sectionNumeric')}</SectionTitle>
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[140px]">
          <MagnifyingGlassIcon className="w-3.5 h-3.5 text-white/25 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input value={statFilter} onChange={e => setStatFilter(e.target.value)} placeholder={t('mmoItems.searchStats')}
            className={`${inputCls} pl-8 text-xs`} />
        </div>
        <div className="w-44">
          <CustomDropdown
            value={statCat}
            onChange={setStatCat}
            options={[
              { value: 'all', label: t('mmoItems.allCategories') },
              ...STAT_CATEGORIES.map(c => ({ value: c.id, label: t(`mmoItems.statCat.${c.id}`) })),
            ]}
            accent="indigo"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1 custom-dropdown-scroll">
        {filtered.map(st => {
          const active = !!s.numericStats[st.key]
          return (
            <div key={st.key} className={`rounded-xl border p-3 transition-all ${active ? 'border-indigo-500/25 bg-indigo-500/5' : 'border-white/[0.06] bg-white/[0.02]'}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs font-semibold text-white/80">{st.label}</span>
                  <span className="text-[10px] font-mono text-white/25 ml-2">{st.key}</span>
                </div>
                <button onClick={() => toggleStat(st.key)} className={`${btnCls} ${active ? 'bg-red-500/15 border-red-500/25 text-red-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'}`}>
                  {active ? <><TrashIcon className="w-3 h-3" />{t('mmoItems.remove')}</> : <><PlusIcon className="w-3 h-3" />{t('mmoItems.add')}</>}
                </button>
              </div>
              {active && <ScaledEditor t={t} value={s.numericStats[st.key]} onChange={v => updateStat(st.key, v)} compact />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FlagsTab({ t, s, set }) {
  function toggle(key) {
    const next = { ...s.booleanStats }
    next[key] = !next[key]
    if (!next[key]) delete next[key]
    set({ booleanStats: next })
  }
  return (
    <div className={sectionCls}>
      <SectionTitle>{t('mmoItems.sectionBoolean')}</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {BOOLEAN_STATS.map(st => (
          <button key={st.key} onClick={() => toggle(st.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-[11px] transition-all ${
              s.booleanStats[st.key] ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200' : 'bg-white/[0.03] border-white/[0.06] text-white/45 hover:text-white/70 hover:bg-white/[0.05]'
            }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.booleanStats[st.key] ? 'bg-indigo-400' : 'bg-white/15'}`} />
            <span>{st.label}</span>
            <span className="font-mono text-[9px] text-white/20 ml-auto">{st.key}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function EnchantsTab({ t, s, set }) {
  function add() { set({ enchants: [...s.enchants, { name: 'sharpness', base: '1', scale: '', level: '1' }] }) }
  function remove(i) { set({ enchants: s.enchants.filter((_, idx) => idx !== i) }) }
  function update(i, patch) { set({ enchants: s.enchants.map((e, idx) => idx === i ? { ...e, ...patch } : e) }) }
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <SectionTitle>{t('mmoItems.sectionEnchants')}</SectionTitle>
          <button onClick={add} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}><PlusIcon className="w-3 h-3" />{t('mmoItems.add')}</button>
        </div>
        {s.enchants.map((e, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-end p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex-1 min-w-[120px]">
              <label className={labelCls}>{t('mmoItems.fieldEnchant')}</label>
              <input list="mmo-enchants" value={e.name} onChange={ev => update(i, { name: ev.target.value.toLowerCase() })} className={inputCls} />
            </div>
            <div className="w-20"><label className={labelCls}>{t('mmoItems.fieldLevel')}</label><input value={e.base} onChange={ev => update(i, { base: ev.target.value })} className={inputCls} /></div>
            <div className="w-20"><label className={labelCls}>{t('mmoItems.fieldScale')}</label><input value={e.scale} onChange={ev => update(i, { scale: ev.target.value })} className={inputCls} placeholder={t('mmoItems.placeholderOpt')} /></div>
            <button onClick={() => remove(i)} className={`${btnCls} bg-red-500/10 border-red-500/20 text-red-300 mb-0.5`}><TrashIcon className="w-3 h-3" /></button>
          </div>
        ))}
        <datalist id="mmo-enchants">{ENCHANTMENTS.map(en => <option key={en} value={en} />)}</datalist>
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoItems.sectionGemSockets')}</SectionTitle>
        <Field label={t('mmoItems.fieldSocketColors')}><ListEditor items={s.gemSockets} onChange={gemSockets => set({ gemSockets })} placeholder={t('mmoItems.placeholderSocket')} /></Field>
      </div>
    </div>
  )
}

function ElementsTab({ t, s, set }) {
  function add() { set({ elements: [...s.elements, { ...emptyElement('fire'), simpleDamage: '', simpleDefense: '' }] }) }
  function remove(i) { set({ elements: s.elements.filter((_, idx) => idx !== i) }) }
  function update(i, patch) { set({ elements: s.elements.map((el, idx) => idx === i ? { ...el, ...patch } : el) }) }
  return (
    <div className={sectionCls}>
      <div className="flex items-center justify-between">
        <SectionTitle>{t('mmoItems.sectionElements')}</SectionTitle>
        <button onClick={add} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}><PlusIcon className="w-3 h-3" />{t('mmoItems.add')}</button>
      </div>
      {s.elements.map((el, i) => (
        <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-2">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <CustomDropdown label={t('mmoItems.fieldElement')} value={el.element} onChange={v => update(i, { element: v })} options={ELEMENTS} accent="indigo" />
            </div>
            <button onClick={() => remove(i)} className={`${btnCls} bg-red-500/10 border-red-500/20 text-red-300`}><TrashIcon className="w-3 h-3" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t('mmoItems.fieldSimpleDamage')}><input value={el.simpleDamage ?? ''} onChange={e => update(i, { simpleDamage: e.target.value })} className={inputCls} /></Field>
            <Field label={t('mmoItems.fieldSimpleDefense')}><input value={el.simpleDefense ?? ''} onChange={e => update(i, { simpleDefense: e.target.value })} className={inputCls} /></Field>
          </div>
          <ScaledEditor t={t} value={el.damage} onChange={damage => update(i, { damage })} compact />
          <ScaledEditor t={t} value={el.defense} onChange={defense => update(i, { defense })} compact />
        </div>
      ))}
    </div>
  )
}

function AbilitiesTab({ t, s, set }) {
  function add() {
    const n = s.abilities.length + 1
    set({ abilities: [...s.abilities, emptyAbility(`ability${n}`)] })
  }
  function remove(i) { set({ abilities: s.abilities.filter((_, idx) => idx !== i) }) }
  function update(i, patch) { set({ abilities: s.abilities.map((a, idx) => idx === i ? { ...a, ...patch } : a) }) }
  function addParam(i) {
    const ab = s.abilities[i]
    update(i, { params: [...ab.params, { key: 'damage', value: '' }] })
  }
  function updateParam(i, pi, patch) {
    const ab = s.abilities[i]
    update(i, { params: ab.params.map((p, idx) => idx === pi ? { ...p, ...patch } : p) })
  }
  function removeParam(i, pi) {
    const ab = s.abilities[i]
    update(i, { params: ab.params.filter((_, idx) => idx !== pi) })
  }
  return (
    <div className={sectionCls}>
      <div className="flex items-center justify-between">
        <SectionTitle>{t('mmoItems.sectionAbilities')}</SectionTitle>
        <button onClick={add} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}><PlusIcon className="w-3 h-3" />{t('mmoItems.add')}</button>
      </div>
      {s.abilities.map((ab, i) => (
        <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="w-24"><label className={labelCls}>{t('mmoItems.fieldKey')}</label><input value={ab.id} onChange={e => update(i, { id: e.target.value })} className={inputCls} /></div>
            <div className="flex-1 min-w-[120px]">
              <label className={labelCls}>{t('mmoItems.fieldType')}</label>
              <input list="mmo-abilities" value={ab.type} onChange={e => update(i, { type: e.target.value.toUpperCase() })} className={inputCls} />
            </div>
            <div className="w-40">
              <CustomDropdown label={t('mmoItems.fieldMode')} value={ab.mode} onChange={v => update(i, { mode: v })} options={ABILITY_MODES} accent="indigo" />
            </div>
            <div className="w-20"><label className={labelCls}>{t('mmoItems.fieldCd')}</label><input value={ab.cooldown} onChange={e => update(i, { cooldown: e.target.value })} className={inputCls} /></div>
            <div className="w-20"><label className={labelCls}>{t('mmoItems.fieldMana')}</label><input value={ab.mana} onChange={e => update(i, { mana: e.target.value })} className={inputCls} /></div>
            <button onClick={() => remove(i)} className={`${btnCls} bg-red-500/10 border-red-500/20 text-red-300`}><TrashIcon className="w-3 h-3" /></button>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">{t('mmoItems.extraParams')}</span>
              <button onClick={() => addParam(i)} className={`${btnCls} py-1 px-2 text-[10px] bg-white/[0.04] border-white/[0.08] text-white/50`}><PlusIcon className="w-3 h-3" /></button>
            </div>
            {ab.params.map((p, pi) => (
              <div key={pi} className="flex gap-2">
                <input value={p.key} onChange={e => updateParam(i, pi, { key: e.target.value })} className={`${inputCls} flex-1 text-xs`} placeholder={t('mmoItems.placeholderKey')} />
                <input value={p.value} onChange={e => updateParam(i, pi, { value: e.target.value })} className={`${inputCls} flex-1 text-xs`} placeholder={t('mmoItems.placeholderValue')} />
                <button onClick={() => removeParam(i, pi)} className={`${btnCls} px-2 bg-red-500/10 border-red-500/20 text-red-300`}><TrashIcon className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <datalist id="mmo-abilities">{COMMON_ABILITIES.map(a => <option key={a} value={a} />)}</datalist>
    </div>
  )
}

function ModifiersTab({ t, s, set }) {
  function add() { set({ modifiers: [...s.modifiers, emptyModifier(`mod${s.modifiers.length + 1}`)] }) }
  function remove(i) { set({ modifiers: s.modifiers.filter((_, idx) => idx !== i) }) }
  function update(i, patch) { set({ modifiers: s.modifiers.map((m, idx) => idx === i ? { ...m, ...patch } : m) }) }
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <SectionTitle>{t('mmoItems.sectionModifiers')}</SectionTitle>
          <button onClick={add} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}><PlusIcon className="w-3 h-3" />{t('mmoItems.add')}</button>
        </div>
        {s.modifiers.map((mod, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <div className="w-28"><label className={labelCls}>{t('mmoItems.fieldKey')}</label><input value={mod.id} onChange={e => update(i, { id: e.target.value })} className={inputCls} /></div>
              <div className="w-20"><label className={labelCls}>{t('mmoItems.fieldChance')}</label><input value={mod.chance} onChange={e => update(i, { chance: e.target.value })} className={inputCls} /></div>
              <div className="w-20"><label className={labelCls}>{t('mmoItems.fieldWeight')}</label><input value={mod.weight} onChange={e => update(i, { weight: e.target.value })} className={inputCls} /></div>
              <div className="flex-1 min-w-[100px]"><label className={labelCls}>{t('mmoItems.fieldPrefix')}</label><input value={mod.prefix} onChange={e => update(i, { prefix: e.target.value })} className={inputCls} /></div>
              <div className="flex-1 min-w-[100px]"><label className={labelCls}>{t('mmoItems.fieldSuffix')}</label><input value={mod.suffix} onChange={e => update(i, { suffix: e.target.value })} className={inputCls} /></div>
              <button onClick={() => remove(i)} className={`${btnCls} self-end bg-red-500/10 border-red-500/20 text-red-300`}><TrashIcon className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoItems.sectionRawModifiers')}</SectionTitle>
        <p className="text-[10px] text-white/30">{t('mmoItems.sectionRawModifiersHint')}</p>
        <textarea value={s.templateModifiersYaml} onChange={e => set({ templateModifiersYaml: e.target.value })} rows={6} spellCheck={false}
          className={`${inputCls} font-mono text-xs resize-y`} placeholder="example_group:&#10;  min: 1&#10;  max: 3" />
      </div>
    </div>
  )
}

function ConsumableTab({ t, s, set }) {
  function addPerm() { set({ permEffects: [...s.permEffects, { effect: 'SPEED', level: '1' }] }) }
  function addCons() { set({ consumableEffects: [...s.consumableEffects, { effect: 'REGENERATION', duration: '30', amplifier: '1' }] }) }
  function addCmd() { set({ commands: [...s.commands, emptyCommand(String(s.commands.length + 1))] }) }
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <div className="flex items-center justify-between"><SectionTitle>{t('mmoItems.sectionPermEffects')}</SectionTitle><button onClick={addPerm} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}><PlusIcon className="w-3 h-3" />{t('mmoItems.add')}</button></div>
        {s.permEffects.map((e, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex-1">
              <CustomDropdown value={e.effect} onChange={v => set({ permEffects: s.permEffects.map((x, idx) => idx === i ? { ...x, effect: v } : x) })} options={POTION_EFFECTS} searchable accent="indigo" menuMinWidth={220} />
            </div>
            <input value={e.level} onChange={ev => set({ permEffects: s.permEffects.map((x, idx) => idx === i ? { ...x, level: ev.target.value } : x) })} className={`${inputCls} w-20`} placeholder={t('mmoItems.placeholderLvl')} />
            <button onClick={() => set({ permEffects: s.permEffects.filter((_, idx) => idx !== i) })} className={`${btnCls} px-2 bg-red-500/10 border-red-500/20 text-red-300`}><TrashIcon className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
      <div className={sectionCls}>
        <div className="flex items-center justify-between"><SectionTitle>{t('mmoItems.sectionConsEffects')}</SectionTitle><button onClick={addCons} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}><PlusIcon className="w-3 h-3" />{t('mmoItems.add')}</button></div>
        {s.consumableEffects.map((e, i) => (
          <div key={i} className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <CustomDropdown value={e.effect} onChange={v => set({ consumableEffects: s.consumableEffects.map((x, idx) => idx === i ? { ...x, effect: v } : x) })} options={POTION_EFFECTS} searchable accent="indigo" menuMinWidth={220} />
            </div>
            <input value={e.duration} onChange={ev => set({ consumableEffects: s.consumableEffects.map((x, idx) => idx === i ? { ...x, duration: ev.target.value } : x) })} className={`${inputCls} w-20`} placeholder={t('mmoItems.placeholderDur')} />
            <input value={e.amplifier} onChange={ev => set({ consumableEffects: s.consumableEffects.map((x, idx) => idx === i ? { ...x, amplifier: ev.target.value } : x) })} className={`${inputCls} w-20`} placeholder={t('mmoItems.placeholderAmp')} />
            <button onClick={() => set({ consumableEffects: s.consumableEffects.filter((_, idx) => idx !== i) })} className={`${btnCls} px-2 bg-red-500/10 border-red-500/20 text-red-300`}><TrashIcon className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
      <div className={sectionCls}>
        <div className="flex items-center justify-between"><SectionTitle>{t('mmoItems.sectionCommands')}</SectionTitle><button onClick={addCmd} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}><PlusIcon className="w-3 h-3" />{t('mmoItems.add')}</button></div>
        {s.commands.map((cmd, i) => (
          <div key={i} className="flex gap-2 flex-wrap items-end p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="w-12"><label className={labelCls}>{t('mmoItems.fieldKey')}</label><input value={cmd.id} onChange={e => set({ commands: s.commands.map((c, idx) => idx === i ? { ...c, id: e.target.value } : c) })} className={inputCls} /></div>
            <div className="flex-1 min-w-[120px]"><label className={labelCls}>{t('mmoItems.fieldCommand')}</label><input value={cmd.command} onChange={e => set({ commands: s.commands.map((c, idx) => idx === i ? { ...c, command: e.target.value } : c) })} className={inputCls} placeholder={t('mmoItems.placeholderSpawn')} /></div>
            <div className="w-16"><label className={labelCls}>{t('mmoItems.fieldCd')}</label><input value={cmd.cooldown} onChange={e => set({ commands: s.commands.map((c, idx) => idx === i ? { ...c, cooldown: e.target.value } : c) })} className={inputCls} /></div>
            <div className="w-16"><label className={labelCls}>{t('mmoItems.fieldDelay')}</label><input value={cmd.delay} onChange={e => set({ commands: s.commands.map((c, idx) => idx === i ? { ...c, delay: e.target.value } : c) })} className={inputCls} /></div>
            <button onClick={() => set({ commands: s.commands.filter((_, idx) => idx !== i) })} className={`${btnCls} bg-red-500/10 border-red-500/20 text-red-300`}><TrashIcon className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ParticlesTab({ t, s, set }) {
  const ip = s.itemParticles || { type: '', particle: 'FLAME', radius: '', rotationSpeed: '', colorRed: '', colorGreen: '', colorBlue: '' }
  const ap = s.arrowParticles || { particle: '', amount: '', speed: '' }
  function setIp(patch) { set({ itemParticles: { ...ip, ...patch } }) }
  function setAp(patch) { set({ arrowParticles: { ...ap, ...patch } }) }
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <SectionTitle>{t('mmoItems.sectionItemParticles')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <CustomDropdown label={t('mmoItems.fieldPatternType')} value={ip.type} onChange={v => setIp({ type: v })} options={[{ value: '', label: t('mmoItems.patternNone') }, ...PARTICLE_TYPES]} accent="indigo" />
          <Field label={t('mmoItems.fieldParticle')}><input value={ip.particle} onChange={e => setIp({ particle: e.target.value.toUpperCase() })} className={inputCls} placeholder="FLAME" /></Field>
          <Field label={t('mmoItems.fieldRadius')}><input value={ip.radius} onChange={e => setIp({ radius: e.target.value })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldRotationSpeed')}><input value={ip.rotationSpeed} onChange={e => setIp({ rotationSpeed: e.target.value })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldColorR')}><input value={ip.colorRed} onChange={e => setIp({ colorRed: e.target.value })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldColorG')}><input value={ip.colorGreen} onChange={e => setIp({ colorGreen: e.target.value })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldColorB')}><input value={ip.colorBlue} onChange={e => setIp({ colorBlue: e.target.value })} className={inputCls} /></Field>
        </div>
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoItems.sectionArrowParticles')}</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t('mmoItems.fieldParticle')}><input value={ap.particle} onChange={e => setAp({ particle: e.target.value.toUpperCase() })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldAmount')}><input value={ap.amount} onChange={e => setAp({ amount: e.target.value })} className={inputCls} /></Field>
          <Field label={t('mmoItems.fieldSpeed')}><input value={ap.speed} onChange={e => setAp({ speed: e.target.value })} className={inputCls} /></Field>
        </div>
      </div>
    </div>
  )
}

function UpgradeTab({ t, s, set }) {
  const u = s.upgrade || { template: '', reference: '', workbench: '', max: '' }
  function setU(patch) { set({ upgrade: { ...u, ...patch } }) }
  return (
    <div className={sectionCls}>
      <SectionTitle>{t('mmoItems.sectionUpgrade')}</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('mmoItems.fieldTemplate')}><input value={u.template} onChange={e => setU({ template: e.target.value })} className={inputCls} placeholder="weapon-default" /></Field>
        <Field label={t('mmoItems.fieldReference')}><input value={u.reference} onChange={e => setU({ reference: e.target.value })} className={inputCls} placeholder="weapon-default" /></Field>
        <Field label={t('mmoItems.fieldWorkbench')}><input value={u.workbench} onChange={e => setU({ workbench: e.target.value })} className={inputCls} /></Field>
        <Field label={t('mmoItems.fieldMaxLevel')}><input value={u.max} onChange={e => setU({ max: e.target.value })} className={inputCls} /></Field>
      </div>
    </div>
  )
}

function AdvancedTab({ t, s, set }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <SectionTitle>{t('mmoItems.sectionExtraBase')}</SectionTitle>
        <p className="text-[10px] text-white/30">{t('mmoItems.sectionExtraBaseHint')}</p>
        <textarea value={s.extraBaseYaml} onChange={e => set({ extraBaseYaml: e.target.value })} rows={8} spellCheck={false}
          className={`${inputCls} font-mono text-xs resize-y`} placeholder="pickaxe-power: 5" />
      </div>
      <div className={sectionCls}>
        <SectionTitle>{t('mmoItems.sectionCrafting')}</SectionTitle>
        <textarea value={s.craftingYaml} onChange={e => set({ craftingYaml: e.target.value })} rows={10} spellCheck={false}
          className={`${inputCls} font-mono text-xs resize-y`} placeholder="crafting:&#10;  shaped:" />
      </div>
    </div>
  )
}

export default function MMOItemsTool({ onBack }) {
  const { t } = useI18n()
  const [items, setItems] = useState(() => [createItemState()])
  const [activeId, setActiveId] = useState(() => items[0]?._id)
  const [tab, setTab] = useState('basic')
  const [statFilter, setStatFilter] = useState('')
  const [statCat, setStatCat] = useState('all')
  const [copied, setCopied] = useState(false)
  const [yamlView, setYamlView] = useState('all')

  const s = useMemo(() => items.find(i => i._id === activeId) ?? items[0], [items, activeId])
  const set = useCallback(patch => {
    setItems(prev => prev.map(i => (i._id === activeId ? { ...i, ...patch } : i)))
  }, [activeId])

  const fileKeys = useMemo(() => {
    const keys = new Set(items.map(i => getItemFileKey(i)))
    return [...keys].sort()
  }, [items])

  const duplicateIds = useMemo(() => {
    const seen = new Map()
    const dups = new Set()
    items.forEach(i => {
      const id = i.itemId?.trim()
      if (!id) return
      if (seen.has(id)) {
        dups.add(id)
        dups.add(seen.get(id))
      } else seen.set(id, id)
    })
    return dups
  }, [items])

  const effectiveYamlView = yamlView === 'all' || fileKeys.includes(yamlView)
    ? yamlView
    : (fileKeys[0] ?? 'all')

  const yaml = useMemo(() => {
    if (effectiveYamlView === 'all') return buildProjectYaml(items, { withHeaders: true })
    return buildFileYaml(items, effectiveYamlView)
  }, [items, effectiveYamlView])

  const saveFileName = effectiveYamlView === 'all'
    ? (fileKeys.length === 1 ? `${fileKeys[0]}.yml` : 'mmoitems-project.yml')
    : `${effectiveYamlView}.yml`

  function copyYaml() {
    navigator.clipboard.writeText(yaml).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function saveFile() {
    if (effectiveYamlView === 'all' && fileKeys.length > 1) {
      fileKeys.forEach(file => downloadYaml(buildFileYaml(items, file), `${file}.yml`))
      return
    }
    const file = effectiveYamlView === 'all' ? fileKeys[0] : effectiveYamlView
    downloadYaml(buildFileYaml(items, file), `${file}.yml`)
  }

  async function saveToServer() {
    if (!window.sconfigAPI?.selectFolder) return
    const folder = await window.sconfigAPI.selectFolder()
    if (!folder) return
    for (const file of fileKeys) {
      const path = `${folder}/plugins/MMOItems/item/${file}.yml`
      const content = buildFileYaml(items, file)
      if (!content.trim()) continue
      const existing = await window.sconfigAPI.readFile(path)
      const merged = existing.ok && existing.data?.trim()
        ? existing.data.trimEnd() + '\n\n' + content.trimEnd() + '\n'
        : content
      await window.sconfigAPI.writeFile(path, merged)
    }
  }

  function resetForm() {
    const item = createItemState()
    setItems([item])
    setActiveId(item._id)
    setTab('basic')
    setYamlView('all')
  }

  function applyPreset(p) {
    setItems(prev => prev.map(i => {
      if (i._id !== activeId) return i
      return {
        ...i,
        ...p.patch,
        numericStats: p.patch.numericStats ?? i.numericStats,
        booleanStats: p.patch.booleanStats ?? i.booleanStats,
      }
    }))
  }

  function addItem() {
    const n = items.length + 1
    const item = createItemState({ itemId: `ITEM_${n}`, name: `&fItem ${n}` })
    setItems(prev => [...prev, item])
    setActiveId(item._id)
  }

  function duplicateItem(id) {
    const src = items.find(i => i._id === id)
    if (!src) return
    const { _id: _omit, ...rest } = src
    const copy = createItemState({
      ...rest,
      itemId: `${src.itemId}_COPY`,
    })
    setItems(prev => [...prev, copy])
    setActiveId(copy._id)
  }

  function deleteItem(id) {
    if (items.length <= 1) return
    setItems(prev => {
      const next = prev.filter(i => i._id !== id)
      if (activeId === id) setActiveId(next[0]._id)
      return next
    })
  }

  if (!s) return null

  return (
    <div className="flex-1 flex overflow-hidden animate-fade-in min-h-0">

      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-5 flex flex-col gap-5 pb-8">

          <div className="flex items-center gap-3">
            <button onClick={onBack}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm flex-shrink-0">
              <ArrowLeftIcon className="w-4 h-4" />{t('common.back')}
            </button>
            <div className="w-px h-4 bg-white/10 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-indigo-400/70 uppercase tracking-widest font-semibold">{t('mmoItems.badge')}</p>
              <h1 className="text-xl font-bold text-white leading-tight">{t('mmoItems.title')}</h1>
              <p className="text-xs text-white/35 mt-0.5">{t('mmoItems.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            <ItemList
              t={t}
              items={items}
              activeId={activeId}
              duplicateIds={duplicateIds}
              onSelect={setActiveId}
              onDelete={deleteItem}
              onAdd={addItem}
              onDuplicate={duplicateItem}
            />
            <ItemPreview t={t} s={s} />
          </div>

          <div>
            <SectionTitle>{t('mmoItems.itemPresets')}</SectionTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              {ITEM_PRESETS.map((p, i) => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-xs text-white/60 hover:text-white/90 hover:bg-white/[0.08] transition-all">
                  {t(`mmoItems.${PRESET_I18N_KEYS[i]}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <nav className="w-28 flex-shrink-0 flex flex-col gap-1 sticky top-0">
              {TAB_DEFS.map(tabDef => (
                <TabBtn key={tabDef.id} active={tab === tabDef.id} onClick={() => setTab(tabDef.id)}>
                  {t(`mmoItems.${tabDef.labelKey}`)}
                </TabBtn>
              ))}
            </nav>
            <div className="flex-1 min-w-0">
              {tab === 'basic' && <BasicTab t={t} s={s} set={set} />}
              {tab === 'stats' && <StatsTab t={t} s={s} set={set} statFilter={statFilter} setStatFilter={setStatFilter} statCat={statCat} setStatCat={setStatCat} />}
              {tab === 'flags' && <FlagsTab t={t} s={s} set={set} />}
              {tab === 'enchants' && <EnchantsTab t={t} s={s} set={set} />}
              {tab === 'elements' && <ElementsTab t={t} s={s} set={set} />}
              {tab === 'abilities' && <AbilitiesTab t={t} s={s} set={set} />}
              {tab === 'modifiers' && <ModifiersTab t={t} s={s} set={set} />}
              {tab === 'consumable' && <ConsumableTab t={t} s={s} set={set} />}
              {tab === 'particles' && <ParticlesTab t={t} s={s} set={set} />}
              {tab === 'upgrade' && <UpgradeTab t={t} s={s} set={set} />}
              {tab === 'advanced' && <AdvancedTab t={t} s={s} set={set} />}
            </div>
          </div>
        </div>
      </div>

      <div className="w-72 xl:w-80 flex-shrink-0 border-l border-white/[0.06] flex flex-col overflow-hidden bg-black/20">
        <div className="p-4 border-b border-white/[0.06] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">{t('mmoItems.yamlOutput')}</p>
              <p className="text-[10px] text-white/25">{t('mmoItems.updatesInstantly')}</p>
            </div>
            <button onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white/40 text-xs hover:text-white/70 transition-all">
              <ArrowPathIcon className="w-3.5 h-3.5" />{t('mmoItems.reset')}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={copyYaml} className={`flex-1 justify-center ${btnCls} ${copied ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-white/[0.05] border-white/10 text-white/50 hover:text-white/80'}`}>
              {copied ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
              {t('mmoItems.copy')}
            </button>
            <button onClick={saveFile} className={`flex-1 justify-center ${btnCls} bg-indigo-500/15 border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/25`}>
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('mmoItems.save')}
            </button>
          </div>
          <CustomDropdown
            label={t('mmoItems.yamlView')}
            value={yamlView}
            onChange={setYamlView}
            options={[
              { value: 'all', label: t('mmoItems.yamlAllFiles', { count: items.length }) },
              ...fileKeys.map(f => ({
                value: f,
                label: t('mmoItems.yamlFileItems', {
                  file: f,
                  count: items.filter(i => getItemFileKey(i) === f).length,
                }),
              })),
            ]}
            accent="indigo"
          />
          <p className="text-[10px] font-mono text-indigo-300/60 bg-indigo-500/8 border border-indigo-500/15 rounded-lg px-2 py-1.5">
            {effectiveYamlView === 'all'
              ? (fileKeys.length === 1
                ? t('mmoItems.yamlMetaAll', { files: fileKeys.length, items: items.length })
                : t('mmoItems.yamlMetaAll_plural', { files: fileKeys.length, items: items.length }))
              : t('mmoItems.yamlMetaPath', { file: effectiveYamlView })}
          </p>
        </div>
        <pre className="flex-1 overflow-auto p-4 text-[11px] font-mono text-indigo-200/75 leading-relaxed whitespace-pre-wrap custom-dropdown-scroll">{yaml}</pre>
        <div className="p-4 border-t border-white/[0.06]">
          <button onClick={saveToServer} className={`${btnCls} w-full justify-center bg-emerald-500/15 border-emerald-500/25 text-emerald-300 py-2 hover:bg-emerald-500/25`}>
            {fileKeys.length === 1
              ? t('mmoItems.appendServer', { count: fileKeys.length })
              : t('mmoItems.appendServer_plural', { count: fileKeys.length })}
          </button>
          <p className="text-[10px] text-white/25 mt-2 text-center">{t('mmoItems.appendHint', { file: saveFileName })}</p>
        </div>
      </div>
    </div>
  )
}
