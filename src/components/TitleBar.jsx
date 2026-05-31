import AppLogo from './AppLogo'
import { useI18n } from '../context/I18nContext'

const isElectron = typeof window !== 'undefined' && window.sconfigAPI

export default function TitleBar() {
  const { t } = useI18n()
  const minimize = () => isElectron && window.sconfigAPI.minimizeWindow()
  const maximize = () => isElectron && window.sconfigAPI.maximizeWindow()
  const close    = () => isElectron && window.sconfigAPI.closeWindow()

  return (
    <div className="drag-region flex items-center justify-between h-9 px-4 bg-black/40 backdrop-blur-sm border-b border-white/[0.05] absolute top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-2 no-drag">
        <AppLogo size="sm" />
        <span className="text-sm font-black text-white tracking-tight">
          S<span className="text-indigo-400">Config</span>
        </span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="text-[11px] text-white/20 font-medium tracking-widest uppercase">{t('app.titleBar')}</span>
      </div>

      <div className="no-drag flex items-center gap-1">
        <button onClick={minimize}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-white/40 hover:text-white/80"
          title="Minimize">
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1"/></svg>
        </button>
        <button onClick={maximize}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-white/40 hover:text-white/80"
          title="Maximize">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="9" height="9"/>
          </svg>
        </button>
        <button onClick={close}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-red-500/80 transition-colors text-white/40 hover:text-white"
          title="Close">
          <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5">
            <line x1="0" y1="0" x2="10" y2="10"/>
            <line x1="10" y1="0" x2="0" y2="10"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
