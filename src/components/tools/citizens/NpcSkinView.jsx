import { useMemo, useState } from 'react'
import { stripNpcName } from './citizensData'

const SIZE_MAP = {
  sm: { body: 'h-24', head: 'w-10 h-10' },
  md: { body: 'h-36', head: 'w-14 h-14' },
  lg: { body: 'h-48', head: 'w-20 h-20' },
}

function encodeSkinKey(value) {
  return encodeURIComponent(String(value || '').trim())
}

export function getSkinBodyUrl(npc) {
  const skin = npc?.skin
  if (!skin || npc?.entityType !== 'PLAYER') return null
  if (skin.mode === 'player' && skin.skinName?.trim()) {
    return `https://mc-heads.net/body/${encodeSkinKey(skin.skinName)}/128`
  }
  if (skin.mode === 'url' && skin.skinUrl?.trim()) {
    return skin.skinUrl.trim()
  }
  if (skin.mode === 'texture' && skin.skinName?.trim()) {
    return `https://mc-heads.net/body/${encodeSkinKey(skin.skinName)}/128`
  }
  return 'https://mc-heads.net/body/MHF_Steve/128'
}

export function getSkinHeadUrl(npc) {
  const skin = npc?.skin
  if (!skin || npc?.entityType !== 'PLAYER') return null
  if (skin.mode === 'player' && skin.skinName?.trim()) {
    return `https://mc-heads.net/avatar/${encodeSkinKey(skin.skinName)}/64`
  }
  if (skin.mode === 'url' && skin.skinUrl?.trim()) {
    return skin.skinUrl.trim()
  }
  if (skin.skinName?.trim()) {
    return `https://mc-heads.net/avatar/${encodeSkinKey(skin.skinName)}/64`
  }
  return 'https://mc-heads.net/avatar/MHF_Steve/64'
}

export default function NpcSkinView({ npc, size = 'md', showLabel = true, className = '' }) {
  const s = SIZE_MAP[size] || SIZE_MAP.md
  const bodyUrl = useMemo(() => getSkinBodyUrl(npc), [npc])
  const [failed, setFailed] = useState(false)

  if (npc?.entityType !== 'PLAYER') {
    return (
      <div className={`flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#1a1a1a] p-4 ${className}`}>
        <span className="text-3xl opacity-60">🐾</span>
        <p className="text-[10px] text-white/35 mt-2 font-mono">{npc?.entityType || 'MOB'}</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#2a2a2a] to-[#141414] px-4 pt-3 pb-1 overflow-hidden">
        {!failed && bodyUrl ? (
          <img
            src={bodyUrl}
            alt=""
            draggable={false}
            onError={() => setFailed(true)}
            className={`${s.body} w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]`}
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className={`${s.body} w-16 flex items-center justify-center text-white/20 text-xs font-mono`}>Steve</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>
      {showLabel && (
        <p className="text-[10px] text-white/35 font-mono truncate max-w-full text-center">
          {npc.skin?.mode === 'player' && npc.skin.skinName?.trim()
            ? npc.skin.skinName.trim()
            : stripNpcName(npc.name)}
        </p>
      )}
    </div>
  )
}
