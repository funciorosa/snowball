'use client'

import { useState, useEffect } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const MIN_SIZE = 12
const MAX_SIZE = 48

interface DayData {
  day: number
  pct: number
  hasData: boolean
}

function generateMockMonth(): DayData[] {
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const todayDay = today.getDate()

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    if (day > todayDay) return { day, pct: 0, hasData: false }
    if (day === todayDay) return { day, pct: 1.8, hasData: true }
    const rand = Math.random()
    if (rand < 0.15) return { day, pct: 0, hasData: false }
    return { day, pct: parseFloat((Math.random() * 5 - 1.2).toFixed(2)), hasData: true }
  })
}

// Returns snowball size based on compound growth (1.02^day), normalized to MIN–MAX
function getSize(day: number, totalDays: number): number {
  const compoundMax = Math.pow(1.02, totalDays - 1) - 1
  const compoundDay = Math.pow(1.02, day - 1) - 1
  const ratio = compoundMax > 0 ? compoundDay / compoundMax : 0
  return MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE)
}

function SnowballDay({
  dayData,
  isToday,
  isFuture,
  totalDays,
}: {
  dayData: DayData
  isToday: boolean
  isFuture: boolean
  totalDays: number
}) {
  const { day, pct, hasData } = dayData
  const size = getSize(day, totalDays)

  let ballStyle: React.CSSProperties = {}
  let animation = ''

  if (isFuture) {
    ballStyle = {
      background: 'transparent',
      border: '1.5px dashed rgba(125,219,255,0.18)',
    }
  } else if (isToday) {
    ballStyle = {
      background: 'radial-gradient(circle at 35% 35%, #ffffff, #c8e8ff, #7DDBFF)',
      boxShadow: '0 0 0 2px rgba(125,219,255,0.7), 0 0 16px rgba(125,219,255,0.4)',
    }
    animation = 'today-pulse 2s ease-in-out infinite'
  } else if (!hasData) {
    ballStyle = {
      background: 'rgba(70,160,255,0.07)',
      border: '1px solid rgba(70,160,255,0.13)',
    }
  } else if (pct >= 0) {
    const intensity = Math.min(Math.abs(pct) / 5, 1)
    ballStyle = {
      background: `radial-gradient(circle at 35% 35%, #e8f4ff, #7DDBFF ${30 + intensity * 20}%, #4499cc)`,
      boxShadow: `0 ${2 + intensity * 3}px ${8 + intensity * 12}px rgba(70,160,255,${0.2 + intensity * 0.3})`,
    }
  } else {
    const intensity = Math.min(Math.abs(pct) / 5, 1)
    ballStyle = {
      background: `radial-gradient(circle at 35% 35%, #ffe8e8, #FF9999 ${30 + intensity * 20}%, #cc4444)`,
      boxShadow: `0 ${2 + intensity * 2}px ${6 + intensity * 8}px rgba(255,107,107,${0.15 + intensity * 0.25})`,
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
        minHeight: '68px',
        justifyContent: 'flex-end',
        padding: '4px 2px',
      }}
    >
      <div style={{ position: 'relative', width: `${MAX_SIZE}px`, height: `${MAX_SIZE}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            transition: 'all 0.3s',
            animation,
            flexShrink: 0,
            ...ballStyle,
          }}
        />
        {/* Win highlight dots for 3D snow effect */}
        {hasData && pct >= 0 && !isFuture && size > 16 && (
          <>
            <div style={{
              position: 'absolute',
              width: `${size * 0.22}px`,
              height: `${size * 0.22}px`,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.82)',
              top: `${MAX_SIZE / 2 - size / 2 + size * 0.18}px`,
              left: `${MAX_SIZE / 2 - size / 2 + size * 0.22}px`,
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              width: `${size * 0.11}px`,
              height: `${size * 0.11}px`,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.55)',
              top: `${MAX_SIZE / 2 - size / 2 + size * 0.34}px`,
              left: `${MAX_SIZE / 2 - size / 2 + size * 0.38}px`,
              pointerEvents: 'none',
            }} />
          </>
        )}
      </div>
      <div
        style={{
          fontSize: '10px',
          fontWeight: isToday ? 900 : 600,
          color: isToday ? '#7DDBFF' : isFuture ? 'rgba(125,219,255,0.2)' : 'rgba(232,244,255,0.45)',
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {day}
      </div>
    </div>
  )
}

export default function SnowballCalendar() {
  const [monthData, setMonthData] = useState<DayData[]>([])
  const [calInfo, setCalInfo] = useState({
    year: 0, todayDay: 0, monthName: '', firstDayOfMonth: 0, daysInMonth: 0,
  })

  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const todayDay = today.getDate()
    setCalInfo({
      year,
      todayDay,
      monthName: MONTHS[month],
      firstDayOfMonth: new Date(year, month, 1).getDay(),
      daysInMonth: new Date(year, month + 1, 0).getDate(),
    })
    setMonthData(generateMockMonth())
  }, [])

  const { year, todayDay, monthName, firstDayOfMonth, daysInMonth } = calInfo

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(12,35,90,0.88), rgba(6,20,58,0.94))',
        border: '1px solid rgba(70,160,255,0.25)',
        borderRadius: '14px',
        padding: '20px',
        fontFamily: "'Nunito', sans-serif",
        boxShadow: 'inset 0 1px 0 rgba(125,219,255,0.18), inset 0 0 40px rgba(70,160,255,0.06), 0 8px 32px rgba(0,0,0,0.35)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#e8f4ff', margin: 0 }}>
          ❄ Snowball Calendar
        </h3>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#7DDBFF' }}>
          {monthName} {year}
        </span>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '2px' }}>
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 700,
              color: 'rgba(125,219,255,0.45)',
              padding: '3px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`e${i}`} />)}
        {monthData.map((dayData) => (
          <SnowballDay
            key={dayData.day}
            dayData={dayData}
            isToday={dayData.day === todayDay}
            isFuture={dayData.day > todayDay}
            totalDays={daysInMonth}
          />
        ))}
        {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }, (_, i) => <div key={`end${i}`} />)}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '14px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(70,160,255,0.1)' }}>
        {[
          { color: 'radial-gradient(circle at 35% 35%, #e8f4ff, #7DDBFF, #4499cc)', label: 'Win' },
          { color: 'radial-gradient(circle at 35% 35%, #ffe8e8, #FF9999, #cc4444)', label: 'Loss' },
          { color: 'rgba(70,160,255,0.07)', label: 'No Trade', border: '1px solid rgba(70,160,255,0.15)' },
        ].map(({ color, label, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: color, border, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(232,244,255,0.45)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
