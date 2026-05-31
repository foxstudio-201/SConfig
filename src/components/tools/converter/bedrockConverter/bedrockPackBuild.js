import { runSConfigPipeline } from './engines/sconfigEngine'
import { buildJava2BedrockStyleZip } from './bedrockExportBundle'
import { blobToBase64 } from './packIcon'

/**
 * Full export: java2bedrock-style ZIP bundle (unpackaged + packaged mcpacks).
 */
export async function buildBedrockPackZip({ scan, meta, options, packIconBlob, readBinary, readText, pipelineResult }) {
  const quickOnly = options.convertMode === 'quick_2d'
  const opts = {
    ...options,
    packMeta: meta,
    generateAttachables: quickOnly ? false : options.generateAttachables,
    generateGeyserMappings: quickOnly ? false : options.generateGeyserMappings !== false,
  }

  const pipeline = pipelineResult || await runSConfigPipeline({
    scan,
    options: {
      ...opts,
      maxItems: options.convertMode === 'guided' ? 800 : 500,
      maxTextures: options.convertMode === 'guided' ? 800 : 400,
    },
    readText: readText || (async () => null),
    readBinary,
  })

  const { blob } = await buildJava2BedrockStyleZip({
    pipeline,
    meta,
    packIconBlob,
    scan,
    options: opts,
  })

  const report = {
    generatedAt: new Date().toISOString(),
    engine: 'SConfig Bedrock Engine — full ZIP bundle',
    detected: scan.detected,
    namespace: pipeline.namespace,
    exportedCount: pipeline.textureExports.length,
    mappingCount: pipeline.mappedForGeyser.length,
    attachableCount: pipeline.attachables?.length || 0,
    bundleLayout: 'java2bedrock-compatible (target/)',
    warnings: [...scan.warnings, ...pipeline.warnings],
    logs: pipeline.logs,
  }

  return {
    blob,
    report,
    pipeline,
    exportedCount: pipeline.textureExports.length,
    mappingCount: pipeline.mappedForGeyser.length,
    attachableCount: pipeline.attachables?.length || 0,
  }
}

export async function saveZipBlob(blob, fileName, api) {
  if (api?.saveFileDialog && api?.writeFileBinary) {
    const path = await api.saveFileDialog(fileName)
    if (!path) return { saved: false }
    const b64 = await blobToBase64(blob)
    const res = await api.writeFileBinary(path, b64)
    return { saved: res.ok, path, error: res.error }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = fileName
  a.click()
  URL.revokeObjectURL(a.href)
  return { saved: true, path: null }
}
