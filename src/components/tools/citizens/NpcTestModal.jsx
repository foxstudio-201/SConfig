import { useState, useCallback, useEffect, useRef } from 'react'
import { XMarkIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../../context/I18nContext'
import { McText } from '../deluxeMenus/McMenuGui'
import McItemIcon from '../deluxeMenus/McItemIcon'
import { EQUIPMENT_SLOTS, CLICK_HANDS } from './citizensData'
import NpcSkinView from './NpcSkinView'
import {
  simulateNpcClick, simulateNpcTalk, simulateLookClose, simulateTalkClose,
  formatLogTime, expandNpcText,
} from './citizensSimulator'

const CLICK_BTN = 'px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all'

function ChatBubble({ entry }) {
  return (
    <div className="flex gap-2 items-start animate-fade-in">
      <span className="text-[10px] text-white/25 font-mono shrink-0">{formatLogTime(entry.time)}</span>
      <div className="flex-1 min-w-0 rounded-lg bg-black/30 border border-white/[0.06] px-2.5 py-1.5">
        {entry.npcName && (
          <span className="text-[10px] text-lime-300/70 font-bold block mb-0.5">{entry.npcName}</span>
        )}
        <McText text={entry.text} className="text-xs leading-relaxed" />
      </div>
    </div>
  )
}

function LogRow({ entry }) {
  return (
    <div className="flex gap-2 items-start py-1.5 border-b border-white/[0.04] last:border-0 animate-fade-in">
      <span className="text-[9px] text-white/20 font-mono w-14 shrink-0 pt-0.5">{formatLogTime(entry.time)}</span>
      <span className="text-sm shrink-0 w-5 text-center" style={{ color: entry.color }}>{entry.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/75 font-mono break-all">{entry.text}</p>
        {entry.raw && entry.raw !== entry.text && (
          <p className="text-[9px] text-white/25 mt-0.5 font-mono truncate" title={entry.raw}>{entry.raw}</p>
        )}
      </div>
    </div>
  )
}

export default function NpcTestModal({ npc, onClose }) {
  const { t } = useI18n()
  const [clickHand, setClickHand] = useState('RIGHT')
  const [logs, setLogs] = useState([])
  const [nearNpc, setNearNpc] = useState(true)
  const logRef = useRef(null)

  const appendLogs = useCallback(entries => {
    setLogs(prev => [...entries, ...prev].slice(0, 200))
  }, [])

  useEffect(() => {
    appendLogs([
      ...simulateLookClose(npc, t),
      {
        id: 'open',
        time: new Date(),
        kind: 'info',
        icon: '●',
        color: '#84cc16',
        text: t('citizens.testOpened', { name: expandNpcText(npc.name, npc.name).replace(/&[0-9a-fk-or]/gi, '') }),
      },
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [logs])

  useEffect(() => {
    if (!nearNpc || !npc.talkClose?.enabled) return
    appendLogs(simulateTalkClose(npc, t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearNpc])

  const handleClick = useCallback(() => {
    appendLogs(simulateNpcClick(npc, clickHand, t))
  }, [npc, clickHand, t, appendLogs])

  const chatEntries = logs.filter(e => e.kind === 'chat')

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-white/[0.1] bg-[#0c0c16] shadow-2xl overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08] bg-gradient-to-r from-lime-500/10 to-transparent flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <PlayIcon className="w-4 h-4 text-lime-400" />
              <h2 className="text-base font-bold text-white">{t('citizens.testModeTitle')}</h2>
            </div>
            <p className="text-[11px] text-white/35 mt-0.5">{t('citizens.testModeHint')}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 border-b border-white/[0.06] bg-black/20 flex-shrink-0">
          <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mr-1">{t('citizens.testClickType')}</span>
          {CLICK_HANDS.map(h => (
            <button
              key={h.value}
              type="button"
              onClick={() => setClickHand(h.value)}
              className={`${CLICK_BTN} ${clickHand === h.value ? 'bg-lime-500/20 border-lime-500/40 text-lime-200' : 'border-white/[0.08] text-white/45 hover:text-white/70'}`}
            >
              {t(`citizens.${h.labelKey}`)}
            </button>
          ))}
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setNearNpc(v => !v)}
            className={`${CLICK_BTN} ${nearNpc ? 'bg-sky-500/15 border-sky-500/30 text-sky-300' : 'border-white/[0.08] text-white/40'}`}
          >
            {nearNpc ? t('citizens.testNearOn') : t('citizens.testNearOff')}
          </button>
          <button type="button" onClick={() => appendLogs(simulateNpcTalk(npc, t))} className={`${CLICK_BTN} border-white/[0.08] text-white/45`}>
            {t('citizens.testForceTalk')}
          </button>
          <button type="button" onClick={() => setLogs([])} className={`${CLICK_BTN} border-white/[0.08] text-white/40 hover:text-white/60 flex items-center gap-1`}>
            <TrashIcon className="w-3.5 h-3.5" />{t('citizens.testClearLog')}
          </button>
        </div>

        <div className="relative overflow-hidden">
          <div className="min-w-0 p-6 pr-[356px] sm:pr-[404px] flex flex-col items-center gap-4 bg-[#080810]/50">
            <div className="text-center">
              <McText text={npc.name} className="text-lg font-bold block mb-1" />
              <p className="text-[10px] text-white/30 font-mono">#{npc.citizensId}</p>
            </div>

            <button
              type="button"
              onClick={handleClick}
              className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-lime-500/25 bg-lime-500/5 hover:bg-lime-500/10 hover:border-lime-500/40 transition-all cursor-pointer"
            >
              <NpcSkinView npc={npc} size="lg" showLabel={false} />
              <span className="text-[10px] text-lime-300/70 font-bold uppercase tracking-wider group-hover:text-lime-200">
                {t('citizens.testClickNpc')}
              </span>
            </button>

            {Object.values(npc.equipment || {}).some(Boolean) && (
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {EQUIPMENT_SLOTS.map(slot => {
                  const item = npc.equipment?.[slot.key]
                  if (!item?.material) return null
                  return (
                    <div key={slot.key} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 border border-white/[0.06]">
                      <McItemIcon material={item.material} size="sm" />
                      <span className="text-[9px] text-white/35 font-mono">{item.material}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="absolute inset-y-0 right-0 w-[340px] sm:w-[380px] flex flex-col min-h-0 overflow-hidden border-l border-white/[0.08] bg-[#0a0a12]">
            {chatEntries.length > 0 && (
              <div className="flex-shrink-0 border-b border-white/[0.06] p-3 max-h-[140px] overflow-y-auto custom-dropdown-scroll">
                <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-2">{t('citizens.testChat')}</p>
                <div className="flex flex-col gap-2">
                  {chatEntries.slice(0, 8).map(e => (
                    <ChatBubble key={e.id} entry={e} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col min-h-0 p-3">
              <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-2 flex items-center justify-between">
                {t('citizens.testActionLog')}
                <span className="text-white/20 normal-case">{logs.length}</span>
              </p>
              <div ref={logRef} className="flex-1 overflow-y-auto custom-dropdown-scroll rounded-xl bg-black/40 border border-white/[0.06] p-2">
                {logs.length === 0 ? (
                  <p className="text-xs text-white/25 text-center py-8">{t('citizens.testLogEmpty')}</p>
                ) : (
                  logs.map(e => (
                    e.kind !== 'chat' ? <LogRow key={e.id} entry={e} /> : null
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
