'use client'

interface MetricCardsProps {
  balance?: number
  todayPct?: number
  streak?: number
  winRate?: number
}

function DonutChart({ percentage }: { percentage: number }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const dashOffset = circ - (percentage / 100) * circ

  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(70,160,255,0.15)" strokeWidth="6" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="#7DDBFF"
        strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ filter: 'drop-shadow(0 0 4px rgba(125,219,255,0.5))' }}
      />
      <text
        x="28"
        y="33"
        textAnchor="middle"
        fill="#7DDBFF"
        fontSize="11"
        fontFamily="'Nunito', sans-serif"
        fontWeight="800"
      >
        {percentage}%
      </text>
    </svg>
  )
}

export default function MetricCards({
  balance = 1024.5,
  todayPct = 1.8,
  streak = 5,
  winRate = 73,
}: MetricCardsProps) {
  const isPositiveToday = todayPct >= 0

  const cardBase: React.CSSProperties = {
    background: 'linear-gradient(145deg, rgba(12,35,90,0.88), rgba(6,20,58,0.94))',
    border: '1px solid rgba(70,160,255,0.28)',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontFamily: "'Nunito', sans-serif",
    boxShadow: 'inset 0 1px 0 rgba(125,219,255,0.18), inset 0 0 40px rgba(70,160,255,0.06), 0 8px 32px rgba(0,0,0,0.35)',
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}
    >
      {/* Balance */}
      <div style={cardBase}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'rgba(125,219,255,0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}
            >
              Portfolio Balance
            </div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: '#e8f4ff',
                lineHeight: 1,
              }}
            >
              ${balance.toFixed(2)}
            </div>
          </div>
          <div
            style={{
              fontSize: '28px',
              opacity: 0.8,
            }}
          >
            💰
          </div>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(61,219,140,0.12)',
            border: '1px solid rgba(61,219,140,0.25)',
            borderRadius: '6px',
            padding: '3px 8px',
            color: '#3DDB8C',
            fontSize: '12px',
            fontWeight: 800,
            alignSelf: 'flex-start',
          }}
        >
          ↑ +2.45%
        </div>
      </div>

      {/* Today % */}
      <div style={cardBase}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'rgba(125,219,255,0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}
            >
              Today&apos;s Return
            </div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: isPositiveToday ? '#3DDB8C' : '#FF6B6B',
                lineHeight: 1,
              }}
            >
              {isPositiveToday ? '+' : ''}{todayPct.toFixed(1)}%
            </div>
          </div>
          <div style={{ fontSize: '28px', opacity: 0.8 }}>
            {isPositiveToday ? '📈' : '📉'}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: isPositiveToday ? '#3DDB8C' : '#FF6B6B',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: '16px' }}>{isPositiveToday ? '↑' : '↓'}</span>
          Target: 2.0% daily
        </div>
      </div>

      {/* Streak */}
      <div style={cardBase}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'rgba(125,219,255,0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}
            >
              Win Streak
            </div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: '#FFE060',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🔥 {streak}
            </div>
          </div>
          <div style={{ fontSize: '28px', opacity: 0.8 }}>⚡</div>
        </div>
        <div
          style={{
            color: 'rgba(255,224,96,0.7)',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {streak >= 5 ? 'On fire! Keep going!' : 'Build your streak'}
        </div>
      </div>

      {/* Win Rate */}
      <div
        style={{
          ...cardBase,
          flexDirection: 'row',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <DonutChart percentage={winRate} />
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'rgba(125,219,255,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
            }}
          >
            Win Rate
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#7DDBFF',
              lineHeight: 1,
            }}
          >
            {winRate}%
          </div>
          <div
            style={{
              color: 'rgba(125,219,255,0.6)',
              fontSize: '12px',
              fontWeight: 700,
              marginTop: '4px',
            }}
          >
            Last 30 trades
          </div>
        </div>
      </div>
    </div>
  )
}
