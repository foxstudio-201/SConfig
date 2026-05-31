export default function AppLogo({ size = 'sm', framed = false, className = '' }) {
  const px = size === 'lg' ? 72 : size === 'md' ? 40 : 20
  const svg = (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: px, height: px }}
    >
      <div
        className="absolute inset-0 rounded-full bg-indigo-500/30 blur-md logo-glow"
        aria-hidden
      />
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-[0_0_6px_rgba(129,140,248,0.45)]"
        aria-hidden
      >
        <g className="logo-file-bob" style={{ transformOrigin: '16px 16px' }}>
          <path
            d="M8 4.5C8 3.67 8.67 3 9.5 3h8.79c.53 0 1.04.21 1.41.59l3.21 3.21c.38.37.59.88.59 1.41V25.5c0 .83-.67 1.5-1.5 1.5h-12A1.5 1.5 0 0 1 8 25.5V4.5Z"
            fill="url(#logo-file-grad)"
            stroke="#a5b4fc"
            strokeWidth="1.2"
          />
          <path
            d="M18.29 3.59A1 1 0 0 1 19 3h.5v5.5H25a1 1 0 0 1-.59.29l-6.12-6.12Z"
            fill="#6366f1"
            stroke="#818cf8"
            strokeWidth="0.8"
          />
          <rect x="10.5" y="12" width="9" height="1.2" rx="0.6" fill="#c7d2fe" className="logo-line-1" opacity="0.85" />
          <rect x="10.5" y="15.2" width="7" height="1.2" rx="0.6" fill="#a5b4fc" className="logo-line-2" opacity="0.65" />
          <rect x="10.5" y="18.4" width="8.5" height="1.2" rx="0.6" fill="#818cf8" className="logo-line-3" opacity="0.5" />
        </g>

        <g className="logo-wrench" style={{ transformOrigin: '23px 23px' }}>
          <g transform="translate(23 23) rotate(-42)">
            <circle
              cx="0"
              cy="-6.2"
              r="3.6"
              fill="#eef2ff"
              stroke="#a5b4fc"
              strokeWidth="1.15"
            />
            <circle cx="0" cy="-6.2" r="1.45" fill="#4338ca" stroke="#6366f1" strokeWidth="0.6" />

            <rect
              x="-1.35"
              y="-3.2"
              width="2.7"
              height="8.8"
              rx="1.1"
              fill="#eef2ff"
              stroke="#a5b4fc"
              strokeWidth="1.05"
            />

            <path
              d="M-3.35 5.55 0 2.05 3.35 5.55 2.45 6.35 0.85 4.35 -0.85 4.35 -2.45 6.35 Z"
              fill="#eef2ff"
              stroke="#a5b4fc"
              strokeWidth="1.05"
              strokeLinejoin="round"
            />
            <path
              d="M-1.05 2.35 H1.05"
              stroke="#6366f1"
              strokeWidth="0.85"
              strokeLinecap="round"
            />

            <circle cx="0" cy="-6.2" r="0.55" fill="#c7d2fe" className="logo-spark" />
          </g>
        </g>

        <defs>
          <linearGradient id="logo-file-grad" x1="8" y1="3" x2="22" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="#312e81" />
            <stop offset="1" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )

  if (!framed) return svg

  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/10 flex items-center justify-center relative overflow-hidden shadow-lg shadow-indigo-500/20 border border-indigo-500/15">
      {svg}
    </div>
  )
}
