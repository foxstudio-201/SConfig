import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UpdateWindowApp from './UpdateWindowApp.jsx'
import { I18nProvider } from './context/I18nContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <UpdateWindowApp />
    </I18nProvider>
  </StrictMode>,
)
