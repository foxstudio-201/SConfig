import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  TrashIcon, PlayIcon, PlusIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import { useI18n } from '../../../context/I18nContext'
import {
  createProjectState, createShop, createShopItem, applyShopPreset, getActiveShop,
  SHOP_SIZES, ITEM_TYPES, SHOP_PRESETS,
} from './shopGuiPlusData'
import { buildShopYaml, buildMenuItemsYaml, buildFullExport } from './shopGuiPlusYaml'
import { downloadText, linesToArr, arrToLines } from '../shopShared'
import MINECRAFT_MATERIALS from '../deluxeMenus/minecraftMaterials.js'
import McItemIcon from '../deluxeMenus/McItemIcon'
import GuiSlotPicker from '../deluxeMenus/GuiSlotPicker'
import ShopGuiPreview from './ShopGuiPreview'
import ShopGuiTestModal from './ShopGuiTestModal'

const MAIN_TABS = [
  { id: 'general', labelKey: 'tabGeneral' },
  { id: 'items', labelKey: 'tabItems' },
  { id: 'menu', labelKey: 'tabMenu' },
  { id: 'yaml', labelKey: 'tabYaml' },
]

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-emerald-500/35 transition-colors font-mono text-xs'
const inputWideCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-emerald-500/35 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3'

function Toggle({ label, value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${value ? 'border-emerald-500/35 bg-emerald-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center ${value ? 'bg-emerald-500/40 border-emerald-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
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

function MaterialOption({ opt, isSelected }) {
  return (
    <>
      <McItemIcon material={opt.value} size="xs" className="flex-shrink-0" />
      <span className="flex-1 truncate font-mono text-xs">{opt.label}</span>
      {isSelected && <span className="text-emerald-300 text-xs">✓</span>}
    </>
  )
}

export default function ShopGuiPlusTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(createProjectState)
  const [mainTab, setMainTab] = useState('items')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [testOpen, setTestOpen] = useState(false)

  const shop = useMemo(() => getActiveShop(state), [state])
  const yamlContent = useMemo(() => buildFullExport(state), [state])
  const shopYaml = useMemo(() => shop ? buildShopYaml(shop) : '', [shop])

  const pickerItems = useMemo(() => {
    const m = {}
    shop?.items.forEach(i => {
      if (i.slot != null) m[i.slot] = { material: i.material, amount: i.quantity }
    })
    return m
  }, [shop?.items])

  const selectedItem = useMemo(() => {
    if (selectedSlot == null || !shop) return null
    return shop.items.find(i => i.slot === selectedSlot) || null
  }, [shop, selectedSlot])

  const materialOptions = useMemo(() => MINECRAFT_MATERIALS.map(m => ({ value: m, label: m })), [])
  const renderMaterialOption = useCallback((opt, isSelected) => <MaterialOption opt={opt} isSelected={isSelected} />, [])
  const renderMaterialValue = useCallback(opt => opt ? (
    <span className="flex items-center gap-2 min-w-0"><McItemIcon material={opt.value} size="xs" /><span className="truncate font-mono text-xs">{opt.label}</span></span>
  ) : null, [])

  const updateShop = useCallback(patch => {
    setState(prev => ({ ...prev, shops: prev.shops.map(s => s._id === prev.activeShopId ? { ...s, ...patch } : s) }))
  }, [])

  const updateItem = useCallback((slot, patch) => {
    setState(prev => ({
      ...prev,
      shops: prev.shops.map(s => {
        if (s._id !== prev.activeShopId) return s
        const items = s.items.map(i => i.slot === slot ? { ...i, ...patch } : i)
        return { ...s, items }
      }),
    }))
  }, [])

  const handleSelectSlot = useCallback(slot => {
    setSelectedSlot(slot)
    setState(prev => {
      const s = prev.shops.find(x => x._id === prev.activeShopId)
      if (!s || s.items.some(i => i.slot === slot)) return prev
      return {
        ...prev,
        shops: prev.shops.map(x => x._id === prev.activeShopId ? { ...x, items: [...x.items, createShopItem(slot)] } : x),
      }
    })
    setMainTab('items')
  }, [])

  const handleRemoveItem = useCallback(slot => {
    setState(prev => ({
      ...prev,
      shops: prev.shops.map(s => s._id === prev.activeShopId ? { ...s, items: s.items.filter(i => i.slot !== slot) } : s),
    }))
    if (selectedSlot === slot) setSelectedSlot(null)
  }, [selectedSlot])

  const addShop = useCallback(() => {
    const id = Math.max(0, ...state.shops.map(s => parseInt(s.shopId, 10) || 0)) + 1
    const s = createShop({ shopId: `shop${id}`, name: `&aShop ${id}` })
    setState(prev => ({ ...prev, shops: [...prev.shops, s], activeShopId: s._id }))
  }, [state.shops])

  const loadPreset = useCallback(v => {
    if (!v || !shop) return
    const preset = applyShopPreset(v)
    preset._id = shop._id
    updateShop(preset)
    setSelectedSlot(null)
  }, [shop, updateShop])

  const handleCopy = useCallback(async (text, id) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  if (!shop) return null

  function renderEditor() {
    switch (mainTab) {
      case 'general':
        return (
          <div className="flex flex-col gap-3">
            <Field label={t('shopGuiPlus.shopId')}>
              <input className={inputCls} value={shop.shopId} onChange={e => updateShop({ shopId: e.target.value.replace(/\s/g, '_') })} />
            </Field>
            <Field label={t('shopGuiPlus.shopName')}>
              <input className={inputCls} value={shop.name} onChange={e => updateShop({ name: e.target.value })} spellCheck={false} />
            </Field>
            <CustomDropdown label={t('shopGuiPlus.shopSize')} value={String(shop.size)} onChange={v => updateShop({ size: Number(v) })}
              options={SHOP_SIZES.map(s => ({ value: String(s), label: `${s} slots` }))} accent="emerald" />
            <p className="text-[10px] text-white/30 uppercase font-semibold">{t('shopGuiPlus.fillItem')}</p>
            <CustomDropdown label={t('shopGuiPlus.material')} value={shop.fillItem?.material || ''} onChange={v => updateShop({ fillItem: { ...shop.fillItem, material: v } })}
              options={materialOptions} accent="emerald" searchable renderOption={renderMaterialOption} renderValue={renderMaterialValue} />
          </div>
        )
      case 'items':
        return (
          <div className="flex flex-col gap-4">
            <GuiSlotPicker inventoryType="CHEST" size={shop.size} items={pickerItems} selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot} onRemoveItem={handleRemoveItem} />
            {selectedItem ? (
              <div className={sectionCls}>
                <CustomDropdown label={t('shopGuiPlus.itemType')} value={selectedItem.type} onChange={v => updateItem(selectedSlot, { type: v })}
                  options={ITEM_TYPES.map(x => ({ value: x.value, label: t(`shopGuiPlus.${x.labelKey}`) }))} accent="emerald" />
                <CustomDropdown label={t('shopGuiPlus.material')} value={selectedItem.material} onChange={v => updateItem(selectedSlot, { material: v })}
                  options={materialOptions} accent="emerald" searchable renderOption={renderMaterialOption} renderValue={renderMaterialValue} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label={t('shopGuiPlus.quantity')}><input type="number" min={1} className={inputWideCls} value={selectedItem.quantity || 1} onChange={e => updateItem(selectedSlot, { quantity: Number(e.target.value) || 1 })} /></Field>
                  <Field label={t('shopGuiPlus.slot')}><input type="number" min={0} className={inputWideCls} value={selectedItem.slot} onChange={e => updateItem(selectedSlot, { slot: Number(e.target.value) })} /></Field>
                </div>
                <Field label={t('shopGuiPlus.displayName')}><input className={inputCls} value={selectedItem.name || ''} onChange={e => updateItem(selectedSlot, { name: e.target.value })} spellCheck={false} /></Field>
                <Field label={t('shopGuiPlus.lore')}><textarea className={`${inputCls} min-h-[60px]`} value={arrToLines(selectedItem.lore)} onChange={e => updateItem(selectedSlot, { lore: linesToArr(e.target.value) })} spellCheck={false} /></Field>
                {selectedItem.type === 'item' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label={t('shopGuiPlus.buyPrice')}><input type="number" step="any" className={inputWideCls} value={selectedItem.buyPrice ?? 0} onChange={e => updateItem(selectedSlot, { buyPrice: Number(e.target.value) })} /></Field>
                      <Field label={t('shopGuiPlus.sellPrice')}><input type="number" step="any" className={inputWideCls} value={selectedItem.sellPrice ?? 0} onChange={e => updateItem(selectedSlot, { sellPrice: Number(e.target.value) })} /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Toggle label={t('shopGuiPlus.sellOnly')} value={!!selectedItem.sellOnly} onChange={v => updateItem(selectedSlot, { sellOnly: v })} />
                      <Toggle label={t('shopGuiPlus.buyOnly')} value={!!selectedItem.buyOnly} onChange={v => updateItem(selectedSlot, { buyOnly: v })} />
                    </div>
                  </>
                )}
                {selectedItem.type === 'command' && (
                  <Field label={t('shopGuiPlus.commands')}><textarea className={`${inputCls} min-h-[72px]`} value={arrToLines(selectedItem.commands)} onChange={e => updateItem(selectedSlot, { commands: linesToArr(e.target.value) })} spellCheck={false} placeholder="/give %PLAYER% diamond 1" /></Field>
                )}
                {selectedItem.type === 'permission' && (
                  <Field label={t('shopGuiPlus.permission')}><input className={inputCls} value={selectedItem.permission || ''} onChange={e => updateItem(selectedSlot, { permission: e.target.value })} /></Field>
                )}
                <button type="button" onClick={() => handleRemoveItem(selectedSlot)} className={`${btnCls} self-start border-red-500/20 text-red-300`}><TrashIcon className="w-3.5 h-3.5" />{t('shopGuiPlus.removeItem')}</button>
              </div>
            ) : (
              <p className="text-sm text-white/35 text-center py-4">{t('shopGuiPlus.selectSlotHint')}</p>
            )}
          </div>
        )
      case 'menu':
        return (
          <div className="flex flex-col gap-3">
            <Field label={t('shopGuiPlus.menuSlot')} hint={t('shopGuiPlus.menuSlotHint')}>
              <input type="number" min={0} max={53} className={inputWideCls} value={shop.menuSlot ?? 0} onChange={e => updateShop({ menuSlot: Number(e.target.value) })} />
            </Field>
            <CustomDropdown label={t('shopGuiPlus.menuIcon')} value={shop.menuIcon?.material || 'CHEST'} onChange={v => updateShop({ menuIcon: { ...shop.menuIcon, material: v } })}
              options={materialOptions} accent="emerald" searchable renderOption={renderMaterialOption} renderValue={renderMaterialValue} />
            <Field label={t('shopGuiPlus.menuName')}><input className={inputCls} value={shop.menuIcon?.name || shop.name} onChange={e => updateShop({ menuIcon: { ...shop.menuIcon, name: e.target.value } })} spellCheck={false} /></Field>
            <pre className="text-xs font-mono text-white/40 bg-black/30 rounded-xl p-3 overflow-auto">{buildMenuItemsYaml([shop])}</pre>
          </div>
        )
      case 'yaml':
        return (
          <div className="flex flex-col gap-3 h-full min-h-0">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => handleCopy(yamlContent, 'all')} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/60`}>
                {copiedId === 'all' ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                {t('shopGuiPlus.copyAll')}
              </button>
              <button type="button" onClick={() => downloadText(shopYaml, `${shop.shopId}.yml`)} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('shopGuiPlus.downloadShop')}
              </button>
            </div>
            <p className="text-[10px] text-white/30">{t('shopGuiPlus.yamlHint')}</p>
            <pre className="flex-1 min-h-[280px] overflow-auto custom-dropdown-scroll bg-[#0f0f1b] border border-white/[0.06] rounded-xl p-4 text-xs font-mono text-emerald-300/90 whitespace-pre-wrap">{yamlContent}</pre>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0 flex-wrap">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all"><ArrowLeftIcon className="w-4 h-4" /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-semibold uppercase">{t('shopGuiPlus.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('shopGuiPlus.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('shopGuiPlus.subtitle')}</p>
        </div>
        <CustomDropdown label="" value="" onChange={loadPreset} options={SHOP_PRESETS.map(p => ({ value: p.id, label: t(`shopGuiPlus.${p.labelKey}`) }))} placeholder={t('shopGuiPlus.applyPreset')} accent="emerald" className="w-44" />
        <button type="button" onClick={() => setTestOpen(true)} className={`${btnCls} bg-emerald-500/15 border-emerald-500/30 text-emerald-200`}><PlayIcon className="w-3.5 h-3.5" />{t('shopGuiPlus.openTestMode')}</button>
      </div>
      <div className="flex gap-1 px-5 py-2 border-b border-white/[0.04] flex-shrink-0 overflow-x-auto">
        {MAIN_TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setMainTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${mainTab === tab.id ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' : 'text-white/40 border border-transparent'}`}>
            {t(`shopGuiPlus.${tab.labelKey}`)}
          </button>
        ))}
      </div>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="w-48 flex-shrink-0 border-r border-white/[0.06] p-3 overflow-y-auto custom-dropdown-scroll hidden md:block">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-white/40 uppercase font-semibold">{t('shopGuiPlus.shopList')}</p>
            <button type="button" onClick={addShop} className="text-emerald-300"><PlusIcon className="w-4 h-4" /></button>
          </div>
          {state.shops.map(s => (
            <button key={s._id} type="button" onClick={() => { setState(prev => ({ ...prev, activeShopId: s._id })); setSelectedSlot(null) }}
              className={`w-full text-left rounded-xl border px-2.5 py-2 mb-1.5 ${s._id === state.activeShopId ? 'border-emerald-500/35 bg-emerald-500/10' : 'border-white/[0.06] bg-white/[0.02]'}`}>
              <span className="text-[11px] font-mono font-bold text-white/80 block truncate">{s.shopId}</span>
              <span className="text-[9px] text-white/30">{s.items.length} items</span>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto custom-dropdown-scroll p-5 min-w-0">{renderEditor()}</div>
        <div className="hidden lg:block w-[min(420px,34vw)] min-w-[340px] flex-shrink-0 border-l border-white/[0.06] p-4 overflow-hidden">
          <ShopGuiPreview shop={shop} onOpenTest={() => setTestOpen(true)} />
        </div>
      </div>
      {testOpen && <ShopGuiTestModal shop={shop} onClose={() => setTestOpen(false)} />}
    </div>
  )
}
