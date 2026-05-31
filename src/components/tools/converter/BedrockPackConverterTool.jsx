/**
 * Bedrock Pack Converter — SConfig Engine + java2bedrock + ItemsAdder Bedrock CLI
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import {
  ArrowLeftIcon, FolderOpenIcon, ArrowDownTrayIcon, CheckCircleIcon,
  PhotoIcon, ArrowPathIcon, ExclamationTriangleIcon, LinkIcon, CloudArrowDownIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import {
  SOURCE_TYPES, CONVERT_MODES, EXTERNAL_PIPELINES, DEFAULT_PACK_META,
  createConverterState, uuidV4,
} from './bedrockConverter/bedrockConverterData'
import { scanPackSource } from './bedrockConverter/bedrockPackScan'
import { buildBedrockPackZip, saveZipBlob } from './bedrockConverter/bedrockPackBuild'
import { fileToPackIconPngBlob } from './bedrockConverter/packIcon'

const isElectron = typeof window !== 'undefined' && window.sconfigAPI
const api = isElectron ? window.sconfigAPI : null

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-sky-500/35 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3 min-h-0'

function SectionTitle({ children }) {
  return <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{children}</p>
}

function Toggle({ label, value, onChange, desc }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-sky-500/35 bg-sky-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${value ? 'bg-sky-400' : 'bg-white/20'}`} />
      <span className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold text-white/80 block">{label}</span>
        {desc && <span className="text-[10px] text-white/35 block mt-0.5">{desc}</span>}
      </span>
    </button>
  )
}

export default function BedrockPackConverterTool({ onBack }) {
  const [opts, setOpts] = useState(createConverterState)
  const [rootPath, setRootPath] = useState(null)
  const [scan, setScan] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [converting, setConverting] = useState(false)
  const [externalRunning, setExternalRunning] = useState(false)
  const [packIconBlob, setPackIconBlob] = useState(null)
  const [packIconPreview, setPackIconPreview] = useState(null)
  const [log, setLog] = useState([])
  const [lastExport, setLastExport] = useState(null)
  const [toolStatus, setToolStatus] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const setOpt = useCallback(patch => setOpts(prev => ({ ...prev, ...patch })), [])
  const setMeta = useCallback(patch => setOpts(prev => ({
    ...prev,
    packMeta: { ...prev.packMeta, ...patch },
  })), [])

  function pushLog(msg, level = 'info') {
    setLog(prev => [...prev.slice(-120), { t: Date.now(), msg, level }])
  }

  useEffect(() => {
    if (!api?.bedrockCheckTools) return
    api.bedrockCheckTools().then(setToolStatus).catch(() => {})
    const unsub = api.onBedrockPipelineLog?.(({ msg }) => {
      if (msg) pushLog(msg, 'info')
    })
    return () => unsub?.()
  }, [])

  async function pickFolder() {
    if (!api) {
      pushLog('Chọn thư mục chỉ hoạt động trong app Electron.', 'warn')
      return
    }
    const folder = await api.selectFolder()
    if (!folder) return
    setRootPath(folder)
    setScan(null)
    setLastExport(null)
    pushLog(`Đã chọn: ${folder}`)
  }

  async function runScan() {
    if (!rootPath || !api) return
    setScanning(true)
    setScan(null)
    try {
      const readText = async path => {
        const res = await api.readFile(path)
        return res.ok ? res.data : null
      }
      const result = await scanPackSource({
        rootPath,
        sourceType: opts.sourceType,
        api,
        readText,
      })
      setScan(result)
      pushLog(`Phát hiện: ${result.detected} — ${result.textures.length} texture, ${result.items.length} item`)
      result.warnings.forEach(w => pushLog(w, 'warn'))
    } catch (e) {
      pushLog(e.message, 'error')
    } finally {
      setScanning(false)
    }
  }

  async function installConverter(key) {
    if (!api?.bedrockInstallConverter) return
    pushLog(`Đang cài ${key}…`)
    const res = await api.bedrockInstallConverter(key)
    if (res.ok) {
      pushLog(`Đã cài: ${res.path}`, 'ok')
      const st = await api.bedrockCheckTools()
      setToolStatus(st)
    } else {
      pushLog(res.error || 'Cài đặt thất bại', 'error')
    }
  }

  async function runExternalEngines() {
    if (!rootPath || !api?.bedrockRunExternal) return
    if (!opts.runJava2Bedrock && !opts.runIABedrock) {
      pushLog('Bật ít nhất một engine ngoài (java2bedrock hoặc IA Bedrock).', 'warn')
      return
    }
    setExternalRunning(true)
    try {
      const res = await api.bedrockRunExternal({
        rootPath,
        flags: {
          runJava2Bedrock: opts.runJava2Bedrock,
          runIABedrock: opts.runIABedrock,
          namespace: opts.namespacePrefix,
        },
      })
      if (!res.ok) {
        pushLog(res.error || 'External pipeline failed', 'error')
        return
      }
      if (res.results?.java2bedrock?.ok) {
        pushLog(`java2bedrock: ${(res.results.java2bedrock.outputs || []).join(', ') || 'done'}`, 'ok')
      } else if (res.results?.java2bedrock?.error) {
        pushLog(`java2bedrock: ${res.results.java2bedrock.error}`, 'warn')
        if (res.results.java2bedrock.issueUrl) pushLog('Dùng GitHub Actions issue thay thế.', 'info')
      }
      if (res.results?.iaBedrock?.ok) {
        pushLog(`IA Bedrock: ${res.results.iaBedrock.resourceZip}`, 'ok')
      } else if (res.results?.iaBedrock?.error) {
        pushLog(`IA Bedrock: ${res.results.iaBedrock.error}`, 'warn')
      }
      pushLog(`Thư mục làm việc: ${res.workDir}`, 'info')
    } catch (e) {
      pushLog(e.message, 'error')
    } finally {
      setExternalRunning(false)
    }
  }

  async function applyPackIconFile(file) {
    if (!file?.type?.startsWith('image/')) {
      pushLog('File phải là ảnh (PNG/JPG/WebP).', 'warn')
      return
    }
    try {
      const blob = await fileToPackIconPngBlob(file)
      setPackIconBlob(blob)
      setPackIconPreview(URL.createObjectURL(blob))
      pushLog('Đã đặt pack_icon.png (256×256).')
    } catch (e) {
      pushLog(e.message, 'error')
    }
  }

  function onIconDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) applyPackIconFile(file)
  }

  async function runConvert() {
    if (!scan || !api) return
    setConverting(true)
    try {
      if (opts.convertMode === 'guided' && (opts.runJava2Bedrock || opts.runIABedrock)) {
        await runExternalEngines()
      }

      const meta = {
        ...opts.packMeta,
        headerUuid: uuidV4(),
        moduleUuid: uuidV4(),
        version: opts.packMeta.version || DEFAULT_PACK_META.version,
        minEngine: opts.packMeta.minEngine || DEFAULT_PACK_META.minEngine,
      }
      const readBinary = path => api.readFileBinary(path)
      const readText = async path => {
        const res = await api.readFile(path)
        return res.ok ? res.data : null
      }

      const { blob, report, exportedCount, mappingCount, pipeline } = await buildBedrockPackZip({
        scan,
        meta,
        options: opts,
        packIconBlob,
        readBinary,
        readText,
      })

      pipeline?.logs?.forEach(l => pushLog(l, 'info'))

      const safeName = (meta.name || 'bedrock_pack').replace(/[^a-z0-9_-]+/gi, '_')
      const fileName = `${safeName}_geyser_export.zip`
      const saveRes = await saveZipBlob(blob, fileName, api)
      setLastExport({ ...report, exportedCount, mappingCount })
      if (saveRes.saved) {
        pushLog(`ZIP: unpackaged/rp+bp, packaged/*.mcpack, config.json, geyser_mappings → ${saveRes.path || fileName}`, 'ok')
        pushLog(`${exportedCount} tex · ${mappingCount} mapping · ${report.attachableCount || 0} attachable`, 'ok')
      } else {
        pushLog('Đã hủy lưu file.', 'warn')
      }
    } catch (e) {
      pushLog(e.message, 'error')
    } finally {
      setConverting(false)
    }
  }

  const modeInfo = CONVERT_MODES.find(m => m.value === opts.convertMode)

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white">Bedrock Pack Converter</h1>
          <p className="text-xs text-white/35 mt-0.5">Engine riêng cho Geyser server — mappings + attachable 3D/armor chuẩn</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-4">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(300px,340px)_minmax(0,1fr)_minmax(0,280px)] gap-4 h-full min-h-0">
          <div className={`${sectionCls} overflow-y-auto custom-dropdown-scroll`}>
            <SectionTitle>Nguồn</SectionTitle>
            {!isElectron && (
              <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                Cần SConfig (Electron) để quét, engine ngoài và lưu file.
              </p>
            )}
            <button type="button" onClick={pickFolder} disabled={!isElectron}
              className={`${btnCls} w-full justify-center bg-white/[0.04] border-white/[0.08] text-white/70 disabled:opacity-40`}>
              <FolderOpenIcon className="w-4 h-4" />
              {rootPath ? 'Đổi thư mục' : 'Chọn server / pack'}
            </button>
            {rootPath && <p className="text-[10px] font-mono text-white/40 break-all">{rootPath}</p>}

            <CustomDropdown label="Loại nguồn" value={opts.sourceType} onChange={v => setOpt({ sourceType: v })}
              options={SOURCE_TYPES} accent="sky" />
            <CustomDropdown label="Chế độ" value={opts.convertMode} onChange={v => setOpt({ convertMode: v })}
              options={CONVERT_MODES.map(m => ({ value: m.value, label: m.label }))} accent="sky" />
            {modeInfo && <p className="text-[10px] text-white/35 leading-relaxed">{modeInfo.desc}</p>}

            <button type="button" onClick={runScan} disabled={!rootPath || scanning}
              className={`${btnCls} w-full justify-center bg-sky-500/15 border-sky-500/25 text-sky-300 disabled:opacity-40`}>
              <ArrowPathIcon className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Đang quét…' : 'Quét nguồn'}
            </button>

            <SectionTitle>SConfig Engine (Geyser)</SectionTitle>
            <Toggle label="Geyser mappings v2" value={opts.generateGeyserMappings !== false}
              onChange={v => setOpt({ generateGeyserMappings: v })}
              desc="custom_mappings/sconfig_geyser_items.json → plugins/Geyser-*/custom_mappings/" />
            <Toggle label="Attachable 3D + animations" value={opts.generateAttachables !== false}
              onChange={v => setOpt({ generateAttachables: v })}
              desc="Java elements → Bedrock geometry (java2bedrock logic)" />
            <Toggle label="Item textures" value={opts.includeItems} onChange={v => setOpt({ includeItems: v })} />
            <Toggle label="Block textures" value={opts.includeBlocks} onChange={v => setOpt({ includeBlocks: v })} />

            <SectionTitle>Engine ngoài</SectionTitle>
            {toolStatus && (
              <div className="text-[10px] font-mono text-white/40 space-y-0.5 rounded-lg bg-black/30 p-2 border border-white/[0.06]">
                <div>node: {toolStatus.node || '—'}</div>
                <div>git: {toolStatus.git || '—'}</div>
                <div>bash: {toolStatus.bash ? 'OK' : '—'}</div>
                <div>j2b: {toolStatus.converters?.java2bedrock ? 'installed' : 'not installed'}</div>
                <div>IA: {toolStatus.converters?.iaBedrock ? 'installed' : 'not installed'}</div>
              </div>
            )}
            <Toggle label="java2bedrock.sh" value={opts.runJava2Bedrock} onChange={v => setOpt({ runJava2Bedrock: v })}
              desc="3D / armor — cần Git Bash (Windows)" />
            <Toggle label="ItemsAdder → Bedrock CLI" value={opts.runIABedrock} onChange={v => setOpt({ runIABedrock: v })}
              desc="Blocks / furniture behavior pack" />
            <div className="flex flex-wrap gap-1.5">
              <button type="button" disabled={!isElectron} onClick={() => installConverter('java2bedrock')}
                className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/55 text-[10px]`}>
                <CloudArrowDownIcon className="w-3.5 h-3.5" /> Cài j2b
              </button>
              <button type="button" disabled={!isElectron} onClick={() => installConverter('iaBedrock')}
                className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/55 text-[10px]`}>
                <CloudArrowDownIcon className="w-3.5 h-3.5" /> Cài IA CLI
              </button>
              <button type="button" disabled={!isElectron || externalRunning} onClick={runExternalEngines}
                className={`${btnCls} bg-violet-500/10 border-violet-500/25 text-violet-300 text-[10px]`}>
                <Cog6ToothIcon className="w-3.5 h-3.5" /> Chạy ngoài
              </button>
            </div>
            <button type="button" disabled={!isElectron} onClick={() => api?.bedrockOpenGithubIssue?.()}
              className={`${btnCls} w-full justify-center bg-white/[0.03] border-white/[0.08] text-white/45 text-[10px]`}>
              Mở GitHub java2bedrock (Actions)
            </button>

            <SectionTitle>Pack icon</SectionTitle>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onIconDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-3 flex flex-col items-center gap-2 cursor-pointer ${
                dragOver ? 'border-sky-400/60 bg-sky-500/10' : 'border-white/[0.1] bg-white/[0.02]'
              }`}
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) applyPackIconFile(f); e.target.value = '' }} />
              {packIconPreview
                ? <img src={packIconPreview} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                : <PhotoIcon className="w-8 h-8 text-white/25" />}
              <p className="text-[10px] text-white/45 text-center">Kéo thả ảnh → pack_icon 256²</p>
            </div>

            <div>
              <label className={labelCls}>Tên pack</label>
              <input className={inputCls} value={opts.packMeta.name} onChange={e => setMeta({ name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Prefix ID</label>
              <input className={inputCls} value={opts.namespacePrefix} onChange={e => setOpt({ namespacePrefix: e.target.value })} />
            </div>

            <button type="button" onClick={runConvert} disabled={!scan || converting}
              className={`${btnCls} w-full justify-center bg-emerald-500/15 border-emerald-500/25 text-emerald-300 disabled:opacity-40`}>
              <ArrowDownTrayIcon className="w-4 h-4" />
              {converting ? 'Đang convert…' : 'Xuất ZIP (java2bedrock)'}
            </button>
          </div>

          <div className={`${sectionCls} overflow-hidden`}>
            <SectionTitle>Kết quả</SectionTitle>
            {!scan ? (
              <p className="text-sm text-white/35">Quét nguồn để xem assets và chạy SConfig Engine.</p>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll flex flex-col gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[['Nguồn', scan.detected], ['Files', scan.fileCount], ['Tex', scan.textures.length], ['Models', scan.models.length]].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-2 py-2">
                      <p className="text-[9px] text-white/30 uppercase">{k}</p>
                      <p className="text-sm font-mono text-white/80">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3">
                  <p className="text-[11px] text-sky-200/90 font-semibold mb-1">Geyser server output</p>
                  <ul className="text-[10px] text-white/45 space-y-0.5 list-disc list-inside">
                    <li>packaged/geyser_resources.mcpack</li>
                    <li>packaged/geyser_addon.mcaddon</li>
                    <li>unpackaged/rp + unpackaged/bp</li>
                    <li>geyser_mappings.json + config.json</li>
                  </ul>
                </div>
                {scan.warnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-amber-200/90 flex gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />{w}
                  </p>
                ))}
                {lastExport && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[11px] text-emerald-200">
                    <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                    {lastExport.exportedCount} textures · {lastExport.mappingCount} mappings · {lastExport.attachableCount ?? 0} attachables
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`${sectionCls} overflow-hidden`}>
            <SectionTitle>Tài liệu / Log</SectionTitle>
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto custom-dropdown-scroll">
              {EXTERNAL_PIPELINES.map(p => (
                <a key={p.id} href={p.url} target="_blank" rel="noreferrer"
                  className="rounded-lg border border-white/[0.06] p-2 hover:bg-white/[0.04]">
                  <p className="text-[10px] text-sky-300 flex items-center gap-1"><LinkIcon className="w-3 h-3" />{p.name}</p>
                </a>
              ))}
            </div>
            <div className="flex-1 min-h-[120px] overflow-y-auto custom-dropdown-scroll rounded-lg bg-black/40 border border-white/[0.06] p-2 font-mono text-[10px]">
              {log.map((entry, i) => (
                <div key={i} className={
                  entry.level === 'error' ? 'text-red-300' :
                  entry.level === 'warn' ? 'text-amber-300' :
                  entry.level === 'ok' ? 'text-emerald-300' : 'text-white/45'
                }>{entry.msg}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
