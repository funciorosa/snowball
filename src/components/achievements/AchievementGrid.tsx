'use client'

interface Achievement {
  id: string
  badgeName: string
  description: string
  icon: string
  unlockedAt?: string
  locked: boolean
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const ACHIEVEMENTS: Achievement[] = [
  { id: '1', badgeName: 'First Snowflake', description: 'Complete your first trade', icon: '❄', unlockedAt: '2026-03-01', locked: false, rarity: 'common' },
  { id: '2', badgeName: 'Ice Streak', description: '5 winning trades in a row', icon: '🔥', unlockedAt: '2026-03-05', locked: false, rarity: 'rare' },
  { id: '3', badgeName: 'Wave Rider', description: 'Complete 3 wave challenges', icon: '🌊', unlockedAt: '2026-03-08', locked: false, rarity: 'rare' },
  { id: '4', badgeName: 'Snowball Effect', description: 'Reach 10% portfolio growth', icon: '⛄', unlockedAt: '2026-03-10', locked: false, rarity: 'epic' },
  { id: '5', badgeName: 'Diamond Hands', description: 'Hold through -5% drawdown and recover', icon: '💎', locked: true, rarity: 'epic' },
  { id: '6', badgeName: 'Arctic Champion', description: 'Win 10 consecutive trades', icon: '🏆', locked: true, rarity: 'legendary' },
  { id: '7', badgeName: 'Compound King', description: 'Achieve 2%/day for 30 days', icon: '👑', locked: true, rarity: 'legendary' },
  { id: '8', badgeName: 'SOL Surfer', description: 'Make 5 profitable SOL trades', icon: '◎', unlockedAt: '2026-03-09', locked: false, rarity: 'common' },
  { id: '9', badgeName: 'BTC Believer', description: 'Hold BTC through 3 corrections', icon: '₿', locked: true, rarity: 'rare' },
  { id: '10', badgeName: 'Arena Master', description: 'Win your first tournament', icon: '⚔', locked: true, rarity: 'epic' },
  { id: '11', badgeName: 'Sabrina\'s Favorite', description: 'Chat with Sabrina 10 times', icon: '✦', unlockedAt: '2026-03-11', locked: false, rarity: 'common' },
  { id: '12', badgeName: 'Ice Queen', description: 'Reach $2000 portfolio balance', icon: '👸', locked: true, rarity: 'legendary' },
]

const RARITY_STYLES: Record<string, { border: string; glow: string; label: string; labelColor: string }> = {
  common: { border: 'rgba(125,219,255,0.3)', glow: 'rgba(125,219,255,0.15)', label: 'Common', labelColor: '#7DDBFF' },
  rare: { border: 'rgba(100,120,255,0.4)', glow: 'rgba(100,120,255,0.2)', label: 'Rare', labelColor: '#8888FF' },
  epic: { border: 'rgba(153,69,255,0.4)', glow: 'rgba(153,69,255,0.2)', label: 'Epic', labelColor: '#9945FF' },
  legendary: { border: 'rgba(255,224,96,0.5)', glow: 'rgba(255,224,96,0.2)', label: 'Legendary', labelColor: '#FFE060' },
}

export default function AchievementGrid() {
  const unlocked = ACHIEVEMENTS.filter((a) => !a.locked).length
  const total = ACHIEVEMENTS.length

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Header stats */}
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(12,35,90,0.85), rgba(6,20,58,0.92))',
          border: '1px solid rgba(70,160,255,0.22)',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div style={{ fontSize: '32px' }}>🏆</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(125,219,255,0.6)', marginBottom: '4px' }}>
            Achievement Progress
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#e8f4ff' }}>
              {unlocked}/{total}
            </span>
            <div style={{ flex: 1, height: '8px', background: 'rgba(70,160,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(unlocked / total) * 100}%`,
                  background: 'linear-gradient(90deg, #4499FF, #7DDBFF)',
                  borderRadius: '4px',
                  boxShadow: '0 0 8px rgba(125,219,255,0.4)',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#7DDBFF' }}>
              {Math.round((unlocked / total) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        {ACHIEVEMENTS.map((achievement) => {
          const rarityStyle = RARITY_STYLES[achievement.rarity]
          return (
            <div
              key={achievement.id}
              style={{
                background: achievement.locked
                  ? 'linear-gradient(145deg, rgba(6,15,40,0.8), rgba(4,10,30,0.9))'
                  : 'linear-gradient(145deg, rgba(12,35,90,0.9), rgba(6,20,58,0.95))',
                border: `1px solid ${achievement.locked ? 'rgba(70,160,255,0.1)' : rarityStyle.border}`,
                borderRadius: '14px',
                padding: '18px 16px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s',
                boxShadow: achievement.locked ? 'none' : `0 4px 20px ${rarityStyle.glow}`,
              }}
            >
              {/* Locked overlay */}
              {achievement.locked && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(2,9,24,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '14px',
                    backdropFilter: 'blur(2px)',
                    zIndex: 1,
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔒</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(125,219,255,0.4)' }}>
                      LOCKED
                    </div>
                  </div>
                </div>
              )}

              {/* Rarity tag */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  fontSize: '9px',
                  fontWeight: 800,
                  color: rarityStyle.labelColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: achievement.locked ? 0.4 : 1,
                }}
              >
                {rarityStyle.label}
              </div>

              {/* Icon */}
              <div
                style={{
                  fontSize: '36px',
                  marginBottom: '8px',
                  filter: achievement.locked ? 'grayscale(1) opacity(0.3)' : 'none',
                  lineHeight: 1,
                }}
              >
                {achievement.icon}
              </div>

              {/* Name */}
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: achievement.locked ? 'rgba(232,244,255,0.3)' : '#e8f4ff',
                  marginBottom: '6px',
                  lineHeight: 1.2,
                }}
              >
                {achievement.badgeName}
              </div>

              {/* Description */}
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: achievement.locked ? 'rgba(125,219,255,0.2)' : 'rgba(125,219,255,0.55)',
                  lineHeight: 1.4,
                  marginBottom: '8px',
                }}
              >
                {achievement.description}
              </div>

              {/* Date or Locked */}
              {!achievement.locked && achievement.unlockedAt && (
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'rgba(125,219,255,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  ✓ {(() => {
                      const [, m, d] = achievement.unlockedAt.split('-')
                      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                      return `${months[parseInt(m) - 1]} ${parseInt(d)}`
                    })()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
