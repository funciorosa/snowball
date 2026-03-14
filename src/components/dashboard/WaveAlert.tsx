'use client'

import { useState } from 'react'

interface WaveAlertProps {
  coin?: string
  percentage?: string
  timeframe?: string
  onRide?: () => void
  onSkip?: () => void
}

export default function WaveAlert({
  coin = 'BTC',
  percentage = '+4.2%',
  timeframe = '4H',
  onRide,
  onSkip,
}: WaveAlertProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleSkip = () => {
    setDismissed(true)
    onSkip?.()
  }

  const handleRide = () => {
    setDismissed(true)
    onRide?.()
  }

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(12,35,90,0.9), rgba(6,20,58,0.95))',
        border: '1px solid rgba(125,219,255,0.35)',
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        animation: 'wave-pulse 2s ease-in-out infinite',
        boxShadow: '0 0 20px rgba(125,219,255,0.1)',
        fontFamily: "'Nunito', sans-serif",
        flexWrap: 'wrap',
      }}
    >
      {/* Wave Icon */}
      <div style={{ fontSize: '32px', lineHeight: 1, flexShrink: 0 }}>🌊</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#7DDBFF',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            🌊 WAVE DETECTED
          </span>
          <span
            style={{
              background: 'rgba(125,219,255,0.15)',
              border: '1px solid rgba(125,219,255,0.3)',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#7DDBFF',
            }}
          >
            {timeframe}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#e8f4ff',
            }}
          >
            {coin}/USDT
          </span>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 900,
              color: '#3DDB8C',
            }}
          >
            {percentage}
          </span>
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(232,244,255,0.6)',
              fontWeight: 600,
            }}
          >
            momentum signal
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button
          onClick={handleRide}
          className="btn-ride"
          style={{
            padding: '10px 22px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          🏄 Ride It
        </button>
        <button
          onClick={handleSkip}
          className="btn-skip"
          style={{
            padding: '10px 22px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ✕ Skip
        </button>
      </div>
    </div>
  )
}
