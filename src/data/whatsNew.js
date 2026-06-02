/**
 * What's-new modal — bump `releaseId` and add features when shipping a release.
 * Users see the modal once per `releaseId` (persisted in store).
 */
export const WHATS_NEW_RELEASE_ID = '1.1.0'

export const WHATS_NEW_STORE_KEY = 'whatsNewDismissedRelease'

/** @typedef {'violet'|'emerald'} WhatsNewTheme */

/** @type {{ toolId: string, theme: WhatsNewTheme, i18nKey: string }[]} */
export const WHATS_NEW_FEATURES = [
  {
    toolId: 'lpx-anticheat',
    theme: 'violet',
    i18nKey: 'lpx',
  },
  {
    toolId: 'smart-spawner',
    theme: 'emerald',
    i18nKey: 'smartSpawner',
  },
]
