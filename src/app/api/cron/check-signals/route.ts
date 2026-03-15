import { NextResponse } from 'next/server'

// This just calls the leaderboard endpoint to trigger signal detection
export async function GET() {
  try {
    const host = process.env.VERCEL_URL ?? 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const res = await fetch(`${protocol}://${host}/api/signals/leaderboard`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json({ ok: true, signals: data.confirmedSignals?.length ?? 0 })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) })
  }
}
