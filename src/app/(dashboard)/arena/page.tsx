import TournamentCard from '@/components/arena/TournamentCard'

export default function ArenaPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#e8f4ff', margin: 0, marginBottom: '4px' }}>
          ⚔ Arena
        </h1>
        <p style={{ color: 'rgba(125,219,255,0.55)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
          Tournament challenges & wave battles
        </p>
      </div>

      {/* Leaderboard header */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(12,35,90,0.85), rgba(6,20,58,0.92))',
          border: '1px solid rgba(255,224,96,0.25)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <span style={{ fontSize: '32px' }}>🏅</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFE060', marginBottom: '4px' }}>
            Season 1 — March 2026
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { label: '1st Place', value: '@IceTrader_99', color: '#FFE060' },
              { label: '2nd Place', value: '@SnowBaller42', color: '#C0C0C0' },
              { label: '3rd Place', value: '@WaveKing_01', color: '#CD7F32' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(232,244,255,0.4)', display: 'block' }}>{label}</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            background: 'rgba(255,224,96,0.1)',
            border: '1px solid rgba(255,224,96,0.2)',
            borderRadius: '10px',
            padding: '10px 16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,224,96,0.6)', textTransform: 'uppercase', marginBottom: '2px' }}>
            Your Rank
          </div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFE060' }}>#12</div>
        </div>
      </div>

      <TournamentCard />
    </div>
  )
}
