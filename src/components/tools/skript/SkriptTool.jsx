import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  PlusIcon, TrashIcon, DocumentTextIcon, Cog6ToothIcon, VariableIcon,
  CommandLineIcon, BoltIcon, CodeBracketSquareIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import { useI18n } from '../../../context/I18nContext'
import {
  MODULES, PRESETS, applyPreset, createSkriptState, createCommand, createEvent, createFunction,
  EVENT_TYPES, EVENT_CATEGORIES, EVENT_PRIORITIES, EVENT_FILTERS, EXECUTABLE_BY,
  COOLDOWN_STORAGE, PARAM_TYPES, EFFECT_SNIPPETS, CONDITION_SNIPPETS, getEventSyntax,
} from './skriptData'
import { buildSkript, downloadSkript, countLines, countEnabled } from './skriptGenerator'

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-violet-500/35 transition-colors font-mono'
const inputClsPlain = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-violet-500/35 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/35 border border-white/[0.06] p-4'

const MODULE_ICONS = {
  doc: DocumentTextIcon,
  cog: Cog6ToothIcon,
  var: VariableIcon,
  cmd: CommandLineIcon,
  bolt: BoltIcon,
  fn: CodeBracketSquareIcon,
  code: CodeBracketSquareIcon,
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

function Toggle({ label, value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-violet-500/35 bg-violet-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}
    >
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center ${value ? 'bg-violet-500/40 border-violet-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
        <span className={`block w-3.5 h-3.5 rounded-full bg-white/90 transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="text-[11px] font-semibold text-white/80">{label}</span>
    </button>
  )
}

function SectionTitle({ children }) {
  return <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-3">{children}</p>
}

function parseLines(v) {
  return String(v || '').split('\n').map(x => x.trimEnd()).filter((x, i, arr) => x || (i < arr.length - 1))
}

function toLines(list) {
  return (list || []).join('\n')
}

function LineEditor({ label, value, onChange, rows = 6, hint, mono = true }) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className={`${mono ? inputCls : inputClsPlain} min-h-[${rows * 20}px]`}
        style={{ minHeight: rows * 22 }}
        value={toLines(value)}
        onChange={e => onChange(parseLines(e.target.value))}
        spellCheck={false}
      />
    </Field>
  )
}

function SnippetBar({ snippets, onInsert, labelKey, t }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {snippets.map(s => (
        <button
          key={s.id}
          type="button"
          onClick={() => onInsert(s.code)}
          className="px-2 py-1 rounded-md border border-violet-500/20 bg-violet-500/8 text-[10px] text-violet-300/80 hover:bg-violet-500/15 hover:border-violet-500/35 transition-all"
        >
          {t(`skript.${s.labelKey}`)}
        </button>
      ))}
    </div>
  )
}

function ListItem({ active, label, sub, enabled, onClick, onDelete }) {
  return (
    <div className={`flex items-center gap-1 rounded-xl border transition-all ${active ? 'border-violet-500/40 bg-violet-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
      <button type="button" onClick={onClick} className="flex-1 flex items-center gap-2 px-3 py-2 text-left min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${enabled ? 'bg-emerald-400' : 'bg-white/20'}`} />
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

export default function SkriptTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(() => createSkriptState())
  const [module, setModule] = useState('header')
  const [selectedCmd, setSelectedCmd] = useState(0)
  const [selectedEvt, setSelectedEvt] = useState(0)
  const [selectedFn, setSelectedFn] = useState(0)
  const [copied, setCopied] = useState(false)
  const [presetNotice, setPresetNotice] = useState(null)

  const skript = useMemo(() => buildSkript(state), [state])
  const stats = useMemo(() => countEnabled(state), [state])
  const lineCount = useMemo(() => countLines(skript), [skript])

  const presetOptions = useMemo(
    () => PRESETS.map(p => ({ value: p.id, label: t(`skript.${p.labelKey}`) })),
    [t],
  )

  const updateHeader = patch => setState(prev => ({ ...prev, header: { ...prev.header, ...patch } }))
  const updateVariables = patch => setState(prev => ({ ...prev, variables: { ...prev.variables, ...patch } }))
  const updateCustom = patch => setState(prev => ({ ...prev, custom: { ...prev.custom, ...patch } }))

  const updateCommand = useCallback((idx, patch) => {
    setState(prev => {
      const cmds = [...prev.commands]
      cmds[idx] = { ...cmds[idx], ...patch }
      return { ...prev, commands: cmds }
    })
  }, [])

  const updateEvent = useCallback((idx, patch) => {
    setState(prev => {
      const evts = [...prev.events]
      evts[idx] = { ...evts[idx], ...patch }
      return { ...prev, events: evts }
    })
  }, [])

  const updateFunction = useCallback((idx, patch) => {
    setState(prev => {
      const fns = [...prev.functions]
      fns[idx] = { ...fns[idx], ...patch }
      return { ...prev, functions: fns }
    })
  }, [])

  const addCommand = () => {
    setState(prev => ({ ...prev, commands: [...prev.commands, createCommand()] }))
    setSelectedCmd(state.commands.length)
    setModule('commands')
  }

  const addEvent = () => {
    setState(prev => ({ ...prev, events: [...prev.events, createEvent()] }))
    setSelectedEvt(state.events.length)
    setModule('events')
  }

  const addFunction = () => {
    setState(prev => ({ ...prev, functions: [...prev.functions, createFunction()] }))
    setSelectedFn(state.functions.length)
    setModule('functions')
  }

  const removeCommand = idx => {
    setState(prev => ({ ...prev, commands: prev.commands.filter((_, i) => i !== idx) }))
    setSelectedCmd(Math.max(0, idx - 1))
  }

  const removeEvent = idx => {
    setState(prev => ({ ...prev, events: prev.events.filter((_, i) => i !== idx) }))
    setSelectedEvt(Math.max(0, idx - 1))
  }

  const removeFunction = idx => {
    setState(prev => ({ ...prev, functions: prev.functions.filter((_, i) => i !== idx) }))
    setSelectedFn(Math.max(0, idx - 1))
  }

  const applyPresetHandler = presetId => {
    const next = applyPreset(state, presetId)
    setState(next)
    setModule('header')
    setPresetNotice(t('skript.presetApplied', { name: t(`skript.preset${presetId[0].toUpperCase()}${presetId.slice(1)}`) }))
    setTimeout(() => setPresetNotice(null), 2500)
  }

  const copySkript = () => {
    navigator.clipboard.writeText(skript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const insertSnippet = (target, idx, field, code) => {
    const updater = target === 'cmd' ? updateCommand : updateEvent
    const current = target === 'cmd' ? state.commands[idx] : state.events[idx]
    const list = [...(current[field] || []), code]
    updater(idx, { [field]: list })
  }

  const cmd = state.commands[selectedCmd]
  const evt = state.events[selectedEvt]
  const fn = state.functions[selectedFn]

  const eventTypeOptions = EVENT_TYPES.map(e => ({
    value: e.value,
    label: t(`skript.${e.labelKey}`),
    group: t(`skript.${EVENT_CATEGORIES.find(c => c.id === e.category)?.labelKey || 'catSystem'}`),
  }))

  const renderModuleNav = () => (
    <div className="space-y-1">
      {MODULES.map(m => {
        const Icon = MODULE_ICONS[m.icon] || DocumentTextIcon
        let badge = null
        if (m.id === 'commands') badge = stats.commands
        if (m.id === 'events') badge = stats.events
        if (m.id === 'functions') badge = stats.functions
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => setModule(m.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
              module === m.id
                ? 'border-violet-500/40 bg-violet-500/12 text-violet-200'
                : 'border-transparent hover:bg-white/[0.04] text-white/60'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-[11px] font-semibold flex-1">{t(`skript.${m.labelKey}`)}</span>
            {badge != null && badge > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300">{badge}</span>
            )}
          </button>
        )
      })}
    </div>
  )

  const renderHeader = () => (
    <div className="space-y-3">
      <SectionTitle>{t('skript.sectionHeader')}</SectionTitle>
      <Field label={t('skript.fieldScriptName')}>
        <input className={inputClsPlain} value={state.header.scriptName} onChange={e => updateHeader({ scriptName: e.target.value })} />
      </Field>
      <Field label={t('skript.fieldAuthor')}><input className={inputClsPlain} value={state.header.author} onChange={e => updateHeader({ author: e.target.value })} /></Field>
      <Field label={t('skript.fieldVersion')}><input className={inputClsPlain} value={state.header.version} onChange={e => updateHeader({ version: e.target.value })} /></Field>
      <Field label={t('skript.fieldDescription')}><textarea className={`${inputClsPlain} min-h-16`} value={state.header.description} onChange={e => updateHeader({ description: e.target.value })} /></Field>
      <Field label={t('skript.fieldDefaultPrefix')} hint={t('skript.hintPrefix')}>
        <input className={inputCls} value={state.header.prefix} onChange={e => updateHeader({ prefix: e.target.value })} />
      </Field>
      <Toggle label={t('skript.fieldTimestamp')} value={state.header.includeTimestamp} onChange={v => updateHeader({ includeTimestamp: v })} />
    </div>
  )

  const renderOptions = () => (
    <div className="space-y-3">
      <SectionTitle>{t('skript.sectionOptions')}</SectionTitle>
      <p className="text-[10px] text-white/30 mb-2">{t('skript.hintOptions')}</p>
      {(state.options || []).map((opt, i) => (
        <div key={i} className="flex gap-2 items-start">
          <input className={`${inputCls} flex-1`} placeholder="key" value={opt.key} onChange={e => {
            const opts = [...state.options]
            opts[i] = { ...opts[i], key: e.target.value }
            setState(prev => ({ ...prev, options: opts }))
          }} />
          <input className={`${inputCls} flex-[2]`} placeholder="value" value={opt.value} onChange={e => {
            const opts = [...state.options]
            opts[i] = { ...opts[i], value: e.target.value }
            setState(prev => ({ ...prev, options: opts }))
          }} />
          <button type="button" onClick={() => setState(prev => ({ ...prev, options: prev.options.filter((_, j) => j !== i) }))} className="p-2 text-white/25 hover:text-red-400">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setState(prev => ({ ...prev, options: [...prev.options, { key: '', value: '' }] }))} className={`${btnCls} border-violet-500/25 bg-violet-500/10 text-violet-300 w-full justify-center`}>
        <PlusIcon className="w-3.5 h-3.5" /> {t('skript.addOption')}
      </button>
    </div>
  )

  const renderVariables = () => (
    <div className="space-y-4">
      <SectionTitle>{t('skript.sectionVariables')}</SectionTitle>
      <LineEditor label={t('skript.varOnLoad')} value={state.variables.onLoad} onChange={v => updateVariables({ onLoad: v })} rows={8} hint={t('skript.hintVarLoad')} />
      <LineEditor label={t('skript.varOnUnload')} value={state.variables.onUnload} onChange={v => updateVariables({ onUnload: v })} rows={4} hint={t('skript.hintVarUnload')} />
    </div>
  )

  const renderCommandEditor = () => {
    if (!cmd) return <p className="text-white/30 text-sm">{t('skript.noCommands')}</p>
    return (
      <div className="space-y-3">
        <Toggle label={t('skript.fieldEnabled')} value={cmd.enabled} onChange={v => updateCommand(selectedCmd, { enabled: v })} />
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('skript.fieldCmdPath')}><input className={inputCls} value={cmd.path} onChange={e => updateCommand(selectedCmd, { path: e.target.value })} /></Field>
          <Field label={t('skript.fieldCmdArgs')} hint={t('skript.hintCmdArgs')}><input className={inputCls} value={cmd.args} onChange={e => updateCommand(selectedCmd, { args: e.target.value })} placeholder="<text> <player>" /></Field>
        </div>
        <Field label={t('skript.fieldPermission')}><input className={inputClsPlain} value={cmd.permission} onChange={e => updateCommand(selectedCmd, { permission: e.target.value })} /></Field>
        <Field label={t('skript.fieldPermMsg')}><input className={inputCls} value={cmd.permissionMessage} onChange={e => updateCommand(selectedCmd, { permissionMessage: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('skript.fieldDescription')}><input className={inputClsPlain} value={cmd.description} onChange={e => updateCommand(selectedCmd, { description: e.target.value })} /></Field>
          <Field label={t('skript.fieldUsage')}><input className={inputClsPlain} value={cmd.usage} onChange={e => updateCommand(selectedCmd, { usage: e.target.value })} /></Field>
        </div>
        <Field label={t('skript.fieldAliases')}><textarea className={`${inputClsPlain} min-h-14`} value={(cmd.aliases || []).join('\n')} onChange={e => updateCommand(selectedCmd, { aliases: parseLines(e.target.value) })} /></Field>
        <CustomDropdown label={t('skript.fieldExecutableBy')} value={cmd.executableBy} onChange={v => updateCommand(selectedCmd, { executableBy: v })} options={EXECUTABLE_BY.map(x => ({ value: x.value, label: t(`skript.${x.labelKey}`) }))} accent="violet" className="w-full" />
        <div className="rounded-xl border border-white/[0.06] p-3 space-y-2">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">{t('skript.sectionCooldown')}</p>
          <div className="grid grid-cols-3 gap-2">
            <Field label={t('skript.fieldCooldown')}><input type="number" min="0" className={inputClsPlain} value={cmd.cooldown} onChange={e => updateCommand(selectedCmd, { cooldown: Number(e.target.value) || 0 })} /></Field>
            <Field label={t('skript.fieldCooldownUnit')}><input className={inputClsPlain} value={cmd.cooldownUnit} onChange={e => updateCommand(selectedCmd, { cooldownUnit: e.target.value })} placeholder="seconds" /></Field>
            <CustomDropdown label={t('skript.fieldCooldownStorage')} value={cmd.cooldownStorage} onChange={v => updateCommand(selectedCmd, { cooldownStorage: v })} options={COOLDOWN_STORAGE.map(x => ({ value: x.value, label: t(`skript.${x.labelKey}`) }))} accent="violet" className="w-full" />
          </div>
          <Field label={t('skript.fieldCooldownMsg')}><input className={inputCls} value={cmd.cooldownMessage} onChange={e => updateCommand(selectedCmd, { cooldownMessage: e.target.value })} /></Field>
          <Field label={t('skript.fieldCooldownBypass')}><input className={inputClsPlain} value={cmd.cooldownBypass} onChange={e => updateCommand(selectedCmd, { cooldownBypass: e.target.value })} /></Field>
        </div>
        <LineEditor label={t('skript.fieldConditions')} value={cmd.conditions} onChange={v => updateCommand(selectedCmd, { conditions: v })} rows={3} hint={t('skript.hintConditions')} />
        <SnippetBar snippets={CONDITION_SNIPPETS} onInsert={code => insertSnippet('cmd', selectedCmd, 'conditions', code)} labelKey="snipConditions" t={t} />
        <LineEditor label={t('skript.fieldEffects')} value={cmd.effects} onChange={v => updateCommand(selectedCmd, { effects: v })} rows={8} hint={t('skript.hintEffects')} />
        <SnippetBar snippets={EFFECT_SNIPPETS} onInsert={code => insertSnippet('cmd', selectedCmd, 'effects', code)} labelKey="snipEffects" t={t} />
        <LineEditor label={t('skript.fieldElseEffects')} value={cmd.elseEffects} onChange={v => updateCommand(selectedCmd, { elseEffects: v })} rows={3} />
      </div>
    )
  }

  const renderEventEditor = () => {
    if (!evt) return <p className="text-white/30 text-sm">{t('skript.noEvents')}</p>
    const evtDef = EVENT_TYPES.find(e => e.value === evt.type)
    return (
      <div className="space-y-3">
        <Toggle label={t('skript.fieldEnabled')} value={evt.enabled} onChange={v => updateEvent(selectedEvt, { enabled: v })} />
        <CustomDropdown label={t('skript.fieldEventType')} value={evt.type} onChange={v => {
          const def = EVENT_TYPES.find(e => e.value === v)
          updateEvent(selectedEvt, { type: v, customSyntax: def?.custom ? def.syntax : evt.customSyntax })
        }} options={eventTypeOptions} accent="violet" className="w-full" searchable />
        {(evtDef?.custom || evt.type === 'custom') && (
          <Field label={t('skript.fieldCustomSyntax')} hint={t('skript.hintCustomEvent')}>
            <input className={inputCls} value={evt.customSyntax} onChange={e => updateEvent(selectedEvt, { customSyntax: e.target.value })} placeholder="every 5 minutes" />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-2">
          <CustomDropdown label={t('skript.fieldPriority')} value={evt.priority} onChange={v => updateEvent(selectedEvt, { priority: v })} options={EVENT_PRIORITIES.map(x => ({ value: x.value, label: t(`skript.${x.labelKey}`) }))} accent="violet" className="w-full" />
          <CustomDropdown label={t('skript.fieldFilter')} value={evt.filter} onChange={v => updateEvent(selectedEvt, { filter: v })} options={EVENT_FILTERS.map(x => ({ value: x.value, label: t(`skript.${x.labelKey}`) }))} accent="violet" className="w-full" />
        </div>
        <div className="rounded-lg bg-violet-500/8 border border-violet-500/15 px-3 py-2">
          <p className="text-[10px] text-violet-300/60 uppercase tracking-wider mb-1">{t('skript.previewEventLine')}</p>
          <code className="text-xs text-violet-200/90 font-mono">{getEventSyntax(evt)}:</code>
        </div>
        <LineEditor label={t('skript.fieldConditions')} value={evt.conditions} onChange={v => updateEvent(selectedEvt, { conditions: v })} rows={3} />
        <SnippetBar snippets={CONDITION_SNIPPETS} onInsert={code => insertSnippet('evt', selectedEvt, 'conditions', code)} t={t} />
        <LineEditor label={t('skript.fieldEffects')} value={evt.effects} onChange={v => updateEvent(selectedEvt, { effects: v })} rows={8} />
        <SnippetBar snippets={EFFECT_SNIPPETS} onInsert={code => insertSnippet('evt', selectedEvt, 'effects', code)} t={t} />
        <LineEditor label={t('skript.fieldElseEffects')} value={evt.elseEffects} onChange={v => updateEvent(selectedEvt, { elseEffects: v })} rows={3} />
      </div>
    )
  }

  const renderFunctionEditor = () => {
    if (!fn) return <p className="text-white/30 text-sm">{t('skript.noFunctions')}</p>
    return (
      <div className="space-y-3">
        <Toggle label={t('skript.fieldEnabled')} value={fn.enabled} onChange={v => updateFunction(selectedFn, { enabled: v })} />
        <Toggle label={t('skript.fieldLocalFn')} value={fn.local} onChange={v => updateFunction(selectedFn, { local: v })} />
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('skript.fieldFnName')}><input className={inputClsPlain} value={fn.name} onChange={e => updateFunction(selectedFn, { name: e.target.value })} /></Field>
          <Field label={t('skript.fieldReturnType')} hint={t('skript.hintReturnType')}><input className={inputClsPlain} value={fn.returnType} onChange={e => updateFunction(selectedFn, { returnType: e.target.value })} placeholder="text" /></Field>
        </div>
        <SectionTitle>{t('skript.sectionParams')}</SectionTitle>
        {(fn.params || []).map((p, i) => (
          <div key={i} className="flex gap-2">
            <input className={`${inputClsPlain} flex-1`} placeholder="name" value={p.name} onChange={e => {
              const params = [...fn.params]
              params[i] = { ...params[i], name: e.target.value }
              updateFunction(selectedFn, { params })
            }} />
            <CustomDropdown label="" value={p.type} onChange={v => {
              const params = [...fn.params]
              params[i] = { ...params[i], type: v }
              updateFunction(selectedFn, { params })
            }} options={PARAM_TYPES.map(pt => ({ value: pt, label: pt }))} accent="violet" className="flex-[1.2]" />
            <button type="button" onClick={() => updateFunction(selectedFn, { params: fn.params.filter((_, j) => j !== i) })} className="p-2 text-white/25 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
          </div>
        ))}
        <button type="button" onClick={() => updateFunction(selectedFn, { params: [...(fn.params || []), { name: 'arg', type: 'text' }] })} className={`${btnCls} border-violet-500/25 bg-violet-500/10 text-violet-300 w-full justify-center`}>
          <PlusIcon className="w-3.5 h-3.5" /> {t('skript.addParam')}
        </button>
        <LineEditor label={t('skript.fieldFnBody')} value={fn.body} onChange={v => updateFunction(selectedFn, { body: v })} rows={10} hint={t('skript.hintFnBody')} />
        <SnippetBar snippets={EFFECT_SNIPPETS.slice(0, 10)} onInsert={code => updateFunction(selectedFn, { body: [...(fn.body || []), code] })} t={t} />
      </div>
    )
  }

  const renderCustom = () => (
    <div className="space-y-3">
      <SectionTitle>{t('skript.sectionCustom')}</SectionTitle>
      <p className="text-[10px] text-white/30">{t('skript.hintCustom')}</p>
      <Toggle label={t('skript.fieldCustomEnabled')} value={state.custom.enabled} onChange={v => updateCustom({ enabled: v })} />
      <textarea
        className={`${inputCls} min-h-[300px]`}
        value={state.custom.code}
        onChange={e => updateCustom({ code: e.target.value })}
        spellCheck={false}
        placeholder="# Raw Skript code appended at end of file"
      />
    </div>
  )

  const renderListPanel = () => {
    if (module === 'commands') {
      return (
        <div className="space-y-2">
          <button type="button" onClick={addCommand} className={`${btnCls} border-violet-500/25 bg-violet-500/10 text-violet-300 w-full justify-center mb-2`}>
            <PlusIcon className="w-3.5 h-3.5" /> {t('skript.addCommand')}
          </button>
          {state.commands.map((c, i) => (
            <ListItem
              key={c.id}
              active={selectedCmd === i}
              label={`${c.path}${c.args ? ` ${c.args}` : ''}`}
              sub={c.description || c.permission}
              enabled={c.enabled}
              onClick={() => setSelectedCmd(i)}
              onDelete={() => removeCommand(i)}
            />
          ))}
        </div>
      )
    }
    if (module === 'events') {
      return (
        <div className="space-y-2">
          <button type="button" onClick={addEvent} className={`${btnCls} border-violet-500/25 bg-violet-500/10 text-violet-300 w-full justify-center mb-2`}>
            <PlusIcon className="w-3.5 h-3.5" /> {t('skript.addEvent')}
          </button>
          {state.events.map((e, i) => (
            <ListItem
              key={e.id}
              active={selectedEvt === i}
              label={getEventSyntax(e)}
              sub={t(`skript.${EVENT_TYPES.find(x => x.value === e.type)?.labelKey || 'eventJoin'}`)}
              enabled={e.enabled}
              onClick={() => setSelectedEvt(i)}
              onDelete={() => removeEvent(i)}
            />
          ))}
        </div>
      )
    }
    if (module === 'functions') {
      return (
        <div className="space-y-2">
          <button type="button" onClick={addFunction} className={`${btnCls} border-violet-500/25 bg-violet-500/10 text-violet-300 w-full justify-center mb-2`}>
            <PlusIcon className="w-3.5 h-3.5" /> {t('skript.addFunction')}
          </button>
          {state.functions.length === 0 && <p className="text-[10px] text-white/25 text-center py-4">{t('skript.noFunctions')}</p>}
          {state.functions.map((f, i) => (
            <ListItem
              key={f.id}
              active={selectedFn === i}
              label={f.name}
              sub={f.returnType ? `:: ${f.returnType}` : t('skript.noReturn')}
              enabled={f.enabled}
              onClick={() => setSelectedFn(i)}
              onDelete={() => removeFunction(i)}
            />
          ))}
        </div>
      )
    }
    return null
  }

  const renderEditor = () => {
    if (module === 'header') return renderHeader()
    if (module === 'options') return renderOptions()
    if (module === 'variables') return renderVariables()
    if (module === 'commands') return renderCommandEditor()
    if (module === 'events') return renderEventEditor()
    if (module === 'functions') return renderFunctionEditor()
    if (module === 'custom') return renderCustom()
    return null
  }

  const showList = ['commands', 'events', 'functions'].includes(module)

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-violet-500/30 bg-violet-500/10 text-violet-300 font-semibold uppercase">{t('skript.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('skript.title')}</h1>
            {presetNotice && <span className="text-[10px] text-emerald-400 animate-fade-in">{presetNotice}</span>}
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('skript.subtitle')}</p>
        </div>
        <CustomDropdown label="" value="" onChange={applyPresetHandler} options={presetOptions} accent="violet" className="w-48" placeholder={t('skript.preset')} />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(260px,300px)_minmax(0,1fr)_minmax(0,340px)] gap-3 h-full min-h-0">
          {/* Module nav */}
          <section className={`${sectionCls} overflow-y-auto min-h-0 custom-dropdown-scroll p-3`}>
            {renderModuleNav()}
            <div className="mt-4 pt-3 border-t border-white/[0.06]">
              <p className="text-[9px] text-white/25 uppercase tracking-wider mb-2">{t('skript.stats')}</p>
              <div className="space-y-1 text-[10px] text-white/40">
                <p>{t('skript.statCommands')}: <span className="text-violet-300">{stats.commands}</span></p>
                <p>{t('skript.statEvents')}: <span className="text-violet-300">{stats.events}</span></p>
                <p>{t('skript.statFunctions')}: <span className="text-violet-300">{stats.functions}</span></p>
                <p>{t('skript.statLines')}: <span className="text-violet-300">{lineCount}</span></p>
              </div>
            </div>
          </section>

          {/* List panel (commands/events/functions) */}
          {showList && (
            <section className={`${sectionCls} overflow-y-auto min-h-0 custom-dropdown-scroll p-3`}>
              {renderListPanel()}
            </section>
          )}

          {/* Editor */}
          <section className={`${sectionCls} overflow-y-auto min-h-0 custom-dropdown-scroll ${showList ? '' : 'lg:col-span-2'}`}>
            {renderEditor()}
          </section>

          {/* Preview */}
          <section className={`${sectionCls} flex flex-col min-h-0 overflow-hidden p-0`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">{t('skript.skOutput')}</p>
                <p className="text-[10px] text-white/20 mt-0.5">plugins/Skript/scripts/{state.header.scriptName || 'script'}.sk</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={copySkript} className={`${btnCls} ${copied ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-sky-500/25 bg-sky-500/10 text-sky-300 hover:bg-sky-500/15'}`}>
                  {copied ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                  {copied ? t('skript.copied') : t('skript.copy')}
                </button>
                <button type="button" onClick={() => downloadSkript(skript, state.header.scriptName)} className={`${btnCls} border-indigo-500/25 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/15`}>
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" /> {t('skript.save')}
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto px-4 py-3 text-[11px] leading-relaxed text-violet-100/75 font-mono custom-dropdown-scroll whitespace-pre-wrap break-words sk-preview">
              {skript}
            </pre>
          </section>
        </div>
      </div>
    </div>
  )
}
