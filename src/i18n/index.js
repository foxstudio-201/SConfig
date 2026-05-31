import en from './locales/en'
import vi from './locales/vi'

export const LOCALES = [
  { code: 'en', labelKey: 'settings.langEn' },
  { code: 'vi', labelKey: 'settings.langVi' },
]

export const DEFAULT_LOCALE = 'en'
export const STORE_KEY = 'appLanguage'

const catalogs = { en, vi }

function getNested(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), obj)
}

function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str
  let out = str
  for (const [k, v] of Object.entries(vars)) {
    if (k.endsWith('_plural')) continue
    out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
  }
  return out
}

/**
 * @param {string} locale
 * @param {string} key dot path e.g. dashboard.title
 * @param {Record<string, string|number>} [vars]
 */
export function translate(locale, key, vars) {
  const loc = catalogs[locale] ? locale : DEFAULT_LOCALE
  let text = getNested(catalogs[loc], key)
  if (text == null && loc !== DEFAULT_LOCALE) {
    text = getNested(catalogs[DEFAULT_LOCALE], key)
  }
  if (text == null) return key
  return interpolate(text, vars)
}

export function isValidLocale(code) {
  return code === 'en' || code === 'vi'
}
