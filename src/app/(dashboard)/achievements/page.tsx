import AchievementGrid from '@/components/achievements/AchievementGrid'

export default function AchievementsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#e8f4ff', margin: 0, marginBottom: '4px' }}>
          🏆 Achievements
        </h1>
        <p style={{ color: 'rgba(125,219,255,0.55)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
          Earn badges and track your trading milestones
        </p>
      </div>
      <AchievementGrid />
    </div>
  )
}
