import { NextResponse } from 'next/server'
import { binanceAuth, binancePublic, BinanceAccountInfo, BinanceTicker } from '@/lib/binance'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const TRACKED_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX', 'DOGE', 'USDT']

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch account info from Binance
    const account = await binanceAuth<BinanceAccountInfo>('/api/v3/account')

    // Filter meaningful balances
    const balances = account.balances.filter(b => {
      const total = parseFloat(b.free) + parseFloat(b.locked)
      return total > 0.00001
    })

    // Fetch current prices for non-USDT coins
    const nonUsdtCoins = balances.filter(b => b.asset !== 'USDT' && TRACKED_COINS.includes(b.asset))

    let totalUsdt = parseFloat(balances.find(b => b.asset === 'USDT')?.free ?? '0') +
                    parseFloat(balances.find(b => b.asset === 'USDT')?.locked ?? '0')

    const portfolioRows = []

    if (nonUsdtCoins.length > 0) {
      const symbols = nonUsdtCoins.map(b => `"${b.asset}USDT"`).join(',')
      const tickers = await binancePublic<BinanceTicker[]>(
        `/api/v3/ticker/price?symbols=[${symbols}]`
      )
      const priceMap = new Map(tickers.map(t => [t.symbol.replace('USDT', ''), parseFloat(t.lastPrice)]))

      for (const bal of nonUsdtCoins) {
        const qty = parseFloat(bal.free) + parseFloat(bal.locked)
        const price = priceMap.get(bal.asset) ?? 0
        const usdtValue = qty * price
        totalUsdt += usdtValue
        portfolioRows.push({ coin: bal.asset, qty, price, usdtValue })
      }
    }

    // Update Supabase portfolio table
    const admin = createAdminClient()
    for (const row of portfolioRows) {
      const allocationPct = totalUsdt > 0 ? (row.usdtValue / totalUsdt) * 100 : 0
      await admin.from('portfolio').upsert({
        user_id: user.id,
        coin: row.coin,
        allocation_pct: parseFloat(allocationPct.toFixed(2)),
        current_value: parseFloat(row.usdtValue.toFixed(2)),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,coin' })
    }

    // Update users table with real balance
    await admin.from('users').update({ initial_capital: parseFloat(totalUsdt.toFixed(2)) }).eq('id', user.id)

    return NextResponse.json({
      totalUsdt: parseFloat(totalUsdt.toFixed(2)),
      balances: portfolioRows,
      rawBalances: balances,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
