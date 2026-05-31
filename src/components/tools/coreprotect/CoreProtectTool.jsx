import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  PlusIcon, TrashIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import {
  LOGGING_GROUPS, COMMAND_TYPES, ACTIONS, HASHTAGS, BLACKLIST_TYPES,
  CONFIG_PRESETS, WORLD_PRESETS, COMMAND_PRESETS,
  createProfileState, createBlacklistEntry, createCommandState,
  presetToProfile, worldPresetToProfile, buildCoCommand, countEnabledLogging,
} from './coreProtectData'
import {
  buildConfigYaml, buildBlacklistText, buildProjectYaml,
  getProfileFileName, downloadText,
} from './coreProtectYaml'
import { useI18n } from '../../../context/I18nContext'

const MAIN_TAB_DEFS = [
  { id: 'config', labelKey: 'tabConfig' },
  { id: 'blacklist', labelKey: 'tabBlacklist' },
  { id: 'commands', labelKey: 'tabCommands' },
]

const CONFIG_TAB_DEFS = [
  { id: 'general', labelKey: 'tabGeneral' },
  { id: 'database', labelKey: 'tabDatabase' },
  { id: 'logging', labelKey: 'tabLogging' },
]

const LOG_GROUP_I18N = {
  rollback: 'logGroupRollback',
  blocks: 'logGroupBlocks',
  entities: 'logGroupEntities',
  liquids: 'logGroupLiquids',
  player: 'logGroupPlayer',
}

const CONFIG_PRESET_I18N = {
  default: 'presetDefault',
  performance: 'presetPerformance',
  minimal: 'presetMinimal',
}

const WORLD_PRESET_I18N = {
  'nether-minimal': 'worldNetherMinimal',
  'end-disabled': 'worldEndDisabled',
  'overworld-standard': 'worldOverworldStandard',
}

const CMD_PRESET_I18N = {
  'grief-1h': 'cmdGrief1h',
  'grief-player': 'cmdGriefPlayer',
  'chest-theft': 'cmdChestTheft',
  xray: 'cmdXray',
  'purge-30d': 'cmdPurge30d',
  'restore-undo': 'cmdRestoreUndo',
}

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-teal-500/30 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3'
const sectionHead = 'text-[10px] text-white/30 uppercase tracking-widest font-semibold'

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
        value ? 'border-teal-500/35 bg-teal-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center transition-all ${value ? 'bg-teal-500/40 border-teal-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
        <span className={`block w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold text-white/80 block">{label}</span>
        {desc && <span className="text-[10px] text-white/35 block mt-0.5">{desc}</span>}
      </span>
    </button>
  )
}

function ProfileList({ t, profiles, activeId, onSelect, onDelete, onAdd }) {
  const countLabel = profiles.length === 1
    ? t('coreProtect.profileCount', { count: profiles.length })
    : t('coreProtect.profileCount_plural', { count: profiles.length })
  return (
    <div className={`${sectionCls} min-h-0 overflow-hidden flex flex-col flex-1`}>
      <div className="flex items-center justify-between gap-2 flex-shrink-0">
        <div>
          <SectionTitle>{t('coreProtect.profiles')}</SectionTitle>
          <p className="text-[10px] text-white/25 mt-0.5">{countLabel}</p>
        </div>
        <button type="button" onClick={onAdd} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('coreProtect.new')}
        </button>
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
        {profiles.map(p => {
          const active = p._id === activeId
          const file = getProfileFileName(p)
          const enabled = countEnabledLogging(p)
          return (
            <div key={p._id}
              className={`group flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                active ? 'border-teal-500/35 bg-teal-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
              }`}>
              <button type="button" onClick={() => onSelect(p._id)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-mono font-semibold text-white/85 truncate">{file}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded border flex-shrink-0 ${
                    p.profileType === 'world' ? 'border-cyan-500/25 text-cyan-300 bg-cyan-500/10' : 'border-teal-500/25 text-teal-300 bg-teal-500/10'
                  }`}>{p.profileType === 'world' ? t('coreProtect.tagWorld') : t('coreProtect.tagGlobal')}</span>
                </div>
                <p className="text-[10px] text-white/35">{t('coreProtect.loggingOn', { count: enabled })}</p>
              </button>
              <button type="button" onClick={() => onDelete(p._id)} disabled={profiles.length <= 1}
                className="p-1.5 rounded-lg border border-red-500/15 text-red-400/70 opacity-60 group-hover:opacity-100 disabled:opacity-25">
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ConfigSummary({ t, profile }) {
  const enabled = countEnabledLogging(profile)
  const file = getProfileFileName(profile)
  const folder = t('coreProtect.folder')
  return (
    <div className={`${sectionCls} flex-shrink-0`}>
      <SectionTitle>{t('coreProtect.summary')}</SectionTitle>
      <div className="rounded-xl bg-[#0d0d1a] border border-white/[0.04] p-3 flex flex-col gap-2">
        <p className="text-[11px] font-mono text-teal-300/90">{t('coreProtect.summaryPath', { folder, file })}</p>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/25 text-teal-300">{t('coreProtect.badgeLogsOn', { count: enabled })}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">{t('coreProtect.badgeRadius', { radius: profile.defaultRadius })}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300">{profile.useMysql ? 'MySQL' : 'SQLite'}</span>
        </div>
        <p className="text-[10px] text-white/30 pt-1 border-t border-white/[0.04]">
          {t('coreProtect.applyReload', { cmd: t('coreProtect.reloadCmd') })}
        </p>
      </div>
    </div>
  )
}

function GeneralTab({ t, s, set, profileTypeOptions }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <SectionTitle>{t('coreProtect.sectionProfileType')}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CustomDropdown label={t('coreProtect.fieldType')} value={s.profileType} onChange={v => set({ profileType: v })} options={profileTypeOptions} accent="teal" />
          {s.profileType === 'world' && (
            <Field label={t('coreProtect.fieldWorldFolder')}>
              <input className={`${inputCls} font-mono`} value={s.worldName} onChange={e => set({ worldName: e.target.value })}
                placeholder="world_nether" />
            </Field>
          )}
        </div>
        {s.profileType === 'world' && (
          <Toggle label={t('coreProtect.toggleMinimalWorld')} desc={t('coreProtect.toggleMinimalWorldDesc')} value={s.worldOverrideMinimal}
            onChange={v => set({ worldOverrideMinimal: v })} />
        )}
      </div>
      {!s.worldOverrideMinimal && (
        <div className={sectionCls}>
          <SectionTitle>{t('coreProtect.sectionGeneral')}</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('coreProtect.fieldDefaultRadius')}><input type="number" className={inputCls} value={s.defaultRadius} onChange={e => set({ defaultRadius: Number(e.target.value) })} /></Field>
            <Field label={t('coreProtect.fieldMaxRadius')}><input type="number" className={inputCls} value={s.maxRadius} onChange={e => set({ maxRadius: Number(e.target.value) })} /></Field>
          </div>
          <div className="flex flex-col gap-2">
            <Toggle label={t('coreProtect.toggleVerbose')} desc={t('coreProtect.toggleVerboseDesc')} value={s.verbose} onChange={v => set({ verbose: v })} />
            <Toggle label={t('coreProtect.toggleCheckUpdates')} desc={t('coreProtect.toggleCheckUpdatesDesc')} value={s.checkUpdates} onChange={v => set({ checkUpdates: v })} />
            <Toggle label={t('coreProtect.toggleApi')} desc={t('coreProtect.toggleApiDesc')} value={s.apiEnabled} onChange={v => set({ apiEnabled: v })} />
          </div>
        </div>
      )}
    </div>
  )
}

function DatabaseTab({ t, s, set }) {
  if (s.profileType === 'world') {
    return <p className="text-[11px] text-white/35 text-center py-8">{t('coreProtect.databaseWorldOnly')}</p>
  }
  return (
    <div className="flex flex-col gap-4">
      <div className={sectionCls}>
        <SectionTitle>{t('coreProtect.sectionMysql')}</SectionTitle>
        <Toggle label={t('coreProtect.toggleMysql')} desc={t('coreProtect.toggleMysqlDesc')} value={s.useMysql} onChange={v => set({ useMysql: v })} />
        {s.useMysql && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <Field label={t('coreProtect.fieldTablePrefix')}><input className={`${inputCls} font-mono`} value={s.tablePrefix} onChange={e => set({ tablePrefix: e.target.value })} /></Field>
            <Field label={t('coreProtect.fieldHost')}><input className={inputCls} value={s.mysqlHost} onChange={e => set({ mysqlHost: e.target.value })} /></Field>
            <Field label={t('coreProtect.fieldPort')}><input type="number" className={inputCls} value={s.mysqlPort} onChange={e => set({ mysqlPort: Number(e.target.value) })} /></Field>
            <Field label={t('coreProtect.fieldDatabase')}><input className={inputCls} value={s.mysqlDatabase} onChange={e => set({ mysqlDatabase: e.target.value })} /></Field>
            <Field label={t('coreProtect.fieldUsername')}><input className={inputCls} value={s.mysqlUsername} onChange={e => set({ mysqlUsername: e.target.value })} /></Field>
            <Field label={t('coreProtect.fieldPassword')}><input type="password" className={inputCls} value={s.mysqlPassword} onChange={e => set({ mysqlPassword: e.target.value })} /></Field>
          </div>
        )}
      </div>
    </div>
  )
}

function LoggingTab({ t, s, set }) {
  const setAll = (val) => {
    const patch = {}
    LOGGING_GROUPS.flatMap(g => g.options).forEach(o => { patch[o.field] = val })
    set(patch)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        <button type="button" onClick={() => setAll(true)} className={`${btnCls} bg-teal-500/10 border-teal-500/20 text-teal-300`}>{t('coreProtect.enableAll')}</button>
        <button type="button" onClick={() => setAll(false)} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/50`}>{t('coreProtect.disableAll')}</button>
      </div>
      {LOGGING_GROUPS.map(group => (
        <div key={group.id} className={sectionCls}>
          <SectionTitle>{t(`coreProtect.${LOG_GROUP_I18N[group.id]}`)}</SectionTitle>
          <div className="flex flex-col gap-2">
            {group.options.map(opt => (
              <Toggle key={opt.key} label={opt.label} desc={opt.desc}
                value={!!s[opt.field]} onChange={v => set({ [opt.field]: v })} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function BlacklistPanel({ t, entries, setEntries, copied, onCopy }) {
  const text = useMemo(() => buildBlacklistText(entries), [entries])

  const add = () => setEntries(prev => [...prev, createBlacklistEntry()])
  const update = (id, patch) => setEntries(prev => prev.map(e => e._id === id ? { ...e, ...patch } : e))
  const remove = (id) => setEntries(prev => prev.filter(e => e._id !== id))

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 flex-1 min-h-0">
      <div className={`${sectionCls} min-h-0 overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between flex-shrink-0">
          <SectionTitle>{t('coreProtect.sectionBlacklistEntries')}</SectionTitle>
          <button type="button" onClick={add} className={`${btnCls} bg-teal-500/10 border-teal-500/20 text-teal-300`}>
            <PlusIcon className="w-3.5 h-3.5" />{t('coreProtect.new')}
          </button>
        </div>
        <p className="text-[10px] text-white/30 flex-shrink-0">{t('coreProtect.blacklistHint')}</p>
        <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll flex flex-col gap-2 pr-0.5">
          {entries.length === 0 && <p className="text-[11px] text-white/25 text-center py-6">{t('coreProtect.blacklistEmpty')}</p>}
          {entries.map(e => {
            const typeInfo = BLACKLIST_TYPES.find(bl => bl.value === e.type)
            return (
              <div key={e._id} className="grid grid-cols-[120px_1fr_auto] gap-2 items-end">
                <CustomDropdown label={t('coreProtect.fieldType')} value={e.type} onChange={v => update(e._id, { type: v })} options={BLACKLIST_TYPES.map(bl => ({ value: bl.value, label: bl.label }))} accent="teal" />
                <Field label={typeInfo?.desc || t('coreProtect.fieldValue')}>
                  <input className={`${inputCls} font-mono text-xs`} value={e.value} onChange={ev => update(e._id, { value: ev.target.value })} placeholder={typeInfo?.example || ''} />
                </Field>
                <button type="button" onClick={() => remove(e._id)} className="p-2 text-red-400/60 mb-0.5"><TrashIcon className="w-4 h-4" /></button>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-2 flex-shrink-0 pt-2 border-t border-white/[0.06]">
          {BLACKLIST_TYPES.map(bl => (
            <button key={bl.value} type="button"
              onClick={() => setEntries(prev => [...prev, createBlacklistEntry(bl.value, bl.example)])}
              className="text-[10px] px-2 py-1 rounded-lg border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.04]">
              + {bl.example}
            </button>
          ))}
        </div>
      </div>
      <div className={`${sectionCls} flex flex-col min-h-0`}>
        <div className="flex items-center justify-between flex-shrink-0">
          <SectionTitle>{t('coreProtect.sectionBlacklistFile')}</SectionTitle>
          <div className="flex gap-1.5">
            <button type="button" onClick={onCopy} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/60`}>
              {copied ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
              {copied ? t('coreProtect.copied') : t('coreProtect.copy')}
            </button>
            <button type="button" onClick={() => downloadText(text, 'blacklist.txt')} className={`${btnCls} bg-teal-500/10 border-teal-500/20 text-teal-300`}>
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('coreProtect.save')}
            </button>
          </div>
        </div>
        <pre className="flex-1 min-h-[200px] overflow-auto p-3 rounded-xl bg-[#0d0d1a] border border-white/[0.04] text-[10px] font-mono text-teal-200/75 whitespace-pre-wrap custom-dropdown-scroll">{text || t('coreProtect.blacklistNoEntries')}</pre>
      </div>
    </div>
  )
}

function CommandsPanel({ t, cmd, setCmd, copied, onCopy }) {
  const built = useMemo(() => buildCoCommand(cmd), [cmd])

  const toggleTag = (tag) => {
    setCmd(prev => ({
      ...prev,
      hashtags: prev.hashtags?.includes(tag)
        ? prev.hashtags.filter(h => h !== tag)
        : [...(prev.hashtags || []), tag],
    }))
  }

  if (cmd.commandType === 'inspect') {
    return (
      <div className={`${sectionCls} max-w-lg`}>
        <SectionTitle>{t('coreProtect.sectionInspector')}</SectionTitle>
        <p className="text-[11px] text-white/40">{t('coreProtect.inspectorDesc')}</p>
        <code className="block mt-3 p-3 rounded-xl bg-[#0d0d1a] border border-white/[0.04] font-mono text-sm text-teal-300">/co inspect</code>
        <p className="text-[10px] text-white/30 mt-2">{t('coreProtect.inspectorAlias')} <span className="font-mono">/co i</span></p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 flex-1 min-h-0">
      <div className={`${sectionCls}`}>
        <SectionTitle>{t('coreProtect.sectionCmdParams')}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CustomDropdown label={t('coreProtect.fieldCommand')} value={cmd.commandType} onChange={v => setCmd({ ...cmd, commandType: v })} options={COMMAND_TYPES.filter(c => c.value !== 'inspect')} accent="teal" />
          <Field label={t('coreProtect.fieldUsers')}><input className={inputCls} value={cmd.users} onChange={e => setCmd({ ...cmd, users: e.target.value })} placeholder="Notch,Intelli or #tnt" /></Field>
          <Field label={t('coreProtect.fieldTime')}><input className={`${inputCls} font-mono`} value={cmd.time} onChange={e => setCmd({ ...cmd, time: e.target.value })} placeholder="1h, 30d, 5m" /></Field>
          <Field label={t('coreProtect.fieldRadius')}><input className={`${inputCls} font-mono`} value={cmd.radius} onChange={e => setCmd({ ...cmd, radius: e.target.value })} placeholder="10, #global, #world_nether" /></Field>
          <CustomDropdown label={t('coreProtect.fieldAction')} value={cmd.action} onChange={v => setCmd({ ...cmd, action: v })} options={ACTIONS} accent="teal" />
          <Field label={t('coreProtect.fieldInclude')}><input className={`${inputCls} font-mono`} value={cmd.include} onChange={e => setCmd({ ...cmd, include: e.target.value })} placeholder="stone,diamond_ore" /></Field>
          <Field label={t('coreProtect.fieldExclude')}><input className={`${inputCls} font-mono`} value={cmd.exclude} onChange={e => setCmd({ ...cmd, exclude: e.target.value })} placeholder="tnt,dirt" /></Field>
        </div>
        <SectionTitle>{t('coreProtect.sectionHashtags')}</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {HASHTAGS.map(h => (
            <button key={h.value} type="button" onClick={() => toggleTag(h.value)}
              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono transition-all ${
                cmd.hashtags?.includes(h.value) ? 'border-teal-500/40 bg-teal-500/15 text-teal-300' : 'border-white/[0.08] text-white/40'
              }`} title={h.desc}>{h.label}</button>
          ))}
        </div>
        <SectionTitle>{t('coreProtect.sectionPresets')}</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {COMMAND_PRESETS.map(p => (
            <button key={p.id} type="button" onClick={() => setCmd(createCommandState(p))}
              className="px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[10px] text-white/50 hover:text-white/80 hover:bg-white/[0.06]">
              {t(`coreProtect.${CMD_PRESET_I18N[p.id]}`)}
            </button>
          ))}
        </div>
      </div>
      <div className={`${sectionCls} flex flex-col`}>
        <div className="flex items-center justify-between flex-shrink-0">
          <SectionTitle>{t('coreProtect.sectionGeneratedCmd')}</SectionTitle>
          <button type="button" onClick={onCopy} className={`${btnCls} bg-teal-500/10 border-teal-500/20 text-teal-300`}>
            {copied ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
            {t('coreProtect.copy')}
          </button>
        </div>
        <code className="block p-4 rounded-xl bg-[#0d0d1a] border border-teal-500/20 font-mono text-[12px] text-teal-200 leading-relaxed break-all">{built}</code>
        <div className="mt-3 flex flex-col gap-1.5 text-[10px] text-white/35">
          <p><span className="text-white/50 font-mono">u:</span> {t('coreProtect.cmdLegend1')}</p>
          <p><span className="text-white/50 font-mono">a:</span> {t('coreProtect.cmdLegend2')}</p>
        </div>
      </div>
    </div>
  )
}

export default function CoreProtectTool({ onBack }) {
  const { t } = useI18n()
  const [mainTab, setMainTab] = useState('config')
  const [configTab, setConfigTab] = useState('general')
  const [profiles, setProfiles] = useState(() => [presetToProfile(CONFIG_PRESETS[0])])
  const [activeId, setActiveId] = useState(() => profiles[0]?._id)
  const [blacklist, setBlacklist] = useState(() => [
    createBlacklistEntry('user', 'Notch'),
    createBlacklistEntry('block', 'minecraft:stone'),
  ])
  const [cmd, setCmd] = useState(() => createCommandState())
  const [yamlView, setYamlView] = useState('active')
  const [copied, setCopied] = useState(false)
  const [copiedBl, setCopiedBl] = useState(false)
  const [copiedCmd, setCopiedCmd] = useState(false)

  const active = useMemo(() => profiles.find(p => p._id === activeId) ?? profiles[0], [profiles, activeId])

  const set = useCallback((patch) => {
    setProfiles(prev => prev.map(p => (p._id === activeId ? { ...p, ...patch } : p)))
  }, [activeId])

  const yaml = useMemo(() => {
    if (yamlView === 'all') return buildProjectYaml(profiles, activeId)
    return active ? buildConfigYaml(active) : ''
  }, [profiles, activeId, active, yamlView])

  const copyYaml = useCallback(() => {
    navigator.clipboard.writeText(yaml).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [yaml])

  const applyConfigPreset = (id) => {
    const p = CONFIG_PRESETS.find(x => x.id === id)
    if (p) set(p.patch)
  }

  const addWorldPreset = (id) => {
    const p = WORLD_PRESETS.find(x => x.id === id)
    if (p) {
      const prof = worldPresetToProfile(p)
      setProfiles(prev => [...prev, prof])
      setActiveId(prof._id)
    }
  }

  const addProfile = () => {
    const p = createProfileState({ profileType: 'world', worldName: `world_${profiles.length}` })
    setProfiles(prev => [...prev, p])
    setActiveId(p._id)
  }

  const deleteProfile = (id) => {
    setProfiles(prev => {
      const next = prev.filter(p => p._id !== id)
      if (activeId === id && next.length) setActiveId(next[0]._id)
      return next.length ? next : [createProfileState()]
    })
  }

  const saveName = active ? getProfileFileName(active) : 'config.yml'

  const profileTypeOptions = useMemo(() => [
    { value: 'global', label: t('coreProtect.profileTypeGlobal') },
    { value: 'world', label: t('coreProtect.profileTypeWorld') },
  ], [t])

  const configPresetOptions = useMemo(() => CONFIG_PRESETS.map(p => ({
    value: p.id,
    label: t('coreProtect.presetPrefix', { name: t(`coreProtect.${CONFIG_PRESET_I18N[p.id]}`) }),
  })), [t])

  const worldPresetOptions = useMemo(() => WORLD_PRESETS.map(p => ({
    value: p.id,
    label: t('coreProtect.worldPrefix', { name: t(`coreProtect.${WORLD_PRESET_I18N[p.id]}`) }),
  })), [t])

  const yamlViewOptions = useMemo(() => [
    { value: 'active', label: t('coreProtect.yamlActive') },
    { value: 'all', label: t('coreProtect.yamlAll') },
  ], [t])

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white">{t('coreProtect.title')}</h1>
          <p className="text-xs text-white/35 mt-0.5">{t('coreProtect.subtitle')}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {MAIN_TAB_DEFS.map(tabDef => (
            <button key={tabDef.id} type="button" onClick={() => setMainTab(tabDef.id)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                mainTab === tabDef.id ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-white/[0.03] border-white/[0.08] text-white/40'
              }`}>{t(`coreProtect.${tabDef.labelKey}`)}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4 flex flex-col">
        {mainTab === 'config' && (
          <>
            <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0">
              <CustomDropdown label="" value="" onChange={applyConfigPreset}
                options={configPresetOptions}
                placeholder={t('coreProtect.applyPreset')} accent="teal" className="w-44" />
              <CustomDropdown label="" value="" onChange={addWorldPreset}
                options={worldPresetOptions}
                placeholder={t('coreProtect.addWorldProfile')} accent="teal" className="w-48" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[200px_1fr_260px] gap-3 flex-1 min-h-0">
              <div className="min-h-0 flex flex-col overflow-hidden">
                <ProfileList t={t} profiles={profiles} activeId={activeId} onSelect={setActiveId} onDelete={deleteProfile} onAdd={addProfile} />
              </div>
              <div className={`${sectionCls} min-h-0 overflow-hidden flex flex-col`}>
                <div className="flex gap-1 flex-shrink-0 flex-wrap">
                  {CONFIG_TAB_DEFS.map(tabDef => (
                    <button key={tabDef.id} type="button" onClick={() => setConfigTab(tabDef.id)}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold ${
                        configTab === tabDef.id ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-white/[0.03] border-white/[0.08] text-white/40'
                      }`}>{t(`coreProtect.${tabDef.labelKey}`)}</button>
                  ))}
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
                  {active && configTab === 'general' && <GeneralTab t={t} s={active} set={set} profileTypeOptions={profileTypeOptions} />}
                  {active && configTab === 'database' && <DatabaseTab t={t} s={active} set={set} />}
                  {active && configTab === 'logging' && <LoggingTab t={t} s={active} set={set} />}
                </div>
              </div>
              <div className="min-h-0 flex flex-col gap-3 overflow-hidden">
                {active && <ConfigSummary t={t} profile={active} />}
                <div className={`${sectionCls} flex-1 min-h-0 overflow-hidden flex flex-col`}>
                  <div className="flex items-center justify-between gap-2 flex-shrink-0">
                    <SectionTitle>{t('coreProtect.configYml')}</SectionTitle>
                    <div className="flex gap-1">
                      <button type="button" onClick={copyYaml} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/60`}>
                        {copied ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                      </button>
                      <button type="button" onClick={() => downloadText(yaml, yamlView === 'active' ? saveName : 'coreprotect-export.yml')}
                        className={`${btnCls} bg-teal-500/10 border-teal-500/20 text-teal-300`}>
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <CustomDropdown label={t('coreProtect.yamlView')} value={yamlView} onChange={setYamlView}
                    options={yamlViewOptions} accent="teal" />
                  <pre className="flex-1 min-h-0 overflow-auto p-3 rounded-xl bg-[#0d0d1a] border border-white/[0.04] text-[10px] font-mono text-teal-200/75 whitespace-pre-wrap custom-dropdown-scroll">{yaml}</pre>
                </div>
              </div>
            </div>
          </>
        )}

        {mainTab === 'blacklist' && (
          <BlacklistPanel t={t} entries={blacklist} setEntries={setBlacklist} copied={copiedBl}
            onCopy={() => {
              navigator.clipboard.writeText(buildBlacklistText(blacklist)).catch(() => {})
              setCopiedBl(true)
              setTimeout(() => setCopiedBl(false), 2000)
            }} />
        )}

        {mainTab === 'commands' && (
          <CommandsPanel t={t} cmd={cmd} setCmd={setCmd} copied={copiedCmd}
            onCopy={() => {
              navigator.clipboard.writeText(buildCoCommand(cmd)).catch(() => {})
              setCopiedCmd(true)
              setTimeout(() => setCopiedCmd(false), 2000)
            }} />
        )}
      </div>
    </div>
  )
}
