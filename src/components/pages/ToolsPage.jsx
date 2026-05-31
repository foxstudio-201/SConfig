import { useState } from 'react'
import { useI18n } from '../../context/I18nContext'
import {
  CheckCircleIcon,
  SwatchIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  SparklesIcon,
  RectangleStackIcon,
  CommandLineIcon,
  UserGroupIcon,
  MapIcon,
  BoltIcon,
  ShoppingBagIcon,
  CubeIcon,
  TableCellsIcon,
  BanknotesIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'

import PixelRankTool     from '../tools/pixelrank/PixelRankTool'
import ColorPreviewTool  from '../tools/colorpreview/ColorPreviewTool'
import YamlValidatorTool from '../tools/yamlvalidator/YamlValidatorTool'
import GlyphTool         from '../tools/glyph/GlyphTool'
import MMOItemsTool            from '../tools/mmoitem/MMOItemsTool'
import MMOCoreTool             from '../tools/mmocore/MMOCoreTool'
import CoreProtectTool         from '../tools/coreprotect/CoreProtectTool'
import MythicMobsTool           from '../tools/mythicmob/MythicMobsTool'
import GrimAnticheatTool       from '../tools/grimanticheat/GrimAnticheatTool'
import VulcanAnticheatTool     from '../tools/vulcan/VulcanAnticheatTool'
import PermissionBuilderTool   from '../tools/luckprems/PermissionBuilderTool'
import BedrockPackConverterTool from '../tools/converter/BedrockPackConverterTool'
import PlaceholderApiTool from '../tools/placeholder/PlaceholderApiTool'
import TabConfigTool from '../tools/tab/TabConfigTool'

// ── Tool registry ─────────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: 'pixel-rank',
    i18nKey: 'pixelRank',
    name: 'Pixel Rank Generator',
    desc: 'Pixel-art rank labels with icons, gradients, borders and PNG export.',
    icon: SparklesIcon,
    gradient: 'from-indigo-600/25 via-violet-600/15 to-transparent',
    border: 'border-indigo-500/25 hover:border-indigo-400/50',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-300',
    tag: 'Resource Pack',
    tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    component: PixelRankTool,
  },
  {
    id: 'color-preview',
    i18nKey: 'colorPreview',
    name: 'Color Code Preview',
    desc: 'Preview Minecraft &a color codes and formatting in real time.',
    icon: SwatchIcon,
    gradient: 'from-amber-600/25 via-orange-600/15 to-transparent',
    border: 'border-amber-500/25 hover:border-amber-400/50',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-300',
    tag: 'Text',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    component: ColorPreviewTool,
  },
  {
    id: 'yaml-validator',
    i18nKey: 'yamlValidator',
    name: 'YAML Validator',
    desc: 'Monaco editor, live validation, line highlights and plugin config checks.',
    icon: CheckCircleIcon,
    gradient: 'from-emerald-600/25 via-green-600/15 to-transparent',
    border: 'border-emerald-500/25 hover:border-emerald-400/50',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-300',
    tag: 'Config',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    component: YamlValidatorTool,
  },
  {
    id: 'mmoitems-builder',
    i18nKey: 'mmoitemsBuilder',
    name: 'MMOItems Item Builder',
    desc: 'Create MMOItems templates with stats, abilities, modifiers, elements and YAML export.',
    icon: SparklesIcon,
    gradient: 'from-rose-600/25 via-pink-600/15 to-transparent',
    border: 'border-rose-500/25 hover:border-rose-400/50',
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-300',
    tag: 'MMOItems',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    component: MMOItemsTool,
  },
  {
    id: 'mmocore-builder',
    i18nKey: 'mmocoreBuilder',
    name: 'MMOCore Builder',
    desc: 'Create MMOCore classes & professions with skills, stats, exp sources and YAML export.',
    icon: SparklesIcon,
    gradient: 'from-orange-600/25 via-amber-600/15 to-transparent',
    border: 'border-orange-500/25 hover:border-orange-400/50',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-300',
    tag: 'MMOCore',
    tagColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    component: MMOCoreTool,
  },
  {
    id: 'coreprotect-builder',
    i18nKey: 'coreprotectBuilder',
    name: 'CoreProtect Builder',
    desc: 'Configure logging, MySQL, per-world overrides, blacklist.txt and rollback commands.',
    icon: ShieldCheckIcon,
    gradient: 'from-teal-600/25 via-cyan-600/15 to-transparent',
    border: 'border-teal-500/25 hover:border-teal-400/50',
    iconBg: 'bg-teal-500/20',
    iconColor: 'text-teal-300',
    tag: 'CoreProtect',
    tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    component: CoreProtectTool,
  },
  {
    id: 'glyph-browser',
    i18nKey: 'glyphBrowser',
    name: 'Glyph Browser',
    desc: 'Browse & copy Minecraft Bedrock glyph characters (U+E100–U+E1FF).',
    icon: SwatchIcon,
    gradient: 'from-cyan-600/25 via-teal-600/15 to-transparent',
    border: 'border-cyan-500/25 hover:border-cyan-400/50',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-300',
    tag: 'Bedrock',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    component: GlyphTool,
  },
  {
    id: 'mythicmobs-builder',
    i18nKey: 'mythicmobsBuilder',
    name: 'MythicMobs Builder',
    desc: 'Create custom mobs & skills with equipment, drops, boss bar and YAML export.',
    icon: SparklesIcon,
    gradient: 'from-red-600/25 via-rose-600/15 to-transparent',
    border: 'border-red-500/25 hover:border-red-400/50',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-300',
    tag: 'MythicMobs',
    tagColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    component: MythicMobsTool,
  },
  {
    id: 'vulcan-anticheat',
    i18nKey: 'vulcanAnticheat',
    name: 'Vulcan Anticheat',
    desc: 'Configure Vulcan config.yml with shield-matrix UI, checks catalog & YAML export.',
    icon: ShieldCheckIcon,
    gradient: 'from-orange-600/25 via-amber-600/15 to-transparent',
    border: 'border-orange-500/25 hover:border-orange-400/50',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-300',
    tag: 'Vulcan',
    tagColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    component: VulcanAnticheatTool,
  },
  {
    id: 'grim-anticheat',
    i18nKey: 'grimAnticheat',
    name: 'Grim Anticheat',
    desc: 'Configure Grim config.yml & punishments.yml with live chip signal UI and YAML export.',
    icon: ShieldCheckIcon,
    gradient: 'from-cyan-600/25 via-sky-600/15 to-transparent',
    border: 'border-cyan-500/25 hover:border-cyan-400/50',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-300',
    tag: 'GrimAC',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    component: GrimAnticheatTool,
  },
  {
    id: 'bedrock-pack-converter',
    i18nKey: 'bedrockPackConverter',
    name: 'Bedrock Pack Converter',
    desc: 'Convert Java / ItemsAdder / Oraxen packs toward Bedrock — custom pack icon, scan & .mcpack export.',
    icon: SparklesIcon,
    gradient: 'from-sky-600/25 via-blue-600/15 to-transparent',
    border: 'border-sky-500/25 hover:border-sky-400/50',
    iconBg: 'bg-sky-500/20',
    iconColor: 'text-sky-300',
    tag: 'Bedrock',
    tagColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    component: BedrockPackConverterTool,
  },
  {
    id: 'permission-builder',
    i18nKey: 'permissionBuilder',
    name: 'Permission Builder',
    desc: 'Build LuckPerms groups with presets, export YAML/commands and sync via REST API.',
    icon: ShieldCheckIcon,
    gradient: 'from-violet-600/25 via-purple-600/15 to-transparent',
    border: 'border-violet-500/25 hover:border-violet-400/50',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-300',
    tag: 'Permissions',
    tagColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    component: PermissionBuilderTool,
  },
  {
    id: 'placeholderapi',
    i18nKey: 'placeholderApi',
    name: 'PlaceholderAPI Helper',
    desc: 'Browse placeholders, simulate expansion outcomes, and verify formatting.',
    icon: CommandLineIcon,
    gradient: 'from-slate-600/25 via-zinc-600/15 to-transparent',
    border: 'border-white/[0.08] hover:border-white/20',
    iconBg: 'bg-white/[0.06]',
    iconColor: 'text-white/70',
    tag: 'PlaceholderAPI',
    tagColor: 'bg-white/[0.08] text-white/70 border-white/[0.1]',
    component: PlaceholderApiTool,
  },
  {
    id: 'tab-config-builder',
    i18nKey: 'tabConfigBuilder',
    name: 'TAB Config Builder',
    desc: 'Header, footer, tablist, nametags, scoreboard & YAML export with live preview.',
    icon: TableCellsIcon,
    gradient: 'from-violet-600/25 via-purple-600/15 to-transparent',
    border: 'border-violet-500/25 hover:border-violet-400/50',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-300',
    tag: 'TAB',
    tagColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    component: TabConfigTool,
  },
]

// ── Coming soon (placeholder cards) ───────────────────────────────────────────
const COMING_SOON = [
  {
    id: 'deluxe-menus',
    i18nKey: 'deluxeMenus',
    icon: RectangleStackIcon,
    gradient: 'from-fuchsia-600/15 via-purple-600/10 to-transparent',
    border: 'border-fuchsia-500/15',
    iconBg: 'bg-fuchsia-500/10',
    iconColor: 'text-fuchsia-300/50',
    tagColor: 'bg-fuchsia-500/10 text-fuchsia-300/50 border-fuchsia-500/20',
  },
  {
    id: 'citizens',
    i18nKey: 'citizens',
    icon: UserGroupIcon,
    gradient: 'from-lime-600/15 via-green-600/10 to-transparent',
    border: 'border-lime-500/15',
    iconBg: 'bg-lime-500/10',
    iconColor: 'text-lime-300/50',
    tagColor: 'bg-lime-500/10 text-lime-300/50 border-lime-500/20',
  },
  {
    id: 'worldguard',
    i18nKey: 'worldGuard',
    icon: MapIcon,
    gradient: 'from-blue-600/15 via-indigo-600/10 to-transparent',
    border: 'border-blue-500/15',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-300/50',
    tagColor: 'bg-blue-500/10 text-blue-300/50 border-blue-500/20',
  },
  {
    id: 'essentials',
    i18nKey: 'essentials',
    icon: BoltIcon,
    gradient: 'from-yellow-600/15 via-amber-600/10 to-transparent',
    border: 'border-amber-500/15',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-300/50',
    tagColor: 'bg-amber-500/10 text-amber-300/50 border-amber-500/20',
  },
  {
    id: 'shopguiplus',
    i18nKey: 'shopGuiPlus',
    icon: ShoppingBagIcon,
    gradient: 'from-emerald-600/15 via-teal-600/10 to-transparent',
    border: 'border-emerald-500/15',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-300/50',
    tagColor: 'bg-emerald-500/10 text-emerald-300/50 border-emerald-500/20',
  },
  {
    id: 'itemsadder',
    i18nKey: 'itemsAdder',
    icon: CubeIcon,
    gradient: 'from-pink-600/15 via-rose-600/10 to-transparent',
    border: 'border-pink-500/15',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-300/50',
    tagColor: 'bg-pink-500/10 text-pink-300/50 border-pink-500/20',
  },
  {
    id: 'chestshop',
    i18nKey: 'chestShop',
    icon: BanknotesIcon,
    gradient: 'from-orange-600/15 via-red-600/10 to-transparent',
    border: 'border-orange-500/15',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-300/50',
    tagColor: 'bg-orange-500/10 text-orange-300/50 border-orange-500/20',
  },
  {
    id: 'oraxen',
    i18nKey: 'oraxen',
    icon: SparklesIcon,
    gradient: 'from-cyan-600/15 via-sky-600/10 to-transparent',
    border: 'border-cyan-500/15',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-300/50',
    tagColor: 'bg-cyan-500/10 text-cyan-300/50 border-cyan-500/20',
  },
  {
    id: 'vault',
    i18nKey: 'vault',
    icon: CheckCircleIcon,
    gradient: 'from-yellow-600/15 via-amber-600/10 to-transparent',
    border: 'border-amber-500/15',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-300/50',
    tagColor: 'bg-amber-500/10 text-amber-300/50 border-amber-500/20',
  },
]

const GRID_CLS = 'grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3'

// ── Tool card (square grid tile) ──────────────────────────────────────────────
function ToolCard({ tool, onOpen, translate }) {
  const { i18nKey, icon: Icon, gradient, border, iconBg, iconColor, tagColor } = tool
  const base = i18nKey ? `toolsPage.items.${i18nKey}` : null
  const name = base ? translate(`${base}.name`) : tool.name
  const desc = base ? translate(`${base}.desc`) : tool.desc
  const tag = base ? translate(`${base}.tag`) : tool.tag

  return (
    <button
      type="button"
      onClick={() => onOpen(tool)}
      className={`
        group relative aspect-square w-full rounded-2xl
        bg-gradient-to-br ${gradient}
        border ${border}
        p-4 flex flex-col items-center justify-between text-center
        transition-all duration-150
        hover:brightness-110 active:scale-[0.98] cursor-pointer
      `}
    >
      <ChevronRightIcon
        className="absolute top-3 right-3 w-4 h-4 text-white/15 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all"
        aria-hidden
      />

      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 mt-1`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>

      <div className="flex flex-col items-center gap-1.5 w-full min-w-0 flex-1 justify-end">
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold leading-none ${tagColor}`}>
          {tag}
        </span>
        <span className="text-sm font-semibold text-white/90 leading-tight line-clamp-2 w-full px-0.5">
          {name}
        </span>
        <p className="text-[11px] text-white/35 leading-snug line-clamp-2 w-full">
          {desc}
        </p>
      </div>
    </button>
  )
}

function ComingSoonCard({ tool, translate }) {
  const { i18nKey, icon: Icon, gradient, border, iconBg, iconColor, tagColor } = tool
  const base = `toolsPage.soon.${i18nKey}`
  const name = translate(`${base}.name`)
  const desc = translate(`${base}.desc`)
  const tag = translate(`${base}.tag`)
  const soonLabel = translate('toolsPage.soonBadge')

  return (
    <div
      className={`
        relative aspect-square w-full rounded-2xl
        bg-gradient-to-br ${gradient}
        border ${border}
        p-4 flex flex-col items-center justify-between text-center
        opacity-55 select-none
      `}
      aria-disabled
    >
      <span className="absolute top-3 left-3 text-[9px] px-1.5 py-0.5 rounded-md border border-white/10 bg-black/30 text-white/40 font-semibold uppercase tracking-wide">
        {soonLabel}
      </span>
      <LockClosedIcon className="absolute top-3 right-3 w-3.5 h-3.5 text-white/15" aria-hidden />

      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 mt-1`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>

      <div className="flex flex-col items-center gap-1.5 w-full min-w-0 flex-1 justify-end">
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold leading-none ${tagColor}`}>
          {tag}
        </span>
        <span className="text-sm font-semibold text-white/50 leading-tight line-clamp-2 w-full px-0.5">
          {name}
        </span>
        <p className="text-[11px] text-white/25 leading-snug line-clamp-2 w-full">
          {desc}
        </p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ToolsPage() {
  const { t } = useI18n()
  const [activeTool, setActiveTool] = useState(null)

  if (activeTool) {
    const ToolComponent = activeTool.component
    return <ToolComponent onBack={() => setActiveTool(null)} />
  }

  const available = TOOLS.filter(tool => tool.component)

  return (
    <div className="flex-1 overflow-y-auto p-5 animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">{t('toolsPage.title')}</h1>
        <p className="text-xs text-white/35 mt-0.5">{t('toolsPage.subtitle')}</p>
      </div>

      <div className={GRID_CLS}>
        {available.map(tool => (
          <ToolCard key={tool.id} tool={tool} onOpen={setActiveTool} translate={t} />
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <div className="mb-4">
          <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">
            {t('toolsPage.comingSoon')}
          </p>
          <p className="text-xs text-white/30 mt-1">{t('toolsPage.comingSoonDesc')}</p>
        </div>
        <div className={GRID_CLS}>
          {COMING_SOON.map(tool => (
            <ComingSoonCard key={tool.id} tool={tool} translate={t} />
          ))}
        </div>
      </div>
    </div>
  )
}
