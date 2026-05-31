/**
 * useAiConfig — manages AI API keys and settings in the persistent store.
 *
 * Schema stored under key "aiConfig":
 * {
 *   enabled: boolean,
 *   keys: [{ id, provider, key, label, active }],
 *   tokenLimit: number,        // default 40000
 *   checkpointSize: number,    // lines per checkpoint, default 80
 *   translateEnabled: boolean,
 *   translateTarget: string,   // e.g. "vi", "en", "zh"
 * }
 */
import { useState, useEffect, useCallback } from 'react'
import { storeGet, storeSet } from './useStore'

export const PROVIDERS = [
  { id: 'openai',     label: 'OpenAI',        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { id: 'gemini',     label: 'Google Gemini', models: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro'] },
  { id: 'openrouter', label: 'OpenRouter',    models: ['openai/gpt-4o', 'openai/gpt-4o-mini', 'google/gemini-2.0-flash', 'anthropic/claude-3-haiku', 'meta-llama/llama-3.1-8b-instruct'] },
]

export const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文 (Chinese)' },
  { code: 'ja', label: '日本語 (Japanese)' },
  { code: 'ko', label: '한국어 (Korean)' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
]

const DEFAULT_CONFIG = {
  enabled: false,
  keys: [],
  tokenLimit: 40000,
  checkpointSize: 80,
  translateEnabled: false,
  translateTarget: 'vi',
}

export function useAiConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    storeGet('aiConfig').then(saved => {
      setConfig(saved ? { ...DEFAULT_CONFIG, ...saved } : DEFAULT_CONFIG)
      setLoaded(true)
    })
  }, [])

  const save = useCallback(async (patch) => {
    const next = { ...config, ...patch }
    setConfig(next)
    await storeSet('aiConfig', next)
    return next
  }, [config])

  // ── Key management ──────────────────────────────────────────────────────────
  const addKey = useCallback(async (provider, key, label, model, availableModels) => {
    const newKey = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      provider,
      key,
      label: label || `${provider} key`,
      model: model || 'auto',           // 'auto' or specific model id
      availableModels: availableModels || [], // fetched from API
      active: true,
    }
    return save({ keys: [...config.keys, newKey] })
  }, [config.keys, save])

  const removeKey = useCallback(async (id) => {
    return save({ keys: config.keys.filter(k => k.id !== id) })
  }, [config.keys, save])

  const toggleKey = useCallback(async (id) => {
    return save({ keys: config.keys.map(k => k.id === id ? { ...k, active: !k.active } : k) })
  }, [config.keys, save])

  const updateKey = useCallback(async (id, patch) => {
    return save({ keys: config.keys.map(k => k.id === id ? { ...k, ...patch } : k) })
  }, [config.keys, save])

  // Returns the first active key, cycling through all active keys round-robin
  const getActiveKey = useCallback(() => {
    const active = config.keys.filter(k => k.active)
    if (active.length === 0) return null
    // Simple round-robin via timestamp mod
    return active[Math.floor(Date.now() / 1000) % active.length]
  }, [config.keys])

  return { config, loaded, save, addKey, removeKey, toggleKey, updateKey, getActiveKey }
}
