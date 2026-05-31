/**
 * SConfig Bedrock Engine — full Geyser server pipeline (no external deps).
 */

import { sanitizeBedrockId } from '../bedrockConverterData'
import { enrichItemsAdder } from './itemsAdderEngine'
import { enrichOraxen } from './oraxenEngine'
import { buildModelToCmdMap, findModelForItem, resolveMergedModel } from './modelResolveEngine'
import { buildBedrockGeometry } from './javaModelToGeometry'
import { buildDisplayAnimations } from './displayAnimationEngine'
import { buildGeyserAttachable, getArmorSlot, isHandheldMaterial } from './attachableEngine'
import {
  buildGeyserMappingsV2, buildGeyserMappingsV1, buildServerMappingBundle, textureDataKey,
} from './geyserMappingEngine'

function norm(p) {
  return String(p || '').replace(/\\/g, '/').toLowerCase()
}

function matchTextureForItem(item, scanTextures) {
  const hints = [
    item.textureHint,
    typeof item.texture === 'string' ? item.texture : null,
    item.textures?.[0],
    item.id,
  ].filter(Boolean)

  for (const h of hints) {
    const key = norm(h).replace(/\.png$/i, '')
    const hit = scanTextures.find(t => norm(t.rel).includes(key) || norm(t.bedrockId) === key.split('/').pop())
    if (hit) return hit
  }
  return null
}

function textureRefToFile(textures, files) {
  const resolveRef = ref => {
    let r = String(ref)
    if (r.startsWith('#')) r = textures[r.slice(1)] || r
    return r.replace(/^minecraft:/, '')
  }
  for (const v of Object.values(textures || {})) {
    const pathKey = resolveRef(v)
    const hit = files.find(f => {
      const r = norm(f.rel)
      return r.endsWith(`${pathKey}.png`) || r.includes(pathKey.replace('item/', '/item/'))
    })
    if (hit) return hit
  }
  return null
}

export async function runSConfigPipeline({ scan, options, readText, readBinary }) {
  const logs = []
  const warnings = [...(scan.warnings || [])]
  const namespace = sanitizeBedrockId(options.namespacePrefix || 'geyser_custom')
  const files = scan.rawFiles || []
  const generateAttachables = options.generateAttachables !== false

  logs.push('[SConfig Engine] Geyser server pipeline v2')

  const modelToCmd = await buildModelToCmdMap(files, readText)
  logs.push(`[CMD] ${modelToCmd.size} entries from Java item overrides`)

  let enrichedItems
  if (scan.detected === 'itemsadder' || options.sourceType === 'itemsadder') {
    const ia = await enrichItemsAdder({ files, readText, namespacePrefix: namespace })
    enrichedItems = ia.items
    if (ia.behaviorHints.length) {
      warnings.push(`${ia.behaviorHints.length} IA block(s) need behavior pack on Java side — equippable/furniture limited on Bedrock via Geyser.`)
    }
    logs.push(`[ItemsAdder] ${enrichedItems.length} items`)
  } else if (scan.detected === 'oraxen' || options.sourceType === 'oraxen') {
    const ox = await enrichOraxen({ files, readText, namespacePrefix: namespace })
    enrichedItems = ox.items
    logs.push(`[Oraxen] ${enrichedItems.length} items`)
  } else {
    enrichedItems = (scan.items || []).map(it => ({
      ...it,
      bedrockKey: sanitizeBedrockId(`${namespace}_${it.namespace || 'item'}_${it.id}`),
      material: it.material || 'PAPER',
      displayName: it.id,
    }))
  }

  const textureExports = []
  const attachables = []
  const geometries = []
  const animations = []
  const mappedForGeyser = []
  const usedKeys = new Set()
  let autoCmd = 30000

  for (const item of enrichedItems.slice(0, options.maxItems || 500)) {
    let bedrockKey = item.bedrockKey || sanitizeBedrockId(`${namespace}_${item.id}`)
    if (usedKeys.has(bedrockKey)) bedrockKey = `${bedrockKey}_${usedKeys.size}`
    usedKeys.add(bedrockKey)

    const bedrockId = textureDataKey(namespace, bedrockKey)
    const geometryId = `${namespace}.${bedrockKey}`

    const modelInfo = findModelForItem(item, files)
    let merged = null
    if (modelInfo) {
      merged = await resolveMergedModel(modelInfo.modelRef, files, readText)
    }

    let texFile = matchTextureForItem(item, scan.textures)
    if (!texFile && merged?.textures) {
      texFile = textureRefToFile(merged.textures, files)
    }

    if (!texFile) continue

    const bin = await readBinary(texFile.path)
    if (!bin?.ok) continue

    const texShort = sanitizeBedrockId(bedrockKey)
    const bedrockPath = `textures/${texShort}.png`

    textureExports.push({
      bedrockKey,
      bedrockId,
      textureDataKey: bedrockId,
      bedrockPath,
      javaPath: texFile.rel,
      binary: bin.data,
      itemId: item.id,
    })

    let customModelData = item.customModelData
    if (customModelData == null && modelInfo) {
      const modelKey = modelInfo.modelRef.replace(/^minecraft:/, '')
      const hit = modelToCmd.get(modelKey)
      if (hit) customModelData = hit.customModelData
    }
    if (customModelData == null) {
      customModelData = autoCmd
      autoCmd += 1
      warnings.push(`CMD auto-assigned ${customModelData} for ${item.id} — sync with Java pack or re-export after /oraxen reload`)
    }

    const armorSlot = getArmorSlot(item.material)
    const handheld = isHandheldMaterial(item.material, item.parentModel)
    const needsAttachable = generateAttachables && merged && (
      merged.elements?.length > 0 || merged.generated || handheld || armorSlot
    )

    if (needsAttachable) {
      const geo = buildBedrockGeometry({
        geometryId,
        elements: merged.elements,
        generated: merged.generated,
        binding: armorSlot === 'head'
          ? "c.item_slot == 'head' ? 'head' : q.item_slot_to_bone_name(c.item_slot)"
          : "c.item_slot == 'head' ? 'head' : q.item_slot_to_bone_name(c.item_slot)",
      })

      const anim = buildDisplayAnimations(merged.display || {}, geometryId)
      const att = buildGeyserAttachable({
        bedrockIdentifier: bedrockId,
        geometryIdentifier: geo.geometryIdentifier,
        texturePath: bedrockPath,
        animationIds: anim.animationIds,
      })

      geometries.push({ path: att.geometryPath, json: geo })
      animations.push({ path: att.animationPath, json: anim })
      attachables.push({
        path: att.attachablePath,
        json: att.attachable,
        bedrockId,
      })
      logs.push(`[3D] ${item.id} → ${bedrockId}`)
    }

    mappedForGeyser.push({
      ...item,
      bedrockKey,
      bedrockId,
      customModelData,
      material: item.material || 'PAPER',
      hasAttachable: !!needsAttachable,
      parentModel: item.parentModel,
    })
  }

  if (textureExports.length === 0) {
    for (const tex of scan.textures.slice(0, options.maxTextures || 300)) {
      if (!options.includeBlocks && tex.category === 'block') continue
      if (!options.includeItems && tex.category === 'item') continue
      const bin = await readBinary(tex.path)
      if (!bin?.ok) continue
      const bedrockKey = sanitizeBedrockId(`${namespace}_${tex.bedrockId}`)
      if (usedKeys.has(bedrockKey)) continue
      usedKeys.add(bedrockKey)
      const bedrockId = textureDataKey(namespace, bedrockKey)
      textureExports.push({
        bedrockKey,
        bedrockId,
        textureDataKey: bedrockId,
        bedrockPath: `textures/${bedrockKey}.png`,
        javaPath: tex.rel,
        binary: bin.data,
        itemId: null,
      })
    }
    logs.push(`[Fallback] ${textureExports.length} textures (no model link)`)
  }

  const geyserV2 = options.generateGeyserMappings !== false
    ? buildGeyserMappingsV2(mappedForGeyser, namespace)
    : { format_version: 2, items: {} }
  const geyserV1 = buildGeyserMappingsV1(mappedForGeyser, namespace)
  const serverBundle = buildServerMappingBundle(geyserV2, options.packMeta?.name)

  logs.push(`[Geyser] ${mappedForGeyser.length} mappings · ${attachables.length} attachables`)
  logs.push('[Server] Copy custom_mappings/sconfig_geyser_items.json → Geyser custom_mappings/')

  return {
    textureExports,
    attachables,
    geometries,
    animations,
    geyserV2,
    geyserV1,
    serverBundle,
    mappedForGeyser,
    enrichedItems,
    logs,
    warnings,
    namespace,
  }
}
