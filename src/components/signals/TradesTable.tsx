'use client'

interface Trade {
  id: string
  coin: 'BTC' | 'ETH' | 'SOL'
  entryPrice: number
  exitPrice: number
  resultPct: number
  pnlUsd: number
  date: string
  type: 'snowball' | 'tournament' | 'wave'
}

const MOCK_TRADES: Trade[] = [
  { id: '1', coin: 'BTC', entryPrice: 65200, exitPrice: 66632, resultPct: 2.2, pnlUsd: 22.0, date: '2026-03-13', type: 'snowball' },
  { id: '2', coin: 'ETH', entryPrice: 3280, exitPrice: 3214, resultPct: -2.01, pnlUsd: -20.1, date: '2026-03-12', type: 'wave' },
  { id: '3', coin: 'SOL', entryPrice: 148.5, exitPrice: 153.9, resultPct: 3.64, pnlUsd: 36.4, date: '2026-03-11', type: 'tournament' },
  { id: '4', coin: 'BTC', entryPrice: 64100, exitPrice: 65382, resultPct: 2.0, pnlUsd: 20.0, date: '2026-03-10', type: 'snowball' },
  { id: '5', coin: 'ETH', entryPrice: 3190, exitPrice: 3221, resultPct: 0.97, pnlUsd: 9.7, date: '2026-03-09', type: 'snowball' },
  { id: '6', coin: 'SOL', entryPrice: 142.0, exitPrice: 139.88, resultPct: -1.49, pnlUsd: -14.9, date: '2026-03-08', type: 'wave' },
  { id: '7', coin: 'BTC', entryPrice: 62800, exitPrice: 64812, resultPct: 3.2, pnlUsd: 32.0, date: '2026-03-07', type: 'snowball' },
]

const COIN_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
}

const COIN_ICONS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  SOL: '◎',
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  snowball: { bg: 'rgba(125,219,255,0.12)', border: 'rgba(125,219,255,0.3)', text: '#7DDBFF' },
  tournament: { bg: 'rgba(255,224,96,0.12)', border: 'rgba(255,224,96,0.3)', text: '#FFE060' },
  wave: { bg: 'rgba(61,219,140,0.12)', border: 'rgba(61,219,140,0.3)', text: '#3DDB8C' },
}

export default function TradesTable() {
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
          📋 Recent Trades
        </h3>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(125,219,255,0.5)' }}>
          Last 7 trades
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Coin', 'Type', 'Entry', 'Exit', 'Result', 'P&L', 'Date'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'rgba(125,219,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid rgba(70,160,255,0.1)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_TRADES.map((trade, i) => {
              const isWin = trade.resultPct >= 0
              const typeStyle = TYPE_COLORS[trade.type]
              return (
                <tr
                  key={trade.id}
                  style={{
                    borderBottom: i < MOCK_TRADES.length - 1 ? '1px solid rgba(70,160,255,0.07)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'rgba(125,219,255,0.04)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
                >
                  {/* Coin */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: COIN_COLORS[trade.coin], fontWeight: 900, fontSize: '14px' }}>
                        {COIN_ICONS[trade.coin]}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '13px', color: '#e8f4ff' }}>
                        {trade.coin}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        background: typeStyle.bg,
                        border: `1px solid ${typeStyle.border}`,
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: typeStyle.text,
                        textTransform: 'capitalize',
                      }}
                    >
                      {trade.type}
                    </span>
                  </td>

                  {/* Entry */}
                  <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: 'rgba(232,244,255,0.7)' }}>
                    ${trade.entryPrice.toLocaleString()}
                  </td>

                  {/* Exit */}
                  <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 600, color: 'rgba(232,244,255,0.7)' }}>
                    ${trade.exitPrice.toLocaleString()}
                  </td>

                  {/* Result */}
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: isWin ? '#3DDB8C' : '#FF6B6B' }}>
                      {isWin ? '+' : ''}{trade.resultPct.toFixed(2)}%
                    </span>
                  </td>

                  {/* PnL */}
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: isWin ? '#3DDB8C' : '#FF6B6B' }}>
                      {isWin ? '+' : ''}${trade.pnlUsd.toFixed(2)}
                    </span>
                  </td>

                  {/* Date */}
                  <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: 'rgba(125,219,255,0.5)' }}>
                    {(() => {
                      const [, m, d] = trade.date.split('-')
                      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                      return `${months[parseInt(m) - 1]} ${parseInt(d)}`
                    })()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
