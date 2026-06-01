import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  PlusIcon, TrashIcon, MagnifyingGlassIcon, CloudArrowDownIcon,
  CloudArrowUpIcon, SignalIcon, XMarkIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import {
  PERMISSION_CATEGORIES, GROUP_PRESETS, EXPORT_FORMATS,
  createGroupState, createPermissionEntry, presetToGroups, uid,
} from './permissionData'
import {
  buildOutput, downloadText, parseImportYaml,
  pullFromLuckPerms, pushToLuckPerms, testLuckPermsConnection,
} from './permissionExport'
import { useI18n } from '../../../context/I18nContext'
import {
  tPerm, tCat, tTab, PRESET_I18N, EXPORT_FORMAT_I18N,
} from './permissionI18n'

const TAB_DEFS = [
  { id: 'overview' },
  { id: 'permissions' },
  { id: 'meta' },
]

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-violet-500/30 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3'
const sectionHead = 'text-[10px] text-white/30 uppercase tracking-widest font-semibold'

const MC_COLORS = {
  '0': '#555555', '1': '#5555FF', '2': '#55FF55', '3': '#55FFFF',
  '4': '#FF5555', '5': '#FF55FF', '6': '#FFAA00', '7': '#AAAAAA',
  '8': '#555555', '9': '#5555FF', a: '#55FF55', b: '#55FFFF',
  c: '#FF5555', d: '#FF55FF', e: '#FFFF55', f: '#FFFFFF',
  l: null, r: 'reset',
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
      else if (MC_COLORS[code] === 'reset') { color = '#AAAAAA'; bold = false }
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

function GroupList({ groups, activeId, onSelect, onDelete, onAdd, t }) {
  const groupCountLabel = groups.length === 1
    ? t('permissionBuilder.groupCount', { count: groups.length })
    : t('permissionBuilder.groupCount_plural', { count: groups.length })
  return (
    <div className={`${sectionCls} h-full min-h-[200px]`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <SectionTitle>{t('permissionBuilder.groups')}</SectionTitle>
          <p className="text-[10px] text-white/25 mt-0.5">{groupCountLabel}</p>
        </div>
        <button type="button" onClick={onAdd} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('permissionBuilder.new')}
        </button>
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
        {[...groups].sort((a, b) => (b.weight || 0) - (a.weight || 0)).map(g => {
          const active = g._id === activeId
          const permCount = (g.permissions?.length || 0) + (g.parents?.length || 0)
          return (
            <div key={g._id}
              className={`group flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                active ? 'border-violet-500/35 bg-violet-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
              }`}>
              <button type="button" onClick={() => onSelect(g._id)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-mono font-semibold text-white/85 truncate">{g.name}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-violet-500/15 border border-violet-500/25 text-violet-300 flex-shrink-0">w:{g.weight ?? 0}</span>
                </div>
                <McText text={g.prefix?.value || g.displayName || g.name} className="text-[10px] truncate block" />
                <div className="flex gap-1.5 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-white/40">{t('permissionBuilder.nodes', { count: permCount })}</span>
                  {(g.parents?.length > 0) && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300/70 truncate">
                      ← {g.parents.join(', ')}
                    </span>
                  )}
                </div>
              </button>
              <button type="button" onClick={() => onDelete(g._id)} disabled={groups.length <= 1} title={t('permissionBuilder.delete')}
                className="p-1.5 rounded-lg border border-red-500/15 bg-red-500/5 text-red-400/70 hover:text-red-300 hover:bg-red-500/15 transition-all disabled:opacity-25 disabled:cursor-not-allowed opacity-60 group-hover:opacity-100">
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GroupOverview({ group, allGroups, onChange, t }) {
  const parentOptions = allGroups
    .filter(g => g._id !== group._id && g.name !== group.name)
    .map(g => ({ value: g.name, label: g.name }))

  const toggleParent = (name) => {
    const parents = group.parents || []
    onChange({
      parents: parents.includes(name) ? parents.filter(p => p !== name) : [...parents, name],
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('permissionBuilder.fieldGroupName')}>
          <input className={inputCls} value={group.name}
            onChange={e => onChange({ name: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
            placeholder="default" />
        </Field>
        <Field label={t('permissionBuilder.fieldDisplayName')}>
          <input className={inputCls} value={group.displayName || ''}
            onChange={e => onChange({ displayName: e.target.value })} placeholder="Default" />
        </Field>
      </div>
      <Field label={t('permissionBuilder.fieldWeight')}>
        <input type="number" className={inputCls} value={group.weight ?? 0}
          onChange={e => onChange({ weight: Number(e.target.value) || 0 })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('permissionBuilder.fieldPrefix')}>
          <input className={inputCls} value={group.prefix?.value || ''}
            onChange={e => onChange({ prefix: { ...group.prefix, value: e.target.value } })} placeholder="&a[VIP]&r " />
        </Field>
        <Field label={t('permissionBuilder.fieldPrefixPriority')}>
          <input type="number" className={inputCls} value={group.prefix?.priority ?? 100}
            onChange={e => onChange({ prefix: { ...group.prefix, priority: Number(e.target.value) || 100 } })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('permissionBuilder.fieldSuffix')}>
          <input className={inputCls} value={group.suffix?.value || ''}
            onChange={e => onChange({ suffix: { ...group.suffix, value: e.target.value } })} />
        </Field>
        <Field label={t('permissionBuilder.fieldSuffixPriority')}>
          <input type="number" className={inputCls} value={group.suffix?.priority ?? 100}
            onChange={e => onChange({ suffix: { ...group.suffix, priority: Number(e.target.value) || 100 } })} />
        </Field>
      </div>
      <div className="rounded-xl bg-[#0d0d1a] border border-white/[0.04] p-3">
        <p className="text-[10px] text-white/30 mb-1">{t('permissionBuilder.prefixPreview')}</p>
        <McText text={(group.prefix?.value || '') + 'PlayerName' + (group.suffix?.value || '')} className="text-sm" />
      </div>
      {parentOptions.length > 0 && (
        <div>
          <SectionTitle>{t('permissionBuilder.inheritFrom')}</SectionTitle>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {parentOptions.map(opt => {
              const on = (group.parents || []).includes(opt.value)
              return (
                <button key={opt.value} type="button" onClick={() => toggleParent(opt.value)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
                    on ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70'
                  }`}>
                  group.{opt.value}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function PermissionBrowser({ group, onAddPermission, search, onSearchChange, t }) {
  const [activeCat, setActiveCat] = useState(PERMISSION_CATEGORIES[0]?.id)
  const category = PERMISSION_CATEGORIES.find(c => c.id === activeCat)
  const existing = new Set((group.permissions || []).map(p => p.node))

  const filtered = useMemo(() => {
    if (!category) return []
    const q = search.trim().toLowerCase()
    if (!q) return category.permissions
    return category.permissions.filter(p => {
      const label = tPerm(t, p.node, 'label', p.label)
      const desc = tPerm(t, p.node, 'desc', p.desc)
      return p.node.toLowerCase().includes(q) || label.toLowerCase().includes(q) || desc?.toLowerCase().includes(q)
    })
  }, [category, search, t])

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <div className="flex gap-1 flex-wrap">
        {PERMISSION_CATEGORIES.map(c => (
          <button key={c.id} type="button" onClick={() => setActiveCat(c.id)}
            className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${
              activeCat === c.id ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/[0.03] border-white/[0.08] text-white/40'
            }`}>
            {tCat(t, c.id, c.label)}
          </button>
        ))}
      </div>
      <div className="relative">
        <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
        <input className={`${inputCls} pl-8`} value={search} onChange={e => onSearchChange(e.target.value)} placeholder={t('permissionBuilder.searchPermissions')} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll flex flex-col gap-1 pr-0.5">
        {filtered.map(p => {
          const has = existing.has(p.node)
          return (
            <button key={p.node} type="button" onClick={() => !has && onAddPermission(p.node)}
              disabled={has}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left transition-all ${
                has ? 'border-emerald-500/20 bg-emerald-500/5 opacity-60 cursor-default' : 'border-white/[0.06] bg-white/[0.02] hover:bg-violet-500/10 hover:border-violet-500/25'
              }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-white/80 truncate">{p.node}</span>
                  {has && <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </div>
                <p className="text-[10px] text-white/45 mt-0.5">{tPerm(t, p.node, 'label', p.label)} — {tPerm(t, p.node, 'desc', p.desc)}</p>
              </div>
              {!has && <PlusIcon className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function GroupPermissions({ group, onChange, t }) {
  const [search, setSearch] = useState('')
  const [customNode, setCustomNode] = useState('')

  const addPerm = (node) => {
    if (!node || group.permissions?.some(p => p.node === node)) return
    onChange({ permissions: [...(group.permissions || []), createPermissionEntry(node)] })
  }

  const updatePerm = (id, patch) => {
    onChange({
      permissions: (group.permissions || []).map(p => p._id === id ? { ...p, ...patch } : p),
    })
  }

  const removePerm = (id) => {
    onChange({ permissions: (group.permissions || []).filter(p => p._id !== id) })
  }

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <div className="flex gap-2">
        <input className={`${inputCls} flex-1 font-mono text-[12px]`} value={customNode}
          onChange={e => setCustomNode(e.target.value)} placeholder={t('permissionBuilder.customNodePlaceholder')}
          onKeyDown={e => { if (e.key === 'Enter') { addPerm(customNode.trim()); setCustomNode('') } }} />
        <button type="button" onClick={() => { addPerm(customNode.trim()); setCustomNode('') }}
          className={`${btnCls} bg-violet-500/10 border-violet-500/20 text-violet-300 flex-shrink-0`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('permissionBuilder.add')}
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll flex flex-col gap-1.5 pr-0.5 max-h-[180px]">
        {(group.permissions || []).length === 0 && (
          <p className="text-[11px] text-white/25 text-center py-4">{t('permissionBuilder.noPermissionsYet')}</p>
        )}
        {(group.permissions || []).map(p => (
          <div key={p._id} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <button type="button" onClick={() => updatePerm(p._id, { value: !p.value })}
              className={`w-8 h-5 rounded-full border flex-shrink-0 transition-all ${
                p.value !== false ? 'bg-emerald-500/30 border-emerald-500/50' : 'bg-red-500/20 border-red-500/40'
              }`}>
              <span className={`block w-3.5 h-3.5 rounded-full bg-white/80 mx-0.5 transition-transform ${
                p.value !== false ? 'translate-x-3' : 'translate-x-0'
              }`} />
            </button>
            <span className="flex-1 text-[11px] font-mono text-white/75 truncate">{p.node}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${
              p.value !== false ? 'border-emerald-500/25 text-emerald-300 bg-emerald-500/10' : 'border-red-500/25 text-red-300 bg-red-500/10'
            }`}>
              {p.value !== false ? t('permissionBuilder.trueVal') : t('permissionBuilder.falseVal')}
            </span>
            <button type="button" onClick={() => removePerm(p._id)} className="p-1 text-red-400/60 hover:text-red-300">
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <SectionTitle>{t('permissionBuilder.presetPermissions')}</SectionTitle>
      <PermissionBrowser group={group} onAddPermission={addPerm} search={search} onSearchChange={setSearch} t={t} />
    </div>
  )
}

function GroupMeta({ group, onChange, t }) {
  const addMeta = () => {
    onChange({ meta: [...(group.meta || []), { _id: uid(), key: '', value: '', context: [], expiry: null }] })
  }
  const updateMeta = (id, patch) => {
    onChange({ meta: (group.meta || []).map(m => m._id === id ? { ...m, ...patch } : m) })
  }
  const removeMeta = (id) => {
    onChange({ meta: (group.meta || []).filter(m => m._id !== id) })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionTitle>{t('permissionBuilder.customMeta')}</SectionTitle>
        <button type="button" onClick={addMeta} className={`${btnCls} bg-violet-500/10 border-violet-500/20 text-violet-300`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('permissionBuilder.addMeta')}
        </button>
      </div>
      <p className="text-[10px] text-white/30">{t('permissionBuilder.metaHint')}</p>
      {(group.meta || []).length === 0 && (
        <p className="text-[11px] text-white/25 text-center py-3">{t('permissionBuilder.noCustomMeta')}</p>
      )}
      {(group.meta || []).map(m => (
        <div key={m._id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
          <Field label={t('permissionBuilder.fieldKey')}>
            <input className={inputCls} value={m.key} onChange={e => updateMeta(m._id, { key: e.target.value })} placeholder="nametag-color" />
          </Field>
          <Field label={t('permissionBuilder.fieldValue')}>
            <input className={inputCls} value={m.value} onChange={e => updateMeta(m._id, { value: e.target.value })} placeholder="red" />
          </Field>
          <button type="button" onClick={() => removeMeta(m._id)} className="p-2 text-red-400/60 hover:text-red-300 mb-0.5">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

function SyncPanel({ lpConfig, onConfigChange, onPull, onPush, onTest, syncStatus, syncing, t }) {
  return (
    <div className={`${sectionCls} gap-2.5`}>
      <div className="flex items-center gap-2">
        <SignalIcon className="w-4 h-4 text-violet-400" />
        <SectionTitle>{t('permissionBuilder.syncTitle')}</SectionTitle>
      </div>
      <p className="text-[10px] text-white/30 leading-relaxed">
        {t('permissionBuilder.syncDesc')}
      </p>
      <Field label={t('permissionBuilder.fieldBaseUrl')}>
        <input className={inputCls} value={lpConfig.baseUrl}
          onChange={e => onConfigChange({ baseUrl: e.target.value })}
          placeholder="http://localhost:8080" />
      </Field>
      <Field label={t('permissionBuilder.fieldApiKey')}>
        <input type="password" className={inputCls} value={lpConfig.apiKey}
          onChange={e => onConfigChange({ apiKey: e.target.value })} placeholder="your-api-key" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onTest} disabled={syncing}
          className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white/90 disabled:opacity-40`}>
          <SignalIcon className="w-3.5 h-3.5" />{t('permissionBuilder.test')}
        </button>
        <button type="button" onClick={onPull} disabled={syncing}
          className={`${btnCls} bg-cyan-500/10 border-cyan-500/20 text-cyan-300 disabled:opacity-40`}>
          <CloudArrowDownIcon className="w-3.5 h-3.5" />{t('permissionBuilder.pull')}
        </button>
        <button type="button" onClick={onPush} disabled={syncing}
          className={`${btnCls} bg-violet-500/10 border-violet-500/20 text-violet-300 disabled:opacity-40`}>
          <CloudArrowUpIcon className="w-3.5 h-3.5" />{t('permissionBuilder.push')}
        </button>
      </div>
      {syncStatus && (
        <p className={`text-[10px] ${syncStatus.ok ? 'text-emerald-400' : 'text-red-400'}`}>{syncStatus.msg}</p>
      )}
    </div>
  )
}

export default function PermissionBuilderTool({ onBack }) {
  const { t } = useI18n()
  const [groups, setGroups] = useState(() => presetToGroups(GROUP_PRESETS[0]))
  const [activeId, setActiveId] = useState(() => groups[0]?._id)
  const [tab, setTab] = useState('overview')
  const [exportFormat, setExportFormat] = useState('commands')
  const [copied, setCopied] = useState(false)
  const [lpConfig, setLpConfig] = useState({ baseUrl: 'http://localhost:8080', apiKey: '' })
  const [syncStatus, setSyncStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)

  const activeGroup = groups.find(g => g._id === activeId) || groups[0]

  useEffect(() => {
    const api = window.sconfigAPI
    if (!api?.storeGet) return
    api.storeGet('luckperms-api').then(saved => {
      if (saved) setLpConfig(prev => ({ ...prev, ...saved }))
    }).catch(() => {})
  }, [])

  const saveLpConfig = useCallback((patch) => {
    setLpConfig(prev => {
      const next = { ...prev, ...patch }
      window.sconfigAPI?.storeSet?.('luckperms-api', next).catch(() => {})
      return next
    })
  }, [])

  const updateGroup = useCallback((id, patch) => {
    setGroups(prev => prev.map(g => g._id === id ? { ...g, ...patch } : g))
  }, [])

  const addGroup = useCallback(() => {
    const g = createGroupState({ name: `group${groups.length + 1}`, displayName: `Group ${groups.length + 1}` })
    setGroups(prev => [...prev, g])
    setActiveId(g._id)
  }, [groups.length])

  const deleteGroup = useCallback((id) => {
    setGroups(prev => {
      const next = prev.filter(g => g._id !== id)
      if (activeId === id && next.length) setActiveId(next[0]._id)
      return next.length ? next : [createGroupState()]
    })
  }, [activeId])

  const applyPreset = useCallback((preset) => {
    const next = presetToGroups(preset)
    setGroups(next)
    setActiveId(next[0]?._id)
  }, [])

  const output = useMemo(() => buildOutput(groups, exportFormat), [groups, exportFormat])

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const importFile = useCallback(async () => {
    const api = window.sconfigAPI
    let text
    if (api?.selectFile) {
      const path = await api.selectFile([
        { name: t('permissionBuilder.importFileYaml'), extensions: ['yml', 'yaml', 'json'] },
        { name: t('permissionBuilder.importFileAll'), extensions: ['*'] },
      ])
      if (!path) return
      const res = await api.readFile(path)
      if (!res.ok) { setSyncStatus({ ok: false, msg: res.error }); return }
      text = res.data
    } else {
      text = prompt(t('permissionBuilder.importPrompt')) || ''
      if (!text.trim()) return
    }
    try {
      const imported = parseImportYaml(text)
      if (!imported.length) { setSyncStatus({ ok: false, msg: t('permissionBuilder.msgNoGroups') }); return }
      setGroups(imported)
      setActiveId(imported[0]._id)
      setSyncStatus({ ok: true, msg: t('permissionBuilder.msgImported', { count: imported.length }) })
    } catch (e) {
      setSyncStatus({ ok: false, msg: e.message || t('permissionBuilder.msgImportFailed') })
    }
  }, [t])

  const handleTest = useCallback(async () => {
    setSyncing(true)
    setSyncStatus(null)
    try {
      const r = await testLuckPermsConnection(lpConfig.baseUrl, lpConfig.apiKey)
      setSyncStatus(r.ok
        ? { ok: true, msg: t('permissionBuilder.msgConnected', { count: r.count }) }
        : { ok: false, msg: r.error || `HTTP ${r.status}` })
    } catch (e) {
      setSyncStatus({ ok: false, msg: e.message })
    } finally {
      setSyncing(false)
    }
  }, [lpConfig, t])

  const handlePull = useCallback(async () => {
    setSyncing(true)
    setSyncStatus(null)
    try {
      const pulled = await pullFromLuckPerms(lpConfig.baseUrl, lpConfig.apiKey)
      setGroups(pulled)
      setActiveId(pulled[0]?._id)
      setSyncStatus({ ok: true, msg: t('permissionBuilder.msgPulled', { count: pulled.length }) })
    } catch (e) {
      setSyncStatus({ ok: false, msg: e.message })
    } finally {
      setSyncing(false)
    }
  }, [lpConfig, t])

  const handlePush = useCallback(async () => {
    setSyncing(true)
    setSyncStatus(null)
    try {
      const results = await pushToLuckPerms(lpConfig.baseUrl, lpConfig.apiKey, groups)
      const failed = results.filter(r => !r.ok)
      if (failed.length) {
        setSyncStatus({
          ok: false,
          msg: t('permissionBuilder.msgPushPartial', { names: failed.map(f => f.name).join(', ') }),
        })
      } else {
        setSyncStatus({ ok: true, msg: t('permissionBuilder.msgPushed', { count: results.length }) })
      }
    } catch (e) {
      setSyncStatus({ ok: false, msg: e.message })
    } finally {
      setSyncing(false)
    }
  }, [lpConfig, groups, t])

  const presetOptions = useMemo(() => GROUP_PRESETS.map(p => {
    const keys = PRESET_I18N[p.id]
    return {
      value: p.id,
      label: keys ? t(`permissionBuilder.${keys.label}`) : p.label,
    }
  }), [t])

  const exportFormatOptions = useMemo(() => EXPORT_FORMATS.map(f => ({
    value: f.value,
    label: t(`permissionBuilder.${EXPORT_FORMAT_I18N[f.value]}`),
  })), [t])

  const ext = exportFormat === 'yaml' ? 'yml' : exportFormat === 'api' ? 'json' : 'txt'

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0 flex-wrap">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-violet-500/30 bg-violet-500/10 text-violet-300 font-semibold uppercase">{t('permissionBuilder.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('permissionBuilder.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('permissionBuilder.subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <CustomDropdown
            label=""
            value=""
            onChange={v => { const p = GROUP_PRESETS.find(x => x.id === v); if (p) applyPreset(p) }}
            options={presetOptions}
            placeholder={t('permissionBuilder.loadPreset')}
            accent="violet"
            className="w-40"
          />
          <button type="button" onClick={importFile} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/60`}>
            <ArrowDownTrayIcon className="w-3.5 h-3.5 rotate-180" />{t('permissionBuilder.import')}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr_320px] gap-3 flex-1 min-h-0">
          <GroupList groups={groups} activeId={activeId} onSelect={setActiveId} onDelete={deleteGroup} onAdd={addGroup} t={t} />

          <div className={`${sectionCls} min-h-0 overflow-hidden`}>
            {activeGroup && (
              <>
                <div className="flex items-center justify-between gap-2 flex-shrink-0">
                  <div>
                    <SectionTitle>{activeGroup.name}</SectionTitle>
                    <McText text={activeGroup.displayName} className="text-[11px] text-white/40" />
                  </div>
                  <div className="flex gap-1">
                    {TAB_DEFS.map(tabDef => (
                      <button key={tabDef.id} type="button" onClick={() => setTab(tabDef.id)}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all ${
                          tab === tabDef.id ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/[0.03] border-white/[0.08] text-white/40'
                        }`}>
                        {tTab(t, tabDef.id)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
                  {tab === 'overview' && (
                    <GroupOverview group={activeGroup} allGroups={groups}
                      onChange={patch => updateGroup(activeGroup._id, patch)} t={t} />
                  )}
                  {tab === 'permissions' && (
                    <GroupPermissions group={activeGroup}
                      onChange={patch => updateGroup(activeGroup._id, patch)} t={t} />
                  )}
                  {tab === 'meta' && (
                    <GroupMeta group={activeGroup}
                      onChange={patch => updateGroup(activeGroup._id, patch)} t={t} />
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
            <SyncPanel
              lpConfig={lpConfig}
              onConfigChange={saveLpConfig}
              onTest={handleTest}
              onPull={handlePull}
              onPush={handlePush}
              syncStatus={syncStatus}
              syncing={syncing}
              t={t}
            />
            <div className={`${sectionCls} flex-1 min-h-0 overflow-hidden`}>
              <div className="flex items-center justify-between gap-2 flex-shrink-0">
                <div>
                  <SectionTitle>{t('permissionBuilder.output')}</SectionTitle>
                  <p className="text-[10px] text-white/25 mt-0.5">{t('permissionBuilder.groupCount_plural', { count: groups.length })}</p>
                </div>
                <div className="flex gap-1.5">
                  <button type="button" onClick={copyOutput} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/60`}>
                    {copied ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                    {copied ? t('permissionBuilder.copied') : t('permissionBuilder.copy')}
                  </button>
                  <button type="button" onClick={() => downloadText(output, `luckperms-export.${ext}`)}
                    className={`${btnCls} bg-violet-500/10 border-violet-500/20 text-violet-300`}>
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('permissionBuilder.save')}
                  </button>
                </div>
              </div>
              <CustomDropdown
                label={t('permissionBuilder.exportFormat')}
                value={exportFormat}
                onChange={setExportFormat}
                options={exportFormatOptions}
                accent="violet"
              />
              <pre className="flex-1 min-h-0 overflow-auto p-3 rounded-xl bg-[#0d0d1a] border border-white/[0.04] text-[10px] font-mono text-violet-200/75 leading-relaxed whitespace-pre-wrap custom-dropdown-scroll">{output}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
