import { useState } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import AppBackground from './components/AppBackground'
import Toast from './components/Toast'
import SplashScreen from './components/SplashScreen'
import { ToastContext, useToastState } from './hooks/useToast'
import { useBootstrap } from './hooks/useBootstrap'

// Pages
import DashboardPage from './components/pages/DashboardPage'
import ToolsPage from './components/pages/ToolsPage'
import ServersPage from './components/pages/ServersPage'
import FilesPage from './components/pages/FilesPage'
import SettingsPage from './components/pages/SettingsPage'
import DonatePage from './components/pages/DonatePage'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
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

  return (
    <ToastContext.Provider value={toastState}>
      <AppBackground />
      <div className="w-screen h-screen flex flex-col overflow-hidden relative z-10 animate-fade-in" style={{ background: 'transparent' }}>
        <TitleBar />
        <div className="flex flex-1 overflow-hidden mt-9 relative">
          <Sidebar activePage={activePage} onNavigate={setActivePage} />
          <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
            {activePage === 'dashboard' && <DashboardPage onNavigate={setActivePage} />}
            {activePage === 'tools'     && <ToolsPage />}
            {activePage === 'servers'   && <ServersPage />}
            {activePage === 'files'     && <FilesPage />}
            {activePage === 'settings'  && <SettingsPage />}
            {activePage === 'donate'    && <DonatePage />}
          </main>
        </div>
      </div>
      <Toast toast={toastState.toast} visible={toastState.visible} onDismiss={toastState.dismiss} />
    </ToastContext.Provider>
  )
}
