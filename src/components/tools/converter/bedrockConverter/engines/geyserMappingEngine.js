/**
 * Geyser custom item mappings v2 — server custom_mappings/ (GeyserMC wiki).
 */

import { sanitizeBedrockId } from '../bedrockConverterData'
import { getArmorSlot, isHandheldMaterial } from './attachableEngine'

function javaMaterialToId(material) {
  const m = String(material || 'PAPER').toLowerCase()
  return m.startsWith('minecraft:') ? m : `minecraft:${m}`
}

function bedrockIdentifier(namespace, bedrockKey) {
  const ns = sanitizeBedrockId(namespace)
  const key = sanitizeBedrockId(bedrockKey)
  return `${ns}:${key}`
}

/** item_texture.json key — Geyser wiki: match identifier / icon */
export function textureDataKey(namespace, bedrockKey) {
  return bedrockIdentifier(namespace, bedrockKey)
}

const ARMOR_PROTECTION = { head: 1, chest: 6, legs: 5, feet: 2 }

/**
 * @param {object} it — mapped item with bedrockKey, customModelData, material, hasAttachable
 */
export function buildGeyserLegacyEntry(it, namespace) {
  const id = bedrockIdentifier(namespace, it.bedrockKey)
  const armorSlot = getArmorSlot(it.material)
  const handheld = isHandheldMaterial(it.material, it.parentModel) || it.hasAttachable

  const bedrock_options = {
    icon: id,
    allow_offhand: true,
  }

  if (handheld || it.hasAttachable) {
    bedrock_options.display_handheld = true
  }

  if (armorSlot) {
    bedrock_options.protection_value = ARMOR_PROTECTION[armorSlot] || 1
    bedrock_options.creative_category = 'equipment'
    bedrock_options.creative_group = `itemGroup.name.${armorSlot === 'head' ? 'helmet' : armorSlot === 'chest' ? 'chestplate' : armorSlot === 'legs' ? 'leggings' : 'boots'}`
  } else if (handheld) {
    bedrock_options.creative_category = 'equipment'
  } else {
    bedrock_options.creative_category = 'items'
  }

  const entry = {
    type: 'legacy',
    custom_model_data: Number(it.customModelData),
    bedrock_identifier: id,
    display_name: it.displayName || it.id,
    bedrock_options,
  }

  if (armorSlot) {
    entry.components = {
      'minecraft:equippable': { slot: armorSlot },
      'minecraft:max_stack_size': 1,
    }
  }

  if (it.hasAttachable) {
    entry.bedrock_options.tags = [`${sanitizeBedrockId(namespace)}:attachable`]
  }

  return { javaItem: javaMaterialToId(it.material), entry, bedrockIdentifier: id }
}

export function buildGeyserMappingsV2(mappedItems, namespace = 'sconfig') {
  const items = {}

  for (const it of mappedItems) {
    if (it.customModelData == null || !it.bedrockKey || !it.material) continue
    const { javaItem, entry } = buildGeyserLegacyEntry(it, namespace)
    if (!items[javaItem]) items[javaItem] = []
    items[javaItem].push(entry)
  }

  return { format_version: 2, items }
}

/** Flat file for Geyser custom_mappings folder */
export function buildServerMappingBundle(geyserV2, packName) {
  return {
    readme: [
      '# SConfig → Geyser server install',
      '1. Copy sconfig_geyser_items.json → plugins/Geyser-Spigot/custom_mappings/',
      '2. Copy resource pack .mcpack → plugins/Geyser-Spigot/packs/',
      '3. config.yml: enable-custom-content: true',
      '4. Restart Geyser + server',
      '',
      `Pack: ${packName}`,
    ].join('\n'),
    mappingFileName: 'sconfig_geyser_items.json',
    mappings: geyserV2,
  }
}

export function buildGeyserMappingsV1(mappedItems, namespace = 'sconfig') {
  const items = {}
  for (const it of mappedItems) {
    if (!it.bedrockKey || it.customModelData == null) continue
    const javaItem = javaMaterialToId(it.material)
    const id = textureDataKey(namespace, it.bedrockKey)
    if (!items[javaItem]) items[javaItem] = []
    items[javaItem].push({
      name: id.replace(':', '_'),
      custom_model_data: Number(it.customModelData),
      display_name: it.displayName || it.id,
      icon: id,
      allow_offhand: true,
    })
  }
  return { format_version: 1, items }
}
