import { useState } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import AppBackground from './components/AppBackground'
import Toast from './components/Toast'
import SplashScreen from './components/SplashScreen'
import { ToastContext, useToastState } from './hooks/useToast'
import { useBootstrap } from './hooks/useBootstrap'
import { UpdateProvider } from './context/UpdateContext'

// Pages
import DashboardPage from './components/pages/DashboardPage'
import ToolsPage from './components/pages/ToolsPage'
import ServersPage from './components/pages/ServersPage'
import FilesPage from './components/pages/FilesPage'
import SettingsPage from './components/pages/SettingsPage'
import DonatePage from './components/pages/DonatePage'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [pendingToolId, setPendingToolId] = useState(null)
  const toastState = useToastState()
  const { ready, progress, label, version, updateInfo } = useBootstrap()

  if (!ready) {
    return (
      <SplashScreen
        progress={progress}
        label={label}
        version={version}
        updateInfo={updateInfo}
      />
    )
  }

  function handleNavigate(page, toolId = null) {
    setActivePage(page)
    if (toolId) setPendingToolId(toolId)
  }

  return (
    <UpdateProvider initialUpdateInfo={updateInfo}>
      <ToastContext.Provider value={toastState}>
        <AppBackground />
        <div className="w-screen h-screen flex flex-col overflow-hidden relative z-10 animate-fade-in" style={{ background: 'transparent' }}>
          <TitleBar />
          <div className="flex flex-1 overflow-hidden mt-9 relative">
            <Sidebar activePage={activePage} onNavigate={handleNavigate} />
            <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
              {activePage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
              {activePage === 'tools'     && (
                <ToolsPage
                  initialToolId={pendingToolId}
                  onToolOpened={() => setPendingToolId(null)}
                />
              )}
              {activePage === 'servers'   && <ServersPage />}
              {activePage === 'files'     && <FilesPage />}
              {activePage === 'settings'  && <SettingsPage />}
              {activePage === 'donate'    && <DonatePage />}
            </main>
          </div>
        </div>
        <Toast toast={toastState.toast} visible={toastState.visible} onDismiss={toastState.dismiss} />
      </ToastContext.Provider>
    </UpdateProvider>
  )
}
