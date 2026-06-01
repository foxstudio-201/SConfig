import { useState, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  TrashIcon, PlayIcon, PlusIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import { useI18n } from '../../../context/I18nContext'
import {
  createProjectState, createShopkeeper, createTrade, createStack, applyShopkeeperPreset,
  getActiveShopkeeper, SHOP_TYPES, OBJECT_TYPES, SK_PRESETS,
} from './shopKeeperData'
import { buildFullExport, buildShopkeeperCommands } from './shopKeeperYaml'
import { downloadText } from '../shopShared'
import MINECRAFT_MATERIALS from '../deluxeMenus/minecraftMaterials.js'
import McItemIcon from '../deluxeMenus/McItemIcon'
import ShopKeeperPreview from './ShopKeeperPreview'
import ShopKeeperTestModal from './ShopKeeperTestModal'

const MAIN_TABS = [
  { id: 'general', labelKey: 'tabGeneral' },
  { id: 'trades', labelKey: 'tabTrades' },
  { id: 'yaml', labelKey: 'tabYaml' },
]

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-amber-500/35 transition-colors font-mono text-xs'
const inputWideCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-amber-500/35 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3'

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
      {isSelected && <span className="text-amber-300 text-xs">✓</span>}
    </>
  )
}

function StackEditor({ label, stack, onChange, materialOptions, renderMaterialOption, renderMaterialValue, t }) {
  if (!stack) return null
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex flex-col gap-2">
      <p className="text-[10px] text-white/40 uppercase font-semibold">{label}</p>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-[#373737] border border-[#555] flex items-center justify-center flex-shrink-0">
          {stack.material ? <McItemIcon material={stack.material} size="md" /> : '—'}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <CustomDropdown label={t('shopKeeper.material')} value={stack.material || ''} onChange={v => onChange({ ...stack, material: v })}
            options={materialOptions} accent="amber" searchable renderOption={renderMaterialOption} renderValue={renderMaterialValue} />
          <Field label={t('shopKeeper.amount')}>
            <input type="number" min={1} className={inputWideCls} value={stack.amount || 1} onChange={e => onChange({ ...stack, amount: Number(e.target.value) || 1 })} />
          </Field>
        </div>
      </div>
    </div>
  )
}

export default function ShopKeeperTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(createProjectState)
  const [mainTab, setMainTab] = useState('trades')
  const [selectedTradeIdx, setSelectedTradeIdx] = useState(0)
  const [useCost2, setUseCost2] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [testOpen, setTestOpen] = useState(false)

  const sk = useMemo(() => getActiveShopkeeper(state), [state])
  const yamlContent = useMemo(() => sk ? buildFullExport(sk) : '', [sk])
  const commandsText = useMemo(() => sk ? buildShopkeeperCommands(sk) : '', [sk])
  const trade = sk?.trades[selectedTradeIdx]

  const materialOptions = useMemo(() => MINECRAFT_MATERIALS.map(m => ({ value: m, label: m })), [])
  const renderMaterialOption = useCallback((opt, isSelected) => <MaterialOption opt={opt} isSelected={isSelected} />, [])
  const renderMaterialValue = useCallback(opt => opt ? (
    <span className="flex items-center gap-2 min-w-0"><McItemIcon material={opt.value} size="xs" /><span className="truncate font-mono text-xs">{opt.label}</span></span>
  ) : null, [])

  const updateSk = useCallback(patch => {
    setState(prev => ({ ...prev, shopkeepers: prev.shopkeepers.map(s => s._id === prev.activeId ? { ...s, ...patch } : s) }))
  }, [])

  const updateTrade = useCallback((idx, patch) => {
    setState(prev => ({
      ...prev,
      shopkeepers: prev.shopkeepers.map(s => {
        if (s._id !== prev.activeId) return s
        const trades = s.trades.map((tr, i) => i === idx ? { ...tr, ...patch } : tr)
        return { ...s, trades }
      }),
    }))
  }, [])

  const loadPreset = useCallback(v => {
    if (!v || !sk) return
    const preset = applyShopkeeperPreset(v)
    preset._id = sk._id
    updateSk(preset)
    setSelectedTradeIdx(0)
  }, [sk, updateSk])

  const handleCopy = useCallback(async (text, id) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  if (!sk) return null

  function renderEditor() {
    switch (mainTab) {
      case 'general':
        return (
          <div className="flex flex-col gap-3">
            <Field label={t('shopKeeper.displayName')}><input className={inputCls} value={sk.name} onChange={e => updateSk({ name: e.target.value })} spellCheck={false} /></Field>
            <CustomDropdown label={t('shopKeeper.shopType')} value={sk.shopType} onChange={v => updateSk({ shopType: v })}
              options={SHOP_TYPES.map(x => ({ value: x.value, label: t(`shopKeeper.${x.labelKey}`) }))} accent="amber" />
            <CustomDropdown label={t('shopKeeper.objectType')} value={sk.objectType} onChange={v => updateSk({ objectType: v })}
              options={OBJECT_TYPES.map(x => ({ value: x.value, label: t(`shopKeeper.${x.labelKey}`) }))} accent="amber" />
            <CustomDropdown label={t('shopKeeper.currencyItem')} value={sk.currencyItem || 'EMERALD'} onChange={v => updateSk({ currencyItem: v })}
              options={materialOptions} accent="amber" searchable renderOption={renderMaterialOption} renderValue={renderMaterialValue} />
            <p className="text-[10px] text-white/30 uppercase font-semibold">{t('shopKeeper.location')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Field label={t('shopKeeper.world')}><input className={inputCls} value={sk.location?.world || 'world'} onChange={e => updateSk({ location: { ...sk.location, world: e.target.value } })} /></Field>
              {['x', 'y', 'z'].map(k => (
                <Field key={k} label={k.toUpperCase()}><input type="number" step="any" className={inputCls} value={sk.location?.[k] ?? 0} onChange={e => updateSk({ location: { ...sk.location, [k]: Number(e.target.value) || 0 } })} /></Field>
              ))}
            </div>
          </div>
        )
      case 'trades':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 items-center">
              {sk.trades.map((tr, i) => (
                <button key={tr.id} type="button" onClick={() => { setSelectedTradeIdx(i); setUseCost2(!!tr.cost2?.material) }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border ${i === selectedTradeIdx ? 'border-amber-500/40 bg-amber-500/10 text-amber-200' : 'border-white/[0.08] text-white/45'}`}>
                  #{i + 1}
                </button>
              ))}
              <button type="button" onClick={() => { updateSk({ trades: [...sk.trades, createTrade()] }); setSelectedTradeIdx(sk.trades.length) }}
                className={`${btnCls} bg-amber-500/10 border-amber-500/20 text-amber-300`}><PlusIcon className="w-3.5 h-3.5" />{t('shopKeeper.addTrade')}</button>
              {sk.trades.length > 1 && (
                <button type="button" onClick={() => { updateSk({ trades: sk.trades.filter((_, i) => i !== selectedTradeIdx) }); setSelectedTradeIdx(0) }}
                  className={`${btnCls} border-red-500/20 text-red-300`}><TrashIcon className="w-3.5 h-3.5" /></button>
              )}
            </div>
            {trade && (
              <div className={sectionCls}>
                <StackEditor label={t('shopKeeper.cost1')} stack={trade.cost1} onChange={v => updateTrade(selectedTradeIdx, { cost1: v })}
                  materialOptions={materialOptions} renderMaterialOption={renderMaterialOption} renderMaterialValue={renderMaterialValue} t={t} />
                <button type="button" onClick={() => {
                  const next = !useCost2
                  setUseCost2(next)
                  updateTrade(selectedTradeIdx, { cost2: next ? createStack('COAL', 1) : null })
                }} className={`${btnCls} self-start border-white/[0.08] text-white/50`}>
                  {useCost2 ? t('shopKeeper.removeCost2') : t('shopKeeper.addCost2')}
                </button>
                {useCost2 && trade.cost2 && (
                  <StackEditor label={t('shopKeeper.cost2')} stack={trade.cost2} onChange={v => updateTrade(selectedTradeIdx, { cost2: v })}
                    materialOptions={materialOptions} renderMaterialOption={renderMaterialOption} renderMaterialValue={renderMaterialValue} t={t} />
                )}
                <StackEditor label={t('shopKeeper.result')} stack={trade.result} onChange={v => updateTrade(selectedTradeIdx, { result: v })}
                  materialOptions={materialOptions} renderMaterialOption={renderMaterialOption} renderMaterialValue={renderMaterialValue} t={t} />
                <Field label={t('shopKeeper.maxUses')} hint={t('shopKeeper.maxUsesHint')}>
                  <input type="number" className={inputWideCls} value={trade.maxUses ?? -1} onChange={e => updateTrade(selectedTradeIdx, { maxUses: Number(e.target.value) })} />
                </Field>
              </div>
            )}
          </div>
        )
      case 'yaml':
        return (
          <div className="flex flex-col gap-3 h-full min-h-0">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => handleCopy(yamlContent, 'yaml')} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/60`}>
                {copiedId === 'yaml' ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                {t('shopKeeper.copyYaml')}
              </button>
              <button type="button" onClick={() => handleCopy(commandsText, 'cmd')} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/60`}>
                {copiedId === 'cmd' ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                {t('shopKeeper.copyCommands')}
              </button>
              <button type="button" onClick={() => downloadText(yamlContent, 'shopkeeper-export.yml')} className={`${btnCls} bg-amber-500/10 border-amber-500/20 text-amber-300`}>
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('shopKeeper.downloadYaml')}
              </button>
            </div>
            <p className="text-[10px] text-white/30">{t('shopKeeper.yamlHint')}</p>
            <pre className="flex-1 min-h-[240px] overflow-auto custom-dropdown-scroll bg-[#0f0f1b] border border-white/[0.06] rounded-xl p-4 text-xs font-mono text-amber-300/90 whitespace-pre-wrap">{yamlContent}</pre>
            <pre className="min-h-[80px] max-h-[120px] overflow-auto custom-dropdown-scroll bg-[#0f0f1b] border border-white/[0.06] rounded-xl p-4 text-xs font-mono text-white/45 whitespace-pre-wrap">{commandsText}</pre>
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
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 font-semibold uppercase">{t('shopKeeper.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('shopKeeper.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('shopKeeper.subtitle')}</p>
        </div>
        <CustomDropdown label="" value="" onChange={loadPreset} options={SK_PRESETS.map(p => ({ value: p.id, label: t(`shopKeeper.${p.labelKey}`) }))} placeholder={t('shopKeeper.applyPreset')} accent="amber" className="w-44" />
        <button type="button" onClick={() => setTestOpen(true)} className={`${btnCls} bg-amber-500/15 border-amber-500/30 text-amber-200`}><PlayIcon className="w-3.5 h-3.5" />{t('shopKeeper.openTestMode')}</button>
      </div>
      <div className="flex gap-1 px-5 py-2 border-b border-white/[0.04] flex-shrink-0">
        {MAIN_TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setMainTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${mainTab === tab.id ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25' : 'text-white/40 border border-transparent'}`}>
            {t(`shopKeeper.${tab.labelKey}`)}
          </button>
        ))}
      </div>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-dropdown-scroll p-5 min-w-0">{renderEditor()}</div>
        <div className="hidden lg:block w-[min(420px,34vw)] min-w-[340px] flex-shrink-0 border-l border-white/[0.06] p-4 overflow-hidden">
          <ShopKeeperPreview sk={sk} selectedTradeIdx={selectedTradeIdx} onSelectTrade={setSelectedTradeIdx} onOpenTest={() => setTestOpen(true)} />
        </div>
      </div>
      {testOpen && <ShopKeeperTestModal sk={sk} onClose={() => setTestOpen(false)} />}
    </div>
  )
}
