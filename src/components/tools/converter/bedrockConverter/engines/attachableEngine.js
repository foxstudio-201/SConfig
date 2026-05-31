/**
 * Geyser-compatible attachables (java2bedrock.sh structure, server resource pack).
 */

import { sanitizeBedrockId } from '../bedrockConverterData'

export function getArmorSlot(material) {
  const m = String(material || '').toUpperCase()
  if (m.includes('HELMET') || m.includes('SKULL') || m.includes('HEAD')) return 'head'
  if (m.includes('CHESTPLATE') || m.includes('ELYTRA')) return 'chest'
  if (m.includes('LEGGINGS')) return 'legs'
  if (m.includes('BOOTS')) return 'feet'
  return null
}

export function isHandheldMaterial(material, parentModel) {
  const m = String(material || '').toUpperCase()
  const p = String(parentModel || '')
  if (p.includes('handheld')) return true
  return /SWORD|AXE|PICKAXE|SHOVEL|HOE|TRIDENT|BOW|CROSSBOW|FISHING|ROD|STICK/.test(m)
}

/**
 * @param {object} p
 * @param {string} p.bedrockIdentifier - namespace:id (must match Geyser mapping)
 * @param {string} p.geometryIdentifier - e.g. geometry.sconfig.item_key
 * @param {string} p.texturePath - textures/foo (no .png)
 * @param {object} p.animationIds - from buildDisplayAnimations
 * @param {boolean} p.useAtlas - use combined atlas texture path
 */
export function buildGeyserAttachable({
  bedrockIdentifier,
  geometryIdentifier,
  texturePath,
  animationIds,
  material = 'entity_alphatest',
}) {
  const tex = texturePath.replace(/\.png$/i, '').replace(/^textures\//, '')

  const attachable = {
    format_version: '1.10.0',
    'minecraft:attachable': {
      description: {
        identifier: bedrockIdentifier,
        materials: {
          default: material,
          enchanted: 'entity_alphatest_glint',
        },
        textures: {
          default: `textures/${tex}`,
          enchanted: 'textures/misc/enchanted_item_glint',
        },
        geometry: {
          default: geometryIdentifier,
        },
        scripts: {
          pre_animation: [
            'v.main_hand = c.item_slot == \'main_hand\';',
            'v.off_hand = c.item_slot == \'off_hand\';',
            'v.head = c.item_slot == \'head\';',
          ],
          animate: [
            { thirdperson_main_hand: 'v.main_hand && !c.is_first_person' },
            { thirdperson_off_hand: 'v.off_hand && !c.is_first_person' },
            { thirdperson_head: 'v.head && !c.is_first_person' },
            { firstperson_main_hand: 'v.main_hand && c.is_first_person' },
            { firstperson_off_hand: 'v.off_hand && c.is_first_person' },
            { firstperson_head: 'c.is_first_person && v.head' },
          ],
        },
        animations: animationIds || {
          thirdperson_main_hand: `${geometryIdentifier.replace('geometry.', 'animation.')}.thirdperson_main_hand`,
          thirdperson_off_hand: `${geometryIdentifier.replace('geometry.', 'animation.')}.thirdperson_off_hand`,
          thirdperson_head: `${geometryIdentifier.replace('geometry.', 'animation.')}.head`,
          firstperson_main_hand: `${geometryIdentifier.replace('geometry.', 'animation.')}.firstperson_main_hand`,
          firstperson_off_hand: `${geometryIdentifier.replace('geometry.', 'animation.')}.firstperson_off_hand`,
          firstperson_head: 'animation.geyser_custom.disable',
        },
        render_controllers: ['controller.render.item_default'],
      },
    },
  }

  const safe = sanitizeBedrockId(bedrockIdentifier.split(':').pop() || bedrockIdentifier)
  return {
    attachable,
    attachablePath: `attachables/${safe}.attachable.json`,
    geometryPath: `models/blocks/${safe}.geo.json`,
    animationPath: `animations/${safe}.animation.json`,
  }
}
