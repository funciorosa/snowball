'use client'

import { useState, useEffect } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface DayData {
  day: number
  pct: number // positive = win, negative = loss, 0 = no trade
  hasData: boolean
}

function generateMockMonth(): DayData[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayDay = today.getDate()

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    if (day > todayDay) return { day, pct: 0, hasData: false }
    if (day === todayDay) return { day, pct: 1.8, hasData: true }
    // Mock historical data
    const rand = Math.random()
    if (rand < 0.15) return { day, pct: 0, hasData: false }
    const pct = (Math.random() * 5 - 1.2)
    return { day, pct: parseFloat(pct.toFixed(2)), hasData: true }
  })
}

function SnowballDay({
  dayData,
  isToday,
  isFuture,
}: {
  dayData: DayData
  isToday: boolean
  isFuture: boolean
}) {
  const { day, pct, hasData } = dayData

  const BASE_SIZE = 24
  const MAX_SIZE = 46

  let size = BASE_SIZE
  if (hasData) {
    const growth = Math.min(Math.abs(pct) / 5, 1)
    size = BASE_SIZE + growth * (MAX_SIZE - BASE_SIZE)
  }

  let ballStyle: React.CSSProperties = {}
  let animation = ''

  if (isFuture) {
    ballStyle = {
      background: 'transparent',
      border: '2px dashed rgba(125,219,255,0.2)',
    }
  } else if (isToday) {
    ballStyle = {
      background: 'radial-gradient(circle at 35% 35%, #ffffff, #c8e8ff, #7DDBFF)',
      boxShadow: '0 0 0 2px rgba(125,219,255,0.6)',
    }
    animation = 'today-pulse 2s ease-in-out infinite'
  } else if (!hasData) {
    ballStyle = {
      background: 'rgba(70,160,255,0.08)',
      border: '1px solid rgba(70,160,255,0.15)',
    }
  } else if (pct >= 0) {
    // Win - ice blue snowball
    const intensity = Math.min(Math.abs(pct) / 5, 1)
    ballStyle = {
      background: `radial-gradient(circle at 35% 35%, #e8f4ff, #7DDBFF ${30 + intensity * 20}%, #4499cc)`,
      boxShadow: `0 ${2 + intensity * 3}px ${8 + intensity * 12}px rgba(70,160,255,${0.2 + intensity * 0.3})`,
    }
    // Two highlight dots via pseudo — we'll overlay with ::before so we add overlay divs
  } else {
    // Loss - red tint
    const intensity = Math.min(Math.abs(pct) / 5, 1)
    ballStyle = {
      background: `radial-gradient(circle at 35% 35%, #ffe8e8, #FF9999 ${30 + intensity * 20}%, #cc4444)`,
      boxShadow: `0 ${2 + intensity * 3}px ${8 + intensity * 8}px rgba(255,107,107,${0.15 + intensity * 0.25})`,
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        minHeight: '64px',
        justifyContent: 'flex-end',
        padding: '4px 2px',
      }}
    >
      {/* Snowball */}
      <div style={{ position: 'relative', width: `${MAX_SIZE}px`, height: `${MAX_SIZE}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            transition: 'all 0.3s',
            animation,
            ...ballStyle,
          }}
        />
        {/* Win highlight dots */}
        {hasData && pct >= 0 && !isFuture && (
          <>
            <div style={{
              position: 'absolute',
              width: `${size * 0.2}px`,
              height: `${size * 0.2}px`,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.8)',
              top: `${MAX_SIZE / 2 - size / 2 + size * 0.2}px`,
              left: `${MAX_SIZE / 2 - size / 2 + size * 0.25}px`,
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              width: `${size * 0.1}px`,
              height: `${size * 0.1}px`,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.6)',
              top: `${MAX_SIZE / 2 - size / 2 + size * 0.36}px`,
              left: `${MAX_SIZE / 2 - size / 2 + size * 0.38}px`,
              pointerEvents: 'none',
            }} />
          </>
        )}
      </div>

      {/* Day number */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: isToday ? 900 : 600,
          color: isToday ? '#7DDBFF' : isFuture ? 'rgba(125,219,255,0.25)' : 'rgba(232,244,255,0.5)',
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
  const [calInfo, setCalInfo] = useState({ year: 0, month: 0, todayDay: 0, monthName: '', firstDayOfMonth: 0, daysInMonth: 0 })

  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const todayDay = today.getDate()
    setCalInfo({
      year,
      month,
      todayDay,
      monthName: today.toLocaleString('default', { month: 'long' }),
      firstDayOfMonth: new Date(year, month, 1).getDay(),
      daysInMonth: new Date(year, month + 1, 0).getDate(),
    })
    setMonthData(generateMockMonth())
  }, [])

  const { year, todayDay, monthName, firstDayOfMonth, daysInMonth } = calInfo

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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#e8f4ff',
            margin: 0,
          }}
        >
          ❄ Snowball Calendar
        </h3>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#7DDBFF',
          }}
        >
          {monthName} {year}
        </span>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          marginBottom: '4px',
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 700,
              color: 'rgba(125,219,255,0.5)',
              padding: '4px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
        }}
      >
        {/* Empty cells for first day offset */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {monthData.map((dayData) => {
          const isToday = dayData.day === todayDay
          const isFuture = dayData.day > todayDay
          return (
            <SnowballDay
              key={dayData.day}
              dayData={dayData}
              isToday={isToday}
              isFuture={isFuture}
            />
          )
        })}

        {/* Pad end */}
        {Array.from(
          { length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 },
          (_, i) => <div key={`end-${i}`} />
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(70,160,255,0.1)',
        }}
      >
        {[
          { color: 'radial-gradient(circle at 35% 35%, #e8f4ff, #7DDBFF, #4499cc)', label: 'Win' },
          { color: 'radial-gradient(circle at 35% 35%, #ffe8e8, #FF9999, #cc4444)', label: 'Loss' },
          { color: 'rgba(125,219,255,0.1)', label: 'No Trade', border: '1px solid rgba(70,160,255,0.2)' },
        ].map(({ color, label, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: color,
                border,
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(232,244,255,0.5)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
