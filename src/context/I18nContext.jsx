import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { storeGet, storeSet } from '../hooks/useStore'
import { translate, DEFAULT_LOCALE, STORE_KEY, isValidLocale } from '../i18n'

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    storeGet(STORE_KEY, DEFAULT_LOCALE).then(saved => {
      const next = isValidLocale(saved) ? saved : DEFAULT_LOCALE
      setLocale(next)
      setLoaded(true)
      document.documentElement.lang = next
    })
  }, [])

  const setLanguage = useCallback(async code => {
    const next = isValidLocale(code) ? code : DEFAULT_LOCALE
    setLocale(next)
    document.documentElement.lang = next
    await storeSet(STORE_KEY, next)
  }, [])

  const t = useCallback((key, vars) => translate(locale, key, vars), [locale])

  const value = useMemo(() => ({
    locale,
    loaded,
    setLanguage,
    t,
  }), [locale, loaded, setLanguage, t])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
