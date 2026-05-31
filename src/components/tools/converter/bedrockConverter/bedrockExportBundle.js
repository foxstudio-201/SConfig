/**
 * Full export bundle — mirrors java2bedrock.sh target/ layout.
 *
 * target/
 *   packaged/geyser_resources.mcpack, geyser_behaviors.mcpack, geyser_addon.mcaddon
 *   unpackaged/rp/, unpackaged/bp/
 *   geyser_mappings.json (v1), geyser_mappings_v2.json, config.json
 */

import JSZip from 'jszip'
import { uuidV4, sanitizeBedrockId } from './bedrockConverterData'

const RP_PREFIX = 'unpackaged/rp'
const BP_PREFIX = 'unpackaged/bp'

function buildRpManifest(meta, rpUuid, moduleUuid) {
  return {
    format_version: 2,
    header: {
      description: meta.description || 'SConfig — Geyser 3D items resource pack',
      name: meta.name || 'SConfig Geyser Resources',
      uuid: rpUuid,
      version: meta.version || [1, 0, 0],
      min_engine_version: meta.minEngine || [1, 20, 0],
    },
    modules: [{
      description: 'Geyser custom items resource pack',
      type: 'resources',
      uuid: moduleUuid,
      version: meta.version || [1, 0, 0],
    }],
  }
}

function buildBpManifest(meta, bpUuid, moduleUuid, rpUuid) {
  return {
    format_version: 2,
    header: {
      description: 'SConfig — Geyser 3D items behavior pack (preview / addon)',
      name: `${meta.name || 'SConfig'} Behaviors`,
      uuid: bpUuid,
      version: meta.version || [1, 0, 0],
      min_engine_version: [1, 20, 0],
    },
    modules: [{
      description: 'Geyser custom items behavior data',
      type: 'data',
      uuid: moduleUuid,
      version: meta.version || [1, 0, 0],
    }],
    dependencies: [{ uuid: rpUuid, version: meta.version || [1, 0, 0] }],
  }
}

function buildDisableAnimation() {
  return {
    format_version: '1.8.0',
    animations: {
      'animation.geyser_custom.disable': {
        loop: true,
        override_previous_animation: true,
        bones: { geyser_custom: { scale: 0 } },
      },
    },
  }
}

function buildTerrainTextureJson(namespace) {
  return {
    resource_pack_name: namespace,
    texture_name: 'atlas.terrain',
    texture_data: {},
  }
}

function buildItemTextureJson(textureExports, namespace) {
  const texture_data = {}
  for (const tex of textureExports) {
    const key = tex.textureDataKey || tex.bedrockId
    texture_data[key] = { textures: [tex.bedrockPath.replace(/\.png$/i, '')] }
  }
  return {
    resource_pack_name: namespace,
    texture_name: 'atlas.items',
    texture_data,
  }
}

function buildLangEntries(mappedItems, namespace) {
  const lines = []
  for (const it of mappedItems) {
    const id = it.bedrockId || `${namespace}:${it.bedrockKey}`
    const name = (it.displayName || it.id || 'Custom Item').replace(/[^\x20-\x7E]/g, '')
    lines.push(`item.${id}.name=${name}`)
  }
  return lines.join('\n')
}

/** java2bedrock-style predicate config */
export function buildConfigJson(pipeline) {
  const out = {}
  let i = 0
  for (const it of pipeline.mappedForGeyser) {
    const pathHash = `gmdl_${sanitizeBedrockId(it.bedrockKey)}`
    const geoId = it.hasAttachable ? `geometry.${pipeline.namespace}.${sanitizeBedrockId(it.bedrockKey)}` : null
    out[pathHash] = {
      geyserID: pathHash,
      path_hash: pathHash,
      item: String(it.material || 'PAPER').toUpperCase(),
      javaItem: `minecraft:${String(it.material || 'paper').toLowerCase()}`,
      bedrock_identifier: it.bedrockId,
      nbt: {
        CustomModelData: it.customModelData,
      },
      geometry: geoId ? geoId.replace('geometry.', 'geo_') : null,
      generated: !it.hasAttachable,
      namespace: pipeline.namespace,
      model_name: it.bedrockKey,
      index: i,
    }
    i += 1
  }
  return out
}

/** Geyser mappings v1 — java2bedrock geyser_mappings.json shape */
export function buildGeyserMappingsV1Java2Bedrock(pipeline) {
  const items = {}
  for (const it of pipeline.mappedForGeyser) {
    const javaKey = `minecraft:${String(it.material || 'paper').toLowerCase()}`
    const pathHash = `gmdl_${sanitizeBedrockId(it.bedrockKey)}`
    const entry = {
      name: pathHash,
      allow_offhand: true,
      icon: it.bedrockId,
      custom_model_data: Number(it.customModelData),
    }
    if (!items[javaKey]) items[javaKey] = []
    items[javaKey].push(entry)
  }
  return { format_version: 1, items }
}

function buildInstallTxt(meta) {
  return [
    'SConfig Bedrock Export (java2bedrock-style bundle)',
    '================================================',
    '',
    'GEYSER PROXY SERVER:',
    '1. packaged/geyser_resources.mcpack → plugins/Geyser-Spigot/packs/',
    '2. geyser_mappings_v2.json OR custom_mappings/sconfig_geyser_items.json',
    '   → plugins/Geyser-Spigot/custom_mappings/',
    '3. enable-custom-content: true in Geyser config.yml',
    '4. Restart Geyser',
    '',
    'BEDROCK ADDON (singleplayer / local test):',
    '- Import packaged/geyser_addon.mcaddon',
    '',
    'UNPACKAGED FOLDERS:',
    '- unpackaged/rp — full resource pack source',
    '- unpackaged/bp — behavior pack (item icons for preview)',
    '',
    'FILES:',
    '- config.json — item registry (like java2bedrock)',
    '- geyser_mappings.json — v1 mappings',
    '- geyser_mappings_v2.json — modern Geyser v2',
    '',
    `Pack: ${meta.name || 'export'}`,
  ].join('\r\n')
}

/**
 * Collect all files for RP and BP trees.
 * @returns {{ rpFiles: Array<{path:string, data: *, binary?:boolean}>, bpFiles: [] }}
 */
export function collectBundleFiles({ pipeline, meta, packIconBlob }) {
  const namespace = pipeline.namespace || 'geyser_custom'
  const rpUuid = meta.headerUuid || uuidV4()
  const rpModuleUuid = meta.moduleUuid || uuidV4()
  const bpUuid = uuidV4()
  const bpModuleUuid = uuidV4()

  const rpFiles = []
  const bpFiles = []

  rpFiles.push({ path: `${RP_PREFIX}/manifest.json`, data: JSON.stringify(buildRpManifest(meta, rpUuid, rpModuleUuid), null, 2) })
  if (packIconBlob) {
    rpFiles.push({ path: `${RP_PREFIX}/pack_icon.png`, data: packIconBlob, binary: true })
  }

  rpFiles.push({
    path: `${RP_PREFIX}/textures/item_texture.json`,
    data: JSON.stringify(buildItemTextureJson(pipeline.textureExports, namespace), null, 2),
  })
  rpFiles.push({
    path: `${RP_PREFIX}/textures/terrain_texture.json`,
    data: JSON.stringify(buildTerrainTextureJson(namespace), null, 2),
  })

  for (const tex of pipeline.textureExports) {
    const rel = `${RP_PREFIX}/${tex.bedrockPath}`
    rpFiles.push({ path: rel, data: tex.binary, binary: true, isBase64: true })
  }

  for (const g of pipeline.geometries || []) {
    rpFiles.push({ path: `${RP_PREFIX}/${g.path}`, data: JSON.stringify(g.json, null, 2) })
  }
  for (const a of pipeline.animations || []) {
    rpFiles.push({ path: `${RP_PREFIX}/${a.path}`, data: JSON.stringify(a.json, null, 2) })
  }
  for (const att of pipeline.attachables || []) {
    rpFiles.push({ path: `${RP_PREFIX}/${att.path}`, data: JSON.stringify(att.json, null, 2) })
  }

  rpFiles.push({
    path: `${RP_PREFIX}/animations/animation.geyser_custom.disable.json`,
    data: JSON.stringify(buildDisableAnimation(), null, 2),
  })

  const lang = buildLangEntries(pipeline.mappedForGeyser, namespace)
  rpFiles.push({ path: `${RP_PREFIX}/texts/en_US.lang`, data: lang })
  rpFiles.push({ path: `${RP_PREFIX}/texts/en_GB.lang`, data: lang })
  rpFiles.push({ path: `${RP_PREFIX}/texts/languages.json`, data: JSON.stringify(['en_US', 'en_GB'], null, 2) })

  bpFiles.push({
    path: `${BP_PREFIX}/manifest.json`,
    data: JSON.stringify(buildBpManifest(meta, bpUuid, bpModuleUuid, rpUuid), null, 2),
  })
  if (packIconBlob) {
    bpFiles.push({ path: `${BP_PREFIX}/pack_icon.png`, data: packIconBlob, binary: true })
  }

  for (const it of pipeline.mappedForGeyser) {
    const id = it.bedrockId
    const safe = sanitizeBedrockId(it.bedrockKey)
    const itemJson = {
      format_version: '1.16.100',
      'minecraft:item': {
        description: {
          identifier: id,
          category: 'items',
        },
        components: {
          'minecraft:icon': { texture: id },
        },
      },
    }
    bpFiles.push({
      path: `${BP_PREFIX}/items/${safe}.json`,
      data: JSON.stringify(itemJson, null, 2),
    })
  }

  return { rpFiles, bpFiles, rpUuid, bpUuid }
}

async function addFilesToZip(zip, files, stripPrefix) {
  for (const f of files) {
    const zipPath = stripPrefix ? f.path.replace(new RegExp(`^${stripPrefix}/`), '') : f.path
    if (f.binary && f.isBase64) {
      const bytes = Uint8Array.from(atob(f.data), c => c.charCodeAt(0))
      zip.file(zipPath, bytes, { binary: true })
    } else if (f.binary) {
      zip.file(zipPath, f.data, { binary: true })
    } else {
      zip.file(zipPath, f.data)
    }
  }
}

/**
 * Build master ZIP + optional inner mcpacks (java2bedrock packaged/).
 */
export async function buildJava2BedrockStyleZip({ pipeline, meta, packIconBlob, scan, options }) {
  const { rpFiles, bpFiles } = collectBundleFiles({ pipeline, meta, packIconBlob })
  const allMeta = [...rpFiles, ...bpFiles]

  const masterZip = new JSZip()

  for (const f of allMeta) {
    if (f.binary && f.isBase64) {
      masterZip.file(f.path, Uint8Array.from(atob(f.data), c => c.charCodeAt(0)), { binary: true })
    } else if (f.binary) {
      masterZip.file(f.path, f.data, { binary: true })
    } else {
      masterZip.file(f.path, f.data)
    }
  }

  const config = buildConfigJson(pipeline)
  masterZip.file('config.json', JSON.stringify(config, null, 2))

  const geyserV1 = buildGeyserMappingsV1Java2Bedrock(pipeline)
  masterZip.file('geyser_mappings.json', JSON.stringify(geyserV1, null, 2))
  masterZip.file('geyser_mappings_v2.json', JSON.stringify(pipeline.geyserV2, null, 2))

  const cm = masterZip.folder('custom_mappings')
  cm.file('sconfig_geyser_items.json', JSON.stringify(pipeline.geyserV2, null, 2))
  cm.file('README.txt', pipeline.serverBundle?.readme || '')

  masterZip.file('INSTALL.txt', buildInstallTxt(meta))
  masterZip.file('sconfig_report.json', JSON.stringify({
    generatedAt: new Date().toISOString(),
    engine: 'SConfig Bedrock Engine — java2bedrock bundle',
    detected: scan?.detected,
    namespace: pipeline.namespace,
    exportedTextures: pipeline.textureExports.length,
    mappingCount: pipeline.mappedForGeyser.length,
    attachableCount: pipeline.attachables?.length || 0,
    structure: {
      'packaged/geyser_resources.mcpack': 'Resource pack for Geyser packs/',
      'packaged/geyser_behaviors.mcpack': 'Behavior pack (preview)',
      'packaged/geyser_addon.mcaddon': 'RP+BP for Bedrock client import',
      'unpackaged/rp': 'Full RP source tree',
      'unpackaged/bp': 'Full BP source tree',
      config: 'Item registry',
      geyser_mappings: 'Geyser v1 mappings',
      geyser_mappings_v2: 'Geyser v2 mappings',
    },
  }, null, 2))

  if (options?.generateGeyserReadme !== false) {
    const readme = [
      '# Geyser server install',
      '',
      '1. `packaged/geyser_resources.mcpack` → `plugins/Geyser-Spigot/packs/`',
      '2. `geyser_mappings_v2.json` → `plugins/Geyser-Spigot/custom_mappings/`',
      '3. `enable-custom-content: true`',
      '',
      'See INSTALL.txt for full layout (matches java2bedrock output).',
    ].join('\n')
    masterZip.file('GEYSER_SERVER_SETUP.md', readme)
  }

  const rpZip = new JSZip()
  const bpZip = new JSZip()
  await addFilesToZip(rpZip, rpFiles, RP_PREFIX)
  await addFilesToZip(bpZip, bpFiles, BP_PREFIX)

  const rpMcpack = await rpZip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
  const bpMcpack = await bpZip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })

  masterZip.file('packaged/geyser_resources.mcpack', rpMcpack, { binary: true })
  masterZip.file('packaged/geyser_behaviors.mcpack', bpMcpack, { binary: true })

  const addonZip = new JSZip()
  addonZip.file('geyser_resources.mcpack', rpMcpack, { binary: true })
  addonZip.file('geyser_behaviors.mcpack', bpMcpack, { binary: true })
  const addonBytes = await addonZip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
  masterZip.file('packaged/geyser_addon.mcaddon', addonBytes, { binary: true })

  const blob = await masterZip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  return { blob, config, geyserV1, rpFileCount: rpFiles.length, bpFileCount: bpFiles.length }
}
