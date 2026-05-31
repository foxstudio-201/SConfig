import { useState, useEffect } from 'react'
import { storeGet } from '../../hooks/useStore'
import { useI18n } from '../../context/I18nContext'
import {
  ServerStackIcon,
  PuzzlePieceIcon,
  FolderOpenIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

function StatCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 flex flex-col gap-3 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
        {sub && <span className="text-[11px] text-white/25 font-medium">{sub}</span>}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/40 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, desc, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-indigo-500/20 transition-all group text-left w-full"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90">{label}</p>
        <p className="text-xs text-white/35 mt-0.5">{desc}</p>
      </div>
      <ArrowRightIcon className="w-4 h-4 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
    </button>
  )
}

export default function DashboardPage({ onNavigate }) {
  const { t } = useI18n()
  const [serverPath, setServerPath] = useState(null)
  const [pluginCount, setPluginCount] = useState(0)

  useEffect(() => {
    storeGet('serverPath').then(p => {
      setServerPath(p)
      if (p) {
        storeGet('plugins').then(list => setPluginCount(Array.isArray(list) ? list.length : 0))
      }
    })
  }, [])

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="text-sm text-white/40 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {!serverPath ? (
        <div className="mb-6 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">{t('dashboard.noServerTitle')}</p>
            <p className="text-xs text-amber-400/60 mt-0.5">{t('dashboard.noServerDesc')}</p>
          </div>
          <button
            onClick={() => onNavigate('servers')}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25"
          >
            {t('dashboard.setup')}
          </button>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
          <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-300">{t('dashboard.serverConnected')}</p>
            <p className="text-xs text-emerald-400/50 mt-0.5 font-mono truncate">{serverPath}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <StatCard
          icon={ServerStackIcon}
          label={t('dashboard.statActiveServers')}
          value={serverPath ? '1' : '0'}
          accent="bg-indigo-500/15 text-indigo-400"
          sub={t('dashboard.configured')}
        />
        <StatCard
          icon={PuzzlePieceIcon}
          label={t('dashboard.statPlugins')}
          value={pluginCount}
          accent="bg-violet-500/15 text-violet-400"
          sub={t('dashboard.total')}
        />
        <StatCard
          icon={FolderOpenIcon}
          label={t('dashboard.statConfigFiles')}
          value="—"
          accent="bg-blue-500/15 text-blue-400"
          sub={t('dashboard.scanned')}
        />
      </div>

      <div className="mb-2">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">{t('dashboard.quickActions')}</h2>
        <div className="flex flex-col gap-2">
          <QuickAction
            icon={ServerStackIcon}
            label={t('dashboard.actionServers')}
            desc={t('dashboard.actionServersDesc')}
            onClick={() => onNavigate('servers')}
            accent="bg-indigo-500/15 text-indigo-400"
          />
          <QuickAction
            icon={PuzzlePieceIcon}
            label={t('dashboard.actionTools')}
            desc={t('dashboard.actionToolsDesc')}
            onClick={() => onNavigate('tools')}
            accent="bg-violet-500/15 text-violet-400"
          />
          <QuickAction
            icon={FolderOpenIcon}
            label={t('dashboard.actionFiles')}
            desc={t('dashboard.actionFilesDesc')}
            onClick={() => onNavigate('files')}
            accent="bg-blue-500/15 text-blue-400"
          />
        </div>
      </div>
    </div>
  )
}
