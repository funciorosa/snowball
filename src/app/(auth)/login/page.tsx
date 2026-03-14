'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(70,160,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(125,219,255,0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background:
            'linear-gradient(145deg, rgba(12,35,90,0.9), rgba(6,20,58,0.95))',
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
          <p style={{ color: 'rgba(125,219,255,0.6)', fontSize: '14px', fontWeight: 600 }}>
            Compound your way to crypto freedom
          </p>
        </div>

        <h2
          style={{
            color: '#e8f4ff',
            fontSize: '22px',
            fontWeight: 800,
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          Welcome back
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

        <form onSubmit={handleLogin}>
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="trader@example.com"
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
                transition: 'border-color 0.2s',
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                transition: 'border-color 0.2s',
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
              transition: 'all 0.2s',
              letterSpacing: '0.5px',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In ❄'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            color: 'rgba(232,244,255,0.5)',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          No account?{' '}
          <Link
            href="/signup"
            style={{
              color: '#7DDBFF',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}
