'use client'

import { useState, useEffect } from 'react'
import SignalCard from '@/components/signals/SignalCard'
import TradesTable from '@/components/signals/TradesTable'

interface CoinData {
  coin: string
  price: number
  change24h: number
  high24h: number
  low24h: number
  volume: number
}

function PriceTicker({ data }: { data: CoinData[] }) {
  const coinColors: Record<string, string> = {
    BTC: '#F7931A',
    ETH: '#627EEA',
    SOL: '#9945FF',
  }
  const coinIcons: Record<string, string> = {
    BTC: '₿',
    ETH: 'Ξ',
    SOL: '◎',
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {data.map((coin) => {
        const isPos = coin.change24h >= 0
        return (
          <div
            key={coin.coin}
            style={{
              background: 'linear-gradient(145deg, rgba(12,35,90,0.85), rgba(6,20,58,0.92))',
              border: `1px solid ${coinColors[coin.coin]}33`,
              borderRadius: '14px',
              padding: '16px 18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', color: coinColors[coin.coin], fontWeight: 900 }}>
                  {coinIcons[coin.coin]}
                </span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#e8f4ff' }}>
                  {coin.coin}/USDT
                </span>
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: isPos ? '#3DDB8C' : '#FF6B6B',
                  background: isPos ? 'rgba(61,219,140,0.1)' : 'rgba(255,107,107,0.1)',
                  border: `1px solid ${isPos ? 'rgba(61,219,140,0.2)' : 'rgba(255,107,107,0.2)'}`,
                  borderRadius: '6px',
                  padding: '2px 8px',
                }}
              >
                {isPos ? '+' : ''}{coin.change24h.toFixed(2)}%
              </span>
            </div>

            <div style={{ fontSize: '22px', fontWeight: 900, color: '#e8f4ff', marginBottom: '8px' }}>
              ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(125,219,255,0.4)', display: 'block' }}>24H HIGH</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#3DDB8C' }}>
                  ${coin.high24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(125,219,255,0.4)', display: 'block' }}>24H LOW</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FF6B6B' }}>
                  ${coin.low24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(125,219,255,0.4)', display: 'block' }}>VOLUME</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(232,244,255,0.6)' }}>
                  ${(coin.volume / 1e9).toFixed(2)}B
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const FALLBACK_DATA: CoinData[] = [
  { coin: 'BTC', price: 67420, change24h: 2.34, high24h: 68200, low24h: 65800, volume: 42800000000 },
  { coin: 'ETH', price: 3280, change24h: -0.82, high24h: 3350, low24h: 3200, volume: 18500000000 },
  { coin: 'SOL', price: 148.5, change24h: 5.12, high24h: 155, low24h: 140, volume: 4200000000 },
]

export default function SignalsPage() {
  const [prices, setPrices] = useState<CoinData[]>(FALLBACK_DATA)

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const res = await fetch('/api/signals')
        if (res.ok) {
          const data = await res.json()
          setPrices(data)
        }
      } catch {
        // keep fallback data
      }
    }

    loadPrices()
    const interval = setInterval(loadPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#e8f4ff', margin: 0, marginBottom: '4px' }}>
          📡 Signals
        </h1>
        <p style={{ color: 'rgba(125,219,255,0.55)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
          Live Binance prices + active trading signals
        </p>
      </div>

      {/* Live Price Ticker */}
      <PriceTicker data={prices} />

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px' }}>
        <SignalCard />
        <TradesTable />
      </div>
    </div>
  )
}
