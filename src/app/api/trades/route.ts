import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Trades GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

interface TradeBody {
  coin: 'BTC' | 'ETH' | 'SOL'
  entry_price: number
  exit_price?: number
  result_pct?: number
  pnl_usd?: number
  type: 'snowball' | 'tournament' | 'wave'
  date?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: TradeBody = await request.json()

    const { data, error } = await supabase
      .from('trades')
      .insert({
        user_id: user.id,
        coin: body.coin,
        entry_price: body.entry_price,
        exit_price: body.exit_price ?? null,
        result_pct: body.result_pct ?? null,
        pnl_usd: body.pnl_usd ?? null,
        type: body.type,
        date: body.date ?? new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Trades POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
