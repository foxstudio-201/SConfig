import { useState, useEffect, useCallback } from 'react'
import { storeGet, storeSet } from './useStore'
import {
  WHATS_NEW_RELEASE_ID,
  WHATS_NEW_STORE_KEY,
  WHATS_NEW_FEATURES,
} from '../data/whatsNew'

const DELAY_MS = 5000

/**
 * Shows what's-new modal once per release after delay (dashboard only).
 */
export function useWhatsNewModal(enabled = true) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled || WHATS_NEW_FEATURES.length === 0) return undefined

    let cancelled = false
    let timer

    ;(async () => {
      const seen = await storeGet(WHATS_NEW_STORE_KEY)
      if (cancelled || seen === WHATS_NEW_RELEASE_ID) return

      timer = setTimeout(() => {
        if (!cancelled) setVisible(true)
      }, DELAY_MS)
    })()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [enabled])

  const dismiss = useCallback(async () => {
    await storeSet(WHATS_NEW_STORE_KEY, WHATS_NEW_RELEASE_ID)
    setVisible(false)
  }, [])

  return { visible, dismiss }
}
