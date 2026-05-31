import { useI18n } from '../../context/I18nContext'
import qrImage from '../../assets/qr/qr.png'
import {
  HeartIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'

const LINKS = [
  {
    id: 'facebook',
    href: 'https://www.facebook.com/foxstudio201',
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    accent: 'from-blue-600/30 via-blue-500/10 to-transparent',
    border: 'border-blue-500/25 hover:border-blue-400/50',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-300',
  },
  {
    id: 'discord',
    href: 'https://join.foxstudio.site',
    icon: ChatBubbleLeftRightIcon,
    accent: 'from-indigo-600/30 via-violet-600/10 to-transparent',
    border: 'border-indigo-500/25 hover:border-indigo-400/50',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-300',
  },
  {
    id: 'website',
    href: 'https://sconfig.vercel.app',
    icon: GlobeAltIcon,
    accent: 'from-violet-600/30 via-purple-600/10 to-transparent',
    border: 'border-violet-500/25 hover:border-violet-400/50',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-300',
  },
]

function openLink(url) {
  if (window.sconfigAPI?.openExternal) {
    window.sconfigAPI.openExternal(url)
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

function LinkCard({ link, label, value, hint }) {
  const Icon = link.icon
  return (
    <button
      type="button"
      onClick={() => openLink(link.href)}
      className={`
        group relative flex flex-col gap-3 p-4 rounded-2xl text-left w-full
        bg-gradient-to-br ${link.accent}
        border ${link.border}
        transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30
        active:scale-[0.99]
      `}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${link.iconBg}`}>
          <Icon className={`w-5 h-5 ${link.iconColor}`} />
        </div>
        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">{label}</p>
        <p className="text-sm font-bold text-white/90 mt-0.5 truncate">{value}</p>
        {hint && <p className="text-[11px] text-white/35 mt-1 line-clamp-2">{hint}</p>}
      </div>
    </button>
  )
}

export default function DonatePage() {
  const { t } = useI18n()

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/25 mb-4">
            <HeartIcon className="w-6 h-6 text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('donate.title')}</h1>
          <p className="text-sm text-white/40 mt-2 max-w-md leading-relaxed">{t('donate.subtitle')}</p>
        </div>

        <div className="relative w-full max-w-sm mb-8">
          <div
            className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-rose-500/40 via-indigo-500/30 to-violet-500/40 blur-xl opacity-60"
            aria-hidden
          />
          <div className="relative rounded-[24px] p-[1px] bg-gradient-to-br from-rose-400/50 via-white/20 to-indigo-400/50">
            <div className="rounded-[23px] bg-[#0c0c14]/95 backdrop-blur-xl px-6 py-8 flex flex-col items-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35 mb-5">
                {t('donate.qrCaption')}
              </p>
              <div className="relative p-3 rounded-2xl bg-white shadow-2xl shadow-black/50 ring-1 ring-white/10">
                <img
                  src={qrImage}
                  alt={t('donate.qrAlt')}
                  className="w-52 h-52 object-contain rounded-lg"
                  draggable={false}
                />
              </div>
              <p className="text-xs text-white/45 mt-5 text-center leading-relaxed max-w-[240px]">
                {t('donate.qrHint')}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-4 w-full text-center">
          {t('donate.connectTitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          {LINKS.map(link => (
            <LinkCard
              key={link.id}
              link={link}
              label={t(`donate.${link.id}Label`)}
              value={t(`donate.${link.id}Value`)}
              hint={t(`donate.${link.id}Hint`)}
            />
          ))}
        </div>

        <p className="text-[11px] text-white/25 mt-8 text-center max-w-md leading-relaxed">
          {t('donate.thanks')}
        </p>
      </div>
    </div>
  )
}
