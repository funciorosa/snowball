export const dynamic = 'force-dynamic'

import MetricCards from '@/components/dashboard/MetricCards'
import WaveAlert from '@/components/dashboard/WaveAlert'
import SnowballCalendar from '@/components/dashboard/SnowballCalendar'
import TargetChart from '@/components/dashboard/TargetChart'
import PortfolioBreakdown from '@/components/dashboard/PortfolioBreakdown'
import HeroBanner from '@/components/dashboard/HeroBanner'
import TelegramConnect from '@/components/settings/TelegramConnect'

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function DashboardPage() {
  const now = new Date()
  const dateLabel = `${WEEKDAYS[now.getDay()]}, ${MONTHS_LONG[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Page header */}
      <div>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 900,
            color: '#e8f4ff',
            margin: 0,
            marginBottom: '4px',
          }}
        >
          ❄ Dashboard
        </h1>
        <p style={{ color: 'rgba(125,219,255,0.55)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
          {dateLabel}
        </p>
      </div>

      {/* Metric Cards */}
      <MetricCards />

      {/* Wave Alert */}
      <WaveAlert coin="BTC" percentage="+4.2%" timeframe="4H" />

      {/* Main content grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        }}
      >
        <SnowballCalendar />
        <TargetChart />
      </div>

      {/* Portfolio Breakdown */}
      <PortfolioBreakdown />

      {/* Telegram Notifications */}
      <TelegramConnect />
    </div>
  )
}
