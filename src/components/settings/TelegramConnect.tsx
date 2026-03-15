'use client'

import { useState, useEffect, useRef } from 'react'

type Status = 'idle' | 'loading' | 'showing-code' | 'connected' | 'disconnected'

export default function TelegramConnect() {
  const [status, setStatus] = useState<Status>('idle')
  const [code, setCode] = useState('')
  const [connected, setConnected] = useState(false)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check initial status
    fetch('/api/telegram/connect')
      .then(r => r.json())
      .then(d => {
        setConnected(d.connected)
        setStatus(d.connected ? 'connected' : 'disconnected')
      })
      .catch(() => setStatus('disconnected'))

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      const r = await fetch('/api/telegram/connect')
      const d = await r.json()
      if (d.connected) {
        setConnected(true)
        setStatus('connected')
        if (pollRef.current) clearInterval(pollRef.current)
      }
    }, 3000)
  }

  const handleConnect = async () => {
    setStatus('loading')
    const r = await fetch('/api/telegram/connect', { method: 'POST' })
    const d = await r.json()
    if (d.code) {
      setCode(d.code)
      setStatus('showing-code')
      startPolling()
    }
  }

  const handleDisconnect = async () => {
    await fetch('/api/telegram/disconnect', { method: 'POST' })
    setConnected(false)
    setStatus('disconnected')
    setCode('')
  }

  const panelStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg, rgba(12,35,90,0.88), rgba(6,20,58,0.94))',
    border: '1px solid rgba(70,160,255,0.28)',
    borderRadius: '14px',
    padding: '20px',
    fontFamily: "'Nunito', sans-serif",
    boxShadow: 'inset 0 1px 0 rgba(125,219,255,0.18), inset 0 0 40px rgba(70,160,255,0.06), 0 8px 32px rgba(0,0,0,0.35)',
  }

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        {/* Telegram icon */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #229ED9, #1A8BBF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', boxShadow: '0 4px 12px rgba(34,158,217,0.4)',
        }}>
          ✈
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#e8f4ff' }}>Telegram Notifications</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(125,219,255,0.6)' }}>
            Get wave alerts, targets & daily summaries
          </div>
        </div>
        {/* Status badge */}
        <div style={{ marginLeft: 'auto' }}>
          {connected ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(61,219,140,0.12)', border: '1px solid rgba(61,219,140,0.3)',
              borderRadius: '8px', padding: '4px 10px',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3DDB8C' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#3DDB8C' }}>CONNECTED</span>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)',
              borderRadius: '8px', padding: '4px 10px',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FF6B6B' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#FF6B6B' }}>NOT CONNECTED</span>
            </div>
          )}
        </div>
      </div>

      {/* Notification types preview */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['🌊 Wave signals', '✅ Target alerts', '🛑 Stop-loss', '📊 Daily summary'].map(t => (
          <span key={t} style={{
            fontSize: '11px', fontWeight: 700,
            background: 'rgba(125,219,255,0.08)', border: '1px solid rgba(125,219,255,0.2)',
            borderRadius: '6px', padding: '3px 8px', color: 'rgba(125,219,255,0.8)',
          }}>{t}</span>
        ))}
      </div>

      {/* Connected state */}
      {connected && (
        <div>
          <div style={{
            background: 'rgba(61,219,140,0.08)', border: '1px solid rgba(61,219,140,0.2)',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '12px',
          }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#3DDB8C' }}>
              ✅ Telegram is connected. You will receive notifications for waves, targets, stop-losses, and the daily 8pm summary.
            </p>
          </div>
          <button onClick={handleDisconnect} style={{
            background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)',
            borderRadius: '10px', padding: '10px 20px', color: '#FF6B6B',
            fontSize: '13px', fontFamily: "'Nunito', sans-serif", fontWeight: 700, cursor: 'pointer',
          }}>
            Disconnect Telegram
          </button>
        </div>
      )}

      {/* Disconnected state — Connect button */}
      {status === 'disconnected' && (
        <button onClick={handleConnect} style={{
          width: '100%',
          background: 'linear-gradient(135deg, #229ED9, #1A8BBF)',
          border: 'none', borderRadius: '12px', padding: '13px',
          color: 'white', fontSize: '15px', fontFamily: "'Nunito', sans-serif",
          fontWeight: 900, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(34,158,217,0.35)',
          transition: 'all 0.2s',
        }}>
          ✈ Connect Telegram
        </button>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <div style={{ textAlign: 'center', color: 'rgba(125,219,255,0.6)', fontWeight: 700 }}>
          Generating code...
        </div>
      )}

      {/* Showing code — instructions */}
      {status === 'showing-code' && code && (
        <div>
          <div style={{
            background: 'rgba(2,9,24,0.5)', border: '1px solid rgba(70,160,255,0.2)',
            borderRadius: '12px', padding: '16px', marginBottom: '14px',
          }}>
            {[
              { n: 1, text: 'Open Telegram on your phone' },
              { n: 2, text: 'Search for @SnowballCryptoBot' },
              { n: 3, text: 'Tap START to activate the bot' },
              { n: 4, text: 'Send this exact code:' },
            ].map(({ n, text }) => (
              <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4499FF, #7DDBFF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 900, color: '#020918', flexShrink: 0,
                }}>{n}</div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(232,244,255,0.8)', paddingTop: '2px' }}>{text}</span>
              </div>
            ))}

            {/* The code */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(34,158,217,0.15), rgba(125,219,255,0.1))',
              border: '2px solid rgba(34,158,217,0.4)',
              borderRadius: '12px', padding: '16px',
              textAlign: 'center', marginTop: '8px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(125,219,255,0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Your verification code
              </div>
              <div style={{
                fontSize: '32px', fontWeight: 900, color: '#7DDBFF',
                letterSpacing: '10px', fontVariantNumeric: 'tabular-nums',
              }}>
                {code}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(125,219,255,0.4)', marginTop: '6px' }}>
                Expires in 10 minutes
              </div>
            </div>
          </div>

          {/* Waiting indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(125,219,255,0.06)', border: '1px solid rgba(125,219,255,0.15)',
            borderRadius: '10px', padding: '10px 14px',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%', background: '#7DDBFF',
              animation: 'pulse-glow 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(125,219,255,0.7)' }}>
              Waiting for you to send the code...
            </span>
          </div>

          <button onClick={() => { setStatus('disconnected'); setCode(''); if (pollRef.current) clearInterval(pollRef.current) }}
            style={{
              marginTop: '10px', background: 'transparent',
              border: 'none', color: 'rgba(125,219,255,0.4)',
              fontSize: '12px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 600,
            }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
