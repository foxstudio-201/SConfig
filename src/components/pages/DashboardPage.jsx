import { useState, useEffect, useCallback } from 'react'
import { storeGet, storeSet } from '../../hooks/useStore'
import { useWhatsNewModal } from '../../hooks/useWhatsNewModal'
import { useI18n } from '../../context/I18nContext'
import WhatsNewModal from '../WhatsNewModal'
import {
  ServerStackIcon,
  WrenchScrewdriverIcon,
  FolderOpenIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  SwatchIcon,
  ShieldCheckIcon,
  RectangleStackIcon,
  CommandLineIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  TableCellsIcon,
  CheckBadgeIcon,
  CubeIcon,
  GiftIcon,
} from '@heroicons/react/24/outline'

// ── Tool metadata map (id → display info) ─────────────────────────────────────
const TOOL_META = {
  'pixel-rank':           { name: 'Pixel Rank Generator',    icon: SparklesIcon,          iconBg: 'bg-indigo-500/20',  iconColor: 'text-indigo-300',  tag: 'Resource Pack', tagColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25' },
  'color-preview':        { name: 'Color Code Preview',      icon: SwatchIcon,             iconBg: 'bg-amber-500/20',   iconColor: 'text-amber-300',   tag: 'Text',          tagColor: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
  'yaml-validator':       { name: 'YAML Validator',          icon: CheckCircleIcon,        iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-300', tag: 'Config',        tagColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  'mmoitems-builder':     { name: 'MMOItems Builder',        icon: SparklesIcon,           iconBg: 'bg-rose-500/20',    iconColor: 'text-rose-300',    tag: 'MMOItems',      tagColor: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  'mmocore-builder':      { name: 'MMOCore Builder',         icon: SparklesIcon,           iconBg: 'bg-orange-500/20',  iconColor: 'text-orange-300',  tag: 'MMOCore',       tagColor: 'bg-orange-500/15 text-orange-300 border-orange-500/25' },
  'coreprotect-builder':  { name: 'CoreProtect Builder',     icon: ShieldCheckIcon,        iconBg: 'bg-teal-500/20',    iconColor: 'text-teal-300',    tag: 'CoreProtect',   tagColor: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
  'glyph-browser':        { name: 'Glyph Browser',           icon: SwatchIcon,             iconBg: 'bg-cyan-500/20',    iconColor: 'text-cyan-300',    tag: 'Bedrock',       tagColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
  'mythicmobs-builder':   { name: 'MythicMobs Builder',      icon: SparklesIcon,           iconBg: 'bg-red-500/20',     iconColor: 'text-red-300',     tag: 'MythicMobs',    tagColor: 'bg-red-500/15 text-red-300 border-red-500/25' },
  'vulcan-anticheat':     { name: 'Vulcan Anticheat',        icon: ShieldCheckIcon,        iconBg: 'bg-orange-500/20',  iconColor: 'text-orange-300',  tag: 'Vulcan',        tagColor: 'bg-orange-500/15 text-orange-300 border-orange-500/25' },
  'grim-anticheat':       { name: 'Grim Anticheat',          icon: ShieldCheckIcon,        iconBg: 'bg-cyan-500/20',    iconColor: 'text-cyan-300',    tag: 'GrimAC',        tagColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
  'lpx-anticheat':        { name: 'LPX AntiPacketExploit',   icon: ShieldCheckIcon,        iconBg: 'bg-violet-500/20',  iconColor: 'text-violet-300',  tag: 'LPX',           tagColor: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  'smart-spawner':        { name: 'SmartSpawner Builder',    icon: SparklesIcon,           iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-300', tag: 'SmartSpawner',  tagColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  'totem-guard':          { name: 'TotemGuard Builder',      icon: ShieldCheckIcon,        iconBg: 'bg-sky-500/20',     iconColor: 'text-sky-300',     tag: 'TotemGuard',    tagColor: 'bg-sky-500/15 text-sky-300 border-sky-500/25' },
  'exploit-fixer':        { name: 'ExploitFixer Builder',    icon: ShieldCheckIcon,        iconBg: 'bg-cyan-500/20',    iconColor: 'text-cyan-300',    tag: 'ExploitFixer',  tagColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
  'skript-builder':       { name: 'Skript Script Builder',   icon: CommandLineIcon,        iconBg: 'bg-violet-500/20',  iconColor: 'text-violet-300',  tag: 'Skript',        tagColor: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  'bedrock-pack-converter':{ name: 'Bedrock Pack Converter', icon: CubeIcon,               iconBg: 'bg-sky-500/20',     iconColor: 'text-sky-300',     tag: 'Bedrock',       tagColor: 'bg-sky-500/15 text-sky-300 border-sky-500/25' },
  'permission-builder':   { name: 'Permission Builder',      icon: ShieldCheckIcon,        iconBg: 'bg-violet-500/20',  iconColor: 'text-violet-300',  tag: 'LuckPerms',     tagColor: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  'placeholderapi':       { name: 'PlaceholderAPI Helper',   icon: CommandLineIcon,        iconBg: 'bg-white/[0.08]',   iconColor: 'text-white/60',    tag: 'PAPI',          tagColor: 'bg-white/[0.06] text-white/50 border-white/[0.1]' },
  'tab-config-builder':   { name: 'TAB Config Builder',      icon: TableCellsIcon,         iconBg: 'bg-violet-500/20',  iconColor: 'text-violet-300',  tag: 'TAB',           tagColor: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  'deluxe-menus':         { name: 'DeluxeMenus Builder',     icon: RectangleStackIcon,     iconBg: 'bg-fuchsia-500/20', iconColor: 'text-fuchsia-300', tag: 'DeluxeMenus',   tagColor: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25' },
  'citizens':             { name: 'Citizens NPC Builder',    icon: UserGroupIcon,          iconBg: 'bg-lime-500/20',    iconColor: 'text-lime-300',    tag: 'Citizens',      tagColor: 'bg-lime-500/15 text-lime-300 border-lime-500/25' },
  'shopguiplus':          { name: 'ShopGUI+ Builder',        icon: ShoppingBagIcon,        iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-300', tag: 'ShopGUI+',      tagColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  'shopkeeper':           { name: 'Shopkeepers Builder',     icon: BanknotesIcon,          iconBg: 'bg-amber-500/20',   iconColor: 'text-amber-300',   tag: 'Shopkeepers',   tagColor: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
  'excellent-crates':     { name: 'ExcellentCrates Builder', icon: GiftIcon,               iconBg: 'bg-amber-500/20',   iconColor: 'text-amber-300',   tag: 'ExcellentCrates', tagColor: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
  'advanced-enchantments': { name: 'Advanced Enchantments',  icon: SparklesIcon,           iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-300', tag: 'AE',             tagColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
}

// ── Persist recent tools to store ─────────────────────────────────────────────
const RECENT_KEY = 'recentTools'
const MAX_RECENT = 8

export function recordToolUsage(toolId) {
  storeGet(RECENT_KEY).then(list => {
    const arr = Array.isArray(list) ? list : []
    const filtered = arr.filter(id => id !== toolId)
    const next = [toolId, ...filtered].slice(0, MAX_RECENT)
    storeSet(RECENT_KEY, next)
  })
}

// ── Hero card — top 3 most used tools ─────────────────────────────────────────
function HeroCard({ recentTools, onOpenTool }) {
  const { t } = useI18n()
  // Top 3 from recent (first = most recent = most used proxy until API available)
  const top = recentTools.slice(0, 3)

  if (top.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent border border-indigo-500/15 p-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <FireIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">{t('dashboard.heroTitle')}</span>
        </div>
        <p className="text-sm text-white/30">{t('dashboard.heroEmpty')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent border border-indigo-500/15 p-5 mb-5">
      <div className="flex items-center gap-2 mb-4">
        <FireIcon className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">{t('dashboard.heroTitle')}</span>
        <span className="ml-auto text-[10px] text-white/20">{t('dashboard.heroSoon')}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {top.map((id, idx) => {
          const meta = TOOL_META[id]
          if (!meta) return null
          const Icon = meta.icon
          return (
            <button
              key={id}
              onClick={() => onOpenTool(id)}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-indigo-500/25 transition-all text-center"
            >
              <div className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${meta.iconColor}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/80 leading-tight line-clamp-2">{meta.name}</p>
                <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded border font-semibold ${meta.tagColor}`}>{meta.tag}</span>
              </div>
              {idx === 0 && (
                <span className="text-[9px] text-indigo-400/70 font-semibold">#1</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Recent tools panel ────────────────────────────────────────────────────────
function RecentToolsPanel({ recentTools, onOpenTool }) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <ClockIcon className="w-3.5 h-3.5 text-white/30" />
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest">{t('dashboard.recentTools')}</h2>
      </div>

      {recentTools.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-center">
          <WrenchScrewdriverIcon className="w-8 h-8 text-white/10" />
          <p className="text-xs text-white/25">{t('dashboard.recentEmpty')}</p>
          <p className="text-[11px] text-white/15">{t('dashboard.recentEmptyHint')}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-1.5 pr-0.5" style={{ maxHeight: 320 }}>
          {recentTools.map(id => {
            const meta = TOOL_META[id]
            if (!meta) return null
            const Icon = meta.icon
            return (
              <button
                key={id}
                onClick={() => onOpenTool(id)}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-left flex-shrink-0"
              >
                <div className={`w-8 h-8 rounded-lg ${meta.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/80 truncate">{meta.name}</p>
                  <span className={`inline-block mt-0.5 text-[9px] px-1 py-0.5 rounded border font-semibold ${meta.tagColor}`}>{meta.tag}</span>
                </div>
                <ArrowRightIcon className="w-3.5 h-3.5 text-white/15 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Quick actions panel ───────────────────────────────────────────────────────
function QuickActionsPanel({ onNavigate }) {
  const { t } = useI18n()

  const actions = [
    {
      icon: ServerStackIcon,
      label: t('dashboard.actionServers'),
      desc: t('dashboard.actionServersDesc'),
      onClick: () => onNavigate('servers'),
      accent: 'bg-indigo-500/15 text-indigo-400',
    },
    {
      icon: WrenchScrewdriverIcon,
      label: t('dashboard.actionTools'),
      desc: t('dashboard.actionToolsDesc'),
      onClick: () => onNavigate('tools'),
      accent: 'bg-violet-500/15 text-violet-400',
    },
    {
      icon: FolderOpenIcon,
      label: t('dashboard.actionFiles'),
      desc: t('dashboard.actionFilesDesc'),
      onClick: () => onNavigate('files'),
      accent: 'bg-blue-500/15 text-blue-400',
    },
  ]

  return (
    <div className="flex flex-col min-h-0">
      <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">{t('dashboard.quickActions')}</h2>
      <div className="flex flex-col gap-2">
        {actions.map(({ icon: Icon, label, desc, onClick, accent }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-indigo-500/20 transition-all group text-left"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white/90">{label}</p>
              <p className="text-xs text-white/35 mt-0.5">{desc}</p>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage({ onNavigate }) {
  const { t } = useI18n()
  const [serverPath, setServerPath] = useState(null)
  const [recentTools, setRecentTools] = useState([])
  const { visible: whatsNewOpen, dismiss: dismissWhatsNew } = useWhatsNewModal(true)

  useEffect(() => {
    storeGet('serverPath').then(p => setServerPath(p || null))
    storeGet(RECENT_KEY).then(list => setRecentTools(Array.isArray(list) ? list : []))
  }, [])

  const handleOpenTool = useCallback((toolId) => {
    onNavigate('tools', toolId || undefined)
  }, [onNavigate])

  const handleWhatsNewOpenTool = useCallback((toolId) => {
    dismissWhatsNew()
    onNavigate('tools', toolId || undefined)
  }, [dismissWhatsNew, onNavigate])

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      {whatsNewOpen && (
        <WhatsNewModal onClose={dismissWhatsNew} onOpenTool={handleWhatsNewOpenTool} />
      )}
      {/* Page title */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="text-sm text-white/40 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Server status banner */}
      {!serverPath ? (
        <div className="mb-5 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">{t('dashboard.noServerTitle')}</p>
            <p className="text-xs text-amber-400/60 mt-0.5">{t('dashboard.noServerDesc')}</p>
          </div>
          <button
            onClick={() => onNavigate('servers')}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25"
          >
            {t('dashboard.setup')}
          </button>
        </div>
      ) : (
        <div className="mb-5 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
          <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-300">{t('dashboard.serverConnected')}</p>
            <p className="text-xs text-emerald-400/50 mt-0.5 font-mono truncate">{serverPath}</p>
          </div>
        </div>
      )}

      {/* Hero card — most used tools */}
      <HeroCard recentTools={recentTools} onOpenTool={handleOpenTool} />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
        {/* Left — recent tools */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4">
          <RecentToolsPanel recentTools={recentTools} onOpenTool={handleOpenTool} />
        </div>

        {/* Right — quick actions */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4">
          <QuickActionsPanel onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  )
}
