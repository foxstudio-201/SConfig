import { PlayIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../../context/I18nContext'
import { McText } from '../deluxeMenus/McMenuGui'
import McItemIcon from '../deluxeMenus/McItemIcon'
import { EQUIPMENT_SLOTS, stripNpcName } from './citizensData'
import NpcSkinView from './NpcSkinView'

export default function NpcPreview({ npc, onOpenTest }) {
  const { t } = useI18n()
  if (!npc) return null

  const equipCount = Object.values(npc.equipment || {}).filter(Boolean).length

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0a0a14]/80 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-lime-300/90 uppercase tracking-wide">{t('citizens.previewTitle')}</p>
          <p className="text-[10px] text-white/30 mt-0.5">{t('citizens.previewHint')}</p>
        </div>
        <button
          type="button"
          onClick={onOpenTest}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-500/15 border border-lime-500/30 text-lime-200 text-[10px] font-bold hover:bg-lime-500/25 transition-all"
        >
          <PlayIcon className="w-3.5 h-3.5" />
          {t('citizens.openTestMode')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-dropdown-scroll p-4 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2">
          <McText text={npc.name} className="text-sm font-bold text-center" />
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 font-mono">
            #{npc.citizensId} · {npc.entityType}
          </span>
        </div>

        <NpcSkinView npc={npc} size="md" />

        {equipCount > 0 && (
          <div className="rounded-lg border border-white/[0.08] bg-black/40 p-3">
            <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2">{t('citizens.previewEquipment')}</p>
            <div className="grid grid-cols-3 gap-2">
              {EQUIPMENT_SLOTS.map(slot => {
                const item = npc.equipment?.[slot.key]
                if (!item?.material) return null
                return (
                  <div key={slot.key} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <McItemIcon material={item.material} size="md" />
                    <span className="text-[8px] text-white/30 uppercase">{t(`citizens.${slot.labelKey}`)}</span>
                    <span className="text-[9px] text-white/25 font-mono truncate max-w-full">{item.material}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {npc.textLines?.filter(Boolean).length > 0 && (
          <div className="rounded-lg border border-white/[0.08] bg-black/40 p-3">
            <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2">{t('citizens.previewDialogue')}</p>
            {npc.textLines.filter(Boolean).slice(0, 3).map((line, i) => (
              <McText key={i} text={line.replace(/<npc>/gi, stripNpcName(npc.name))} className="text-[11px] block text-white/65 mb-1" />
            ))}
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-[10px] text-white/30">
          <span className="font-mono">{npc.location?.world || 'world'}</span>
          <span>{npc.commands?.filter(c => c.command?.trim()).length || 0} cmd</span>
          <span>{equipCount} item</span>
        </div>
      </div>
    </div>
  )
}
