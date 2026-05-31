import AppLogo from './AppLogo'
import { useI18n } from '../context/I18nContext'

export default function SplashScreen({ progress, label, version, updateInfo }) {
  const { t } = useI18n()

  const updateBadge = updateInfo?.status === 'available'
    ? t('splash.updateAvailable', { version: updateInfo.latestVersion })
    : updateInfo?.status === 'current'
      ? t('splash.upToDate')
      : null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#080810]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl splash-orb-1" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl splash-orb-2" />
      </div>

      <div className="relative flex flex-col items-center gap-6 px-8 w-full max-w-md splash-content-in">
        <div className="splash-logo-pop">
          <AppLogo size="lg" />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-white tracking-tight">
            S<span className="text-indigo-400">Config</span>
          </h1>
          <p className="text-sm text-white/35 mt-1">{t('app.tagline')}</p>
          <p className="text-[11px] text-indigo-400/50 mt-0.5 font-medium tracking-wide">{t('app.studio')}</p>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/45 truncate pr-3">{label}</span>
            <span className="text-indigo-300/80 font-mono tabular-nums flex-shrink-0">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] border border-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 splash-progress-glow transition-[width] duration-300 ease-out"
              style={{ width: `${Math.max(4, progress)}%` }}
            />
          </div>
          {updateBadge && (
            <p className={`text-[10px] text-center font-semibold ${
              updateInfo?.status === 'available' ? 'text-amber-300/90' : 'text-emerald-300/70'
            }`}>
              {updateBadge}
            </p>
          )}
        </div>

        {version && (
          <p className="text-[10px] text-white/20 font-mono tracking-wider">v{version}</p>
        )}
      </div>
    </div>
  )
}
