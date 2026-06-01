import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  TrashIcon, PlayIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import { useI18n } from '../../../context/I18nContext'
import {
  createMenuState, applyPreset, createMenuItem,
  INVENTORY_TYPES, CHEST_SIZES, CLICK_TYPES, ACTION_PRESETS,
  getGuiLayout, defaultSizeForType,
} from './deluxeMenusData'
import MINECRAFT_MATERIALS from './minecraftMaterials.js'
import { normalizeMaterialInput } from './minecraftItemTexture'
import McItemIcon from './McItemIcon'
import { buildDeluxeMenuYaml, downloadText } from './deluxeMenusYaml'
import GuiSlotPicker from './GuiSlotPicker'
import MenuPreview from './MenuPreview'
import MenuTestModal from './MenuTestModal'

const MAIN_TABS = [
  { id: 'menu', labelKey: 'tabMenu' },
  { id: 'items', labelKey: 'tabItems' },
  { id: 'yaml', labelKey: 'tabYaml' },
]

const PRESET_OPTIONS = [
  { value: 'blank', labelKey: 'presetBlank' },
  { value: 'shop', labelKey: 'presetShop' },
  { value: 'hub', labelKey: 'presetHub' },
]

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-fuchsia-500/35 transition-colors font-mono text-xs'
const inputWideCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-fuchsia-500/35 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3'

function Toggle({ label, value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-fuchsia-500/35 bg-fuchsia-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center transition-all ${value ? 'bg-fuchsia-500/40 border-fuchsia-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
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

function ClickCommandsEditor({ label, value, onChange, t }) {
  return (
    <Field label={label}>
      <textarea
        className={`${inputCls} min-h-[72px]`}
        value={arrToLines(value)}
        onChange={e => onChange(linesToArr(e.target.value))}
        spellCheck={false}
        placeholder="[close]"
      />
      <div className="flex flex-wrap gap-1 mt-1.5">
        {ACTION_PRESETS.map(p => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange([...(value || []), p.value])}
            className="px-2 py-0.5 rounded border border-white/[0.06] bg-white/[0.03] text-[9px] text-white/45 hover:text-fuchsia-300 hover:border-fuchsia-500/30"
          >
            + {t(`deluxeMenus.${p.labelKey}`)}
          </button>
        ))}
      </div>
    </Field>
  )
}

function MaterialOption({ opt, isSelected }) {
  return (
    <>
      <McItemIcon material={opt.value} size="xs" className="flex-shrink-0" />
      <span className="flex-1 truncate font-mono text-xs">{opt.label}</span>
      {isSelected && <span className="text-fuchsia-300 text-xs">✓</span>}
    </>
  )
}

export default function DeluxeMenusTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(createMenuState)
  const [mainTab, setMainTab] = useState('items')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [testOpen, setTestOpen] = useState(false)

  const set = useCallback(patch => setState(prev => ({ ...prev, ...patch })), [])

  const layout = useMemo(() => getGuiLayout(state.inventoryType, state.size), [state.inventoryType, state.size])
  const validSlots = useMemo(
    () => new Set(layout.cells.filter(c => c.selectable && c.slot != null).map(c => c.slot)),
    [layout],
  )

  const yamlContent = useMemo(() => buildDeluxeMenuYaml(state), [state])

  const presetDropdownOptions = PRESET_OPTIONS.map(p => ({
    value: p.value,
    label: t(`deluxeMenus.${p.labelKey}`),
  }))

  const inventoryOptions = INVENTORY_TYPES.map(o => ({ value: o.value, label: o.label }))
  const sizeOptions = CHEST_SIZES.map(s => ({ value: String(s), label: `${s} (${s / 9} rows)` }))

  const selectedItem = selectedSlot != null ? state.items[selectedSlot] : null

  const materialOptions = useMemo(() => {
    const known = new Set(MINECRAFT_MATERIALS)
    const list = MINECRAFT_MATERIALS.map(m => ({ value: m, label: m }))
    const mat = selectedItem?.material
    if (mat && !known.has(mat)) list.unshift({ value: mat, label: mat })
    return list
  }, [selectedItem?.material])

  const renderMaterialOption = useCallback((opt, isSelected) => (
    <MaterialOption opt={opt} isSelected={isSelected} />
  ), [])

  const renderMaterialValue = useCallback(opt => opt ? (
    <span className="flex items-center gap-2 min-w-0">
      <McItemIcon material={opt.value} size="xs" />
      <span className="truncate font-mono text-xs">{opt.label}</span>
    </span>
  ) : null, [])

  const loadPreset = useCallback(v => {
    if (!v) return
    const next = v === 'blank' ? createMenuState() : applyPreset(v)
    setState(next)
    setSelectedSlot(null)
  }, [])

  const handleInventoryChange = useCallback(type => {
    const newSize = defaultSizeForType(type)
    setState(prev => {
      const newLayout = getGuiLayout(type, newSize)
      const allowed = new Set(newLayout.cells.filter(c => c.selectable && c.slot != null).map(c => c.slot))
      const items = {}
      Object.entries(prev.items).forEach(([slot, item]) => {
        if (allowed.has(Number(slot))) items[slot] = item
      })
      return { ...prev, inventoryType: type, size: newSize, items }
    })
    setSelectedSlot(null)
  }, [])

  const handleSelectSlot = useCallback(slot => {
    setSelectedSlot(slot)
    setState(prev => {
      if (prev.items[slot]) return prev
      return { ...prev, items: { ...prev.items, [slot]: createMenuItem(slot) } }
    })
    setMainTab('items')
  }, [])

  const handleRemoveItem = useCallback(slot => {
    setState(prev => {
      const items = { ...prev.items }
      delete items[slot]
      return { ...prev, items }
    })
    if (selectedSlot === slot) setSelectedSlot(null)
  }, [selectedSlot])

  const updateItem = useCallback((slot, patch) => {
    setState(prev => ({
      ...prev,
      items: { ...prev.items, [slot]: { ...prev.items[slot], ...patch, slot } },
    }))
  }, [])

  const handleCopy = useCallback(async (text, id) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  function renderEditor() {
    switch (mainTab) {
      case 'menu':
        return (
          <div className="flex flex-col gap-3">
            <Field label={t('deluxeMenus.fileName')}>
              <input className={inputWideCls} value={state.fileName} onChange={e => set({ fileName: e.target.value.replace(/\s/g, '_') })} />
            </Field>
            <Field label={t('deluxeMenus.menuTitle')}>
              <input className={inputCls} value={state.menuTitle} onChange={e => set({ menuTitle: e.target.value })} spellCheck={false} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('deluxeMenus.openCommand')}>
                <input className={inputWideCls} value={state.openCommand} onChange={e => set({ openCommand: e.target.value.replace(/\s/g, '') })} />
              </Field>
              <Field label={t('deluxeMenus.updateInterval')}>
                <input type="number" className={inputWideCls} value={state.updateInterval} onChange={e => set({ updateInterval: Number(e.target.value) || 20 })} />
              </Field>
            </div>
            <Toggle label={t('deluxeMenus.registerCommand')} value={state.registerCommand} onChange={v => set({ registerCommand: v })} />
            <CustomDropdown
              label={t('deluxeMenus.inventoryType')}
              value={state.inventoryType}
              onChange={handleInventoryChange}
              options={inventoryOptions}
              accent="fuchsia"
            />
            {['CHEST', 'ENDER_CHEST', 'SHULKER_BOX'].includes(state.inventoryType) && (
              <CustomDropdown
                label={t('deluxeMenus.size')}
                value={String(state.size)}
                onChange={v => {
                  const size = Number(v)
                  setState(prev => {
                    const allowed = new Set(
                      getGuiLayout(prev.inventoryType, size).cells
                        .filter(c => c.selectable && c.slot != null)
                        .map(c => c.slot),
                    )
                    const items = {}
                    Object.entries(prev.items).forEach(([slot, item]) => {
                      if (allowed.has(Number(slot))) items[slot] = item
                    })
                    return { ...prev, size, items }
                  })
                }}
                options={sizeOptions}
                accent="fuchsia"
              />
            )}
            <Field label={t('deluxeMenus.openRequirements')} hint={t('deluxeMenus.openRequirementsHint')}>
              <input className={inputWideCls} value={state.openRequirements} onChange={e => set({ openRequirements: e.target.value })} placeholder="deluxemenus.open" />
            </Field>
            <Field label={t('deluxeMenus.openCommands')}>
              <textarea className={`${inputCls} min-h-[60px]`} value={arrToLines(state.openCommands)} onChange={e => set({ openCommands: linesToArr(e.target.value) })} spellCheck={false} />
            </Field>
            <Field label={t('deluxeMenus.closeCommands')}>
              <textarea className={`${inputCls} min-h-[60px]`} value={arrToLines(state.closeCommands)} onChange={e => set({ closeCommands: linesToArr(e.target.value) })} spellCheck={false} />
            </Field>
          </div>
        )

      case 'items':
        return (
          <div className="flex flex-col gap-4">
            <GuiSlotPicker
              inventoryType={state.inventoryType}
              size={state.size}
              items={state.items}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              onRemoveItem={handleRemoveItem}
            />

            {selectedItem ? (
              <div className={sectionCls}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold text-white/80">
                    {t('deluxeMenus.editingSlot', { slot: selectedSlot })}
                  </p>
                  <button type="button" onClick={() => handleRemoveItem(selectedSlot)} className={`${btnCls} bg-red-500/10 border-red-500/20 text-red-300`}>
                    <TrashIcon className="w-3.5 h-3.5" />{t('deluxeMenus.removeItem')}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                  <CustomDropdown
                    label={t('deluxeMenus.material')}
                    value={selectedItem.material}
                    onChange={v => updateItem(selectedSlot, { material: v })}
                    options={materialOptions}
                    accent="fuchsia"
                    searchable
                    menuMinWidth={300}
                    renderOption={renderMaterialOption}
                    renderValue={renderMaterialValue}
                  />
                  <div className="flex flex-col items-center gap-1 pb-0.5">
                    <span className="text-[9px] text-white/25 uppercase">{t('deluxeMenus.materialPreview')}</span>
                    <div className="w-12 h-12 rounded-lg bg-[#373737] border border-[#555] flex items-center justify-center shadow-inner">
                      <McItemIcon material={selectedItem.material} size="lg" glow={selectedItem.glow} />
                    </div>
                  </div>
                </div>
                <Field label={t('deluxeMenus.materialCustom')} hint={t('deluxeMenus.materialTextureHint')}>
                  <input
                    className={inputCls}
                    value={selectedItem.material}
                    onChange={e => updateItem(selectedSlot, { material: e.target.value.toUpperCase() })}
                    onBlur={e => updateItem(selectedSlot, { material: normalizeMaterialInput(e.target.value) || 'STONE' })}
                    spellCheck={false}
                    placeholder="DIAMOND_SWORD"
                  />
                </Field>
                <Field label={t('deluxeMenus.amount')}>
                  <input type="number" min={1} max={64} className={inputWideCls} value={selectedItem.amount} onChange={e => updateItem(selectedSlot, { amount: Number(e.target.value) || 1 })} />
                </Field>
                <Field label={t('deluxeMenus.displayName')}>
                  <input className={inputCls} value={selectedItem.displayName} onChange={e => updateItem(selectedSlot, { displayName: e.target.value })} spellCheck={false} />
                </Field>
                <Field label={t('deluxeMenus.lore')}>
                  <textarea className={`${inputCls} min-h-[80px]`} value={arrToLines(selectedItem.lore)} onChange={e => updateItem(selectedSlot, { lore: linesToArr(e.target.value) })} spellCheck={false} />
                </Field>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Toggle label={t('deluxeMenus.glow')} value={selectedItem.glow} onChange={v => updateItem(selectedSlot, { glow: v })} />
                  <Toggle label={t('deluxeMenus.hideAttributes')} value={selectedItem.hideAttributes} onChange={v => updateItem(selectedSlot, { hideAttributes: v })} />
                  <Toggle label={t('deluxeMenus.hideEnchantments')} value={selectedItem.hideEnchantments} onChange={v => updateItem(selectedSlot, { hideEnchantments: v })} />
                </div>
                <Field label={t('deluxeMenus.viewRequirement')}>
                  <input className={inputCls} value={selectedItem.viewRequirement || ''} onChange={e => updateItem(selectedSlot, { viewRequirement: e.target.value })} spellCheck={false} placeholder="%vault_rank% >= vip" />
                </Field>
                <Field label={t('deluxeMenus.priority')}>
                  <input type="number" className={inputWideCls} value={selectedItem.priority} onChange={e => updateItem(selectedSlot, { priority: Number(e.target.value) || 0 })} />
                </Field>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('deluxeMenus.clickActions')}</p>
                {CLICK_TYPES.map(ct => {
                  const key = {
                    left: 'leftClick', right: 'rightClick', middle: 'middleClick',
                    shift_left: 'shiftLeftClick', shift_right: 'shiftRightClick',
                  }[ct.value]
                  return (
                    <ClickCommandsEditor
                      key={ct.value}
                      label={t(`deluxeMenus.${ct.labelKey}`)}
                      value={selectedItem[key]}
                      onChange={v => updateItem(selectedSlot, { [key]: v })}
                      t={t}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center">
                <p className="text-sm text-white/40">{t('deluxeMenus.selectSlotHint')}</p>
                <p className="text-[10px] text-white/25 mt-1">{t('deluxeMenus.selectSlotHint2')}</p>
              </div>
            )}

            <div className="text-[9px] text-white/25">
              {t('deluxeMenus.validSlots', { count: validSlots.size })}
            </div>
          </div>
        )

      case 'yaml':
        return (
          <div className="flex flex-col gap-3 h-full min-h-0">
            <div className="flex flex-wrap gap-2 items-center">
              <button type="button" onClick={() => handleCopy(yamlContent, 'yaml')} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/60`}>
                {copiedId === 'yaml' ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                {t('deluxeMenus.copyYaml')}
              </button>
              <button type="button" onClick={() => downloadText(yamlContent, `${state.fileName || 'menu'}.yml`)} className={`${btnCls} bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300`}>
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('deluxeMenus.downloadYaml')}
              </button>
            </div>
            <p className="text-[10px] text-white/30">{t('deluxeMenus.reloadHint')}</p>
            <pre className="flex-1 min-h-[320px] overflow-auto custom-dropdown-scroll bg-[#0f0f1b] border border-white/[0.06] rounded-xl p-4 text-xs font-mono text-emerald-300/90 whitespace-pre-wrap">{yamlContent}</pre>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0 flex-wrap">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all" title={t('common.back')}>
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 font-semibold uppercase">{t('deluxeMenus.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('deluxeMenus.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('deluxeMenus.subtitle')}</p>
        </div>
        <CustomDropdown label="" value="" onChange={loadPreset} options={presetDropdownOptions} placeholder={t('deluxeMenus.applyPreset')} accent="fuchsia" className="w-44" />
        <button
          type="button"
          onClick={() => setTestOpen(true)}
          className={`${btnCls} bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-200`}
        >
          <PlayIcon className="w-3.5 h-3.5" />{t('deluxeMenus.openTestMode')}
        </button>
      </div>

      <div className="flex gap-1 px-5 py-2 border-b border-white/[0.04] flex-shrink-0 overflow-x-auto scrollbar-thin">
        {MAIN_TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setMainTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
              mainTab === tab.id ? 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/25' : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}>
            {t(`deluxeMenus.${tab.labelKey}`)}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-dropdown-scroll p-5 min-w-0">
          {renderEditor()}
        </div>
        <div className="hidden lg:block w-[min(480px,38vw)] min-w-[400px] flex-shrink-0 border-l border-white/[0.06] p-4 overflow-hidden">
          <MenuPreview state={state} selectedSlot={selectedSlot} onSelectSlot={handleSelectSlot} onOpenTest={() => setTestOpen(true)} />
        </div>
      </div>

      {testOpen && (
        <MenuTestModal state={state} onClose={() => setTestOpen(false)} />
      )}
    </div>
  )
}
