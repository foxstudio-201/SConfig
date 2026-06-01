import AppLogo from './AppLogo'
import { useI18n } from '../context/I18nContext'
import {
  HomeIcon as HomeOutline,
  WrenchScrewdriverIcon as ToolOutline,
  ServerStackIcon as ServerOutline,
  FolderOpenIcon as FolderOutline,
  Cog6ToothIcon as CogOutline,
  GiftIcon as GiftOutline,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid,
  WrenchScrewdriverIcon as ToolSolid,
  ServerStackIcon as ServerSolid,
  FolderOpenIcon as FolderSolid,
  Cog6ToothIcon as CogSolid,
  GiftIcon as GiftSolid,
} from '@heroicons/react/24/solid'

const NAV = [
  { id: 'dashboard', labelKey: 'nav.dashboard', Outline: HomeOutline,   Solid: HomeSolid   },
  { id: 'tools',     labelKey: 'nav.tools',     Outline: ToolOutline,   Solid: ToolSolid   },
  { id: 'servers',   labelKey: 'nav.servers',   Outline: ServerOutline, Solid: ServerSolid },
  { id: 'files',     labelKey: 'nav.files',     Outline: FolderOutline, Solid: FolderSolid },
  { id: 'donate',    labelKey: 'nav.donate',    Outline: GiftOutline,   Solid: GiftSolid   },
]

const NAV_BOTTOM = [
  { id: 'settings', labelKey: 'nav.settings', Outline: CogOutline, Solid: CogSolid },
]

function NavButton({ id, labelKey, Outline, Solid, activePage, onNavigate, t }) {
  const isActive = activePage === id
  const Icon = isActive ? Solid : Outline
  const label = t(labelKey)
  return (
    <button
      key={id}
      onClick={() => onNavigate(id)}
      className={`
        relative w-full h-12 rounded-xl flex items-center justify-center
        transition-all duration-150 group
        ${isActive
          ? 'bg-indigo-500/15 text-indigo-400'
          : 'text-white/30 hover:text-white/70 hover:bg-white/[0.06]'
        }
      `}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-indigo-400 rounded-r-full" />
      )}
      <Icon className="w-6 h-6" />
      <span className="
        pointer-events-none absolute left-[calc(100%+10px)] px-2.5 py-1.5
        bg-[#13131f] border border-white/[0.08] rounded-lg
        text-white/80 text-[11px] font-semibold whitespace-nowrap
        shadow-2xl shadow-black/60
        opacity-0 group-hover:opacity-100
        -translate-x-2 group-hover:translate-x-0
        transition-all duration-150 z-[999]
      ">{label}</span>
    </button>
  )
}

export default function Sidebar({ activePage, onNavigate }) {
  const { t } = useI18n()

  return (
    <aside className="w-[68px] flex flex-col items-center py-4 bg-black/25 backdrop-blur-md border-r border-white/[0.05] z-50 overflow-visible">
      {/* Logo */}
      <div className="mb-4 mt-2 flex-shrink-0">
        <AppLogo size="md" framed />
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 flex-1 w-full px-2">
        {NAV.map((item) => (
          <NavButton key={item.id} {...item} activePage={activePage} onNavigate={onNavigate} t={t} />
        ))}
      </nav>

      {/* Divider + Settings — luôn cố định ở cuối */}
      <div className="w-full px-2 flex-shrink-0 mt-auto">
        <div className="w-full h-px bg-white/[0.07] mb-2" />
        <div className="flex flex-col gap-1">
          {NAV_BOTTOM.map((item) => (
            <NavButton key={item.id} {...item} activePage={activePage} onNavigate={onNavigate} t={t} />
          ))}
        </div>
      </div>
    </aside>
  )
}
