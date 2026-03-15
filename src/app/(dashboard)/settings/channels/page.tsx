'use client'

import { useState, useEffect, useCallback } from 'react'

// ── Styles ─────────────────────────────────────────────────────────────────
const icePanel: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(12,35,90,0.88), rgba(6,20,58,0.94))',
  border: '1px solid rgba(70,160,255,0.28)',
  borderRadius: '14px',
  padding: '24px',
  boxShadow: 'inset 0 1px 0 rgba(125,219,255,0.18), inset 0 0 40px rgba(70,160,255,0.06), 0 8px 32px rgba(0,0,0,0.35)',
  fontFamily: "'Nunito', sans-serif",
}

const btn = (color: 'blue' | 'red' | 'ghost'): React.CSSProperties => ({
  background: color === 'blue'
    ? 'linear-gradient(135deg, #4499FF, #7DDBFF)'
    : color === 'red'
    ? 'rgba(255,107,107,0.15)'
    : 'rgba(70,160,255,0.1)',
  border: color === 'red'
    ? '1px solid rgba(255,107,107,0.4)'
    : color === 'ghost'
    ? '1px solid rgba(70,160,255,0.3)'
    : 'none',
  borderRadius: '8px',
  padding: '7px 14px',
  color: color === 'blue' ? '#020918' : color === 'red' ? '#FF6B6B' : '#7DDBFF',
  fontSize: '13px',
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 700,
  cursor: 'pointer',
})

const input: React.CSSProperties = {
  background: 'rgba(2,9,24,0.6)',
  border: '1px solid rgba(70,160,255,0.3)',
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#e8f4ff',
  fontSize: '14px',
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 600,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
}

// ── Types ──────────────────────────────────────────────────────────────────
interface MonitoredChannel {
  id: string
  channel_username: string
  channel_title: string
  last_checked_at: string | null
  is_active: boolean
}

interface TelegramChannel {
  id: string
  title: string
  username: string
  memberCount: number
}

type Step = 'check' | 'phone' | 'code' | 'connected'

// ── Component ──────────────────────────────────────────────────────────────
export default function ChannelsPage() {
  const [step, setStep] = useState<Step>('check')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [phoneCodeHash, setPhoneCodeHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [monitored, setMonitored] = useState<MonitoredChannel[]>([])
  const [allChannels, setAllChannels] = useState<TelegramChannel[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [search, setSearch] = useState('')
  const [addingId, setAddingId] = useState<string | null>(null)

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

  // ── Load state on mount ──────────────────────────────────────────────────
  const loadMonitored = useCallback(async () => {
    const res = await fetch('/api/telegram/channels/list')
    if (res.ok) {
      const d = await res.json()
      setMonitored(d.channels ?? [])
    }
  }, [])

  useEffect(() => {
    // Check if already connected
    fetch('/api/telegram/auth/status')
      .then((r) => r.json())
      .then((d) => {
        if (d.connected) {
          setStep('connected')
          loadMonitored()
        } else {
          setStep('phone')
        }
      })
      .catch(() => setStep('phone'))
  }, [loadMonitored])

  // ── Auth flow ────────────────────────────────────────────────────────────
  const sendCode = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/telegram/auth/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const d = await res.json()
    setLoading(false)
    if (!res.ok) { setError(d.error ?? 'Failed to send code'); return }
    setPhoneCodeHash(d.phoneCodeHash)
    setStep('code')
  }

  const verifyCode = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/telegram/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, phoneCodeHash }),
    })
    const d = await res.json()
    setLoading(false)
    if (!res.ok) { setError(d.error ?? 'Verification failed'); return }
    setStep('connected')
    loadMonitored()
  }

  // ── Fetch all channels from Telegram ────────────────────────────────────
  const loadAllChannels = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/telegram/channels')
    const d = await res.json()
    setLoading(false)
    if (!res.ok) { setError(d.message ?? d.error ?? 'Failed to load channels'); return }
    setAllChannels(d.channels ?? [])
    setShowPicker(true)
  }

  // ── Add channel to monitoring ────────────────────────────────────────────
  const addChannel = async (ch: TelegramChannel) => {
    setAddingId(ch.id)
    await fetch('/api/telegram/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_username: ch.username, channel_id: ch.id, channel_title: ch.title }),
    })
    setAddingId(null)
    setShowPicker(false)
    await loadMonitored()
    flash(`✅ Now monitoring @${ch.username}`)
  }

  // ── Remove channel ───────────────────────────────────────────────────────
  const removeChannel = async (id: string, username: string) => {
    await fetch(`/api/telegram/channels/${id}`, { method: 'DELETE' })
    setMonitored((prev) => prev.filter((c) => c.id !== id))
    flash(`Removed @${username}`)
  }

  const monitoredUsernames = new Set(monitored.map((c) => c.channel_username))
  const filtered = allChannels.filter(
    (c) =>
      !monitoredUsernames.has(c.username) &&
      (search === '' || c.title.toLowerCase().includes(search.toLowerCase()) || c.username.toLowerCase().includes(search.toLowerCase()))
  )

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '680px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#e8f4ff', margin: 0, marginBottom: '4px', fontFamily: "'Nunito', sans-serif" }}>
          📡 Channel Signals
        </h1>
        <p style={{ color: 'rgba(125,219,255,0.55)', fontSize: '14px', fontWeight: 600, margin: 0, fontFamily: "'Nunito', sans-serif" }}>
          Monitor Telegram channels — Claude AI extracts trading signals automatically
        </p>
      </div>

      {/* Flash */}
      {success && (
        <div style={{ background: 'rgba(61,219,140,0.15)', border: '1px solid rgba(61,219,140,0.4)', borderRadius: '10px', padding: '12px 16px', color: '#3DDB8C', fontSize: '14px', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '10px', padding: '12px 16px', color: '#FF6B6B', fontSize: '14px', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
          {error}
        </div>
      )}

      {/* ── STEP: Phone ── */}
      {step === 'phone' && (
        <div style={icePanel}>
          <h3 style={{ color: '#e8f4ff', fontSize: '16px', fontWeight: 800, margin: '0 0 8px', fontFamily: "'Nunito', sans-serif" }}>
            🔐 Connect your Telegram
          </h3>
          <p style={{ color: 'rgba(125,219,255,0.7)', fontSize: '13px', fontWeight: 600, margin: '0 0 20px', fontFamily: "'Nunito', sans-serif" }}>
            We&apos;ll send a verification code to your phone via Telegram. We only read channel messages — never send anything from your account.
          </p>
          <label style={{ display: 'block', color: 'rgba(125,219,255,0.8)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Nunito', sans-serif" }}>
            Phone number (with country code)
          </label>
          <input
            style={input}
            type="tel"
            placeholder="+1 555 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(125,219,255,0.6)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(70,160,255,0.3)')}
          />
          <button
            style={{ ...btn('blue'), marginTop: '16px', padding: '11px 24px', fontSize: '14px' }}
            onClick={sendCode}
            disabled={loading || !phone.trim()}
          >
            {loading ? 'Sending...' : 'Send Code via Telegram ❄'}
          </button>
        </div>
      )}

      {/* ── STEP: Code ── */}
      {step === 'code' && (
        <div style={icePanel}>
          <h3 style={{ color: '#e8f4ff', fontSize: '16px', fontWeight: 800, margin: '0 0 8px', fontFamily: "'Nunito', sans-serif" }}>
            📲 Enter verification code
          </h3>
          <p style={{ color: 'rgba(125,219,255,0.7)', fontSize: '13px', fontWeight: 600, margin: '0 0 20px', fontFamily: "'Nunito', sans-serif" }}>
            Telegram sent a code to <span style={{ color: '#7DDBFF' }}>{phone}</span>. Check your Telegram app.
          </p>
          <label style={{ display: 'block', color: 'rgba(125,219,255,0.8)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Nunito', sans-serif" }}>
            Verification code
          </label>
          <input
            style={{ ...input, letterSpacing: '4px', fontSize: '18px' }}
            type="text"
            placeholder="12345"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(125,219,255,0.6)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(70,160,255,0.3)')}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button style={{ ...btn('blue'), padding: '11px 24px', fontSize: '14px' }} onClick={verifyCode} disabled={loading || !code.trim()}>
              {loading ? 'Verifying...' : 'Verify ✓'}
            </button>
            <button style={{ ...btn('ghost'), padding: '11px 24px', fontSize: '14px' }} onClick={() => { setStep('phone'); setCode('') }}>
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: Connected ── */}
      {step === 'connected' && (
        <>
          {/* Monitored channels list */}
          <div style={icePanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#e8f4ff', fontSize: '16px', fontWeight: 800, margin: 0, fontFamily: "'Nunito', sans-serif" }}>
                📡 Monitored Channels
              </h3>
              <button style={btn('blue')} onClick={loadAllChannels} disabled={loading}>
                {loading ? '...' : '+ Add Channel'}
              </button>
            </div>

            {monitored.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(125,219,255,0.4)', fontFamily: "'Nunito', sans-serif" }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>No channels monitored yet.</p>
                <p style={{ fontSize: '13px', margin: '4px 0 0', opacity: 0.7 }}>Click &quot;+ Add Channel&quot; to pick from your Telegram channels.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {monitored.map((ch) => {
                  const lastCheck = ch.last_checked_at
                    ? (() => {
                        const mins = Math.floor((Date.now() - new Date(ch.last_checked_at).getTime()) / 60000)
                        return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`
                      })()
                    : 'never'
                  return (
                    <div
                      key={ch.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(70,160,255,0.06)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        border: '1px solid rgba(70,160,255,0.12)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3DDB8C', display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontWeight: 800, fontSize: '14px', color: '#e8f4ff', fontFamily: "'Nunito', sans-serif" }}>
                            @{ch.channel_username}
                          </span>
                        </div>
                        {ch.channel_title && (
                          <div style={{ fontSize: '12px', color: 'rgba(125,219,255,0.6)', fontFamily: "'Nunito', sans-serif", paddingLeft: '14px' }}>
                            {ch.channel_title}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: 'rgba(125,219,255,0.4)', fontFamily: "'Nunito', sans-serif", paddingLeft: '14px', marginTop: '2px' }}>
                          Last checked: {lastCheck}
                        </div>
                      </div>
                      <button style={btn('red')} onClick={() => removeChannel(ch.id, ch.channel_username)}>
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Info card */}
          <div style={{ ...icePanel, padding: '16px 20px' }}>
            <p style={{ color: 'rgba(125,219,255,0.6)', fontSize: '13px', fontWeight: 600, margin: 0, fontFamily: "'Nunito', sans-serif", lineHeight: 1.6 }}>
              🤖 <strong style={{ color: 'rgba(125,219,255,0.9)' }}>How it works:</strong> Every 10 minutes, Snowball fetches new messages from your monitored channels and runs them through Claude AI. If a trading signal is detected with confidence ≥ 50%, you&apos;ll receive a Telegram notification.
            </p>
          </div>
        </>
      )}

      {/* ── Channel Picker Modal ── */}
      {showPicker && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(2,9,24,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '24px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPicker(false) }}
        >
          <div
            style={{
              width: '100%', maxWidth: '500px', maxHeight: '70vh',
              background: 'linear-gradient(145deg, rgba(12,35,90,0.98), rgba(6,20,58,0.99))',
              border: '1px solid rgba(70,160,255,0.35)',
              borderRadius: '16px', padding: '24px',
              display: 'flex', flexDirection: 'column', gap: '16px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#e8f4ff', fontSize: '16px', fontWeight: 800, margin: 0 }}>
                Select channels to monitor
              </h3>
              <button
                style={{ background: 'none', border: 'none', color: 'rgba(125,219,255,0.6)', fontSize: '20px', cursor: 'pointer' }}
                onClick={() => setShowPicker(false)}
              >
                ×
              </button>
            </div>

            <input
              style={input}
              placeholder="Search channels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.length === 0 ? (
                <p style={{ color: 'rgba(125,219,255,0.4)', fontSize: '14px', textAlign: 'center', padding: '20px 0', margin: 0 }}>
                  {allChannels.length === 0 ? 'No public channels found in your Telegram.' : 'No results.'}
                </p>
              ) : (
                filtered.map((ch) => (
                  <div
                    key={ch.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: 'rgba(70,160,255,0.06)', borderRadius: '10px',
                      padding: '10px 14px', border: '1px solid rgba(70,160,255,0.1)',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#e8f4ff' }}>@{ch.username}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(125,219,255,0.6)' }}>{ch.title}</div>
                      {ch.memberCount > 0 && (
                        <div style={{ fontSize: '11px', color: 'rgba(125,219,255,0.4)' }}>
                          {ch.memberCount.toLocaleString()} members
                        </div>
                      )}
                    </div>
                    <button
                      style={btn('blue')}
                      onClick={() => addChannel(ch)}
                      disabled={addingId === ch.id}
                    >
                      {addingId === ch.id ? '...' : '+ Monitor'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
