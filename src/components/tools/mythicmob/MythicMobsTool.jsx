import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  PlusIcon, TrashIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import {
  ENTITY_TYPES, EQUIPMENT_SLOTS, MATERIALS, TRIGGERS, TARGETS, COMMON_MECHANICS,
  MECHANIC_DEFAULTS, BOSS_BAR_COLORS, BOSS_BAR_STYLES, DESPAWN_OPTIONS, DAMAGE_CAUSES,
  MOB_PRESETS, SKILL_PRESETS,
  createMobState, createSkillState, emptyEquipment, emptyDrop, emptyDamageMod,
  emptyLevelMod, emptyMobSkill, emptySkillMechanic, presetToMob, presetToSkill,
  buildMobSkillLine, buildSkillMechanicLine,
} from './mythicMobsData'
import {
  buildMobYaml, buildSkillYaml, buildProjectYaml,
  getMobFileName, getSkillFileName, downloadYaml,
} from './mythicMobsYaml'
import { useI18n } from '../../../context/I18nContext'

const MOB_TAB_DEFS = [
  { id: 'display', labelKey: 'tabDisplay' },
  { id: 'stats', labelKey: 'tabStats' },
  { id: 'equipment', labelKey: 'tabGear' },
  { id: 'drops', labelKey: 'tabDrops' },
  { id: 'skills', labelKey: 'tabSkills' },
  { id: 'options', labelKey: 'tabOptions' },
  { id: 'bossbar', labelKey: 'tabBossBar' },
]

const MOB_PRESET_I18N = {
  'skeletal-knight': 'mobSkeletalKnight',
  'charged-sheep': 'mobChargedSheep',
  'slime-boss': 'mobSlimeBoss',
  'fast-zombie': 'mobFastZombie',
}

const SKILL_PRESET_I18N = {
  slash: 'skillSlash',
  'aoe-pulse': 'skillAoePulse',
  shield: 'skillShield',
}

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-red-500/30 transition-colors'
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

function Toggle({ label, value, onChange, desc }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-red-500/35 bg-red-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center transition-all ${value ? 'bg-red-500/40 border-red-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
        <span className={`block w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold text-white/80 block">{label}</span>
        {desc && <span className="text-[10px] text-white/35 block mt-0.5">{desc}</span>}
      </span>
    </button>
  )
}

function EntryList({ t, mode, entries, activeId, onSelect, onDelete, onAdd, onDuplicate }) {
  const isMob = mode === 'mobs'
  const countLabel = isMob
    ? (entries.length === 1
      ? t('mythicMobs.mobCount', { count: entries.length })
      : t('mythicMobs.mobCount_plural', { count: entries.length }))
    : (entries.length === 1
      ? t('mythicMobs.skillCount', { count: entries.length })
      : t('mythicMobs.skillCount_plural', { count: entries.length }))
  return (
    <div className={`${sectionCls} min-h-0 overflow-hidden flex flex-col flex-1`}>
      <div className="flex items-center justify-between gap-2 flex-shrink-0">
        <div>
          <SectionTitle>{isMob ? t('mythicMobs.mobList') : t('mythicMobs.skillList')}</SectionTitle>
          <p className="text-[10px] text-white/25 mt-0.5">{countLabel}</p>
        </div>
        <button type="button" onClick={onAdd} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('mythicMobs.new')}
        </button>
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
        {entries.map(entry => {
          const active = entry._id === activeId
          const name = isMob ? entry.internalName : entry.skillId
          const file = isMob ? getMobFileName(entry) : getSkillFileName(entry)
          return (
            <div key={entry._id}
              className={`group flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                active ? 'border-red-500/35 bg-red-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
              }`}>
              <button type="button" onClick={() => onSelect(entry._id)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-mono font-semibold text-white/85 truncate">{name}</span>
                </div>
                {isMob ? (
                  <>
                    <McText text={entry.display || name} className="text-[10px] truncate block" />
                    <div className="flex gap-1.5 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-white/40 font-mono">{entry.type}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300/70 font-mono">{file}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] text-white/35">{t('mythicMobs.mechanicCount', { count: (entry.mechanics || []).length })}</p>
                )}
              </button>
              <div className="flex flex-col gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                {onDuplicate && (
                  <button type="button" onClick={() => onDuplicate(entry._id)} title={t('mythicMobs.duplicate')}
                    className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white/80 transition-all">
                    <PlusIcon className="w-3 h-3" />
                  </button>
                )}
                <button type="button" onClick={() => onDelete(entry._id)} disabled={entries.length <= 1}
                  className="p-1.5 rounded-lg border border-red-500/15 text-red-400/70 disabled:opacity-25">
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

function MobPreview({ t, mob }) {
  const skillCount = (mob.skills || []).length
  const dropCount = (mob.drops || []).length
  return (
    <div className={`${sectionCls} flex-shrink-0`}>
      <SectionTitle>{t('mythicMobs.mobPreview')}</SectionTitle>
      <div className="bg-[#0d0d1a] rounded-xl border border-white/[0.04] p-3 flex flex-col gap-2">
        <McText text={mob.display || mob.internalName} className="text-sm font-semibold" />
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div><span className="text-white/30">{t('mythicMobs.previewType')}</span><p className="font-mono text-white/70">{mob.type}</p></div>
          <div><span className="text-white/30">{t('mythicMobs.previewHpDmg')}</span><p className="font-mono text-white/70">{mob.health} / {mob.damage}</p></div>
          <div><span className="text-white/30">{t('mythicMobs.previewSkills')}</span><p className="font-mono text-white/70">{skillCount}</p></div>
          <div><span className="text-white/30">{t('mythicMobs.previewDrops')}</span><p className="font-mono text-white/70">{dropCount}</p></div>
        </div>
        {mob.bossBar?.enabled && (
          <div className="rounded-lg bg-red-900/30 border border-red-500/20 px-2 py-1 text-[10px] text-red-200">
            {t('mythicMobs.bossBarLine')} <McText text={mob.bossBar.title || mob.display} />
          </div>
        )}
      </div>
    </div>
  )
}

function DisplayTab({ t, s, set }) {
  return (
    <div className="flex flex-col gap-3">
      <Field label={t('mythicMobs.fieldInternalName')}>
        <input className={inputCls} value={s.internalName} onChange={e => set({ internalName: e.target.value.replace(/\s/g, '') })} />
      </Field>
      <Field label={t('mythicMobs.fieldEntityType')}>
        <CustomDropdown label="" value={s.type} onChange={v => set({ type: v })}
          options={ENTITY_TYPES.map(ent => ({ value: ent, label: ent }))} accent="red" searchable />
      </Field>
      <Field label={t('mythicMobs.fieldDisplayName')}>
        <input className={inputCls} value={s.display} onChange={e => set({ display: e.target.value })} placeholder={t('mythicMobs.placeholderDisplay')} />
      </Field>
      <Field label={t('mythicMobs.fieldFaction')}>
        <input className={inputCls} value={s.faction} onChange={e => set({ faction: e.target.value })} placeholder={t('mythicMobs.placeholderFaction')} />
      </Field>
      <Field label={t('mythicMobs.fieldExtraYaml')}>
        <textarea className={`${inputCls} min-h-[80px] font-mono text-xs`} value={s.extraYaml}
          onChange={e => set({ extraYaml: e.target.value })} placeholder={t('mythicMobs.placeholderExtraMob')} />
      </Field>
    </div>
  )
}

function StatsTab({ t, s, set }) {
  const patchMod = (list, idx, patch, key) => {
    set({ [key]: list.map((item, i) => (i === idx ? { ...item, ...patch } : item)) })
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('mythicMobs.fieldHealth')}><input className={inputCls} value={s.health} onChange={e => set({ health: e.target.value })} /></Field>
        <Field label={t('mythicMobs.fieldDamage')}><input className={inputCls} value={s.damage} onChange={e => set({ damage: e.target.value })} /></Field>
        <Field label={t('mythicMobs.fieldArmor')}><input className={inputCls} value={s.armor} onChange={e => set({ armor: e.target.value })} /></Field>
        <Field label={t('mythicMobs.fieldLevel')}><input className={inputCls} value={s.level} onChange={e => set({ level: e.target.value })} /></Field>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionTitle>{t('mythicMobs.sectionDamageMods')}</SectionTitle>
          <button type="button" onClick={() => set({ damageModifiers: [...(s.damageModifiers || []), emptyDamageMod()] })}
            className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/50`}><PlusIcon className="w-3 h-3" />{t('mythicMobs.add')}</button>
        </div>
        {(s.damageModifiers || []).map((dm, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <CustomDropdown label="" value={dm.cause} onChange={v => patchMod(s.damageModifiers, i, { cause: v }, 'damageModifiers')}
              options={DAMAGE_CAUSES.map(c => ({ value: c, label: c }))} accent="red" className="flex-1" searchable />
            <input className={`${inputCls} w-24`} value={dm.multiplier} placeholder="0.5"
              onChange={e => patchMod(s.damageModifiers, i, { multiplier: e.target.value }, 'damageModifiers')} />
            <button type="button" onClick={() => set({ damageModifiers: s.damageModifiers.filter((_, j) => j !== i) })}
              className="p-2 rounded-lg border border-red-500/15 text-red-400/70"><TrashIcon className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionTitle>{t('mythicMobs.sectionLevelMods')}</SectionTitle>
          <button type="button" onClick={() => set({ levelModifiers: [...(s.levelModifiers || []), emptyLevelMod()] })}
            className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/50`}><PlusIcon className="w-3 h-3" />{t('mythicMobs.add')}</button>
        </div>
        {(s.levelModifiers || []).map((lm, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className={inputCls} value={lm.stat} placeholder="health"
              onChange={e => patchMod(s.levelModifiers, i, { stat: e.target.value }, 'levelModifiers')} />
            <input className={`${inputCls} w-24`} value={lm.amount} placeholder="5"
              onChange={e => patchMod(s.levelModifiers, i, { amount: e.target.value }, 'levelModifiers')} />
            <button type="button" onClick={() => set({ levelModifiers: s.levelModifiers.filter((_, j) => j !== i) })}
              className="p-2 rounded-lg border border-red-500/15 text-red-400/70"><TrashIcon className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

function EquipmentTab({ t, s, set }) {
  const patch = (idx, p) => set({ equipment: s.equipment.map((eq, i) => (i === idx ? { ...eq, ...p } : eq)) })
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <button type="button" onClick={() => set({ equipment: [...(s.equipment || []), emptyEquipment()] })}
          className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/50`}><PlusIcon className="w-3 h-3" />{t('mythicMobs.addGear')}</button>
      </div>
      {(s.equipment || []).length === 0 && <p className="text-xs text-white/30">{t('mythicMobs.noEquipment')}</p>}
      {(s.equipment || []).map((eq, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <CustomDropdown label={t('mythicMobs.fieldItem')} value={eq.item} onChange={v => patch(i, { item: v })}
              options={MATERIALS.map(m => ({ value: m, label: m }))} accent="red" searchable className="flex-1" />
            <CustomDropdown label={t('mythicMobs.fieldSlot')} value={eq.slot} onChange={v => patch(i, { slot: v })}
              options={EQUIPMENT_SLOTS.map(sl => ({ value: sl, label: sl }))} accent="red" className="w-28" />
            <button type="button" onClick={() => set({ equipment: s.equipment.filter((_, j) => j !== i) })}
              className="p-2 rounded-lg border border-red-500/15 text-red-400/70 self-end"><TrashIcon className="w-3.5 h-3.5" /></button>
          </div>
          <p className="text-[10px] font-mono text-white/30">{t('mythicMobs.gearLine', { item: eq.item, slot: eq.slot })}</p>
        </div>
      ))}
    </div>
  )
}

function DropsTab({ t, s, set }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] text-white/35">
        {t('mythicMobs.dropsHint', { example1: t('mythicMobs.dropsExample1'), example2: t('mythicMobs.dropsExample2') })}
      </p>
      <div className="flex justify-end">
        <button type="button" onClick={() => set({ drops: [...(s.drops || []), emptyDrop()] })}
          className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/50`}><PlusIcon className="w-3 h-3" />{t('mythicMobs.addDrop')}</button>
      </div>
      {(s.drops || []).map((d, i) => (
        <div key={i} className="flex gap-2">
          <input className={`${inputCls} font-mono text-xs`} value={d.text} placeholder="exp 10-20 1"
            onChange={e => set({ drops: s.drops.map((x, j) => (j === i ? { text: e.target.value } : x)) })} />
          <button type="button" onClick={() => set({ drops: s.drops.filter((_, j) => j !== i) })}
            className="p-2 rounded-lg border border-red-500/15 text-red-400/70"><TrashIcon className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  )
}

function MobSkillsTab({ t, s, set }) {
  const patch = (idx, p) => set({ skills: s.skills.map((sk, i) => (i === idx ? { ...sk, ...p } : sk)) })
  const applyMechanic = (idx, mech) => patch(idx, { mechanic: mech, options: MECHANIC_DEFAULTS[mech] || '' })
  const targetOptions = useMemo(() => [{ value: '', label: t('mythicMobs.targetNone') }, ...TARGETS], [t])

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] text-white/35">{t('mythicMobs.mobSkillsHint')}</p>
      <div className="flex justify-end">
        <button type="button" onClick={() => set({ skills: [...(s.skills || []), emptyMobSkill()] })}
          className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/50`}><PlusIcon className="w-3 h-3" />{t('mythicMobs.addSkill')}</button>
      </div>
      {(s.skills || []).map((sk, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Toggle label={t('mythicMobs.toggleRawLine')} value={sk.useRaw} onChange={v => patch(i, { useRaw: v })} />
            <button type="button" onClick={() => set({ skills: s.skills.filter((_, j) => j !== i) })}
              className="p-1.5 rounded-lg border border-red-500/15 text-red-400/70"><TrashIcon className="w-3.5 h-3.5" /></button>
          </div>
          {sk.useRaw ? (
            <input className={`${inputCls} font-mono text-xs`} value={sk.raw}
              onChange={e => patch(i, { raw: e.target.value })} placeholder="skill{s=MySkill} @target ~onAttack 0.5" />
          ) : (
            <>
              <CustomDropdown label={t('mythicMobs.fieldMechanic')} value={sk.mechanic} onChange={v => applyMechanic(i, v)}
                options={COMMON_MECHANICS} accent="red" searchable />
              <Field label={t('mythicMobs.fieldOptions')}>
                <input className={`${inputCls} font-mono text-xs`} value={sk.options}
                  onChange={e => patch(i, { options: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <CustomDropdown label={t('mythicMobs.fieldTarget')} value={sk.target} onChange={v => patch(i, { target: v })}
                  options={targetOptions} accent="red" searchable />
                <CustomDropdown label={t('mythicMobs.fieldTrigger')} value={sk.trigger} onChange={v => patch(i, { trigger: v })}
                  options={TRIGGERS} accent="red" />
              </div>
              {sk.trigger === 'onTimer' && (
                <Field label={t('mythicMobs.fieldTimerTicks')}><input className={inputCls} value={sk.timerTicks}
                  onChange={e => patch(i, { timerTicks: e.target.value })} /></Field>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Field label={t('mythicMobs.fieldHealthMod')}><input className={inputCls} value={sk.healthMod} placeholder="<50%"
                  onChange={e => patch(i, { healthMod: e.target.value })} /></Field>
                <Field label={t('mythicMobs.fieldChance')}><input className={inputCls} value={sk.chance} placeholder="0.5"
                  onChange={e => patch(i, { chance: e.target.value })} /></Field>
              </div>
            </>
          )}
          <p className="text-[10px] font-mono text-red-300/60 break-all">{buildMobSkillLine(sk) || t('mythicMobs.skillLineEmpty')}</p>
        </div>
      ))}
    </div>
  )
}

function OptionsTab({ t, s, set }) {
  const opt = s.options || {}
  const setOpt = (key, val) => set({ options: { ...opt, [key]: val } })
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('mythicMobs.fieldMovementSpeed')}><input className={inputCls} value={opt.movementSpeed} onChange={e => setOpt('movementSpeed', e.target.value)} /></Field>
        <Field label={t('mythicMobs.fieldKnockbackResistance')}><input className={inputCls} value={opt.knockbackResistance} onChange={e => setOpt('knockbackResistance', e.target.value)} /></Field>
        <Field label={t('mythicMobs.fieldFollowRange')}><input className={inputCls} value={opt.followRange} onChange={e => setOpt('followRange', e.target.value)} /></Field>
        <Field label={t('mythicMobs.fieldAttackSpeed')}><input className={inputCls} value={opt.attackSpeed} onChange={e => setOpt('attackSpeed', e.target.value)} /></Field>
        <Field label={t('mythicMobs.fieldDespawn')}>
          <CustomDropdown label="" value={opt.despawn || ''} onChange={v => setOpt('despawn', v)}
            options={DESPAWN_OPTIONS.filter(Boolean).map(d => ({ value: d, label: d }))} placeholder={t('mythicMobs.despawnDefault')} accent="red" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        <Toggle label={t('mythicMobs.togglePreventOtherDrops')} value={opt.preventOtherDrops} onChange={v => setOpt('preventOtherDrops', v)} />
        <Toggle label={t('mythicMobs.togglePreventRandomEquipment')} value={opt.preventRandomEquipment} onChange={v => setOpt('preventRandomEquipment', v)} />
        <Toggle label={t('mythicMobs.togglePreventSunburn')} value={opt.preventSunburn} onChange={v => setOpt('preventSunburn', v)} />
        <Toggle label={t('mythicMobs.toggleSilent')} value={opt.silent} onChange={v => setOpt('silent', v)} />
        <Toggle label={t('mythicMobs.toggleNoAi')} value={opt.noAI} onChange={v => setOpt('noAI', v)} />
        <Toggle label={t('mythicMobs.toggleAlwaysShowName')} value={opt.alwaysShowName} onChange={v => setOpt('alwaysShowName', v)} />
        <Toggle label={t('mythicMobs.toggleGlowing')} value={opt.glowing} onChange={v => setOpt('glowing', v)} />
        <Toggle label={t('mythicMobs.toggleInvincible')} value={opt.invincible} onChange={v => setOpt('invincible', v)} />
      </div>
    </div>
  )
}

function BossBarTab({ t, s, set }) {
  const bb = s.bossBar || {}
  const setBb = (key, val) => set({ bossBar: { ...bb, [key]: val } })
  return (
    <div className="flex flex-col gap-3">
      <Toggle label={t('mythicMobs.toggleEnableBossBar')} value={bb.enabled} onChange={v => setBb('enabled', v)} />
      {bb.enabled && (
        <>
          <Field label={t('mythicMobs.fieldTitle')}><input className={inputCls} value={bb.title} onChange={e => setBb('title', e.target.value)} /></Field>
          <Field label={t('mythicMobs.fieldRange')}><input className={inputCls} value={bb.range} onChange={e => setBb('range', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <CustomDropdown label={t('mythicMobs.fieldColor')} value={bb.color} onChange={v => setBb('color', v)}
              options={BOSS_BAR_COLORS.map(c => ({ value: c, label: c }))} accent="red" />
            <CustomDropdown label={t('mythicMobs.fieldStyle')} value={bb.style} onChange={v => setBb('style', v)}
              options={BOSS_BAR_STYLES.map(st => ({ value: st, label: st }))} accent="red" searchable />
          </div>
        </>
      )}
    </div>
  )
}

function SkillEditorTab({ t, s, set }) {
  const patch = (idx, p) => set({ mechanics: s.mechanics.map((m, i) => (i === idx ? { ...m, ...p } : m)) })
  const applyMechanic = (idx, mech) => patch(idx, { mechanic: mech, options: MECHANIC_DEFAULTS[mech] || '' })
  const targetOptions = useMemo(() => [{ value: '', label: t('mythicMobs.targetNone') }, ...TARGETS], [t])

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('mythicMobs.fieldSkillId')}>
        <input className={inputCls} value={s.skillId} onChange={e => set({ skillId: e.target.value.replace(/\s/g, '') })} />
      </Field>
      <div className="flex justify-end">
        <button type="button" onClick={() => set({ mechanics: [...(s.mechanics || []), emptySkillMechanic()] })}
          className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/50`}><PlusIcon className="w-3 h-3" />{t('mythicMobs.addMechanic')}</button>
      </div>
      {(s.mechanics || []).map((m, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Toggle label={t('mythicMobs.toggleRawLine')} value={m.useRaw} onChange={v => patch(i, { useRaw: v })} />
            <button type="button" onClick={() => set({ mechanics: s.mechanics.filter((_, j) => j !== i) })}
              className="p-1.5 rounded-lg border border-red-500/15 text-red-400/70"><TrashIcon className="w-3.5 h-3.5" /></button>
          </div>
          {m.useRaw ? (
            <input className={`${inputCls} font-mono text-xs`} value={m.raw}
              onChange={e => patch(i, { raw: e.target.value })} />
          ) : (
            <>
              <CustomDropdown label={t('mythicMobs.fieldMechanic')} value={m.mechanic} onChange={v => applyMechanic(i, v)}
                options={COMMON_MECHANICS} accent="red" searchable />
              <Field label={t('mythicMobs.fieldOptionsShort')}><input className={`${inputCls} font-mono text-xs`} value={m.options}
                onChange={e => patch(i, { options: e.target.value })} /></Field>
              <CustomDropdown label={t('mythicMobs.fieldTarget')} value={m.target} onChange={v => patch(i, { target: v })}
                options={targetOptions} accent="red" searchable />
              <Field label={t('mythicMobs.fieldConditions')}><input className={inputCls} value={m.conditions} placeholder="optional"
                onChange={e => patch(i, { conditions: e.target.value })} /></Field>
            </>
          )}
          <p className="text-[10px] font-mono text-red-300/60 break-all">{buildSkillMechanicLine(m) || t('mythicMobs.skillLineEmpty')}</p>
        </div>
      ))}
      <Field label={t('mythicMobs.fieldExtraYaml')}>
        <textarea className={`${inputCls} min-h-[60px] font-mono text-xs`} value={s.extraYaml}
          onChange={e => set({ extraYaml: e.target.value })} />
      </Field>
    </div>
  )
}

export default function MythicMobsTool({ onBack }) {
  const { t } = useI18n()
  const [mode, setMode] = useState('mobs')
  const [mobs, setMobs] = useState(() => [createMobState()])
  const [skills, setSkills] = useState(() => [createSkillState()])
  const [activeMobId, setActiveMobId] = useState(() => mobs[0]?._id)
  const [activeSkillId, setActiveSkillId] = useState(() => skills[0]?._id)
  const [tab, setTab] = useState('display')
  const [yamlView, setYamlView] = useState('active')
  const [copied, setCopied] = useState(false)

  const activeMob = useMemo(() => mobs.find(m => m._id === activeMobId) ?? mobs[0], [mobs, activeMobId])
  const activeSkill = useMemo(() => skills.find(sk => sk._id === activeSkillId) ?? skills[0], [skills, activeSkillId])

  const setMob = useCallback(patch => {
    setMobs(prev => prev.map(m => (m._id === activeMobId ? { ...m, ...patch } : m)))
  }, [activeMobId])

  const setSkill = useCallback(patch => {
    setSkills(prev => prev.map(sk => (sk._id === activeSkillId ? { ...sk, ...patch } : sk)))
  }, [activeSkillId])

  const yaml = useMemo(() => {
    if (yamlView === 'all') return buildProjectYaml(mobs, skills)
    if (mode === 'skills') return buildSkillYaml(activeSkill)
    return buildMobYaml(activeMob)
  }, [yamlView, mode, mobs, skills, activeMob, activeSkill])

  const saveName = mode === 'skills' ? getSkillFileName(activeSkill) : getMobFileName(activeMob)
  const folder = mode === 'skills' ? t('mythicMobs.folderSkills') : t('mythicMobs.folderMobs')

  const modeOptions = useMemo(() => [
    { value: 'mobs', label: t('mythicMobs.modeMobs') },
    { value: 'skills', label: t('mythicMobs.modeSkills') },
  ], [t])

  const presetOptions = useMemo(() => (
    (mode === 'mobs' ? MOB_PRESETS : SKILL_PRESETS).map(p => ({
      value: p.id,
      label: t(`mythicMobs.${mode === 'mobs' ? MOB_PRESET_I18N[p.id] : SKILL_PRESET_I18N[p.id]}`),
    }))
  ), [mode, t])

  const yamlViewOptions = useMemo(() => [
    { value: 'active', label: t('mythicMobs.yamlActive') },
    { value: 'all', label: t('mythicMobs.yamlAll') },
  ], [t])

  const copyYaml = () => {
    navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const applyPreset = (id) => {
    if (!id) return
    if (mode === 'mobs') {
      const p = MOB_PRESETS.find(x => x.id === id)
      if (!p) return
      const mob = presetToMob(p)
      setMobs(prev => prev.map(m => (m._id === activeMobId ? mob : m)))
    } else {
      const p = SKILL_PRESETS.find(x => x.id === id)
      if (!p) return
      const sk = presetToSkill(p)
      setSkills(prev => prev.map(s => (s._id === activeSkillId ? { ...sk, _id: activeSkillId } : s)))
    }
  }

  const addEntry = () => {
    if (mode === 'mobs') {
      const mob = createMobState({ internalName: `Mob_${mobs.length + 1}` })
      setMobs(prev => [...prev, mob])
      setActiveMobId(mob._id)
    } else {
      const sk = createSkillState({ skillId: `Skill_${skills.length + 1}` })
      setSkills(prev => [...prev, sk])
      setActiveSkillId(sk._id)
    }
  }

  const duplicateEntry = (id) => {
    if (mode === 'mobs') {
      const src = mobs.find(m => m._id === id)
      if (!src) return
      const { _id: _omit, internalName, ...rest } = src
      const copy = createMobState({ ...rest, internalName: `${internalName}_copy` })
      setMobs(prev => [...prev, copy])
      setActiveMobId(copy._id)
    } else {
      const src = skills.find(s => s._id === id)
      if (!src) return
      const { _id: _omit, skillId, ...rest } = src
      const copy = createSkillState({ ...rest, skillId: `${skillId}_copy` })
      setSkills(prev => [...prev, copy])
      setActiveSkillId(copy._id)
    }
  }

  const deleteEntry = (id) => {
    if (mode === 'mobs') {
      setMobs(prev => {
        const next = prev.filter(m => m._id !== id)
        if (activeMobId === id) setActiveMobId(next[0]?._id)
        return next.length ? next : [createMobState()]
      })
    } else {
      setSkills(prev => {
        const next = prev.filter(s => s._id !== id)
        if (activeSkillId === id) setActiveSkillId(next[0]?._id)
        return next.length ? next : [createSkillState()]
      })
    }
  }

  const handleModeChange = (m) => {
    setMode(m)
    setTab(m === 'mobs' ? 'display' : 'editor')
  }

  const entries = mode === 'mobs' ? mobs : skills
  const activeId = mode === 'mobs' ? activeMobId : activeSkillId
  const setActiveId = mode === 'mobs' ? setActiveMobId : setActiveSkillId

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0 flex-wrap">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-300 font-semibold uppercase">{t('mythicMobs.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('mythicMobs.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('mythicMobs.subtitle')}</p>
        </div>
        <CustomDropdown label="" value={mode} onChange={handleModeChange} options={modeOptions} accent="red" className="w-28" />
        <CustomDropdown label="" value="" onChange={applyPreset}
          options={presetOptions}
          placeholder={t('mythicMobs.loadPreset')} accent="red" className="w-36" />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)_minmax(0,280px)] gap-3 flex-1 min-h-0">
          <div className="min-h-0 flex flex-col overflow-hidden">
            <EntryList t={t} mode={mode} entries={entries} activeId={activeId} onSelect={setActiveId}
              onDelete={deleteEntry} onAdd={addEntry} onDuplicate={duplicateEntry} />
          </div>

          <div className={`${sectionCls} min-h-0 min-w-0 overflow-hidden flex flex-col`}>
            {mode === 'mobs' && activeMob && (
              <>
                <div className="flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
                  <SectionTitle>{activeMob.internalName}</SectionTitle>
                  <div className="flex gap-1 flex-wrap">
                    {MOB_TAB_DEFS.map(tabDef => (
                      <button key={tabDef.id} type="button" onClick={() => setTab(tabDef.id)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${
                          tab === tabDef.id ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-white/[0.03] border-white/[0.08] text-white/40'
                        }`}>{t(`mythicMobs.${tabDef.labelKey}`)}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
                  {tab === 'display' && <DisplayTab t={t} s={activeMob} set={setMob} />}
                  {tab === 'stats' && <StatsTab t={t} s={activeMob} set={setMob} />}
                  {tab === 'equipment' && <EquipmentTab t={t} s={activeMob} set={setMob} />}
                  {tab === 'drops' && <DropsTab t={t} s={activeMob} set={setMob} />}
                  {tab === 'skills' && <MobSkillsTab t={t} s={activeMob} set={setMob} />}
                  {tab === 'options' && <OptionsTab t={t} s={activeMob} set={setMob} />}
                  {tab === 'bossbar' && <BossBarTab t={t} s={activeMob} set={setMob} />}
                </div>
              </>
            )}
            {mode === 'skills' && activeSkill && (
              <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
                <SkillEditorTab t={t} s={activeSkill} set={setSkill} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 min-h-0 min-w-0 overflow-hidden">
            {mode === 'mobs' && activeMob && <MobPreview t={t} mob={activeMob} />}
            <div className={`${sectionCls} flex-1 min-h-0 overflow-hidden flex flex-col`}>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="min-w-0">
                  <SectionTitle>{t('mythicMobs.yamlOutput')}</SectionTitle>
                  <p className="text-[10px] font-mono text-white/25 mt-0.5 break-all leading-relaxed">
                    {folder}{yamlView === 'active' ? saveName : 'project.yml'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={copyYaml} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/60`}>
                    {copied ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                    {copied ? t('mythicMobs.copied') : t('mythicMobs.copy')}
                  </button>
                  <button type="button" onClick={() => downloadYaml(yaml, yamlView === 'active' ? saveName : 'mythicmobs-export.yml')}
                    className={`${btnCls} bg-red-500/10 border-red-500/20 text-red-300`}>
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('mythicMobs.save')}
                  </button>
                </div>
              </div>
              <div className="flex-shrink-0 min-w-0">
                <CustomDropdown label={t('mythicMobs.yamlView')} value={yamlView} onChange={setYamlView}
                  options={yamlViewOptions} accent="red" />
              </div>
              <pre className="flex-1 min-h-0 h-0 overflow-auto p-3 rounded-xl bg-[#0d0d1a] border border-white/[0.04] text-[10px] font-mono text-red-200/75 leading-relaxed whitespace-pre-wrap custom-dropdown-scroll">{yaml}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
