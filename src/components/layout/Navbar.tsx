'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const tabs = [
  { label: 'Dashboard', href: '/dashboard', icon: '❄' },
  { label: 'Signals', href: '/signals', icon: '📡' },
  { label: 'Achievements', href: '/achievements', icon: '🏆' },
  { label: 'Arena', href: '/arena', icon: '⚔' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(2,9,24,0.92)',
        borderBottom: '1px solid rgba(70,160,255,0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Logo */}
      <Link href="/dashboard" style={{ textDecoration: 'none' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '22px' }}>❄</span>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #7DDBFF, #4499FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px',
            }}
          >
            SNOWBALL
          </span>
        </div>
      </Link>

      {/* Center Tabs */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isActive ? '#7DDBFF' : 'rgba(232,244,255,0.55)',
                  background: isActive
                    ? 'rgba(125,219,255,0.12)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(125,219,255,0.25)'
                    : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '12px' }}>{tab.icon}</span>
                {tab.label}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Right: Live badge + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Binance Live Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(61,219,140,0.12)',
            border: '1px solid rgba(61,219,140,0.3)',
            borderRadius: '8px',
            padding: '5px 10px',
          }}
        >
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#3DDB8C',
              animation: 'pulse-green 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#3DDB8C',
              letterSpacing: '0.5px',
            }}
          >
            BINANCE LIVE
          </span>
        </div>

        {/* User Avatar */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4499FF, #7DDBFF)',
              border: '2px solid rgba(125,219,255,0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontFamily: "'Nunito', sans-serif",
              color: '#020918',
              fontWeight: 900,
            }}
          >
            T
          </button>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                background: 'linear-gradient(145deg, rgba(12,35,90,0.98), rgba(6,20,58,0.99))',
                border: '1px solid rgba(70,160,255,0.22)',
                borderRadius: '12px',
                padding: '8px',
                minWidth: '160px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  background: 'rgba(255,107,107,0.1)',
                  border: '1px solid rgba(255,107,107,0.2)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#FF6B6B',
                  fontSize: '14px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
