import { useState, useCallback, useEffect } from 'react'
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowDownIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import AppLogo from './components/AppLogo'
import UpdateTitleBar from './components/UpdateTitleBar'
import { useI18n } from './context/I18nContext'

function statusTheme(status) {
  switch (status) {
    case 'available':
      return {
        icon: CloudArrowDownIcon,
        accent: 'from-amber-500/20 via-orange-500/10 to-transparent',
        border: 'border-amber-500/35',
        glow: 'shadow-amber-500/10',
        iconWrap: 'bg-amber-500/15 border-amber-400/30',
        iconColor: 'text-amber-300',
        dot: 'bg-amber-400',
      }
    case 'current':
      return {
        icon: CheckCircleIcon,
        accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
        border: 'border-emerald-500/35',
        glow: 'shadow-emerald-500/10',
        iconWrap: 'bg-emerald-500/15 border-emerald-400/30',
        iconColor: 'text-emerald-300',
        dot: 'bg-emerald-400',
      }
    case 'offline':
      return {
        icon: ExclamationTriangleIcon,
        accent: 'from-orange-500/15 via-red-500/10 to-transparent',
        border: 'border-orange-500/30',
        glow: 'shadow-orange-500/10',
        iconWrap: 'bg-orange-500/15 border-orange-400/25',
        iconColor: 'text-orange-300',
        dot: 'bg-orange-400',
      }
    default:
      return {
        icon: ExclamationTriangleIcon,
        accent: 'from-white/5 to-transparent',
        border: 'border-white/10',
        glow: 'shadow-black/20',
        iconWrap: 'bg-white/[0.06] border-white/10',
        iconColor: 'text-white/45',
        dot: 'bg-white/30',
      }
  }
}

function VersionPill({ label, value, highlight }) {
  return (
    <div
      className={`flex-1 rounded-xl border px-3 py-2.5 text-center min-w-0 ${
        highlight
          ? 'border-indigo-500/35 bg-indigo-500/10'
          : 'border-white/[0.08] bg-white/[0.03]'
      }`}
    >
      <p className="text-[9px] uppercase tracking-widest text-white/30 font-semibold mb-1 truncate">
        {label}
      </p>
      <p className={`text-sm font-bold font-mono tabular-nums truncate ${
        highlight ? 'text-indigo-200' : 'text-white/75'
      }`}>
        {value ? `v${value}` : '—'}
      </p>
    </div>
  )
}

export default function UpdateWindowApp() {
  const { t } = useI18n()
  const [appInfo, setAppInfo] = useState(null)
  const [updateInfo, setUpdateInfo] = useState(null)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState(null)

  const runCheck = useCallback(async () => {
    const api = window.sconfigAPI
    if (!api?.checkAppUpdates) {
      setError(t('updateWindow.electronOnly'))
      setChecking(false)
      return
    }
    setChecking(true)
    setError(null)
    try {
      const [info, update] = await Promise.all([
        api.getAppInfo?.() ?? Promise.resolve(null),
        api.checkAppUpdates(),
      ])
      setAppInfo(info)
      setUpdateInfo(update)
    } catch (e) {
      setError(e.message || t('updateWindow.checkFailed'))
    } finally {
      setChecking(false)
    }
  }, [t])

  useEffect(() => {
    runCheck()
  }, [runCheck])

  const status = updateInfo?.status
  const theme = statusTheme(status)
  const StatusIcon = theme.icon
  const hasUpdate = status === 'available'
  const latest = updateInfo?.latestVersion || updateInfo?.currentVersion
  const current = appInfo?.version || updateInfo?.currentVersion

  const statusTitle = checking
    ? t('updateWindow.checking')
    : hasUpdate
      ? t('updateWindow.statusAvailable')
      : status === 'current'
        ? t('updateWindow.statusCurrent')
        : status === 'offline'
          ? t('updateWindow.statusOffline')
          : t('updateWindow.statusSkipped')

  const statusDetail = checking
    ? t('updateWindow.checkingHint')
    : error
      ? error
      : hasUpdate && updateInfo?.latestVersion
        ? t('updateWindow.availableDetail', { version: updateInfo.latestVersion })
        : updateInfo?.message

  const openRelease = () => {
    const url = updateInfo?.url
    if (url) window.sconfigAPI?.openExternal?.(url)
  }

  const closeWin = () => window.sconfigAPI?.closeUpdateWindow?.()

  return (
    <div className="min-h-screen relative overflow-hidden text-white flex flex-col bg-[#080810] rounded-xl border border-white/[0.08] shadow-2xl shadow-black/60">
      <UpdateTitleBar />

      <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden" aria-hidden>
        <div
          className="absolute rounded-full"
          style={{
            width: '120%',
            height: '70%',
            top: '-25%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '90%',
            height: '50%',
            bottom: '-15%',
            right: '-15%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <header className="relative z-10 px-6 pt-5 mt-9 pb-2 flex flex-col items-center text-center">
        <div className="mb-3">
          <AppLogo size="lg" framed />
        </div>
        <h1 className="text-lg font-bold tracking-tight">
          S<span className="text-indigo-400">Config</span>
        </h1>
        <p className="text-[11px] text-white/35 mt-1 max-w-[280px]">{t('updateWindow.subtitle')}</p>
      </header>

      <main className="relative z-10 flex-1 px-6 pb-6 flex flex-col gap-4">
        <div className="flex gap-2">
          <VersionPill label={t('updateWindow.versionLabel')} value={current} />
          <div className="flex items-center text-white/15 px-0.5" aria-hidden>→</div>
          <VersionPill
            label={t('updateWindow.latestLabel')}
            value={checking ? null : latest}
            highlight={hasUpdate}
          />
        </div>

        <div
          className={`relative rounded-2xl border bg-gradient-to-br p-4 shadow-lg ${theme.accent} ${theme.border} ${theme.glow}`}
        >
          {!checking && (
            <span
              className={`absolute top-3.5 right-3.5 w-2 h-2 rounded-full ${theme.dot} ${
                hasUpdate ? 'animate-pulse' : ''
              }`}
              aria-hidden
            />
          )}

          <div className="flex gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${theme.iconWrap}`}
            >
              {checking
                ? <ArrowPathIcon className="w-6 h-6 text-indigo-300 animate-spin" />
                : <StatusIcon className={`w-6 h-6 ${theme.iconColor}`} />}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-white/90 leading-snug">{statusTitle}</p>
              <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">{statusDetail}</p>
            </div>
          </div>

          {hasUpdate && !checking && (
            <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center gap-2 text-[10px] text-amber-200/80">
              <SparklesIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('updateWindow.updateReady')}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          {hasUpdate && updateInfo?.url && !checking && (
            <button
              type="button"
              onClick={openRelease}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-400/40 bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-[0.99] transition-all"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              {t('updateWindow.openRelease')}
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={runCheck}
              disabled={checking}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/[0.1] bg-white/[0.04] text-[11px] font-semibold text-white/65 hover:text-white hover:bg-white/[0.08] disabled:opacity-40 transition-all"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              {t('updateWindow.checkAgain')}
            </button>
            <button
              type="button"
              onClick={closeWin}
              className="px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.02] text-[11px] font-semibold text-white/45 hover:text-white/75 transition-all"
            >
              {t('updateWindow.close')}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
