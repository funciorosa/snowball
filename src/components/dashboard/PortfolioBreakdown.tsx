'use client'

interface CoinData {
  coin: string
  allocation: number
  change24h: number
  value: number
  color: string
  icon: string
}

const PORTFOLIO: CoinData[] = [
  { coin: 'BTC', allocation: 40, change24h: 2.34, value: 409.80, color: '#F7931A', icon: '₿' },
  { coin: 'ETH', allocation: 30, change24h: -0.82, value: 307.35, color: '#627EEA', icon: 'Ξ' },
  { coin: 'SOL', allocation: 20, change24h: 5.12, value: 204.90, color: '#9945FF', icon: '◎' },
  { coin: 'USDT', allocation: 10, change24h: 0.01, value: 102.45, color: '#26A17B', icon: '$' },
]

export default function PortfolioBreakdown() {
  const total = PORTFOLIO.reduce((acc, c) => acc + c.value, 0)

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(12,35,90,0.85), rgba(6,20,58,0.92))',
        border: '1px solid rgba(70,160,255,0.22)',
        borderRadius: '14px',
        padding: '20px',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#e8f4ff', margin: 0 }}>
          💎 Portfolio Breakdown
        </h3>
        <span style={{ fontSize: '14px', fontWeight: 800, color: '#7DDBFF' }}>
          ${total.toFixed(2)}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {PORTFOLIO.map(({ coin, allocation, change24h, value, color, icon }) => {
          const isPositive = change24h >= 0
          return (
            <div key={coin}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                {/* Coin icon */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `${color}22`,
                    border: `1px solid ${color}55`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 900,
                    color,
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>

                {/* Coin name + % */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: '#e8f4ff' }}>{coin}</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: isPositive ? '#3DDB8C' : '#FF6B6B',
                        }}
                      >
                        {isPositive ? '+' : ''}{change24h.toFixed(2)}%
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#e8f4ff' }}>
                        ${value.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      height: '6px',
                      background: 'rgba(70,160,255,0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${allocation}%`,
                        background: `linear-gradient(90deg, ${color}88, ${color})`,
                        borderRadius: '3px',
                        transition: 'width 0.5s ease',
                        boxShadow: `0 0 6px ${color}44`,
                      }}
                    />
                  </div>
                </div>

                {/* Allocation % */}
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: 'rgba(125,219,255,0.7)',
                    minWidth: '36px',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {allocation}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
