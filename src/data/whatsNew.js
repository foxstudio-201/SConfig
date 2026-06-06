/**
 * What's-new modal — bump `releaseId` and add features when shipping a release.
 * Users see the modal once per `releaseId` (persisted in store).
 */
export const WHATS_NEW_RELEASE_ID = '1.2.0'

export const WHATS_NEW_STORE_KEY = 'whatsNewDismissedRelease'

/** @typedef {'violet'|'emerald'|'amber'|'cyan'|'sky'} WhatsNewTheme */

/** @type {{ toolId: string, theme: WhatsNewTheme, i18nKey: string }[]} */
export const WHATS_NEW_FEATURES = [
  {
    toolId: 'advanced-enchantments',
    theme: 'emerald',
    i18nKey: 'advancedEnchantments',
  },
  {
    toolId: 'excellent-crates',
    theme: 'amber',
    i18nKey: 'excellentCrates',
  },
  {
    toolId: 'skript-builder',
    theme: 'violet',
    i18nKey: 'skript',
  },
  {
    toolId: 'exploit-fixer',
    theme: 'cyan',
    i18nKey: 'exploitFixer',
  },
  {
    toolId: 'totem-guard',
    theme: 'sky',
    i18nKey: 'totemGuard',
  },
]
