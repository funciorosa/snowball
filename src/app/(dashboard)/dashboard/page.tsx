import MetricCards from '@/components/dashboard/MetricCards'
import WaveAlert from '@/components/dashboard/WaveAlert'
import SnowballCalendar from '@/components/dashboard/SnowballCalendar'
import TargetChart from '@/components/dashboard/TargetChart'
import PortfolioBreakdown from '@/components/dashboard/PortfolioBreakdown'

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
    </div>
  )
}
