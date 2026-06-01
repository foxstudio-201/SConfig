import { PlayIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../../context/I18nContext'
import McItemIcon from '../deluxeMenus/McItemIcon'
import { McText } from '../deluxeMenus/McMenuGui'
import { stackToDisplayName, stackToLore } from './shopKeeperData'

function TradeSlot({ stack, label, accent }) {
  if (!stack?.material) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded border border-dashed border-white/[0.08] bg-black/20" />
        <span className="text-[8px] text-white/25">{label}</span>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-1 relative">
      <div className={`w-12 h-12 rounded-lg bg-[#373737] border border-[#555] flex items-center justify-center ring-1 ${accent}`}>
        <McItemIcon material={stack.material} size="md" />
        {stack.amount > 1 && <span className="absolute -bottom-0.5 right-1 text-[8px] font-bold text-white drop-shadow">{stack.amount}</span>}
      </div>
      <span className="text-[8px] text-white/35 uppercase">{label}</span>
      <McText text={stackToDisplayName(stack)} className="text-[9px] text-center max-w-[72px] truncate" />
    </div>
  )
}

function TradeRow({ trade, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full rounded-xl border p-3 flex items-center justify-center gap-2 transition-all ${
        selected ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <TradeSlot stack={trade.cost1} label="Cost" accent="" />
      {trade.cost2?.material && <><span className="text-white/30">+</span><TradeSlot stack={trade.cost2} label="Cost 2" accent="" /></>}
      <span className="text-amber-300/60 text-lg">→</span>
      <TradeSlot stack={trade.result} label="Result" accent="ring-amber-500/30" />
    </button>
  )
}

export default function ShopKeeperPreview({ sk, selectedTradeIdx, onSelectTrade, onOpenTest }) {
  const { t } = useI18n()
  const trade = sk.trades[selectedTradeIdx ?? 0]

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0a0a14]/80 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-amber-300/90 uppercase tracking-wide">{t('shopKeeper.previewTitle')}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{t('shopKeeper.previewHint')}</p>
        </div>
        <button type="button" onClick={onOpenTest}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[10px] font-bold hover:bg-amber-500/25 transition-all">
          <PlayIcon className="w-3.5 h-3.5" />{t('shopKeeper.openTestMode')}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-dropdown-scroll p-4 flex flex-col gap-3">
        <div className="text-center">
          <McText text={sk.name} className="text-sm font-bold" />
          <p className="text-[9px] text-white/30 font-mono mt-1">{sk.objectType} · {sk.shopType}</p>
        </div>
        {trade && (
          <div className="rounded-lg border border-white/[0.08] bg-black/40 p-4 flex items-center justify-center gap-3">
            <TradeSlot stack={trade.cost1} label={t('shopKeeper.cost1')} accent="" />
            {trade.cost2?.material && <TradeSlot stack={trade.cost2} label={t('shopKeeper.cost2')} accent="" />}
            <span className="text-amber-400 text-xl font-bold">→</span>
            <TradeSlot stack={trade.result} label={t('shopKeeper.result')} accent="ring-amber-500/40" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          {sk.trades.map((tr, i) => (
            <TradeRow key={tr.id} trade={tr} selected={i === (selectedTradeIdx ?? 0)} onClick={() => onSelectTrade?.(i)} />
          ))}
        </div>
      </div>
    </div>
  )
}
