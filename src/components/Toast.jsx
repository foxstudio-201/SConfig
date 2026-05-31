export default function Toast({ toast, visible, onDismiss }) {
  if (!toast) return null

  const colors = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error:   'border-red-500/30 bg-red-500/10 text-red-300',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    info:    'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
  }
  const barColors = {
    success: 'bg-emerald-400',
    error:   'bg-red-400',
    warning: 'bg-amber-400',
    info:    'bg-indigo-400',
  }

  const type = toast.type || 'info'

  return (
    <div
      className={`
        fixed bottom-5 right-5 z-[9999] min-w-[260px] max-w-[360px]
        rounded-xl border backdrop-blur-md overflow-hidden
        shadow-2xl shadow-black/50
        transition-all duration-300
        ${colors[type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}
      `}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
        <button onClick={onDismiss} className="text-white/30 hover:text-white/70 transition-colors mt-0.5 flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      {visible && (
        <div className={`h-[2px] ${barColors[type]} animate-toast-bar`} />
      )}
    </div>
  )
}
