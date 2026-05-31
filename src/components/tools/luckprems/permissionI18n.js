/** @param {string} node */
export function permNodeKey(node) {
  if (node === '*') return 'wildcard'
  return node.replace(/\./g, '_').replace(/\*/g, 'star')
}

export const CATEGORY_I18N = {
  luckperms: 'catLuckperms',
  essentials: 'catEssentials',
  worldedit: 'catWorldedit',
  worldguard: 'catWorldguard',
  minecraft: 'catMinecraft',
  vault: 'catVault',
  chat: 'catChat',
  server: 'catServer',
}

export const PRESET_I18N = {
  'rank-ladder': { label: 'presetRankLadder', desc: 'presetRankLadderDesc' },
  minimal: { label: 'presetMinimal', desc: 'presetMinimalDesc' },
}

export const EXPORT_FORMAT_I18N = {
  commands: 'exportCommands',
  yaml: 'exportYaml',
  api: 'exportApi',
}

const TAB_I18N = {
  overview: 'tabOverview',
  permissions: 'tabPermissions',
  meta: 'tabMeta',
}

export function tPerm(t, node, field, fallback) {
  const key = `permissionBuilder.perm.${permNodeKey(node)}.${field}`
  const v = t(key)
  return v === key ? fallback : v
}

export function tCat(t, categoryId, fallback) {
  const k = CATEGORY_I18N[categoryId]
  return k ? t(`permissionBuilder.${k}`) : fallback
}

export function tTab(t, tabId) {
  return t(`permissionBuilder.${TAB_I18N[tabId]}`)
}
