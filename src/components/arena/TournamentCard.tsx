'use client'

import { useState, useEffect } from 'react'

interface Tournament {
  id: string
  name: string
  capitalAssigned: number
  currentBalance: number
  targetPct: number
  deadline: string
  status: 'active' | 'completed' | 'failed'
}

const MOCK_TOURNAMENT: Tournament = {
  id: '1',
  name: 'Wave Challenge #7',
  capitalAssigned: 200,
  currentBalance: 224.60,
  targetPct: 20,
  deadline: '2026-03-19T00:00:00.000Z',
  status: 'active',
}

const AVAILABLE_CHALLENGES = [
  { id: 'c1', name: '5% in 24h Challenge', reward: '🏆 Speed Trader badge', risk: 'Low', entry: '$50' },
  { id: 'c2', name: 'Wave Surfer', reward: '🌊 Wave Rider badge', risk: 'Medium', entry: '$100' },
  { id: 'c3', name: 'BTC Monthly Bull', reward: '₿ BTC Believer badge', risk: 'Medium', entry: '$200' },
  { id: 'c4', name: 'Compound Master', reward: '⛄ 2% Daily badge', risk: 'Low', entry: '$500' },
]

function getTimeRemaining(deadline: string) {
  const now = new Date()
  const end = new Date(deadline)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Expired'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export default function TournamentCard() {
  const [joining, setJoining] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState('5d 0h')
  const t = MOCK_TOURNAMENT

  useEffect(() => {
    const update = () => setTimeRemaining(getTimeRemaining(t.deadline))
    update()
    const timer = setInterval(update, 60000)
    return () => clearInterval(timer)
  }, [t.deadline])

  const progress = ((t.currentBalance - t.capitalAssigned) / (t.capitalAssigned * t.targetPct / 100)) * 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  const pnl = t.currentBalance - t.capitalAssigned
  const pnlPct = (pnl / t.capitalAssigned) * 100

  const handleJoin = (id: string) => {
    setJoining(id)
    setTimeout(() => setJoining(null), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Nunito', sans-serif" }}>
      {/* Active Tournament */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(12,35,90,0.9), rgba(6,20,58,0.95))',
          border: '1px solid rgba(125,219,255,0.3)',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 0 30px rgba(125,219,255,0.08)',
        }}
      >
        {/* Banner */}
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(125,219,255,0.15), rgba(125,219,255,0.05))',
            border: '1px solid rgba(125,219,255,0.25)',
            borderRadius: '8px',
            padding: '6px 12px',
            marginBottom: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '16px' }}>🌊</span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#7DDBFF', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Wave Challenge
          </span>
          <span
            style={{
              background: 'rgba(61,219,140,0.2)',
              border: '1px solid rgba(61,219,140,0.3)',
              borderRadius: '4px',
              padding: '1px 6px',
              fontSize: '10px',
              fontWeight: 800,
              color: '#3DDB8C',
            }}
          >
            ACTIVE
          </span>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#e8f4ff', margin: '0 0 16px 0' }}>
          {t.name}
        </h3>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Assigned', value: `$${t.capitalAssigned}`, color: '#e8f4ff' },
            { label: 'Current Balance', value: `$${t.currentBalance.toFixed(2)}`, color: '#3DDB8C' },
            { label: 'Time Left', value: timeRemaining, color: '#FFE060' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: 'rgba(2,9,24,0.4)',
                border: '1px solid rgba(70,160,255,0.15)',
                borderRadius: '10px',
                padding: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(125,219,255,0.5)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {label}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 900, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(125,219,255,0.7)' }}>
              Progress to +{t.targetPct}% target
            </span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: pnl >= 0 ? '#3DDB8C' : '#FF6B6B' }}>
              {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
            </span>
          </div>
          <div style={{ height: '10px', background: 'rgba(70,160,255,0.12)', borderRadius: '5px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${clampedProgress}%`,
                background: pnl >= 0
                  ? 'linear-gradient(90deg, #1DB875, #3DDB8C)'
                  : 'linear-gradient(90deg, #cc4444, #FF6B6B)',
                borderRadius: '5px',
                transition: 'width 0.5s ease',
                boxShadow: pnl >= 0 ? '0 0 8px rgba(61,219,140,0.4)' : '0 0 8px rgba(255,107,107,0.4)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(125,219,255,0.4)' }}>Start: ${t.capitalAssigned}</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(125,219,255,0.4)' }}>Target: ${(t.capitalAssigned * (1 + t.targetPct / 100)).toFixed(2)}</span>
          </div>
        </div>

        {/* P&L display */}
        <div
          style={{
            background: pnl >= 0 ? 'rgba(61,219,140,0.08)' : 'rgba(255,107,107,0.08)',
            border: `1px solid ${pnl >= 0 ? 'rgba(61,219,140,0.2)' : 'rgba(255,107,107,0.2)'}`,
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(232,244,255,0.6)' }}>Total P&L</span>
          <span style={{ fontSize: '18px', fontWeight: 900, color: pnl >= 0 ? '#3DDB8C' : '#FF6B6B' }}>
            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Available Challenges */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(12,35,90,0.85), rgba(6,20,58,0.92))',
          border: '1px solid rgba(70,160,255,0.22)',
          borderRadius: '14px',
          padding: '20px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#e8f4ff', margin: '0 0 16px 0' }}>
          ⚔ Available Challenges
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {AVAILABLE_CHALLENGES.map((challenge) => (
            <div
              key={challenge.id}
              style={{
                background: 'rgba(2,9,24,0.4)',
                border: '1px solid rgba(70,160,255,0.15)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(125,219,255,0.3)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(70,160,255,0.15)')}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#e8f4ff', marginBottom: '4px' }}>
                  {challenge.name}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(125,219,255,0.6)' }}>
                    {challenge.reward}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: challenge.risk === 'Low' ? '#3DDB8C' : challenge.risk === 'Medium' ? '#FFE060' : '#FF6B6B',
                      background: challenge.risk === 'Low' ? 'rgba(61,219,140,0.1)' : challenge.risk === 'Medium' ? 'rgba(255,224,96,0.1)' : 'rgba(255,107,107,0.1)',
                      border: `1px solid ${challenge.risk === 'Low' ? 'rgba(61,219,140,0.2)' : challenge.risk === 'Medium' ? 'rgba(255,224,96,0.2)' : 'rgba(255,107,107,0.2)'}`,
                      borderRadius: '4px',
                      padding: '1px 6px',
                    }}
                  >
                    {challenge.risk} Risk
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginRight: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(125,219,255,0.5)', marginBottom: '2px' }}>Entry</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#FFE060' }}>{challenge.entry}</div>
              </div>

              <button
                onClick={() => handleJoin(challenge.id)}
                style={{
                  background: joining === challenge.id
                    ? 'rgba(61,219,140,0.2)'
                    : 'linear-gradient(135deg, #4499FF, #7DDBFF)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: joining === challenge.id ? '#3DDB8C' : '#020918',
                  fontSize: '13px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {joining === challenge.id ? '✓ Joined!' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
