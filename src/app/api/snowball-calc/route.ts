import { NextRequest, NextResponse } from 'next/server'

interface DataPoint {
  date: string
  value: number
  day: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startDateParam = searchParams.get('startDate')
  const capitalParam = searchParams.get('initialCapital')

  const initialCapital = capitalParam ? parseFloat(capitalParam) : 1000
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  // Use start of current month if no startDate
  const startDate = startDateParam ? new Date(startDateParam) : new Date(year, month, 1)

  // Calculate days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const data: DataPoint[] = []

  for (let day = 0; day < daysInMonth; day++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + day)

    // Stop at today
    if (currentDate > today) break

    // Compound: capital * (1.02 ^ day)
    const value = initialCapital * Math.pow(1.02, day)

    data.push({
      date: currentDate.toISOString().split('T')[0],
      value: parseFloat(value.toFixed(2)),
      day,
    })
  }

  const finalValue = data.length > 0 ? data[data.length - 1].value : initialCapital
  const totalGrowth = ((finalValue - initialCapital) / initialCapital) * 100

  return NextResponse.json({
    data,
    summary: {
      initialCapital,
      currentTarget: parseFloat(finalValue.toFixed(2)),
      totalGrowthPct: parseFloat(totalGrowth.toFixed(2)),
      daysElapsed: data.length,
    },
  })
}
