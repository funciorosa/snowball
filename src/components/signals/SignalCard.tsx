'use client'

import { useState, useEffect } from 'react'

interface FearGreedData {
  value: string
  valueClassification: string
}

interface CoinData {
  coin: string
  price: number
  change24h: number
}

export default function SignalCard() {
  const [fearGreed, setFearGreed] = useState<FearGreedData | null>(null)
  const [countdown, setCountdown] = useState(3600) // 1 hour in seconds
  const [btcData, setBtcData] = useState<CoinData | null>(null)

  useEffect(() => {
    // Fetch fear & greed
    fetch('/api/fear-greed')
      .then((r) => r.json())
      .then((d) => setFearGreed(d))
      .catch(() => setFearGreed({ value: '52', valueClassification: 'Neutral' }))

    // Fetch BTC price
    fetch('/api/signals')
      .then((r) => r.json())
      .then((data: CoinData[]) => {
        const btc = data.find((d) => d.coin === 'BTC')
        if (btc) setBtcData(btc)
      })
      .catch(() => setBtcData({ coin: 'BTC', price: 67420, change24h: 2.34 }))

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 3600))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const entryPrice = btcData?.price ?? 67420
  const targetPrice = entryPrice * 1.022
  const stopLoss = entryPrice * 0.985

  const getFGColor = (value: string) => {
    const n = parseInt(value)
    if (n >= 75) return '#3DDB8C'
    if (n >= 55) return '#7DDBFF'
    if (n >= 45) return '#FFE060'
    if (n >= 25) return '#FF9933'
    return '#FF6B6B'
  }

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#3DDB8C',
              animation: 'pulse-green 2s ease-in-out infinite',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#7DDBFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Signal
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {fearGreed && (
            <div
              style={{
                background: `${getFGColor(fearGreed.value)}18`,
                border: `1px solid ${getFGColor(fearGreed.value)}44`,
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 800,
                color: getFGColor(fearGreed.value),
              }}
            >
              F&G: {fearGreed.value} · {fearGreed.valueClassification}
            </div>
          )}
        </div>
      </div>

      {/* Coin + Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#F7931A' }}>₿</span>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#e8f4ff' }}>BTC/USDT</span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#3DDB8C',
                background: 'rgba(61,219,140,0.12)',
                border: '1px solid rgba(61,219,140,0.25)',
                borderRadius: '6px',
                padding: '2px 8px',
              }}
            >
              {btcData ? (btcData.change24h >= 0 ? '+' : '') + btcData.change24h.toFixed(2) + '%' : 'LONG'}
            </span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(232,244,255,0.5)', marginTop: '4px' }}>
            Copying: @CryptoWave_Pro · ROI: <span style={{ color: '#3DDB8C', fontWeight: 800 }}>+847%</span>
          </div>
        </div>

        {/* Countdown */}
        <div
          style={{
            background: 'rgba(125,219,255,0.08)',
            border: '1px solid rgba(125,219,255,0.2)',
            borderRadius: '10px',
            padding: '8px 12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(125,219,255,0.6)', textTransform: 'uppercase', marginBottom: '2px' }}>
            Expires
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#7DDBFF', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(countdown)}
          </div>
        </div>
      </div>

      {/* Prices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Entry', value: `$${entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#e8f4ff', icon: '→' },
          { label: 'Target', value: `$${targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: '+2.2%', color: '#3DDB8C', icon: '↑' },
          { label: 'Stop Loss', value: `$${stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub: '-1.5%', color: '#FF6B6B', icon: '↓' },
        ].map(({ label, value, sub, color, icon }) => (
          <div
            key={label}
            style={{
              background: 'rgba(2,9,24,0.4)',
              border: `1px solid ${color}22`,
              borderRadius: '10px',
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(125,219,255,0.5)', textTransform: 'uppercase', marginBottom: '4px' }}>
              {label}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 900, color, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{icon}</span>
              <span>{value}</span>
            </div>
            {sub && (
              <div style={{ fontSize: '11px', fontWeight: 700, color, marginTop: '2px' }}>{sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Binance button */}
      <a
        href="https://www.binance.com/en/trade/BTC_USDT"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          background: 'linear-gradient(135deg, #F7931A, #FFB347)',
          borderRadius: '10px',
          padding: '12px',
          textAlign: 'center',
          color: 'white',
          fontWeight: 900,
          fontSize: '14px',
          fontFamily: "'Nunito', sans-serif",
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}
      >
        🔗 Open on Binance
      </a>
    </div>
  )
}
