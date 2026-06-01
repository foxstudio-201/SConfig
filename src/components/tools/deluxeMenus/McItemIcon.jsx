import { useState, useEffect, useCallback } from 'react'
import { materialColor } from './minecraftItemTexture'
import { ensureMaterialTextureSrc, getCdnFallbackSrc, isDiskTextureCache } from './minecraftTextureService'

const SIZE_INNER = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
}

function FallbackIcon({ material, size, className, nativeTitle }) {
  const s = SIZE_INNER[size] || SIZE_INNER.md
  const color = materialColor(material)
  return (
    <div
      className={`${s} rounded-sm border border-black/30 ${className || ''}`}
      style={{ background: `linear-gradient(145deg, ${color} 0%, ${color}99 100%)` }}
      {...(nativeTitle && material ? { title: material } : {})}
    />
  )
}

export default function McItemIcon({
  material,
  size = 'md',
  className = '',
  imgClassName = '',
  title,
  glow = false,
  nativeTitle = true,
}) {
  const [src, setSrc] = useState(null)
  const [cdnIndex, setCdnIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  const diskCache = isDiskTextureCache()

  useEffect(() => {
    let cancelled = false
    setSrc(null)
    setCdnIndex(0)
    setFailed(false)

    ensureMaterialTextureSrc(material).then(resolved => {
      if (!cancelled) {
        if (resolved) setSrc(resolved)
        else setFailed(true)
      }
    })

    return () => { cancelled = true }
  }, [material])

  const handleError = useCallback(() => {
    if (diskCache) {
      setFailed(true)
      return
    }
    const next = getCdnFallbackSrc(material, cdnIndex)
    if (next) {
      setCdnIndex(i => i + 1)
      setSrc(next)
    } else {
      setFailed(true)
    }
  }, [material, cdnIndex, diskCache])

  const s = SIZE_INNER[size] || SIZE_INNER.md
  const tip = nativeTitle ? (title ?? material) : undefined

  if (!material || failed || !src) {
    return material ? <FallbackIcon material={material} size={size} className={className} nativeTitle={nativeTitle} /> : null
  }

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      {...(tip ? { title: tip } : {})}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        loading="lazy"
        decoding="async"
        onError={handleError}
        className={`${s} object-contain ${imgClassName}`}
        style={{ imageRendering: 'pixelated' }}
      />
      {glow && (
        <span className="absolute inset-0 rounded border border-yellow-300/60 pointer-events-none shadow-[inset_0_0_6px_rgba(253,224,71,0.4)] animate-pulse" />
      )}
    </span>
  )
}
