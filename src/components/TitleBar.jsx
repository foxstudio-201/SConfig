import { useState, useRef, useEffect } from 'react'
import AppLogo from './AppLogo'
import { useI18n } from '../context/I18nContext'
import { useUpdate } from '../context/UpdateContext'
import { BellIcon, ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

const isElectron = typeof window !== 'undefined' && window.sconfigAPI

export default function TitleBar() {
  const { t } = useI18n()
  const { updateInfo } = useUpdate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  const hasUpdate = updateInfo?.status === 'available'

  const minimize = () => isElectron && window.sconfigAPI.minimizeWindow()
  const maximize = () => isElectron && window.sconfigAPI.maximizeWindow()
  const close    = () => isElectron && window.sconfigAPI.closeWindow()

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropOpen) return
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropOpen])

  function openUpdateWindow() {
    setDropOpen(false)
    isElectron && window.sconfigAPI.openUpdateWindow?.()
  }

  function openReleasePage() {
    setDropOpen(false)
    const url = updateInfo?.releaseUrl
    if (url) window.sconfigAPI?.openExternal?.(url)
  }

  return (
    <div className="drag-region flex items-center justify-between h-9 px-4 bg-black/40 backdrop-blur-sm border-b border-white/[0.05] absolute top-0 left-0 right-0 z-50">
      {/* Left — logo + name */}
      <div className="flex items-center gap-2 no-drag">
        <AppLogo size="sm" />
        <span className="text-sm font-black text-white tracking-tight">
          S<span className="text-indigo-400">Config</span>
        </span>
      </div>

      {/* Center — app title */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="text-[11px] text-white/20 font-medium tracking-widest uppercase">{t('app.titleBar')}</span>
      </div>

      {/* Right — notification bell + window controls */}
      <div className="no-drag flex items-center gap-0.5">

        {/* Bell notification button */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen(v => !v)}
            className={`w-8 h-7 flex items-center justify-center rounded transition-colors relative
              ${dropOpen ? 'bg-white/10 text-white/80' : 'text-white/30 hover:bg-white/10 hover:text-white/70'}`}
            title={t('titleBar.notifications')}
          >
            <BellIcon className="w-4 h-4" />
            {/* Red dot when update available */}
            {hasUpdate && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 border border-black/60 animate-pulse" />
            )}
          </button>

          {/* Dropdown panel */}
          {dropOpen && (
            <div className="absolute top-[calc(100%+4px)] right-0 w-72 rounded-xl border border-white/[0.1] bg-[#0e0e1a]/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden z-[200]">
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">{t('titleBar.notifications')}</span>
                {hasUpdate && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">1</span>
                )}
              </div>

              {/* Content */}
              {hasUpdate ? (
                <div className="p-3">
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ArrowDownTrayIcon className="w-4 h-4 text-amber-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/90">{t('titleBar.updateAvailable')}</p>
                        <p className="text-[11px] text-white/45 mt-0.5">
                          {t('titleBar.updateDesc', { version: updateInfo.latestVersion })}
                        </p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1 animate-pulse" />
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={openUpdateWindow}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/30 transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        {t('titleBar.updateBtn')}
                      </button>
                      <button
                        onClick={openReleasePage}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/40 hover:text-white/70 transition-colors"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-white/25">{t('titleBar.noNotifications')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/[0.08] mx-1" />

        {/* Window controls */}
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
