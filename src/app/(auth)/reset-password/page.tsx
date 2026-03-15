'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase handles the token from the URL hash automatically
    // We just need to confirm the session is active
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020918',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Nunito', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Aurora background */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(70,160,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(125,219,255,0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(145deg, rgba(12,35,90,0.9), rgba(6,20,58,0.95))',
          border: '1px solid rgba(70,160,255,0.22)',
          borderRadius: '20px',
          padding: '40px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #7DDBFF, #4499FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-1px',
              marginBottom: '4px',
            }}
          >
            ❄ SNOWBALL
          </div>
        </div>

        {done ? (
          /* Success */
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#e8f4ff', fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>
              Password updated!
            </h2>
            <p style={{ color: 'rgba(125,219,255,0.7)', fontSize: '14px', fontWeight: 600 }}>
              Redirecting you to the dashboard...
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ color: '#e8f4ff', fontSize: '22px', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>
              Set new password
            </h2>
            <p style={{ color: 'rgba(125,219,255,0.6)', fontSize: '14px', fontWeight: 600, textAlign: 'center', marginBottom: '28px' }}>
              Choose a strong password for your account
            </p>

            {error && (
              <div
                style={{
                  background: 'rgba(255,107,107,0.15)',
                  border: '1px solid rgba(255,107,107,0.4)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: '#FF6B6B',
                  fontSize: '14px',
                  marginBottom: '16px',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    color: 'rgba(125,219,255,0.8)',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  style={{
                    width: '100%',
                    background: 'rgba(2,9,24,0.6)',
                    border: '1px solid rgba(70,160,255,0.3)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    color: '#e8f4ff',
                    fontSize: '15px',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(125,219,255,0.6)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(70,160,255,0.3)')}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    color: 'rgba(125,219,255,0.8)',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    background: 'rgba(2,9,24,0.6)',
                    border: '1px solid rgba(70,160,255,0.3)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    color: '#e8f4ff',
                    fontSize: '15px',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(125,219,255,0.6)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(70,160,255,0.3)')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading
                    ? 'rgba(125,219,255,0.2)'
                    : 'linear-gradient(135deg, #4499FF, #7DDBFF)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  color: loading ? 'rgba(125,219,255,0.5)' : '#020918',
                  fontSize: '16px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 900,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.5px',
                }}
              >
                {loading ? 'Updating...' : 'Update Password ❄'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(232,244,255,0.5)', fontSize: '14px', fontWeight: 600 }}>
              <Link href="/login" style={{ color: '#7DDBFF', textDecoration: 'none', fontWeight: 700 }}>
                ← Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
