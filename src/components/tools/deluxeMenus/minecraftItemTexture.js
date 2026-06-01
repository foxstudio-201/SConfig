/** Resolve Spigot Material names → Minecraft texture PNG URLs */

export const MC_TEXTURE_VERSION = '1.21'

const CDN = `https://assets.mcasset.cloud/${MC_TEXTURE_VERSION}/assets/minecraft/textures`
const CDN_JS = `https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets@${MC_TEXTURE_VERSION}/assets/minecraft/textures`

const FALLBACK_COLORS = {
  DIAMOND: '#5decf5', EMERALD: '#17dd62', GOLD_INGOT: '#fcd53a', IRON_INGOT: '#d8d8d8',
  BARRIER: '#c41e1e', COMPASS: '#c4c4c4', CHEST: '#8b6914', STONE: '#8a8a8a',
  PLAYER_HEAD: '#c6a87c', PAPER: '#f5f5dc', REDSTONE: '#aa0a0a', BEDROCK: '#333',
}

/** Material → alternate texture paths (without .png) */
const TEXTURE_ALIASES = {
  GRASS_BLOCK: ['block/grass_block_top', 'block/grass_block'],
  MYCELIUM: ['block/mycelium_top', 'block/mycelium'],
  PODZOL: ['block/podzol_top', 'block/podzol'],
  DIRT_PATH: ['block/dirt_path'],
  TNT: ['block/tnt_side', 'item/tnt'],
  MELON: ['block/melon_side', 'item/melon_slice'],
  PUMPKIN: ['block/pumpkin_side', 'item/pumpkin'],
  CARVED_PUMPKIN: ['block/carved_pumpkin'],
  JACK_O_LANTERN: ['block/jack_o_lantern'],
  HAY_BLOCK: ['block/hay_block_side'],
  NETHERRACK: ['block/netherrack'],
  SOUL_SAND: ['block/soul_sand'],
  SOUL_SOIL: ['block/soul_soil'],
  GLOWSTONE: ['block/glowstone'],
  SEA_LANTERN: ['block/sea_lantern'],
  OBSIDIAN: ['block/obsidian'],
  CRYING_OBSIDIAN: ['block/crying_obsidian'],
  DRAGON_EGG: ['block/dragon_egg'],
  BARRIER: ['item/barrier'],
  FILLED_MAP: ['item/filled_map', 'item/map'],
  MAP: ['item/map'],
  ENCHANTED_BOOK: ['item/enchanted_book'],
  POTION: ['item/potion'],
  SPLASH_POTION: ['item/splash_potion'],
  LINGERING_POTION: ['item/lingering_potion'],
  TIPPED_ARROW: ['item/tipped_arrow_head', 'item/tipped_arrow_base'],
  PLAYER_HEAD: ['item/player_head'],
  DRAGON_HEAD: ['item/dragon_head'],
  ZOMBIE_HEAD: ['item/zombie_head'],
  SKELETON_SKULL: ['item/skeleton_skull'],
  WITHER_SKELETON_SKULL: ['item/wither_skeleton_skull'],
  CREEPER_HEAD: ['item/creeper_head'],
  PIGLIN_HEAD: ['item/piglin_head'],
  CLOCK: ['item/clock_00', 'item/clock'],
  COMPASS: ['item/compass_00', 'item/compass'],
  RECOVERY_COMPASS: ['item/recovery_compass_00'],
  CROSSBOW: ['item/crossbow_standby'],
  BOW: ['item/bow'],
  TRIDENT: ['item/trident'],
  ELYTRA: ['item/elytra'],
  TOTEM_OF_UNDYING: ['item/totem_of_undying'],
  NETHER_STAR: ['item/nether_star'],
  SUNFLOWER: ['block/sunflower_front'],
  CACTUS: ['block/cactus_side'],
  MOSS_BLOCK: ['block/moss_block'],
  SHORT_GRASS: ['block/short_grass', 'block/grass'],
}

const urlCache = new Map()

export function materialColor(mat) {
  if (!mat) return '#888'
  return FALLBACK_COLORS[mat.toUpperCase()] || '#9a9a9a'
}

function texturePathCandidates(material) {
  const key = String(material || '').trim().toUpperCase()
  if (!key) return []
  const slug = key.toLowerCase()
  const paths = new Set()
  ;(TEXTURE_ALIASES[key] || []).forEach(p => paths.add(p))
  paths.add(`item/${slug}`)
  paths.add(`block/${slug}`)
  return [...paths]
}

function pathToUrls(path) {
  return [`${CDN}/${path}.png`, `${CDN_JS}/${path}.png`]
}

export function getMaterialTextureUrls(material) {
  const key = String(material || '').trim().toUpperCase()
  if (!key) return []
  if (urlCache.has(key)) return urlCache.get(key)
  const urls = []
  const seen = new Set()
  texturePathCandidates(key).forEach(path => {
    pathToUrls(path).forEach(u => {
      if (!seen.has(u)) {
        seen.add(u)
        urls.push(u)
      }
    })
  })
  urlCache.set(key, urls)
  return urls
}

export function normalizeMaterialInput(raw) {
  return String(raw || '').trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
}
