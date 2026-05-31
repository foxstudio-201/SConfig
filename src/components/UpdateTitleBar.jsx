import AppLogo from './AppLogo'
import { useI18n } from '../context/I18nContext'

const isElectron = typeof window !== 'undefined' && window.sconfigAPI

export default function UpdateTitleBar() {
  const { t } = useI18n()

  const minimize = () => isElectron && window.sconfigAPI.minimizeUpdateWindow?.()
  const close = () => isElectron && window.sconfigAPI.closeUpdateWindow?.()

  return (
    <div className="drag-region flex items-center justify-between h-9 px-3 bg-black/50 backdrop-blur-md border-b border-white/[0.06] absolute top-0 left-0 right-0 z-50 rounded-t-xl overflow-hidden">
      <div className="flex items-center gap-2 no-drag min-w-0">
        <AppLogo size="sm" />
        <span className="text-xs font-bold text-white/90 truncate">
          S<span className="text-indigo-400">Config</span>
          <span className="text-white/30 font-medium mx-1.5">·</span>
          <span className="text-white/50 font-semibold">{t('updateWindow.title')}</span>
        </span>
      </div>

      <div className="no-drag flex items-center gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={minimize}
          className="w-8 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors text-white/40 hover:text-white/80"
          title={t('updateWindow.minimize')}
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor" aria-hidden>
            <rect width="10" height="1" />
          </svg>
        </button>
        <button
          type="button"
          onClick={close}
          className="w-8 h-7 flex items-center justify-center rounded-md hover:bg-red-500/80 transition-colors text-white/40 hover:text-white"
          title={t('updateWindow.close')}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <line x1="0" y1="0" x2="10" y2="10" />
            <line x1="10" y1="0" x2="0" y2="10" />
          </svg>
        </button>
      </div>
    </div>
  )
}
