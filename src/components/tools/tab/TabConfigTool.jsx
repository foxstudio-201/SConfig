import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  PlusIcon, TrashIcon, EyeIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import { useI18n } from '../../../context/I18nContext'
import { parseMcText } from '../placeholder/placeholderApiExport'
import {
  createTabState, applyPreset, previewText, MOCK_PLAYERS,
  SORTING_TYPE_OPTIONS, BOSSBAR_STYLES, BOSSBAR_COLORS,
  createDesign, createScoreboard, createGroup, createBossBar,
} from './tabData'
import { buildConfigYaml, buildGroupsYaml, downloadText } from './tabYaml'

const MAIN_TABS = [
  { id: 'headerFooter', labelKey: 'tabHeaderFooter' },
  { id: 'tablist', labelKey: 'tabTablist' },
  { id: 'nametags', labelKey: 'tabNametags' },
  { id: 'scoreboard', labelKey: 'tabScoreboard' },
  { id: 'bossbar', labelKey: 'tabBossbar' },
  { id: 'general', labelKey: 'tabGeneral' },
  { id: 'yaml', labelKey: 'tabYaml' },
]

const PRESET_OPTIONS = [
  { value: 'default', labelKey: 'presetDefault' },
  { value: 'minimal', labelKey: 'presetMinimal' },
  { value: 'network', labelKey: 'presetNetwork' },
  { value: 'pvp', labelKey: 'presetPvp' },
]

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-violet-500/35 transition-colors font-mono text-xs'
const inputWideCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-violet-500/35 transition-colors'
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3'

function Toggle({ label, value, onChange, desc }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-violet-500/35 bg-violet-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center transition-all ${value ? 'bg-violet-500/40 border-violet-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
        <span className={`block w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold text-white/80 block">{label}</span>
        {desc && <span className="text-[10px] text-white/35 block mt-0.5">{desc}</span>}
      </span>
    </button>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      {children}
      {hint && <p className="text-[10px] text-white/25 mt-1">{hint}</p>}
    </div>
  )
}

function McLine({ text, className = '', align = 'left' }) {
  const parts = useMemo(() => parseMcText(previewText(text || '')), [text])
  const alignCls = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
  return (
    <div className={`font-mono text-[11px] leading-snug ${alignCls} ${className}`}>
      {parts.length === 0 || !text?.trim() ? (
        <span className="text-white/10">&nbsp;</span>
      ) : parts.map((p, i) => (
        <span key={i} style={{ color: p.color, ...p.style }}>{p.text}</span>
      ))}
    </div>
  )
}

const PREVIEW_MODES = [
  { id: 'tab', labelKey: 'previewBtnTab' },
  { id: 'scoreboard', labelKey: 'previewBtnScoreboard' },
  { id: 'nametag', labelKey: 'previewBtnNametag' },
  { id: 'bossbar', labelKey: 'previewBtnBossbar' },
]

function PreviewCard({ title, hint, badge, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-white/[0.08] bg-[#0a0a14]/80 overflow-hidden ${className}`}>
      <div className="px-3 py-2 border-b border-white/[0.06] bg-white/[0.02] flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-violet-300/90 uppercase tracking-wide">{title}</p>
          {hint && <p className="text-[9px] text-white/30 mt-0.5 leading-relaxed">{hint}</p>}
        </div>
        {badge}
      </div>
      {children}
    </div>
  )
}

function TabPreviewPanel({ t, state, activeDesign, activeBoard, activeBar, editorTab }) {
  const [previewMode, setPreviewMode] = useState('tab')
  const design = activeDesign || state.headerFooter.designs[0]
  const board = activeBoard || state.scoreboard.boards[0]
  const bar = activeBar || state.bossbar.bars[0]

  useEffect(() => {
    const map = {
      headerFooter: 'tab',
      tablist: 'tab',
      nametags: 'nametag',
      scoreboard: 'scoreboard',
      bossbar: 'bossbar',
    }
    if (map[editorTab]) setPreviewMode(map[editorTab])
  }, [editorTab])

  const previewModes = PREVIEW_MODES.filter(m => m.id !== 'bossbar' || state.bossbar.enabled)

  const tabEntries = useMemo(() => {
    return MOCK_PLAYERS.map(p => {
      const grp = state.groups.find(g => g.name.toLowerCase() === p.group) ||
        state.groups.find(g => g.name === '_DEFAULT_') ||
        state.groups[0]
      const prefix = previewText(grp?.tabprefix || p.prefix, { playerName: p.name, group: p.group, prefix: p.prefix })
      const suffix = previewText(grp?.tabsuffix || '', { playerName: p.name, group: p.group })
      const name = previewText(grp?.customtabname || p.name, { playerName: p.name }).replace(/%player_name%/gi, p.name)
      return { ...p, display: `${prefix}${name}${suffix}`, isSelf: p.name === 'Steve' }
    })
  }, [state.groups])

  const pingLine = useMemo(() => {
    if (!state.playerlistObjective.enabled) return null
    return previewText(state.playerlistObjective.fancyValue || state.playerlistObjective.value)
  }, [state.playerlistObjective])

  const tagSample = useMemo(() => {
    const grp = state.groups.find(g => g.name === 'Admin') || state.groups[0]
    const prefix = previewText(grp?.tagprefix || '&7', { playerName: 'Steve', group: 'admin' })
    const suffix = previewText(grp?.tagsuffix || '', { playerName: 'Steve' })
    return `${prefix}Steve${suffix}`
  }, [state.groups])

  const scoreboardLines = useMemo(() => {
    if (!board?.lines) return []
    return board.lines.filter(line => line.trim() !== '' && !line.includes('&m'))
  }, [board])

  const activePreviewMeta = {
    tab: { title: t('tab.previewTabOverlay'), hint: t('tab.previewTabOverlayHint') },
    scoreboard: { title: t('tab.previewScoreboardHud'), hint: t('tab.previewScoreboardHudHint') },
    nametag: { title: t('tab.previewNametag'), hint: '' },
    bossbar: { title: t('tab.previewBossbar'), hint: '' },
  }[previewMode]

  const renderPreviewContent = () => {
    switch (previewMode) {
      case 'tab':
        return (
          <div className="relative p-4 min-h-[260px] bg-gradient-to-b from-black/70 via-black/50 to-black/70 flex items-center justify-center">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)]" />
            <div className="relative flex flex-col items-center gap-2 w-full max-w-[300px]">
              {state.headerFooter.enabled && design ? (
                <div className="w-full space-y-0.5 pb-2 border-b border-white/[0.08]">
                  {design.header.map((line, i) => <McLine key={i} text={line} align="center" />)}
                </div>
              ) : (
                <p className="text-[9px] text-white/20 italic pb-2">{t('tab.previewHeader')}: —</p>
              )}
              <div className="w-full py-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {tabEntries.map(entry => (
                    <div
                      key={entry.name}
                      className={`flex flex-col items-center ${entry.isSelf ? 'bg-white/[0.06] ring-1 ring-violet-500/30 rounded px-1 py-0.5' : ''}`}
                    >
                      <McLine text={entry.display} align="center" className="text-[10px] whitespace-nowrap" />
                      {entry.isSelf && <span className="text-[7px] text-violet-400/60">{t('tab.previewYou')}</span>}
                    </div>
                  ))}
                </div>
                {pingLine && state.playerlistObjective.enabled && (
                  <div className="mt-3 flex justify-center">
                    <McLine text={pingLine} align="center" className="text-[10px] opacity-70" />
                  </div>
                )}
              </div>
              {state.headerFooter.enabled && design ? (
                <div className="w-full space-y-0.5 pt-2 border-t border-white/[0.08]">
                  {design.footer.map((line, i) => <McLine key={i} text={line} align="center" />)}
                </div>
              ) : (
                <p className="text-[9px] text-white/20 italic pt-2">{t('tab.previewFooter')}: —</p>
              )}
            </div>
          </div>
        )

      case 'scoreboard':
        return (
          <div className="relative min-h-[260px] p-4 bg-gradient-to-br from-[#1c2a1c]/40 via-[#12121c] to-[#1a1a2e] flex items-start justify-end">
            <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,#ffffff08_0px,#ffffff08_2px,transparent_2px,transparent_8px)]" />
            {state.scoreboard.enabled && board ? (
              <div className="relative bg-black/60 border border-white/[0.08] px-3 py-2.5 min-w-[130px] max-w-[180px] shadow-lg">
                <McLine text={board.title} align="center" className="text-[11px] font-bold mb-2 pb-1.5 border-b border-white/[0.06]" />
                <div className="flex flex-col gap-1">
                  {scoreboardLines.map((line, i) => (
                    <McLine key={i} text={line} align="right" className="text-[10px]" />
                  ))}
                </div>
              </div>
            ) : (
              <p className="relative text-[10px] text-white/30 italic">{t('tab.previewDisabled')}</p>
            )}
          </div>
        )

      case 'nametag':
        return (
          <div className="min-h-[260px] flex flex-col items-center justify-center p-6 bg-[#0a0a12]">
            {state.scoreboardTeams.invisibleNametags ? (
              <p className="text-[10px] text-white/30 italic">{t('tab.previewDisabled')}</p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <McLine
                  text={tagSample}
                  align="center"
                  className="text-[14px] [text-shadow:1px_1px_0_#3f3f3f,-1px_-1px_0_#3f3f3f,1px_-1px_0_#3f3f3f,-1px_1px_0_#3f3f3f]"
                />
                {state.belownameObjective.enabled && (
                  <McLine
                    text={state.belownameObjective.fancyValue}
                    align="center"
                    className="text-[11px] [text-shadow:1px_1px_0_#3f3f3f]"
                  />
                )}
              </div>
            )}
          </div>
        )

      case 'bossbar':
        return (
          <div className="min-h-[260px] p-6 bg-black/50 flex flex-col items-center justify-start pt-8">
            {state.bossbar.enabled && bar ? (
              <div className="w-full max-w-[280px]">
                <McLine text={bar.text} align="center" className="text-[11px] mb-2" />
                <div className="h-2.5 rounded-sm bg-[#2d0a0a] border border-[#5c1a1a]/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#c03030] to-[#e06060]"
                    style={{ width: `${Math.min(100, Number(bar.progress) || 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-white/30 italic">{t('tab.previewDisabled')}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`${sectionCls} min-h-0 overflow-hidden`}>
      <div className="flex items-center gap-2 flex-shrink-0">
        <EyeIcon className="w-4 h-4 text-violet-400" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('tab.previewTitle')}</p>
          <p className="text-[10px] text-white/25 mt-0.5">{t('tab.previewHint')}</p>
        </div>
      </div>

      <div className="flex-shrink-0">
        <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1.5">{t('tab.previewSwitch')}</p>
        <div className="flex flex-wrap gap-1">
          {previewModes.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPreviewMode(m.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                previewMode === m.id
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-200'
                  : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70'
              }`}
            >
              {t(`tab.${m.labelKey}`)}
            </button>
          ))}
        </div>
      </div>

      <PreviewCard
        title={activePreviewMeta?.title || ''}
        hint={activePreviewMeta?.hint}
        badge={
          previewMode === 'tab' && !state.headerFooter.enabled && !state.tablistFormatting.enabled ? (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30 border border-white/[0.08]">{t('tab.previewDisabled')}</span>
          ) : previewMode === 'scoreboard' && !state.scoreboard.enabled ? (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30 border border-white/[0.08]">{t('tab.previewDisabled')}</span>
          ) : null
        }
        className="flex-1 min-h-0 flex flex-col"
      >
        <div className="flex-1 min-h-0">{renderPreviewContent()}</div>
      </PreviewCard>
    </div>
  )
}

export default function TabConfigTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(createTabState())
  const [mainTab, setMainTab] = useState('headerFooter')
  const [activeDesignId, setActiveDesignId] = useState(null)
  const [activeBoardId, setActiveBoardId] = useState(null)
  const [activeGroupId, setActiveGroupId] = useState(null)
  const [activeBarId, setActiveBarId] = useState(null)
  const [yamlView, setYamlView] = useState('config')
  const [copiedId, setCopiedId] = useState(null)

  const set = useCallback(patch => setState(prev => ({ ...prev, ...patch })), [])

  const activeDesign = state.headerFooter.designs.find(d => d._id === activeDesignId) || state.headerFooter.designs[0]
  const activeBoard = state.scoreboard.boards.find(b => b._id === activeBoardId) || state.scoreboard.boards[0]
  const activeGroup = state.groups.find(g => g._id === activeGroupId) || state.groups[0]
  const activeBar = state.bossbar.bars.find(b => b._id === activeBarId) || state.bossbar.bars[0]

  const configYaml = useMemo(() => buildConfigYaml(state), [state])
  const groupsYaml = useMemo(() => buildGroupsYaml(state), [state])
  const yamlContent = yamlView === 'config' ? configYaml : groupsYaml

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const loadPreset = (id) => {
    const next = applyPreset(id)
    setState(next)
    setActiveDesignId(next.headerFooter.designs[0]?._id)
    setActiveBoardId(next.scoreboard.boards[0]?._id)
    setActiveGroupId(next.groups[0]?._id)
    setActiveBarId(next.bossbar.bars[0]?._id)
  }

  const updateDesign = (id, patch) => {
    setState(prev => ({
      ...prev,
      headerFooter: {
        ...prev.headerFooter,
        designs: prev.headerFooter.designs.map(d => d._id === id ? { ...d, ...patch } : d),
      },
    }))
  }

  const updateBoard = (id, patch) => {
    setState(prev => ({
      ...prev,
      scoreboard: {
        ...prev.scoreboard,
        boards: prev.scoreboard.boards.map(b => b._id === id ? { ...b, ...patch } : b),
      },
    }))
  }

  const updateGroup = (id, patch) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => g._id === id ? { ...g, ...patch } : g),
    }))
  }

  const updateBar = (id, patch) => {
    setState(prev => ({
      ...prev,
      bossbar: {
        ...prev.bossbar,
        bars: prev.bossbar.bars.map(b => b._id === id ? { ...b, ...patch } : b),
      },
    }))
  }

  const presetDropdownOptions = PRESET_OPTIONS.map(p => ({
    value: p.value,
    label: t(`tab.${p.labelKey}`),
  }))

  const renderEditor = () => {
    switch (mainTab) {
      case 'headerFooter':
        return (
          <div className="flex flex-col gap-3">
            <Toggle label={t('tab.enabled')} value={state.headerFooter.enabled} onChange={v => set({ headerFooter: { ...state.headerFooter, enabled: v } })} />
            <div className="flex flex-wrap gap-1.5">
              {state.headerFooter.designs.map(d => (
                <button key={d._id} type="button" onClick={() => setActiveDesignId(d._id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${activeDesign?._id === d._id ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'border-white/[0.06] text-white/40'}`}>
                  {d.name}
                </button>
              ))}
              <button type="button" onClick={() => {
                const d = createDesign({ name: `design-${state.headerFooter.designs.length + 1}` })
                setState(prev => ({ ...prev, headerFooter: { ...prev.headerFooter, designs: [...prev.headerFooter.designs, d] } }))
                setActiveDesignId(d._id)
              }} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
                <PlusIcon className="w-3.5 h-3.5" />{t('tab.newDesign')}
              </button>
            </div>
            {activeDesign && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('tab.designName')}>
                    <input className={inputWideCls} value={activeDesign.name} onChange={e => updateDesign(activeDesign._id, { name: e.target.value.replace(/\s/g, '-') })} />
                  </Field>
                  <Field label={t('tab.displayCondition')} hint={t('tab.displayConditionHint')}>
                    <input className={inputWideCls} value={activeDesign.displayCondition} onChange={e => updateDesign(activeDesign._id, { displayCondition: e.target.value })} placeholder="%world%=lobby" />
                  </Field>
                </div>
                <Field label={t('tab.headerLines')} hint={t('tab.oneLinePerRow')}>
                  <textarea className={`${inputCls} min-h-[100px] resize-y`} value={activeDesign.header.join('\n')} onChange={e => updateDesign(activeDesign._id, { header: e.target.value.split('\n') })} spellCheck={false} />
                </Field>
                <Field label={t('tab.footerLines')} hint={t('tab.oneLinePerRow')}>
                  <textarea className={`${inputCls} min-h-[100px] resize-y`} value={activeDesign.footer.join('\n')} onChange={e => updateDesign(activeDesign._id, { footer: e.target.value.split('\n') })} spellCheck={false} />
                </Field>
                {state.headerFooter.designs.length > 1 && (
                  <button type="button" onClick={() => {
                    setState(prev => ({ ...prev, headerFooter: { ...prev.headerFooter, designs: prev.headerFooter.designs.filter(d => d._id !== activeDesign._id) } }))
                    setActiveDesignId(null)
                  }} className={`${btnCls} self-start bg-red-500/10 border-red-500/20 text-red-300`}>
                    <TrashIcon className="w-3.5 h-3.5" />{t('tab.delete')}
                  </button>
                )}
              </>
            )}
          </div>
        )

      case 'tablist':
      case 'nametags':
        return (
          <div className="flex flex-col gap-3">
            {mainTab === 'tablist' && (
              <>
                <Toggle label={t('tab.enabled')} value={state.tablistFormatting.enabled} onChange={v => set({ tablistFormatting: { ...state.tablistFormatting, enabled: v } })} />
                <Field label={t('tab.disableCondition')}>
                  <input className={inputWideCls} value={state.tablistFormatting.disableCondition} onChange={e => set({ tablistFormatting: { ...state.tablistFormatting, disableCondition: e.target.value } })} />
                </Field>
              </>
            )}
            {mainTab === 'nametags' && (
              <>
                <Toggle label={t('tab.enabled')} value={state.scoreboardTeams.enabled} onChange={v => set({ scoreboardTeams: { ...state.scoreboardTeams, enabled: v } })} />
                <Toggle label={t('tab.enableCollision')} value={state.scoreboardTeams.enableCollision} onChange={v => set({ scoreboardTeams: { ...state.scoreboardTeams, enableCollision: v } })} />
                <Toggle label={t('tab.invisibleNametags')} value={state.scoreboardTeams.invisibleNametags} onChange={v => set({ scoreboardTeams: { ...state.scoreboardTeams, invisibleNametags: v } })} />
                <Toggle label={t('tab.caseSensitiveSorting')} value={state.scoreboardTeams.caseSensitiveSorting} onChange={v => set({ scoreboardTeams: { ...state.scoreboardTeams, caseSensitiveSorting: v } })} />
                <Field label={t('tab.disableCondition')}>
                  <input className={inputWideCls} value={state.scoreboardTeams.disableCondition} onChange={e => set({ scoreboardTeams: { ...state.scoreboardTeams, disableCondition: e.target.value } })} />
                </Field>
                <Field label={t('tab.sortingTypes')}>
                  <textarea className={`${inputCls} min-h-[72px]`} value={state.scoreboardTeams.sortingTypes.join('\n')} onChange={e => set({ scoreboardTeams: { ...state.scoreboardTeams, sortingTypes: e.target.value.split('\n').filter(Boolean) } })} spellCheck={false} />
                </Field>
              </>
            )}
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1">{t('tab.groupsTitle')}</p>
              <p className="text-[10px] text-white/25 mb-2">{t('tab.groupsHint')}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {state.groups.map(g => (
                <button key={g._id} type="button" onClick={() => setActiveGroupId(g._id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border font-mono ${activeGroup?._id === g._id ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'border-white/[0.06] text-white/40'}`}>
                  {g.name}
                </button>
              ))}
              <button type="button" onClick={() => {
                const g = createGroup({ name: `Group${state.groups.length}` })
                setState(prev => ({ ...prev, groups: [...prev.groups, g] }))
                setActiveGroupId(g._id)
              }} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
                <PlusIcon className="w-3.5 h-3.5" />{t('tab.newGroup')}
              </button>
            </div>
            {activeGroup && (
              <>
                {activeGroup.name === '_DEFAULT_' && <p className="text-[10px] text-amber-300/70">{t('tab.defaultGroupNote')}</p>}
                <Field label={t('tab.groupName')}>
                  <input className={inputWideCls} value={activeGroup.name} disabled={activeGroup.name === '_DEFAULT_'} onChange={e => updateGroup(activeGroup._id, { name: e.target.value })} />
                </Field>
                {(mainTab === 'tablist' || mainTab === 'nametags') && (
                  <>
                    <Field label={t('tab.tabprefix')}>
                      <input className={inputCls} value={activeGroup.tabprefix} onChange={e => updateGroup(activeGroup._id, { tabprefix: e.target.value })} spellCheck={false} />
                    </Field>
                    <Field label={t('tab.tabsuffix')}>
                      <input className={inputCls} value={activeGroup.tabsuffix} onChange={e => updateGroup(activeGroup._id, { tabsuffix: e.target.value })} spellCheck={false} />
                    </Field>
                    {mainTab === 'tablist' && (
                      <Field label={t('tab.customtabname')}>
                        <input className={inputCls} value={activeGroup.customtabname} onChange={e => updateGroup(activeGroup._id, { customtabname: e.target.value })} spellCheck={false} />
                      </Field>
                    )}
                    {mainTab === 'nametags' && (
                      <>
                        <Field label={t('tab.tagprefix')}>
                          <input className={inputCls} value={activeGroup.tagprefix} onChange={e => updateGroup(activeGroup._id, { tagprefix: e.target.value })} spellCheck={false} />
                        </Field>
                        <Field label={t('tab.tagsuffix')}>
                          <input className={inputCls} value={activeGroup.tagsuffix} onChange={e => updateGroup(activeGroup._id, { tagsuffix: e.target.value })} spellCheck={false} />
                        </Field>
                      </>
                    )}
                  </>
                )}
                {activeGroup.name !== '_DEFAULT_' && (
                  <button type="button" onClick={() => {
                    setState(prev => ({ ...prev, groups: prev.groups.filter(g => g._id !== activeGroup._id) }))
                    setActiveGroupId(null)
                  }} className={`${btnCls} self-start bg-red-500/10 border-red-500/20 text-red-300`}>
                    <TrashIcon className="w-3.5 h-3.5" />{t('tab.delete')}
                  </button>
                )}
              </>
            )}
          </div>
        )

      case 'scoreboard':
        return (
          <div className="flex flex-col gap-3">
            <Toggle label={t('tab.enabled')} value={state.scoreboard.enabled} onChange={v => set({ scoreboard: { ...state.scoreboard, enabled: v } })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('tab.toggleCommand')}>
                <input className={inputWideCls} value={state.scoreboard.toggleCommand} onChange={e => set({ scoreboard: { ...state.scoreboard, toggleCommand: e.target.value } })} />
              </Field>
              <Field label={t('tab.delayOnJoin')}>
                <input type="number" className={inputWideCls} value={state.scoreboard.delayOnJoinMs} onChange={e => set({ scoreboard: { ...state.scoreboard, delayOnJoinMs: Number(e.target.value) || 0 } })} />
              </Field>
            </div>
            <Toggle label={t('tab.rememberToggle')} value={state.scoreboard.rememberToggleChoice} onChange={v => set({ scoreboard: { ...state.scoreboard, rememberToggleChoice: v } })} />
            <Toggle label={t('tab.hiddenByDefault')} value={state.scoreboard.hiddenByDefault} onChange={v => set({ scoreboard: { ...state.scoreboard, hiddenByDefault: v } })} />
            <div className="flex flex-wrap gap-1.5">
              {state.scoreboard.boards.map(b => (
                <button key={b._id} type="button" onClick={() => setActiveBoardId(b._id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border font-mono ${activeBoard?._id === b._id ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'border-white/[0.06] text-white/40'}`}>
                  {b.key}
                </button>
              ))}
              <button type="button" onClick={() => {
                const b = createScoreboard({ key: `board-${state.scoreboard.boards.length + 1}` })
                setState(prev => ({ ...prev, scoreboard: { ...prev.scoreboard, boards: [...prev.scoreboard.boards, b] } }))
                setActiveBoardId(b._id)
              }} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
                <PlusIcon className="w-3.5 h-3.5" />{t('tab.newBoard')}
              </button>
            </div>
            {activeBoard && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('tab.boardKey')}>
                    <input className={inputWideCls} value={activeBoard.key} onChange={e => updateBoard(activeBoard._id, { key: e.target.value.replace(/\s/g, '-') })} />
                  </Field>
                  <Field label={t('tab.displayCondition')}>
                    <input className={inputWideCls} value={activeBoard.displayCondition} onChange={e => updateBoard(activeBoard._id, { displayCondition: e.target.value })} />
                  </Field>
                </div>
                <Field label={t('tab.boardTitle')}>
                  <input className={inputCls} value={activeBoard.title} onChange={e => updateBoard(activeBoard._id, { title: e.target.value })} spellCheck={false} />
                </Field>
                <Field label={t('tab.boardLines')} hint={t('tab.oneLinePerRow')}>
                  <textarea className={`${inputCls} min-h-[160px] resize-y`} value={activeBoard.lines.join('\n')} onChange={e => updateBoard(activeBoard._id, { lines: e.target.value.split('\n') })} spellCheck={false} />
                </Field>
              </>
            )}
          </div>
        )

      case 'bossbar':
        return (
          <div className="flex flex-col gap-3">
            <Toggle label={t('tab.enabled')} value={state.bossbar.enabled} onChange={v => set({ bossbar: { ...state.bossbar, enabled: v } })} />
            <Field label={t('tab.toggleCommand')}>
              <input className={inputWideCls} value={state.bossbar.toggleCommand} onChange={e => set({ bossbar: { ...state.bossbar, toggleCommand: e.target.value } })} />
            </Field>
            <div className="flex flex-wrap gap-1.5">
              {state.bossbar.bars.map(b => (
                <button key={b._id} type="button" onClick={() => setActiveBarId(b._id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${activeBar?._id === b._id ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'border-white/[0.06] text-white/40'}`}>
                  {b.key}
                </button>
              ))}
              <button type="button" onClick={() => {
                const b = createBossBar({ key: `Bar${state.bossbar.bars.length + 1}` })
                setState(prev => ({ ...prev, bossbar: { ...prev.bossbar, bars: [...prev.bossbar.bars, b] } }))
                setActiveBarId(b._id)
              }} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
                <PlusIcon className="w-3.5 h-3.5" />{t('tab.newBossBar')}
              </button>
            </div>
            {activeBar && (
              <>
                <Field label={t('tab.barKey')}>
                  <input className={inputWideCls} value={activeBar.key} onChange={e => updateBar(activeBar._id, { key: e.target.value.replace(/\s/g, '') })} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <CustomDropdown label={t('tab.barStyle')} value={activeBar.style} onChange={v => updateBar(activeBar._id, { style: v })} options={BOSSBAR_STYLES} accent="indigo" />
                  <CustomDropdown label={t('tab.barColor')} value={activeBar.color} onChange={v => updateBar(activeBar._id, { color: v })} options={BOSSBAR_COLORS} accent="indigo" />
                </div>
                <Field label={t('tab.barProgress')}>
                  <input className={inputWideCls} value={activeBar.progress} onChange={e => updateBar(activeBar._id, { progress: e.target.value })} />
                </Field>
                <Field label={t('tab.barText')}>
                  <input className={inputCls} value={activeBar.text} onChange={e => updateBar(activeBar._id, { text: e.target.value })} spellCheck={false} />
                </Field>
              </>
            )}
          </div>
        )

      case 'general':
        return (
          <div className="flex flex-col gap-3">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{t('tab.playerlistObjective')}</p>
            <Toggle label={t('tab.enabled')} value={state.playerlistObjective.enabled} onChange={v => set({ playerlistObjective: { ...state.playerlistObjective, enabled: v } })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('tab.value')}><input className={inputCls} value={state.playerlistObjective.value} onChange={e => set({ playerlistObjective: { ...state.playerlistObjective, value: e.target.value } })} spellCheck={false} /></Field>
              <Field label={t('tab.fancyValue')}><input className={inputCls} value={state.playerlistObjective.fancyValue} onChange={e => set({ playerlistObjective: { ...state.playerlistObjective, fancyValue: e.target.value } })} spellCheck={false} /></Field>
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mt-2">{t('tab.belownameObjective')}</p>
            <Toggle label={t('tab.enabled')} value={state.belownameObjective.enabled} onChange={v => set({ belownameObjective: { ...state.belownameObjective, enabled: v } })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('tab.value')}><input className={inputCls} value={state.belownameObjective.value} onChange={e => set({ belownameObjective: { ...state.belownameObjective, value: e.target.value } })} spellCheck={false} /></Field>
              <Field label={t('tab.fancyValue')}><input className={inputCls} value={state.belownameObjective.fancyValue} onChange={e => set({ belownameObjective: { ...state.belownameObjective, fancyValue: e.target.value } })} spellCheck={false} /></Field>
            </div>
            <Field label={t('tab.objectiveTitle')}><input className={inputCls} value={state.belownameObjective.title} onChange={e => set({ belownameObjective: { ...state.belownameObjective, title: e.target.value } })} spellCheck={false} /></Field>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mt-2">{t('tab.placeholdersSection')}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('tab.dateFormat')}><input className={inputWideCls} value={state.placeholders.dateFormat} onChange={e => set({ placeholders: { ...state.placeholders, dateFormat: e.target.value } })} /></Field>
              <Field label={t('tab.timeFormat')}><input className={inputWideCls} value={state.placeholders.timeFormat} onChange={e => set({ placeholders: { ...state.placeholders, timeFormat: e.target.value } })} /></Field>
            </div>
            <Field label={t('tab.primaryGroups')} hint={t('tab.primaryGroupsHint')}>
              <textarea className={`${inputCls} min-h-[80px]`} value={state.primaryGroupFindingList.join('\n')} onChange={e => set({ primaryGroupFindingList: e.target.value.split('\n').filter(Boolean) })} spellCheck={false} />
            </Field>
            <Toggle label={t('tab.debug')} value={state.debug} onChange={v => set({ debug: v })} />
          </div>
        )

      case 'yaml':
        return (
          <div className="flex flex-col gap-3 h-full min-h-0">
            <div className="flex flex-wrap gap-2 items-center">
              <button type="button" onClick={() => setYamlView('config')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border ${yamlView === 'config' ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'border-white/[0.06] text-white/40'}`}>{t('tab.yamlConfig')}</button>
              <button type="button" onClick={() => setYamlView('groups')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border ${yamlView === 'groups' ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'border-white/[0.06] text-white/40'}`}>{t('tab.yamlGroups')}</button>
              <div className="flex-1" />
              <button type="button" onClick={() => handleCopy(yamlContent, 'yaml')} className={`${btnCls} bg-white/[0.03] border-white/[0.08] text-white/60`}>
                {copiedId === 'yaml' ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                {t('tab.copyYaml')}
              </button>
              <button type="button" onClick={() => downloadText(yamlContent, yamlView === 'config' ? 'config.yml' : 'groups.yml')} className={`${btnCls} bg-violet-500/10 border-violet-500/20 text-violet-300`}>
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('tab.downloadYaml')}
              </button>
            </div>
            <p className="text-[10px] text-white/30">{t('tab.reloadHint')}</p>
            <pre className="flex-1 min-h-[320px] overflow-auto custom-dropdown-scroll bg-[#0f0f1b] border border-white/[0.06] rounded-xl p-4 text-xs font-mono text-emerald-300/90 whitespace-pre-wrap">{yamlContent}</pre>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0 flex-wrap">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all" title={t('common.back')}>
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-violet-500/30 bg-violet-500/10 text-violet-300 font-semibold uppercase">{t('tab.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('tab.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('tab.subtitle')}</p>
        </div>
        <CustomDropdown label="" value="" onChange={loadPreset} options={presetDropdownOptions} placeholder={t('tab.applyPreset')} accent="indigo" className="w-44" />
        <Field label="">
          <input className="w-40 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-white/80 outline-none focus:border-violet-500/35" value={state.profileName} onChange={e => set({ profileName: e.target.value })} placeholder={t('tab.profileName')} />
        </Field>
      </div>

      <div className="flex gap-1 px-5 py-2 border-b border-white/[0.04] flex-shrink-0 overflow-x-auto scrollbar-thin">
        {MAIN_TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setMainTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border whitespace-nowrap transition-all ${
              mainTab === tab.id ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/70'
            }`}>
            {t(`tab.${tab.labelKey}`)}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 p-4 overflow-hidden">
        {mainTab === 'yaml' ? (
          <div className={`${sectionCls} h-full`}>{renderEditor()}</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 h-full min-h-0">
            <div className={`${sectionCls} min-h-0 overflow-y-auto custom-dropdown-scroll`}>{renderEditor()}</div>
            <TabPreviewPanel t={t} state={state} activeDesign={activeDesign} activeBoard={activeBoard} activeBar={activeBar} editorTab={mainTab} />
          </div>
        )}
      </div>
    </div>
  )
}
