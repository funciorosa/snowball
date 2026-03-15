import { NextResponse } from 'next/server'
import { binanceAuth, BinanceTrade } from '@/lib/binance'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const TRADE_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT']

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const allTrades: BinanceTrade[] = []

    // Fetch trades for each symbol (last 500 each)
    for (const symbol of TRADE_SYMBOLS) {
      try {
        const trades = await binanceAuth<BinanceTrade[]>('/api/v3/myTrades', {
          symbol,
          limit: '500',
        })
        allTrades.push(...trades)
      } catch {
        // Skip symbols with no trades
      }
    }

    if (!allTrades.length) return NextResponse.json({ synced: 0 })

    // Sort by time
    allTrades.sort((a, b) => a.time - b.time)

    // Group into buy/sell pairs to calculate P&L
    const tradeRows = []
    const buyMap = new Map<string, BinanceTrade>()

    for (const trade of allTrades) {
      const coin = trade.symbol.replace('USDT', '') as 'BTC' | 'ETH' | 'SOL'
      if (coin !== 'BTC' && coin !== 'ETH' && coin !== 'SOL') continue

      if (trade.isBuyer) {
        buyMap.set(coin, trade)
      } else {
        const buy = buyMap.get(coin)
        if (buy) {
          const entryPrice = parseFloat(buy.price)
          const exitPrice = parseFloat(trade.price)
          const qty = parseFloat(trade.qty)
          const pnlUsd = (exitPrice - entryPrice) * qty
          const resultPct = ((exitPrice - entryPrice) / entryPrice) * 100

          const dateStr = new Date(trade.time).toISOString().slice(0, 10)
          tradeRows.push({
            user_id: user.id,
            coin,
            entry_price: entryPrice,
            exit_price: exitPrice,
            result_pct: parseFloat(resultPct.toFixed(4)),
            pnl_usd: parseFloat(pnlUsd.toFixed(2)),
            date: dateStr,
            type: 'snowball' as const,
          })
          buyMap.delete(coin)
        }
      }
    }

    // Upsert trades (avoid duplicates using user_id + coin + date + entry_price)
    if (tradeRows.length > 0) {
      await admin.from('trades').upsert(tradeRows, {
        onConflict: 'user_id,coin,date,entry_price',
        ignoreDuplicates: true,
      })
    }

    return NextResponse.json({ synced: tradeRows.length, total: allTrades.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
