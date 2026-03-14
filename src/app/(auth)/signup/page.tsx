'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  const inputStyle: React.CSSProperties = {
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
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'rgba(125,219,255,0.8)',
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
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
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background:
            'radial-gradient(ellipse at 80% 50%, rgba(70,160,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(125,219,255,0.06) 0%, transparent 50%)',
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
          <p style={{ color: 'rgba(125,219,255,0.6)', fontSize: '14px', fontWeight: 600 }}>
            Start your snowball journey
          </p>
        </div>

        {success ? (
          <div
            style={{
              background: 'rgba(61,219,140,0.15)',
              border: '1px solid rgba(61,219,140,0.4)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              color: '#3DDB8C',
              fontWeight: 700,
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
            <div style={{ fontSize: '16px' }}>Account created!</div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              Check your email to confirm. Redirecting to login...
            </div>
          </div>
        ) : (
          <>
            <h2
              style={{
                color: '#e8f4ff',
                fontSize: '22px',
                fontWeight: 800,
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              Create your account
            </h2>

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

            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="trader@example.com"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat password"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading
                    ? 'rgba(61,219,140,0.2)'
                    : 'linear-gradient(135deg, #1DB875, #3DDB8C)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  color: loading ? 'rgba(61,219,140,0.5)' : 'white',
                  fontSize: '16px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 900,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Creating...' : 'Start Snowballing ❄'}
              </button>
            </form>
          </>
        )}

        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            color: 'rgba(232,244,255,0.5)',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: '#7DDBFF', textDecoration: 'none', fontWeight: 700 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
