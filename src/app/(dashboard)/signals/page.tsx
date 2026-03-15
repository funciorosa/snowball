'use client'

import { useState, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface WatchlistCoin {
  symbol: string
  coin: string
  price: number
  change24h: number
  volume: number
  momentum: 'bullish' | 'bearish' | 'neutral'
}

interface Trader { name: string; roi: number; rank: number }

interface Signal {
  id: string
  coin: string
  direction: 'long' | 'short'
  entry_price: number
  target_price: number
  stop_loss: number
  confidence_score: number
  traders_count: number
  trader_names: string[]
  volume_ratio: number
  momentum: string
  status: string
  created_at: string
}

interface LeaderboardData {
  traders: Trader[]
  watchlist: WatchlistCoin[]
  activeSignals: Signal[]
  fearGreed: number
}

interface ChannelSignal {
  id: string
  coin: string
  direction: 'long' | 'short'
  entry_price: number | null
  target_price: number | null
  stop_loss: number | null
  confidence_score: number
  source_channel: string
  source_message: string | null
  created_at: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const COIN_COLORS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', SOL: '#9945FF', BNB: '#F3BA2F',
  AVAX: '#E84142', DOGE: '#C2A633', PEPE: '#4CAF50', WIF: '#FF6B35',
  SUI: '#4DA2FF', APT: '#00B5D4', SEI: '#FF4D6D', INJ: '#00C5E4', TIA: '#9B59B6',
}

const COIN_ICONS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', SOL: '◎', BNB: '⬡', AVAX: '🔺',
  DOGE: 'Ð', PEPE: '🐸', WIF: '🐕', SUI: '💧', APT: '🔷',
  SEI: '🌊', INJ: '💫', TIA: '🌌',
}

const icePanel: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(12,35,90,0.88), rgba(6,20,58,0.94))',
  border: '1px solid rgba(70,160,255,0.28)',
  borderRadius: '14px',
  padding: '18px 20px',
  boxShadow: 'inset 0 1px 0 rgba(125,219,255,0.18), inset 0 0 40px rgba(70,160,255,0.06), 0 8px 32px rgba(0,0,0,0.35)',
  fontFamily: "'Nunito', sans-serif",
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 85 ? '#FFE060' : score >= 75 ? '#3DDB8C' : '#7DDBFF'
  return (
    <div style={{
      background: `${color}18`, border: `1px solid ${color}44`,
      borderRadius: '8px', padding: '3px 10px',
      fontSize: '12px', fontWeight: 900, color,
    }}>
      {score}/100
    </div>
  )
}

function MomentumArrow({ momentum }: { momentum: string }) {
  if (momentum === 'bullish') return <span style={{ color: '#3DDB8C', fontSize: '16px' }}>↑</span>
  if (momentum === 'bearish') return <span style={{ color: '#FF6B6B', fontSize: '16px' }}>↓</span>
  return <span style={{ color: 'rgba(125,219,255,0.4)', fontSize: '16px' }}>→</span>
}

function ActiveSignalCard({ signal }: { signal: Signal }) {
  const coinName = signal.coin.replace('USDT', '')
  const isLong = signal.direction === 'long'
  const tgtPct = ((signal.target_price - signal.entry_price) / signal.entry_price * 100).toFixed(1)
  const slPct = ((signal.stop_loss - signal.entry_price) / signal.entry_price * 100).toFixed(1)
  const elapsed = Math.floor((Date.now() - new Date(signal.created_at).getTime()) / 60000)

  return (
    <div style={{
      ...icePanel,
      border: `1px solid ${isLong ? 'rgba(61,219,140,0.35)' : 'rgba(255,107,107,0.35)'}`,
      boxShadow: `inset 0 1px 0 rgba(125,219,255,0.18), 0 8px 32px ${isLong ? 'rgba(61,219,140,0.08)' : 'rgba(255,107,107,0.08)'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px', color: COIN_COLORS[coinName] ?? '#7DDBFF', fontWeight: 900 }}>
            {COIN_ICONS[coinName] ?? '●'}
          </span>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#e8f4ff' }}>{coinName}/USDT</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: isLong ? '#3DDB8C' : '#FF6B6B' }}>
              {isLong ? '▲ LONG' : '▼ SHORT'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ConfidenceBadge score={signal.confidence_score} />
          <span style={{ fontSize: '11px', color: 'rgba(125,219,255,0.4)', fontWeight: 600 }}>
            {elapsed}m ago
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {[
          { label: 'Entry', value: `$${signal.entry_price.toLocaleString(undefined, { maximumFractionDigits: 4 })}`, color: '#e8f4ff' },
          { label: 'Target', value: `+${tgtPct}%`, color: '#3DDB8C' },
          { label: 'Stop', value: `${slPct}%`, color: '#FF6B6B' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'rgba(2,9,24,0.4)', border: `1px solid ${color}22`,
            borderRadius: '8px', padding: '8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(125,219,255,0.5)', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(125,219,255,0.6)', background: 'rgba(125,219,255,0.08)', border: '1px solid rgba(125,219,255,0.15)', borderRadius: '5px', padding: '2px 8px' }}>
          👥 {signal.traders_count}/5 traders
        </span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(125,219,255,0.6)', background: 'rgba(125,219,255,0.08)', border: '1px solid rgba(125,219,255,0.15)', borderRadius: '5px', padding: '2px 8px' }}>
          🌊 {signal.momentum}
        </span>
        {signal.trader_names.slice(0, 3).map(name => (
          <span key={name} style={{ fontSize: '11px', fontWeight: 700, color: '#7DDBFF', background: 'rgba(70,160,255,0.1)', border: '1px solid rgba(70,160,255,0.2)', borderRadius: '5px', padding: '2px 8px' }}>
            @{name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const CORE_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX']
const FALLBACK_WATCHLIST: WatchlistCoin[] = CORE_COINS.map((coin, i) => ({
  symbol: coin + 'USDT', coin, price: [83200, 3280, 148, 580, 32][i],
  change24h: [2.1, -0.8, 4.2, 1.1, -1.5][i], volume: [42e9, 18e9, 4e9, 3e9, 1e9][i],
  momentum: ['bullish', 'neutral', 'bullish', 'neutral', 'bearish'][i] as 'bullish' | 'bearish' | 'neutral',
}))

export default function SignalsPage() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'watchlist' | 'traders'>('watchlist')
  const [channelSignals, setChannelSignals] = useState<ChannelSignal[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [pricesRes, lbRes, chRes] = await Promise.all([
          fetch('/api/signals'),
          fetch('/api/signals/leaderboard'),
          fetch('/api/signals/channel-signals'),
        ])
        const prices = pricesRes.ok ? await pricesRes.json() : []
        const lb = lbRes.ok ? await lbRes.json() : {}
        const ch = chRes.ok ? await chRes.json() : {}

        setChannelSignals(ch.signals ?? [])

        const watchlist: WatchlistCoin[] = lb.watchlist?.length > 0 ? lb.watchlist
          : prices.map((p: { coin: string; price: number; change24h: number; volume: number }) => ({
              symbol: p.coin + 'USDT', coin: p.coin, price: p.price,
              change24h: p.change24h, volume: p.volume, momentum: 'neutral' as const,
            }))

        setData({
          traders: lb.traders ?? [],
          watchlist,
          activeSignals: lb.activeSignals ?? [],
          fearGreed: lb.fearGreed ?? 52,
        })
      } catch {
        setData({ traders: [], watchlist: FALLBACK_WATCHLIST, activeSignals: [], fearGreed: 52 })
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const fearGreedColor = (v: number) => v >= 75 ? '#3DDB8C' : v >= 55 ? '#7DDBFF' : v >= 45 ? '#FFE060' : v >= 25 ? '#FF9933' : '#FF6B6B'
  const fearGreedLabel = (v: number) => v >= 75 ? 'Extreme Greed' : v >= 55 ? 'Greed' : v >= 45 ? 'Neutral' : v >= 25 ? 'Fear' : 'Extreme Fear'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Nunito', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#e8f4ff', margin: 0, marginBottom: '4px' }}>
            📡 Signals
          </h1>
          <p style={{ color: 'rgba(125,219,255,0.55)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
            Copy trading signals · 13-coin watchlist · Top leaderboard traders
          </p>
        </div>
        {data && (
          <div style={{
            background: `${fearGreedColor(data.fearGreed)}18`,
            border: `1px solid ${fearGreedColor(data.fearGreed)}44`,
            borderRadius: '10px', padding: '8px 14px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(125,219,255,0.5)', textTransform: 'uppercase' }}>Fear & Greed</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: fearGreedColor(data.fearGreed) }}>{data.fearGreed}</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: fearGreedColor(data.fearGreed) }}>{fearGreedLabel(data.fearGreed)}</div>
          </div>
        )}
      </div>

      {/* Active signals */}
      {data && data.activeSignals.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#7DDBFF', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🎯 Active Signals ({data.activeSignals.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
            {data.activeSignals.map(s => <ActiveSignalCard key={s.id} signal={s} />)}
          </div>
        </div>
      )}

      {/* No signals state */}
      {data && data.activeSignals.length === 0 && (
        <div style={{ ...icePanel, textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌊</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#e8f4ff', marginBottom: '6px' }}>No Active Signals</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(125,219,255,0.5)' }}>
            Monitoring 13 coins · Scanning every 15 min · Need 3/5 trader consensus
          </div>
        </div>
      )}

      {/* From Channels */}
      {channelSignals.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#7DDBFF', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
            💬 From Channels ({channelSignals.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {channelSignals.map((s) => {
              const isLong = s.direction === 'long'
              const elapsed = Math.floor((Date.now() - new Date(s.created_at).getTime()) / 60000)
              const scoreColor = s.confidence_score >= 75 ? '#3DDB8C' : s.confidence_score >= 50 ? '#7DDBFF' : '#FFE060'
              return (
                <div key={s.id} style={{
                  ...icePanel,
                  border: `1px solid ${isLong ? 'rgba(61,219,140,0.25)' : 'rgba(255,107,107,0.25)'}`,
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '14px',
                  alignItems: 'center',
                }}>
                  {/* Coin + direction */}
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: COIN_COLORS[s.coin.replace('USDT', '')] ?? '#7DDBFF' }}>
                      {COIN_ICONS[s.coin.replace('USDT', '')] ?? '●'}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: isLong ? '#3DDB8C' : '#FF6B6B', marginTop: '2px' }}>
                      {isLong ? '▲ LONG' : '▼ SHORT'}
                    </div>
                  </div>

                  {/* Message + source */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#e8f4ff' }}>{s.coin}/USDT</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#7DDBFF', background: 'rgba(70,160,255,0.1)', border: '1px solid rgba(70,160,255,0.2)', borderRadius: '5px', padding: '1px 7px' }}>
                        @{s.source_channel}
                      </span>
                    </div>
                    {s.source_message && (
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(125,219,255,0.6)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '420px' }}>
                        &ldquo;{s.source_message}&rdquo;
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      {s.entry_price && <span style={{ fontSize: '11px', color: 'rgba(125,219,255,0.5)', fontWeight: 600 }}>Entry: ${s.entry_price}</span>}
                      {s.target_price && <span style={{ fontSize: '11px', color: '#3DDB8C', fontWeight: 600 }}>Target: ${s.target_price}</span>}
                      {s.stop_loss && <span style={{ fontSize: '11px', color: '#FF6B6B', fontWeight: 600 }}>Stop: ${s.stop_loss}</span>}
                      {!s.entry_price && <span style={{ fontSize: '11px', color: '#FFE060', fontWeight: 600 }}>⚠️ No entry specified</span>}
                    </div>
                  </div>

                  {/* Score + time */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: scoreColor }}>{s.confidence_score}/100</div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(125,219,255,0.4)', marginTop: '2px' }}>{elapsed}m ago</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab panel: Watchlist + Traders */}
      <div style={icePanel}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          {(['watchlist', 'traders'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? 'rgba(125,219,255,0.15)' : 'transparent',
              border: tab === t ? '1px solid rgba(125,219,255,0.3)' : '1px solid transparent',
              borderRadius: '8px', padding: '6px 16px',
              color: tab === t ? '#7DDBFF' : 'rgba(232,244,255,0.4)',
              fontSize: '13px', fontFamily: "'Nunito', sans-serif", fontWeight: 800, cursor: 'pointer',
              textTransform: 'capitalize',
            }}>
              {t === 'watchlist' ? '📊 Watchlist (13)' : '👥 Top Traders (5)'}
            </button>
          ))}
          {loading && (
            <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(125,219,255,0.4)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7DDBFF', animation: 'pulse-glow 1s ease-in-out infinite' }} />
              Live
            </div>
          )}
        </div>

        {/* Watchlist table */}
        {tab === 'watchlist' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Coin', 'Price', '24h %', 'Volume', 'Momentum'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: '10px', fontWeight: 700, color: 'rgba(125,219,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(70,160,255,0.1)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.watchlist ?? FALLBACK_WATCHLIST).map(coin => {
                  const isPos = coin.change24h >= 0
                  const color = COIN_COLORS[coin.coin] ?? '#7DDBFF'
                  return (
                    <tr key={coin.symbol}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(125,219,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      style={{ borderBottom: '1px solid rgba(70,160,255,0.06)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '9px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color, fontWeight: 900, fontSize: '14px', width: '20px', textAlign: 'center' }}>
                            {COIN_ICONS[coin.coin] ?? '●'}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '13px', color: '#e8f4ff' }}>{coin.coin}</span>
                        </div>
                      </td>
                      <td style={{ padding: '9px 10px', fontWeight: 800, fontSize: '13px', color: '#e8f4ff' }}>
                        ${coin.price.toLocaleString(undefined, { maximumFractionDigits: coin.price < 1 ? 6 : 2 })}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{
                          fontWeight: 800, fontSize: '13px', color: isPos ? '#3DDB8C' : '#FF6B6B',
                          background: isPos ? 'rgba(61,219,140,0.1)' : 'rgba(255,107,107,0.1)',
                          border: `1px solid ${isPos ? 'rgba(61,219,140,0.2)' : 'rgba(255,107,107,0.2)'}`,
                          borderRadius: '5px', padding: '2px 7px',
                        }}>
                          {isPos ? '+' : ''}{coin.change24h.toFixed(2)}%
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px', fontSize: '12px', fontWeight: 600, color: 'rgba(232,244,255,0.5)' }}>
                        ${(coin.volume / 1e9).toFixed(2)}B
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <MomentumArrow momentum={coin.momentum} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Traders panel */}
        {tab === 'traders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data && data.traders.length > 0 ? data.traders.map((trader, i) => (
              <div key={trader.name} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(2,9,24,0.35)', border: '1px solid rgba(70,160,255,0.12)',
                borderRadius: '10px', padding: '12px 14px',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? 'linear-gradient(135deg, #FFE060, #F7931A)' : i === 1 ? 'linear-gradient(135deg, #e8e8e8, #aaaaaa)' : i === 2 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' : 'rgba(70,160,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 900, color: i < 3 ? '#020918' : '#7DDBFF',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#e8f4ff' }}>@{trader.name}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(125,219,255,0.5)', marginTop: '2px' }}>
                    Rank #{trader.rank}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#3DDB8C' }}>+{trader.roi.toFixed(0)}%</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(125,219,255,0.4)', textTransform: 'uppercase' }}>30d ROI</div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(125,219,255,0.4)', fontSize: '13px', fontWeight: 600 }}>
                Loading top traders... Leaderboard refreshes every 15 min.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
