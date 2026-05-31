export default function AppBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#080810 0%,#0c0c1a 60%,#0a0818 100%)' }} />

      {/* Blue/violet orbs */}
      <div
        className="absolute rounded-full"
        style={{
          width: '55vw', height: '55vw',
          top: '-20vw', left: '-10vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          animation: 'bg-pulse-1 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '45vw', height: '45vw',
          bottom: '-15vw', right: '-8vw',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          animation: 'bg-pulse-2 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '30vw', height: '30vw',
          top: '35%', left: '45%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.04) 0%, transparent 70%)',
          animation: 'bg-pulse-1 7s ease-in-out 2s infinite',
        }}
      />

      {/* Aurora strip */}
      <div
        className="absolute"
        style={{
          top: '-5%', left: '-20%', right: '-20%', height: '55%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.04) 40%, rgba(139,92,246,0.05) 70%, transparent 100%)',
          borderRadius: '50%',
          animation: 'aurora-wave-1 14s ease-in-out infinite',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '10%', left: '-30%', right: '-30%', height: '40%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(167,139,250,0.03) 50%, transparent 100%)',
          borderRadius: '50%',
          animation: 'aurora-wave-2 18s ease-in-out infinite',
          filter: 'blur(60px)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(129,140,248,1) 1px,transparent 1px),linear-gradient(90deg,rgba(129,140,248,1) 1px,transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />
    </div>
  )
}
