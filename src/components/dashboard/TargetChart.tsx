'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ChartPoint {
  date: string
  actual: number
  target: number
}

function generateChartData(initialCapital: number): ChartPoint[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const todayDay = today.getDate()

  const data: ChartPoint[] = []
  let actual = initialCapital

  for (let day = 1; day <= todayDay; day++) {
    const target = initialCapital * Math.pow(1.02, day - 1)
    const dailyReturn = (Math.random() * 4.5 - 0.8) / 100
    actual = actual * (1 + dailyReturn)

    const date = new Date(year, month, day)
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    data.push({
      date: label,
      actual: parseFloat(actual.toFixed(2)),
      target: parseFloat(target.toFixed(2)),
    })
  }

  return data
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        background: 'rgba(6,20,58,0.97)',
        border: '1px solid rgba(70,160,255,0.3)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <p style={{ color: 'rgba(125,219,255,0.7)', fontSize: '12px', fontWeight: 700, margin: '0 0 6px 0' }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          style={{
            color: entry.color,
            fontSize: '13px',
            fontWeight: 800,
            margin: '2px 0',
          }}
        >
          {entry.name === 'actual' ? 'Actual' : 'Target'}: ${entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  )
}

export default function TargetChart({ initialCapital = 1000 }: { initialCapital?: number }) {
  const [data, setData] = useState<ChartPoint[]>([])

  useEffect(() => {
    setData(generateChartData(initialCapital))
  }, [initialCapital])

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(12,35,90,0.85), rgba(6,20,58,0.92))',
        border: '1px solid rgba(70,160,255,0.22)',
        borderRadius: '14px',
        padding: '20px',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#e8f4ff', margin: 0 }}>
          📈 Performance vs Target
        </h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '16px', height: '2px', background: '#3DDB8C' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(232,244,255,0.6)' }}>Actual</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '16px', height: '2px', background: '#7DDBFF', borderTop: '2px dashed #7DDBFF' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(232,244,255,0.6)' }}>2% Target</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(70,160,255,0.08)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(125,219,255,0.5)', fontSize: 11, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}
            axisLine={{ stroke: 'rgba(70,160,255,0.2)' }}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: 'rgba(125,219,255,0.5)', fontSize: 11, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}
            axisLine={{ stroke: 'rgba(70,160,255,0.2)' }}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
            width={65}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#3DDB8C"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#3DDB8C', stroke: '#020918', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#7DDBFF"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 5, fill: '#7DDBFF', stroke: '#020918', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
