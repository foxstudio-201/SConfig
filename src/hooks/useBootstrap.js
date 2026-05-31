import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { storeGet } from './useStore'
import { useI18n } from '../context/I18nContext'

const MIN_SPLASH_MS = 1500

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function resolveLabel(data, t) {
  if (data.labelKey) return t(data.labelKey, data.labelVars)
  if (data.label) return data.label
  return t('bootstrap.starting')
}

async function runBrowserBootstrap(onProgress, t) {
  const steps = [
    { p: 15, labelKey: 'bootstrap.init', delay: 180 },
    { p: 30, labelKey: 'bootstrap.loadingConfig', delay: 200, run: async () => { await storeGet('servers', []) } },
    { p: 55, labelKey: 'bootstrap.loadingServers', delay: 220, run: async () => {
      await storeGet('servers', [])
      await storeGet('plugins', [])
      await storeGet('aiConfig')
    }},
    { p: 75, labelKey: 'bootstrap.checkingUpdates', delay: 240 },
    { p: 92, labelKey: 'bootstrap.preparingUi', delay: 180 },
    { p: 100, labelKey: 'bootstrap.ready', delay: 120 },
  ]

  let updateInfo = { status: 'skipped', message: t('bootstrap.browserPreview') }
  for (const step of steps) {
    if (step.run) await step.run()
    if (step.labelKey === 'bootstrap.checkingUpdates') {
      updateInfo = { status: 'skipped', message: t('bootstrap.electronUpdates') }
    }
    onProgress({
      progress: step.p,
      label: t(step.labelKey),
      updateInfo: step.p >= 75 ? updateInfo : undefined,
    })
    await sleep(step.delay)
  }
  return { ok: true, updateInfo }
}

export function useBootstrap() {
  const { t } = useI18n()
  const tRef = useRef(t)
  useLayoutEffect(() => {
    tRef.current = t
  }, [t])

  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const [label, setLabel] = useState('')
  const [version, setVersion] = useState('')
  const [updateInfo, setUpdateInfo] = useState(null)

  useEffect(() => {
    let cancelled = false
    const started = Date.now()

    async function finish(result) {
      const elapsed = Date.now() - started
      if (elapsed < MIN_SPLASH_MS) await sleep(MIN_SPLASH_MS - elapsed)
      if (!cancelled) setReady(true)
      return result
    }

    async function run() {
      const tr = (...args) => tRef.current(...args)
      if (!cancelled) setLabel(tr('bootstrap.starting'))

      if (window.sconfigAPI?.getAppInfo) {
        const info = await window.sconfigAPI.getAppInfo()
        if (!cancelled) setVersion(info.version || '')
      }

      if (window.sconfigAPI?.startBootstrap) {
        const unsub = window.sconfigAPI.onBootstrapProgress(data => {
          if (cancelled) return
          setProgress(data.progress ?? 0)
          setLabel(resolveLabel(data, tr))
          if (data.updateInfo) setUpdateInfo(data.updateInfo)
        })
        try {
          const result = await window.sconfigAPI.startBootstrap()
          if (result?.updateInfo && !cancelled) setUpdateInfo(result.updateInfo)
          await finish(result)
        } finally {
          unsub()
        }
        return
      }

      await runBrowserBootstrap(data => {
        if (cancelled) return
        setProgress(data.progress ?? 0)
        setLabel(data.label ?? '')
        if (data.updateInfo) setUpdateInfo(data.updateInfo)
      }, tr)
      if (!cancelled) setVersion('1.0.0')
      await finish()
    }

    run().catch(() => {
      if (!cancelled) {
        setLabel(tRef.current('bootstrap.limitedMode'))
        setProgress(100)
        setTimeout(() => setReady(true), 400)
      }
    })

    return () => { cancelled = true }
  }, [])

  return { ready, progress, label, version, updateInfo }
}
