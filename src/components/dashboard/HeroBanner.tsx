'use client'

export default function HeroBanner() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '220px',
        borderRadius: '18px',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #020c1e 0%, #041228 40%, #061830 70%, #0a2040 100%)',
        border: '1px solid rgba(70,160,255,0.2)',
        boxShadow: 'inset 0 1px 0 rgba(125,219,255,0.15), 0 8px 40px rgba(0,0,0,0.5)',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* ── Aurora borealis bands ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Band 1 – teal-green */}
        <div style={{
          position: 'absolute',
          top: '-20px', left: '-10%', width: '120%', height: '90px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,210,140,0.18) 20%, rgba(0,230,160,0.28) 40%, rgba(0,200,180,0.22) 60%, rgba(0,180,210,0.15) 80%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(18px)',
          animation: 'aurora-band1 8s ease-in-out infinite',
        }} />
        {/* Band 2 – ice blue */}
        <div style={{
          position: 'absolute',
          top: '10px', left: '5%', width: '110%', height: '70px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(70,160,255,0.12) 15%, rgba(125,219,255,0.25) 45%, rgba(100,180,255,0.2) 70%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(14px)',
          animation: 'aurora-band2 11s ease-in-out infinite',
        }} />
        {/* Band 3 – purple accent */}
        <div style={{
          position: 'absolute',
          top: '25px', left: '-5%', width: '90%', height: '50px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(140,80,255,0.1) 30%, rgba(180,100,255,0.18) 55%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(20px)',
          animation: 'aurora-band3 14s ease-in-out infinite',
        }} />
      </div>

      {/* ── Stars ── */}
      {[
        { top: '8%', left: '5%', size: 2 }, { top: '14%', left: '12%', size: 1.5 },
        { top: '6%', left: '22%', size: 1 }, { top: '18%', left: '35%', size: 2 },
        { top: '8%', left: '48%', size: 1.5 }, { top: '15%', left: '58%', size: 1 },
        { top: '5%', left: '68%', size: 2 }, { top: '20%', left: '76%', size: 1.5 },
        { top: '9%', left: '85%', size: 1 }, { top: '16%', left: '92%', size: 2 },
        { top: '25%', left: '8%', size: 1 }, { top: '28%', left: '42%', size: 1.5 },
        { top: '22%', left: '62%', size: 1 }, { top: '30%', left: '88%', size: 1.5 },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: s.top, left: s.left,
          width: `${s.size}px`, height: `${s.size}px`,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)',
          boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,0.6)`,
          animation: `star-twinkle ${2 + (i % 3)}s ease-in-out ${i * 0.4}s infinite`,
        }} />
      ))}

      {/* ── Ice crystals – left ── */}
      <svg style={{ position: 'absolute', left: '12px', bottom: '55px', opacity: 0.45 }} width="40" height="70" viewBox="0 0 40 70">
        <polygon points="20,0 23,28 40,22 27,35 40,48 23,42 20,70 17,42 0,48 13,35 0,22 17,28" fill="none" stroke="#7DDBFF" strokeWidth="1"/>
        <polygon points="20,10 22,28 36,24 25,35 36,46 22,42 20,60 18,42 4,46 15,35 4,24 18,28" fill="rgba(125,219,255,0.08)" stroke="none"/>
      </svg>
      <svg style={{ position: 'absolute', left: '38px', bottom: '70px', opacity: 0.3 }} width="24" height="42" viewBox="0 0 24 42">
        <polygon points="12,0 14,17 24,13 16,21 24,29 14,25 12,42 10,25 0,29 8,21 0,13 10,17" fill="none" stroke="#7DDBFF" strokeWidth="1"/>
      </svg>

      {/* ── Ice crystals – right ── */}
      <svg style={{ position: 'absolute', right: '14px', bottom: '58px', opacity: 0.4 }} width="36" height="62" viewBox="0 0 36 62">
        <polygon points="18,0 21,25 36,19 24,31 36,43 21,37 18,62 15,37 0,43 12,31 0,19 15,25" fill="none" stroke="#7DDBFF" strokeWidth="1"/>
        <polygon points="18,8 20,25 32,21 22,31 32,41 20,37 18,54 16,37 4,41 14,31 4,21 16,25" fill="rgba(125,219,255,0.07)" stroke="none"/>
      </svg>
      <svg style={{ position: 'absolute', right: '40px', bottom: '75px', opacity: 0.25 }} width="20" height="36" viewBox="0 0 20 36">
        <polygon points="10,0 12,14 20,11 13,18 20,25 12,22 10,36 8,22 0,25 7,18 0,11 8,14" fill="none" stroke="#a8e8ff" strokeWidth="1"/>
      </svg>

      {/* ── Snow hills – background ── */}
      <svg
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path d="M0,80 Q150,20 300,60 Q450,95 600,45 Q750,10 900,55 Q1050,90 1200,40 L1200,120 L0,120Z"
          fill="rgba(140,190,230,0.12)" />
        <path d="M0,95 Q120,55 240,78 Q380,100 520,65 Q660,38 800,72 Q940,98 1060,60 Q1130,42 1200,68 L1200,120 L0,120Z"
          fill="rgba(180,220,255,0.1)" />
        <path d="M0,105 Q80,85 180,95 Q300,108 420,88 Q540,72 660,90 Q780,105 900,85 Q1020,68 1120,88 Q1160,95 1200,82 L1200,120 L0,120Z"
          fill="rgba(210,235,255,0.14)" />
        {/* Front snow hill */}
        <path d="M0,112 Q100,92 220,108 Q340,120 460,100 Q580,84 700,104 Q820,118 940,98 Q1060,82 1200,105 L1200,120 L0,120Z"
          fill="rgba(230,245,255,0.18)" />
      </svg>

      {/* ── Igloo left ── */}
      <div style={{ position: 'absolute', bottom: '18px', left: '60px' }}>
        {/* Dome */}
        <div style={{
          width: '52px', height: '32px',
          background: 'linear-gradient(180deg, rgba(220,238,255,0.7) 0%, rgba(190,220,245,0.5) 100%)',
          borderRadius: '52px 52px 0 0',
          border: '1px solid rgba(180,220,255,0.5)',
          borderBottom: 'none',
          position: 'relative',
          boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.3)',
        }}>
          {/* Entry arch */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '16px', height: '10px',
            background: 'rgba(2,9,24,0.6)',
            borderRadius: '8px 8px 0 0',
          }} />
          {/* Window glow */}
          <div style={{
            position: 'absolute',
            top: '7px', left: '50%',
            transform: 'translateX(-50%)',
            width: '12px', height: '8px',
            background: 'radial-gradient(circle, rgba(255,220,100,0.95), rgba(255,180,50,0.6))',
            borderRadius: '6px 6px 3px 3px',
            boxShadow: '0 0 10px rgba(255,210,80,0.8), 0 0 20px rgba(255,180,50,0.4)',
          }} />
        </div>
        {/* Snow base */}
        <div style={{
          width: '60px', height: '8px',
          background: 'linear-gradient(180deg, rgba(220,240,255,0.5), transparent)',
          borderRadius: '2px',
          marginLeft: '-4px',
        }} />
      </div>

      {/* ── Igloo right ── */}
      <div style={{ position: 'absolute', bottom: '14px', right: '70px' }}>
        {/* Dome – slightly larger */}
        <div style={{
          width: '64px', height: '40px',
          background: 'linear-gradient(180deg, rgba(225,242,255,0.72) 0%, rgba(195,225,248,0.52) 100%)',
          borderRadius: '64px 64px 0 0',
          border: '1px solid rgba(185,225,255,0.5)',
          borderBottom: 'none',
          position: 'relative',
          boxShadow: 'inset 0 3px 10px rgba(255,255,255,0.35)',
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '18px', height: '12px',
            background: 'rgba(2,9,24,0.65)',
            borderRadius: '9px 9px 0 0',
          }} />
          <div style={{
            position: 'absolute',
            top: '9px', left: '50%',
            transform: 'translateX(-50%)',
            width: '14px', height: '9px',
            background: 'radial-gradient(circle, rgba(255,225,110,0.95), rgba(255,185,60,0.65))',
            borderRadius: '7px 7px 3px 3px',
            boxShadow: '0 0 12px rgba(255,215,80,0.85), 0 0 24px rgba(255,180,50,0.45)',
          }} />
        </div>
        <div style={{
          width: '74px', height: '9px',
          background: 'linear-gradient(180deg, rgba(220,240,255,0.5), transparent)',
          borderRadius: '2px',
          marginLeft: '-5px',
        }} />
      </div>

      {/* ── Hero text ── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -58%)',
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'rgba(125,219,255,0.7)',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          ❄ Snowball Method
        </div>
        <div style={{
          fontSize: '30px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #ffffff 0%, #c8ecff 40%, #7DDBFF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.5px',
          lineHeight: 1.1,
          textShadow: 'none',
        }}>
          Compound Daily
        </div>
        <div style={{
          fontSize: '14px',
          fontWeight: 700,
          color: 'rgba(200,236,255,0.65)',
          marginTop: '6px',
          letterSpacing: '0.5px',
        }}>
          2% every day → freedom in 12 months
        </div>
      </div>

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes aurora-band1 {
          0%, 100% { transform: translateX(-8%) scaleY(1); opacity: 0.7; }
          50% { transform: translateX(8%) scaleY(1.2); opacity: 1; }
        }
        @keyframes aurora-band2 {
          0%, 100% { transform: translateX(5%) scaleY(0.9); opacity: 0.8; }
          50% { transform: translateX(-5%) scaleY(1.15); opacity: 1; }
        }
        @keyframes aurora-band3 {
          0%, 100% { transform: translateX(0%) scaleY(1); opacity: 0.6; }
          33% { transform: translateX(10%) scaleY(1.3); opacity: 0.9; }
          66% { transform: translateX(-6%) scaleY(0.8); opacity: 0.5; }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.6); }
        }
      `}</style>
    </div>
  )
}
