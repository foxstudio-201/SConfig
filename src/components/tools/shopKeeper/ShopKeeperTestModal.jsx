import { useState, useCallback, useEffect, useRef } from 'react'
import { XMarkIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../../context/I18nContext'
import McItemIcon from '../deluxeMenus/McItemIcon'
import { McText } from '../deluxeMenus/McMenuGui'
import { simulateTrade, simulateOpen, formatLogTime } from './shopKeeperSimulator'

const CLICK_BTN = 'px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all'

function LogRow({ entry }) {
  return (
    <div className="flex gap-2 items-start py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[9px] text-white/20 font-mono w-14 shrink-0">{formatLogTime(entry.time)}</span>
      <span className="text-sm w-5 text-center" style={{ color: entry.color }}>{entry.icon}</span>
      <p className="text-xs text-white/75 font-mono break-all flex-1">{entry.text}</p>
    </div>
  )
}

function TradePanel({ trade, t, onTrade }) {
  if (!trade) return null
  return (
    <div className="rounded-2xl border-2 border-amber-500/20 bg-amber-500/5 p-6 flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        {[trade.cost1, trade.cost2, trade.result].filter(s => s?.material).map((stack, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-lg bg-[#373737] border border-[#555] flex items-center justify-center relative">
              <McItemIcon material={stack.material} size="lg" />
              {stack.amount > 1 && <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold text-white">{stack.amount}</span>}
            </div>
            <McText text={stack.name || `&f${stack.material}`} className="text-[10px] text-center max-w-[80px]" />
          </div>
        ))}
      </div>
      <button type="button" onClick={onTrade}
        className="px-6 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30 transition-all">
        {t('shopKeeper.testExecuteTrade')}
      </button>
    </div>
  )
}

export default function ShopKeeperTestModal({ sk, onClose }) {
  const { t } = useI18n()
  const [tradeIdx, setTradeIdx] = useState(0)
  const [logs, setLogs] = useState([])
  const logRef = useRef(null)
  const trade = sk.trades[tradeIdx]

  const appendLogs = useCallback(entries => setLogs(prev => [...entries, ...prev].slice(0, 200)), [])

  useEffect(() => { appendLogs(simulateOpen(sk, t)) }, [])
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 0 }, [logs])

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-white/[0.1] bg-[#0c0c16] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-gradient-to-r from-amber-500/10 to-transparent">
          <PlayIcon className="w-4 h-4 text-amber-400" />
          <div className="flex-1">
            <h2 className="text-base font-bold text-white">{t('shopKeeper.testModeTitle')}</h2>
            <p className="text-[11px] text-white/35">{t('shopKeeper.testModeHint')}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.08] text-white/50"><XMarkIcon className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-wrap gap-2 px-5 py-2 border-b border-white/[0.06] bg-black/20">
          {sk.trades.map((tr, i) => (
            <button key={tr.id} type="button" onClick={() => setTradeIdx(i)}
              className={`${CLICK_BTN} ${i === tradeIdx ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' : 'border-white/[0.08] text-white/45'}`}>
              #{i + 1}
            </button>
          ))}
          <div className="flex-1" />
          <button type="button" onClick={() => setLogs([])} className={`${CLICK_BTN} border-white/[0.08] text-white/40 flex items-center gap-1`}>
            <TrashIcon className="w-3.5 h-3.5" />{t('shopKeeper.testClearLog')}
          </button>
        </div>

        <div className="relative overflow-hidden">
          <div className="min-w-0 p-6 pr-[356px] flex flex-col items-center gap-4 bg-[#080810]/50">
            <McText text={sk.name} className="text-lg font-bold" />
            <TradePanel trade={trade} t={t} onTrade={() => appendLogs(simulateTrade(trade, t))} />
          </div>
          <div className="absolute inset-y-0 right-0 w-[340px] flex flex-col min-h-0 border-l border-white/[0.08] bg-[#0a0a12] p-3">
            <p className="text-[9px] text-white/30 uppercase mb-2">{t('shopKeeper.testActionLog')}</p>
            <div ref={logRef} className="flex-1 overflow-y-auto custom-dropdown-scroll rounded-xl bg-black/40 border border-white/[0.06] p-2">
              {logs.map(e => <LogRow key={e.id} entry={e} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
