'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_CHIPS = [
  'How snowball works',
  'BTC entry signal',
  'Wave challenge tips',
  'Risk management',
]

function SabrinaSVG({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crown */}
      <g>
        <polygon points="60,4 50,22 38,10 42,26 28,20 38,34 60,28 82,34 92,20 78,26 82,10 70,22" fill="#7DDBFF" opacity="0.9"/>
        <circle cx="60" cy="6" r="4" fill="#ffffff" opacity="0.9"/>
        <circle cx="38" cy="12" r="3" fill="#7DDBFF"/>
        <circle cx="82" cy="12" r="3" fill="#7DDBFF"/>
      </g>
      {/* Hair - back */}
      <ellipse cx="60" cy="55" rx="28" ry="35" fill="#d8eeff" opacity="0.7"/>
      {/* Face */}
      <ellipse cx="60" cy="52" rx="22" ry="24" fill="#fde8d8"/>
      {/* Hair - front strands */}
      <path d="M38 40 Q32 60 30 90 Q38 100 44 95 Q40 70 42 50Z" fill="#c8e8ff" opacity="0.9"/>
      <path d="M82 40 Q88 60 90 90 Q82 100 76 95 Q80 70 78 50Z" fill="#c8e8ff" opacity="0.9"/>
      {/* Eyes */}
      <ellipse cx="52" cy="52" rx="6" ry="7" fill="#1a4a8a"/>
      <ellipse cx="68" cy="52" rx="6" ry="7" fill="#1a4a8a"/>
      <ellipse cx="52" cy="52" rx="4" ry="5" fill="#2266cc"/>
      <ellipse cx="68" cy="52" rx="4" ry="5" fill="#2266cc"/>
      <circle cx="54" cy="50" r="2" fill="white"/>
      <circle cx="70" cy="50" r="2" fill="white"/>
      <circle cx="53" cy="53" r="1" fill="white" opacity="0.6"/>
      <circle cx="69" cy="53" r="1" fill="white" opacity="0.6"/>
      {/* Nose */}
      <ellipse cx="60" cy="59" rx="2" ry="1.5" fill="#f0b090" opacity="0.7"/>
      {/* Cheeks */}
      <ellipse cx="46" cy="60" rx="5" ry="3" fill="#ffb0b0" opacity="0.4"/>
      <ellipse cx="74" cy="60" rx="5" ry="3" fill="#ffb0b0" opacity="0.4"/>
      {/* Mouth */}
      <path d="M53 65 Q60 70 67 65" stroke="#d08070" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Fur collar */}
      <path d="M38 76 Q60 82 82 76 L86 90 Q60 96 34 90Z" fill="white" opacity="0.9"/>
      <circle cx="60" cy="82" r="4" fill="#7DDBFF" opacity="0.8"/>
      <circle cx="47" cy="79" r="3" fill="white" opacity="0.7"/>
      <circle cx="73" cy="79" r="3" fill="white" opacity="0.7"/>
      {/* Dress body */}
      <path d="M34 90 Q20 105 18 135 L102 135 Q100 105 86 90Z" fill="url(#dressGrad)" opacity="0.95"/>
      {/* Dress pattern dots */}
      <circle cx="50" cy="105" r="1.5" fill="white" opacity="0.4"/>
      <circle cx="60" cy="110" r="1.5" fill="white" opacity="0.4"/>
      <circle cx="70" cy="105" r="1.5" fill="white" opacity="0.4"/>
      <circle cx="45" cy="118" r="1.5" fill="white" opacity="0.4"/>
      <circle cx="60" cy="122" r="1.5" fill="white" opacity="0.4"/>
      <circle cx="75" cy="118" r="1.5" fill="white" opacity="0.4"/>
      {/* Ice staff */}
      <line x1="88" y1="75" x2="110" y2="130" stroke="#7DDBFF" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
      <polygon points="110,120 103,108 117,108" fill="#7DDBFF" opacity="0.9"/>
      <circle cx="110" cy="120" r="5" fill="#a8f0ff" opacity="0.8"/>
      {/* Ice boots */}
      <rect x="36" y="128" width="18" height="10" rx="4" fill="#4499cc" opacity="0.9"/>
      <rect x="66" y="128" width="18" height="10" rx="4" fill="#4499cc" opacity="0.9"/>
      <defs>
        <linearGradient id="dressGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5599dd"/>
          <stop offset="100%" stopColor="#3366aa"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function SabrinaFAB() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Sabrina ❄ Your ice queen trading guide. How can I help you snowball your portfolio today? ✦",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/sabrina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.content }])
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Try again in a moment! ❄" },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '380px',
            maxHeight: '560px',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(145deg, rgba(12,35,90,0.97), rgba(6,20,58,0.99))',
            border: '1px solid rgba(70,160,255,0.3)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(125,219,255,0.1)',
            animation: 'slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(70,160,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <SabrinaSVG size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#7DDBFF' }}>
                SABRINA
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(125,219,255,0.6)', fontWeight: 600 }}>
                Ice Queen AI • Online
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,107,107,0.15)',
                border: '1px solid rgba(255,107,107,0.2)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                color: '#FF6B6B',
                fontSize: '16px',
                fontFamily: "'Nunito', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minHeight: '240px',
              maxHeight: '300px',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                }}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4499FF, #7DDBFF)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      flexShrink: 0,
                    }}
                  >
                    ❄
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '260px',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #4499FF, #7DDBFF)'
                        : 'rgba(12,35,90,0.8)',
                    border: msg.role === 'assistant' ? '1px solid rgba(70,160,255,0.2)' : 'none',
                    color: msg.role === 'user' ? '#020918' : '#e8f4ff',
                    fontSize: '13px',
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4499FF, #7DDBFF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                  }}
                >
                  ❄
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '14px 14px 14px 4px',
                    background: 'rgba(12,35,90,0.8)',
                    border: '1px solid rgba(70,160,255,0.2)',
                    color: 'rgba(125,219,255,0.7)',
                    fontSize: '18px',
                    letterSpacing: '3px',
                  }}
                >
                  <span style={{ animation: 'pulse-glow 1s ease-in-out infinite' }}>···</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips */}
          <div
            style={{
              padding: '8px 16px',
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              borderTop: '1px solid rgba(70,160,255,0.1)',
            }}
          >
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                disabled={loading}
                style={{
                  background: 'rgba(125,219,255,0.1)',
                  border: '1px solid rgba(125,219,255,0.25)',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  color: '#7DDBFF',
                  fontSize: '11px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(70,160,255,0.15)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Ask Sabrina anything..."
              disabled={loading}
              style={{
                flex: 1,
                background: 'rgba(2,9,24,0.6)',
                border: '1px solid rgba(70,160,255,0.25)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#e8f4ff',
                fontSize: '13px',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                outline: 'none',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                background:
                  loading || !input.trim()
                    ? 'rgba(125,219,255,0.15)'
                    : 'linear-gradient(135deg, #4499FF, #7DDBFF)',
                border: 'none',
                borderRadius: '10px',
                width: '40px',
                height: '40px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                color: loading || !input.trim() ? 'rgba(125,219,255,0.4)' : '#020918',
                fontSize: '18px',
                fontFamily: "'Nunito', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(145deg, rgba(12,35,90,0.95), rgba(6,20,58,0.98))',
          border: '2px solid rgba(125,219,255,0.4)',
          cursor: 'pointer',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          animation: 'float 3s ease-in-out infinite',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(125,219,255,0.2)',
          transition: 'border-color 0.2s',
          padding: 0,
        }}
      >
        <SabrinaSVG size={46} />
        {/* Green online dot */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#3DDB8C',
            border: '2px solid #020918',
            animation: 'pulse-green 2s ease-in-out infinite',
          }}
        />
        <div
          style={{
            fontSize: '8px',
            fontWeight: 800,
            color: '#7DDBFF',
            fontFamily: "'Nunito', sans-serif",
            letterSpacing: '0.5px',
            lineHeight: 1,
          }}
        >
          SABRINA
        </div>
      </button>
    </>
  )
}
