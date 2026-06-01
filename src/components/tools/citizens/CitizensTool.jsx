import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  TrashIcon, PlayIcon, PlusIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import { useI18n } from '../../../context/I18nContext'
import {
  createProjectState, createNpc, applyNpcPreset, getActiveNpc,
  ENTITY_TYPES, EQUIPMENT_SLOTS, SKIN_MODES, NPC_PRESETS, CLICK_HANDS,
  createCommandEntry, createWaypoint, createEquipmentItem,
} from './citizensData'
import MINECRAFT_MATERIALS from '../deluxeMenus/minecraftMaterials.js'
import McItemIcon from '../deluxeMenus/McItemIcon'
import { McText } from '../deluxeMenus/McMenuGui'
import { buildCitizensSavesYaml, buildCitizensCommands, downloadText } from './citizensYaml'
import NpcPreview from './NpcPreview'
import NpcTestModal from './NpcTestModal'
import NpcSkinView from './NpcSkinView'

const MAIN_TABS = [
  { id: 'general', labelKey: 'tabGeneral' },
  { id: 'skin', labelKey: 'tabSkin' },
  { id: 'equipment', labelKey: 'tabEquipment' },
  { id: 'behavior', labelKey: 'tabBehavior' },
  { id: 'commands', labelKey: 'tabCommands' },
  { id: 'waypoints', labelKey: 'tabWaypoints' },
  { id: 'yaml', labelKey: 'tabYaml' },
]

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-lime-500/35 transition-colors font-mono text-xs'
const inputWideCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-lime-500/35 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3'

function Toggle({ label, value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-lime-500/35 bg-lime-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center transition-all ${value ? 'bg-lime-500/40 border-lime-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
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

function linesToArr(text) {
  return text.split('\n').map(s => s.trim()).filter(Boolean)
}

function arrToLines(arr) {
  return (arr || []).join('\n')
}

function MaterialOption({ opt, isSelected }) {
  return (
    <>
      <McItemIcon material={opt.value} size="xs" className="flex-shrink-0" />
      <span className="flex-1 truncate font-mono text-xs">{opt.label}</span>
      {isSelected && <span className="text-lime-300 text-xs">✓</span>}
    </>
  )
}

export default function CitizensTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(createProjectState)
  const [mainTab, setMainTab] = useState('general')
  const [copiedId, setCopiedId] = useState(null)
  const [testOpen, setTestOpen] = useState(false)

  const npc = useMemo(() => getActiveNpc(state), [state])
  const yamlContent = useMemo(() => buildCitizensSavesYaml(state), [state])
  const commandsText = useMemo(() => npc ? buildCitizensCommands(npc) : '', [npc])

  const updateNpc = useCallback((patch) => {
    setState(prev => ({
      ...prev,
      npcs: prev.npcs.map(n => n._id === prev.activeNpcId ? { ...n, ...patch } : n),
    }))
  }, [])

  const updateNested = useCallback((key, patch) => {
    setState(prev => ({
      ...prev,
      npcs: prev.npcs.map(n => n._id === prev.activeNpcId ? { ...n, [key]: { ...n[key], ...patch } } : n),
    }))
  }, [])

  const setEquipment = useCallback((slot, item) => {
    setState(prev => ({
      ...prev,
      npcs: prev.npcs.map(n => n._id === prev.activeNpcId
        ? { ...n, equipment: { ...n.equipment, [slot]: item } }
        : n),
    }))
  }, [])

  const materialOptions = useMemo(() => MINECRAFT_MATERIALS.map(m => ({ value: m, label: m })), [])
  const renderMaterialOption = useCallback((opt, isSelected) => (
    <MaterialOption opt={opt} isSelected={isSelected} />
  ), [])
  const renderMaterialValue = useCallback(opt => opt ? (
    <span className="flex items-center gap-2 min-w-0">
      <McItemIcon material={opt.value} size="xs" />
      <span className="truncate font-mono text-xs">{opt.label}</span>
    </span>
  ) : null, [])

  const addNpc = useCallback(() => {
    const id = Math.max(0, ...state.npcs.map(n => n.citizensId)) + 1
    const n = createNpc({ citizensId: id, name: `&aNPC ${id}` })
    setState(prev => ({ ...prev, npcs: [...prev.npcs, n], activeNpcId: n._id }))
  }, [state.npcs])

  const duplicateNpc = useCallback(() => {
    if (!npc) return
    const id = Math.max(0, ...state.npcs.map(n => n.citizensId)) + 1
    const copy = { ...JSON.parse(JSON.stringify(npc)), _id: `npc-${id}-${Math.random().toString(36).slice(2, 8)}`, citizensId: id }
    setState(prev => ({ ...prev, npcs: [...prev.npcs, copy], activeNpcId: copy._id }))
  }, [npc, state.npcs])

  const deleteNpc = useCallback(() => {
    setState(prev => {
      if (prev.npcs.length <= 1) return prev
      const npcs = prev.npcs.filter(n => n._id !== prev.activeNpcId)
      return { ...prev, npcs, activeNpcId: npcs[0]._id }
    })
  }, [])

  const loadPreset = useCallback(v => {
    if (!v) return
    const preset = applyNpcPreset(v)
    preset._id = npc?._id || preset._id
    preset.citizensId = npc?.citizensId ?? 0
    updateNpc(preset)
  }, [npc, updateNpc])

  const handleCopy = useCallback(async (text, id) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  if (!npc) return null

  function renderEditor() {
    switch (mainTab) {
      case 'general':
        return (
          <div className="flex flex-col gap-3">
            <Field label={t('citizens.citizensId')}>
              <input type="number" min={0} className={inputWideCls} value={npc.citizensId}
                onChange={e => updateNpc({ citizensId: Number(e.target.value) || 0 })} />
            </Field>
            <Field label={t('citizens.displayName')}>
              <input className={inputCls} value={npc.name} onChange={e => updateNpc({ name: e.target.value })} spellCheck={false} />
            </Field>
            <CustomDropdown
              label={t('citizens.entityType')}
              value={npc.entityType}
              onChange={v => updateNpc({ entityType: v })}
              options={ENTITY_TYPES.map(o => ({ value: o.value, label: o.label }))}
              accent="lime"
            />
            <div className="grid grid-cols-2 gap-2">
              <Toggle label={t('citizens.spawned')} value={npc.spawned !== false} onChange={v => updateNpc({ spawned: v })} />
              <Toggle label={t('citizens.protected')} value={!!npc.protected} onChange={v => updateNpc({ protected: v })} />
              <Toggle label={t('citizens.useMinecraftAI')} value={!!npc.useMinecraftAI} onChange={v => updateNpc({ useMinecraftAI: v })} />
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('citizens.location')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Field label={t('citizens.world')}>
                <input className={inputCls} value={npc.location?.world || ''} onChange={e => updateNested('location', { world: e.target.value })} />
              </Field>
              {['x', 'y', 'z', 'yaw', 'pitch'].map(k => (
                <Field key={k} label={t(`citizens.pos${k === 'x' ? 'X' : k === 'y' ? 'Y' : k === 'z' ? 'Z' : k.charAt(0).toUpperCase() + k.slice(1)}`)}>
                  <input type="number" step="any" className={inputCls} value={npc.location?.[k] ?? 0}
                    onChange={e => updateNested('location', { [k]: Number(e.target.value) || 0 })} />
                </Field>
              ))}
            </div>
          </div>
        )

      case 'skin':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <NpcSkinView npc={npc} size="lg" className="flex-shrink-0" />
              <div className="flex-1 w-full flex flex-col gap-3">
                <CustomDropdown
                  label={t('citizens.skinMode')}
                  value={npc.skin?.mode || 'player'}
                  onChange={v => updateNested('skin', { mode: v })}
                  options={SKIN_MODES.map(m => ({ value: m.value, label: t(`citizens.${m.labelKey}`) }))}
                  accent="lime"
                />
                {npc.skin?.mode === 'player' && (
                  <>
                    <Field label={t('citizens.skinName')}>
                      <input className={inputCls} value={npc.skin?.skinName || ''} onChange={e => updateNested('skin', { skinName: e.target.value })} spellCheck={false} placeholder="Notch" />
                    </Field>
                    <Toggle label={t('citizens.useLatestSkin')} value={!!npc.skin?.useLatest} onChange={v => updateNested('skin', { useLatest: v })} />
                  </>
                )}
                {npc.skin?.mode === 'url' && (
                  <Field label={t('citizens.skinUrl')} hint={t('citizens.skinUrlHint')}>
                    <input className={inputCls} value={npc.skin?.skinUrl || ''} onChange={e => updateNested('skin', { skinUrl: e.target.value })} spellCheck={false} />
                  </Field>
                )}
                {npc.skin?.mode === 'texture' && (
                  <>
                    <Field label={t('citizens.skinName')}>
                      <input className={inputCls} value={npc.skin?.skinName || ''} onChange={e => updateNested('skin', { skinName: e.target.value })} />
                    </Field>
                    <Field label={t('citizens.signature')}>
                      <textarea className={`${inputCls} min-h-[60px]`} value={npc.skin?.signature || ''} onChange={e => updateNested('skin', { signature: e.target.value })} spellCheck={false} />
                    </Field>
                    <Field label={t('citizens.textureData')} hint={t('citizens.textureHint')}>
                      <textarea className={`${inputCls} min-h-[80px]`} value={npc.skin?.textureData || ''} onChange={e => updateNested('skin', { textureData: e.target.value })} spellCheck={false} />
                    </Field>
                  </>
                )}
              </div>
            </div>
          </div>
        )

      case 'equipment':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EQUIPMENT_SLOTS.map(slot => {
              const item = npc.equipment?.[slot.key]
              return (
                <div key={slot.key} className={sectionCls}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-bold text-white/75">{t(`citizens.${slot.labelKey}`)}</p>
                    {item?.material && (
                      <button type="button" onClick={() => setEquipment(slot.key, null)} className="text-[9px] text-red-300/70 hover:text-red-300">
                        {t('citizens.clearSlot')}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#373737] border border-[#555] flex items-center justify-center">
                      {item?.material ? <McItemIcon material={item.material} size="lg" /> : <span className="text-white/20 text-xs">—</span>}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <CustomDropdown
                        label={t('citizens.material')}
                        value={item?.material || ''}
                        onChange={v => setEquipment(slot.key, createEquipmentItem(v, item?.amount || 1))}
                        options={materialOptions}
                        accent="lime"
                        searchable
                        menuMinWidth={280}
                        renderOption={renderMaterialOption}
                        renderValue={renderMaterialValue}
                        placeholder="STONE"
                      />
                      {item?.material && (
                        <Field label={t('citizens.amount')}>
                          <input type="number" min={1} max={64} className={inputWideCls} value={item.amount || 1}
                            onChange={e => setEquipment(slot.key, { ...item, amount: Number(e.target.value) || 1 })} />
                        </Field>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )

      case 'behavior':
        return (
          <div className="flex flex-col gap-3">
            <Toggle label={t('citizens.lookClose')} value={!!npc.lookClose?.enabled} onChange={v => updateNested('lookClose', { enabled: v })} />
            {npc.lookClose?.enabled && (
              <div className="grid grid-cols-2 gap-2 pl-2 border-l border-lime-500/20">
                <Field label={t('citizens.lookRange')}>
                  <input type="number" min={1} className={inputWideCls} value={npc.lookClose?.range ?? 5}
                    onChange={e => updateNested('lookClose', { range: Number(e.target.value) || 5 })} />
                </Field>
                <Toggle label={t('citizens.randomLook')} value={!!npc.lookClose?.randomLook} onChange={v => updateNested('lookClose', { randomLook: v })} />
                <Toggle label={t('citizens.realisticLooking')} value={!!npc.lookClose?.realisticLooking} onChange={v => updateNested('lookClose', { realisticLooking: v })} />
              </div>
            )}
            <Toggle label={t('citizens.talkClose')} value={!!npc.talkClose?.enabled} onChange={v => updateNested('talkClose', { enabled: v })} />
            {npc.talkClose?.enabled && (
              <Field label={t('citizens.talkRange')}>
                <input type="number" min={1} className={inputWideCls} value={npc.talkClose?.range ?? 5}
                  onChange={e => updateNested('talkClose', { range: Number(e.target.value) || 5 })} />
              </Field>
            )}
            <Toggle label={t('citizens.randomTalker')} value={!!npc.randomTalker} onChange={v => updateNpc({ randomTalker: v })} />
            <Field label={t('citizens.dialogue')} hint={t('citizens.dialogueHint')}>
              <textarea className={`${inputCls} min-h-[120px]`} value={arrToLines(npc.textLines)}
                onChange={e => updateNpc({ textLines: linesToArr(e.target.value) })} spellCheck={false} />
            </Field>
          </div>
        )

      case 'commands':
        return (
          <div className="flex flex-col gap-3">
            <button type="button" onClick={() => updateNpc({ commands: [...(npc.commands || []), createCommandEntry()] })}
              className={`${btnCls} self-start bg-lime-500/10 border-lime-500/20 text-lime-300`}>
              <PlusIcon className="w-3.5 h-3.5" />{t('citizens.addCommand')}
            </button>
            {(npc.commands || []).map((cmd, idx) => (
              <div key={cmd.id} className={sectionCls}>
                <div className="flex items-center justify-between">
                  <CustomDropdown
                    label={t('citizens.testClickType')}
                    value={cmd.hand || 'RIGHT'}
                    onChange={v => {
                      const commands = [...npc.commands]
                      commands[idx] = { ...cmd, hand: v }
                      updateNpc({ commands })
                    }}
                    options={CLICK_HANDS.map(h => ({ value: h.value, label: t(`citizens.${h.labelKey}`) }))}
                    accent="lime"
                    className="flex-1"
                  />
                  <button type="button" onClick={() => updateNpc({ commands: npc.commands.filter((_, i) => i !== idx) })}
                    className="p-2 text-red-300/60 hover:text-red-300"><TrashIcon className="w-4 h-4" /></button>
                </div>
                <Field label={t('citizens.commandText')}>
                  <input className={inputCls} value={cmd.command} onChange={e => {
                    const commands = [...npc.commands]
                    commands[idx] = { ...cmd, command: e.target.value }
                    updateNpc({ commands })
                  }} spellCheck={false} placeholder="shop open" />
                </Field>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Toggle label={t('citizens.commandPlayer')} value={cmd.player !== false} onChange={v => {
                    const commands = [...npc.commands]
                    commands[idx] = { ...cmd, player: v }
                    updateNpc({ commands })
                  }} />
                  <Toggle label={t('citizens.commandOp')} value={!!cmd.op} onChange={v => {
                    const commands = [...npc.commands]
                    commands[idx] = { ...cmd, op: v }
                    updateNpc({ commands })
                  }} />
                  <Field label={t('citizens.commandCooldown')}>
                    <input type="number" min={0} className={inputWideCls} value={cmd.cooldown || 0} onChange={e => {
                      const commands = [...npc.commands]
                      commands[idx] = { ...cmd, cooldown: Number(e.target.value) || 0 }
                      updateNpc({ commands })
                    }} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )

      case 'waypoints':
        return (
          <div className="flex flex-col gap-3">
            <button type="button" onClick={() => updateNpc({ waypoints: [...(npc.waypoints || []), createWaypoint()] })}
              className={`${btnCls} self-start bg-lime-500/10 border-lime-500/20 text-lime-300`}>
              <PlusIcon className="w-3.5 h-3.5" />{t('citizens.waypointAdd')}
            </button>
            {(npc.waypoints || []).map((wp, idx) => (
              <div key={wp.id} className={sectionCls}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white/60">#{idx + 1}</span>
                  <button type="button" onClick={() => updateNpc({ waypoints: npc.waypoints.filter((_, i) => i !== idx) })}
                    className="p-1 text-red-300/60 hover:text-red-300"><TrashIcon className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Field label={t('citizens.world')}><input className={inputCls} value={wp.world} onChange={e => {
                    const waypoints = [...npc.waypoints]; waypoints[idx] = { ...wp, world: e.target.value }; updateNpc({ waypoints })
                  }} /></Field>
                  {['x', 'y', 'z'].map(k => (
                    <Field key={k} label={t(`citizens.pos${k.toUpperCase()}`)}><input type="number" step="any" className={inputCls} value={wp[k]}
                      onChange={e => { const waypoints = [...npc.waypoints]; waypoints[idx] = { ...wp, [k]: Number(e.target.value) || 0 }; updateNpc({ waypoints }) }} /></Field>
                  ))}
                  <Field label={t('citizens.waypointDelay')}><input type="number" min={0} className={inputCls} value={wp.delay || 0}
                    onChange={e => { const waypoints = [...npc.waypoints]; waypoints[idx] = { ...wp, delay: Number(e.target.value) || 0 }; updateNpc({ waypoints }) }} /></Field>
                </div>
              </div>
            ))}
          </div>
        )

      case 'yaml':
        return (
          <div className="flex flex-col gap-3 h-full min-h-0">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => handleCopy(yamlContent, 'yaml')} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/60`}>
                {copiedId === 'yaml' ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                {t('citizens.copyYaml')}
              </button>
              <button type="button" onClick={() => handleCopy(commandsText, 'cmds')} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/60`}>
                {copiedId === 'cmds' ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                {t('citizens.copyCommands')}
              </button>
              <button type="button" onClick={() => downloadText(yamlContent, `${state.fileName || 'saves'}.yml`)} className={`${btnCls} bg-lime-500/10 border-lime-500/20 text-lime-300`}>
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('citizens.downloadYaml')}
              </button>
            </div>
            <p className="text-[10px] text-white/30">{t('citizens.yamlHint')}</p>
            <p className="text-[10px] text-white/25">{t('citizens.commandsHint')}</p>
            <pre className="flex-1 min-h-[200px] overflow-auto custom-dropdown-scroll bg-[#0f0f1b] border border-white/[0.06] rounded-xl p-4 text-xs font-mono text-lime-300/90 whitespace-pre-wrap">{yamlContent}</pre>
            <pre className="min-h-[120px] max-h-[200px] overflow-auto custom-dropdown-scroll bg-[#0f0f1b] border border-white/[0.06] rounded-xl p-4 text-xs font-mono text-white/50 whitespace-pre-wrap">{commandsText}</pre>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0 flex-wrap">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-lime-500/30 bg-lime-500/10 text-lime-300 font-semibold uppercase">{t('citizens.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('citizens.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('citizens.subtitle')}</p>
        </div>
        <CustomDropdown label="" value="" onChange={loadPreset}
          options={NPC_PRESETS.map(p => ({ value: p.id, label: t(`citizens.${p.labelKey}`) }))}
          placeholder={t('citizens.applyPreset')} accent="lime" className="w-44" />
        <button type="button" onClick={() => setTestOpen(true)} className={`${btnCls} bg-lime-500/15 border-lime-500/30 text-lime-200`}>
          <PlayIcon className="w-3.5 h-3.5" />{t('citizens.openTestMode')}
        </button>
      </div>

      <div className="flex gap-1 px-5 py-2 border-b border-white/[0.04] flex-shrink-0 overflow-x-auto">
        {MAIN_TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setMainTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
              mainTab === tab.id ? 'bg-lime-500/15 text-lime-300 border border-lime-500/25' : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}>
            {t(`citizens.${tab.labelKey}`)}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="w-52 flex-shrink-0 border-r border-white/[0.06] p-3 overflow-y-auto custom-dropdown-scroll hidden md:block">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-white/40 uppercase font-semibold">{t('citizens.npcList')}</p>
            <button type="button" onClick={addNpc} className="p-1 rounded hover:bg-white/[0.06] text-lime-300" title={t('citizens.newNpc')}>
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {state.npcs.map(n => (
              <button key={n._id} type="button" onClick={() => setState(prev => ({ ...prev, activeNpcId: n._id }))}
                className={`text-left rounded-xl border px-2.5 py-2 transition-all ${
                  n._id === state.activeNpcId ? 'border-lime-500/35 bg-lime-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}>
                <McText text={n.name} className="text-[11px] font-bold block truncate" />
                <span className="text-[9px] text-white/30 font-mono">#{n.citizensId} · {n.entityType}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-1 mt-3">
            <button type="button" onClick={duplicateNpc} className={`${btnCls} flex-1 justify-center text-[9px] py-1 border-white/[0.08] text-white/45`}>{t('citizens.duplicateNpc')}</button>
            <button type="button" onClick={deleteNpc} disabled={state.npcs.length <= 1} className={`${btnCls} py-1 border-red-500/20 text-red-300/70 disabled:opacity-30`}>
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-dropdown-scroll p-5 min-w-0">
          {renderEditor()}
        </div>

        <div className="hidden lg:block w-[min(420px,34vw)] min-w-[340px] flex-shrink-0 border-l border-white/[0.06] p-4 overflow-hidden">
          <NpcPreview npc={npc} onOpenTest={() => setTestOpen(true)} />
        </div>
      </div>

      {testOpen && npc && (
        <NpcTestModal npc={npc} onClose={() => setTestOpen(false)} />
      )}
    </div>
  )
}
