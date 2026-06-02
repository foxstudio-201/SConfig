import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  XMarkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { useI18n } from '../context/I18nContext'
import {
  WHATS_NEW_RELEASE_ID,
  WHATS_NEW_FEATURES,
} from '../data/whatsNew'

const THEME = {
  violet: {
    card: 'border-violet-500/25 bg-gradient-to-br from-violet-500/12 to-transparent',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-300',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    bullet: 'text-violet-400/80',
    btn: 'bg-violet-500/15 border-violet-500/30 text-violet-200 hover:bg-violet-500/25',
  },
  emerald: {
    card: 'border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 to-transparent',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-300',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    bullet: 'text-emerald-400/80',
    btn: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/25',
  },
}

function FeatureCard({ feature, onTry }) {
  const { t } = useI18n()
  const theme = THEME[feature.theme] || THEME.violet
  const base = `whatsNew.features.${feature.i18nKey}`
  const bullets = [1, 2, 3, 4].map(i => t(`${base}.b${i}`)).filter(s => s && !s.startsWith('whatsNew.'))

  return (
    <article className={`rounded-xl border p-4 ${theme.card}`}>
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.iconBg}`}>
          <ShieldCheckIcon className={`w-6 h-6 ${theme.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white/95">{t(`${base}.title`)}</h3>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wide ${theme.badge}`}>
              {t('whatsNew.addedIn', { version: WHATS_NEW_RELEASE_ID })}
            </span>
          </div>
          <p className="text-[11px] text-white/45 font-medium mb-2">{t(`${base}.plugin`)}</p>
          <p className="text-xs text-white/60 leading-relaxed">{t(`${base}.desc`)}</p>
        </div>
      </div>
      {bullets.length > 0 && (
        <ul className="mt-3 space-y-1.5 pl-1">
          {bullets.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-white/55">
              <CheckIcon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${theme.bullet}`} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => onTry(feature.toolId)}
        className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-semibold transition-all ${theme.btn}`}
      >
        {t('whatsNew.tryTool')}
        <ArrowRightIcon className="w-3.5 h-3.5" />
      </button>
    </article>
  )
}

export default function WhatsNewModal({ onClose, onOpenTool }) {
  const { t } = useI18n()

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prev
    }
  }, [handleKey])

  const tryTool = (toolId) => onOpenTool?.(toolId)

  return createPortal(
    <div
      className="fixed inset-0 z-[20000] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whats-new-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        aria-label={t('whatsNew.dismiss')}
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[min(90vh,640px)] flex flex-col rounded-2xl border border-white/[0.10] bg-[#12121c]/98 shadow-[0_24px_80px_rgba(0,0,0,0.65)] overflow-hidden">
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-white/[0.06] bg-gradient-to-r from-indigo-500/10 via-violet-500/8 to-emerald-500/8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <p className="text-[10px] font-semibold text-indigo-300/90 uppercase tracking-widest mb-0.5">
                {t('whatsNew.badge', { version: WHATS_NEW_RELEASE_ID })}
              </p>
              <h2 id="whats-new-title" className="text-lg font-bold text-white leading-tight">
                {t('whatsNew.title')}
              </h2>
              <p className="text-xs text-white/45 mt-1">{t('whatsNew.subtitle', { count: WHATS_NEW_FEATURES.length })}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 flex flex-col gap-3 custom-dropdown-scroll">
          {WHATS_NEW_FEATURES.map(feature => (
            <FeatureCard key={feature.toolId} feature={feature} onTry={tryTool} />
          ))}
        </div>

        <div className="flex-shrink-0 px-5 py-4 border-t border-white/[0.06] flex gap-2">
          <button
            type="button"
            onClick={() => onOpenTool?.()}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.10] bg-white/[0.04] text-sm font-semibold text-white/75 hover:bg-white/[0.07] transition-colors"
          >
            {t('whatsNew.browseTools')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-500/35 bg-indigo-500/20 text-sm font-semibold text-indigo-100 hover:bg-indigo-500/30 transition-colors"
          >
            {t('whatsNew.dismiss')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
