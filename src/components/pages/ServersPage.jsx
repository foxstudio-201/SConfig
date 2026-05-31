import { useState, useEffect } from 'react'
import { storeGet, storeSet } from '../../hooks/useStore'
import { useToast } from '../../hooks/useToast'
import { useI18n } from '../../context/I18nContext'
import {
  FolderOpenIcon,
  ServerStackIcon,
  TrashIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

const isElectron = typeof window !== 'undefined' && window.sconfigAPI

export default function ServersPage() {
  const [servers, setServers] = useState([])
  const [activeId, setActiveId] = useState(null)
  const toast = useToast()
  const { t } = useI18n()

  useEffect(() => {
    Promise.all([storeGet('servers', []), storeGet('activeServerId')]).then(([s, id]) => {
      setServers(Array.isArray(s) ? s : [])
      setActiveId(id)
    })
  }, [])

  async function addServer() {
    if (!isElectron) {
      toast.show(t('servers.toastElectronOnly'), 'warning')
      return
    }
    const folder = await window.sconfigAPI.selectFolder()
    if (!folder) return

    // Validate: check for plugins folder or server.jar
    const listing = await window.sconfigAPI.listDir(folder)
    const hasPlugins = listing.ok && listing.entries.some(e => e.name === 'plugins' && e.isDir)
    const hasJar     = listing.ok && listing.entries.some(e => e.name.endsWith('.jar'))

    if (!hasPlugins && !hasJar) {
      toast.show(t('servers.toastInvalidFolder'), 'warning')
    }

    const name = folder.split(/[\\/]/).pop() || 'Server'
    const id   = Date.now().toString()
    const newServer = { id, name, path: folder, addedAt: new Date().toISOString() }
    const updated = [...servers, newServer]
    setServers(updated)
    await storeSet('servers', updated)

    if (!activeId) {
      setActiveId(id)
      await storeSet('activeServerId', id)
      await storeSet('serverPath', folder)
    }
    toast.show(t('servers.toastAdded', { name }), 'success')
  }

  async function setActive(server) {
    setActiveId(server.id)
    await storeSet('activeServerId', server.id)
    await storeSet('serverPath', server.path)
    toast.show(t('servers.toastActive', { name: server.name }), 'success')
  }

  async function removeServer(id) {
    const updated = servers.filter(s => s.id !== id)
    setServers(updated)
    await storeSet('servers', updated)
    if (activeId === id) {
      const next = updated[0] ?? null
      setActiveId(next?.id ?? null)
      await storeSet('activeServerId', next?.id ?? null)
      await storeSet('serverPath', next?.path ?? null)
    }
    toast.show(t('servers.toastRemoved'), 'info')
  }

  async function openFolder(path) {
    if (isElectron) await window.sconfigAPI.openInExplorer(path)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('servers.title')}</h1>
          <p className="text-sm text-white/40 mt-1">{t('servers.subtitle')}</p>
        </div>
        <button
          onClick={addServer}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/25 transition-all active:scale-95 glow-blue"
        >
          <PlusIcon className="w-4 h-4" />
          {t('servers.addServer')}
        </button>
      </div>

      {servers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
            <ServerStackIcon className="w-8 h-8 text-indigo-400/50" />
          </div>
          <p className="text-white/30 text-sm">{t('servers.empty')}</p>
          <button
            onClick={addServer}
            className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
          >
            {t('servers.emptyHint')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {servers.map(server => {
            const isActive = server.id === activeId
            return (
              <div
                key={server.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-indigo-500/10 border-indigo-500/25'
                    : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/30'
                }`}>
                  <ServerStackIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{server.name}</p>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {t('servers.active')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/30 font-mono mt-0.5 truncate">{server.path}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isActive && (
                    <button
                      onClick={() => setActive(server)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-all"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      {t('servers.setActive')}
                    </button>
                  )}
                  <button
                    onClick={() => openFolder(server.path)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                    title={t('servers.openExplorer')}
                  >
                    <FolderOpenIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeServer(server.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title={t('servers.remove')}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
