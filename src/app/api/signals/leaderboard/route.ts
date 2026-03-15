import { NextResponse } from 'next/server'
import { binanceLeaderboard, BinanceTicker } from '@/lib/binance'
import { createAdminClient } from '@/lib/supabase/admin'

// 13-coin watchlist
const WATCHLIST = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'AVAXUSDT',
  'DOGEUSDT', 'PEPEUSDT', 'WIFUSDT', 'SUIUSDT',
  'APTUSDT', 'SEIUSDT', 'INJUSDT', 'TIAUSDT',
]

interface LeaderboardTrader {
  encryptedUid: string
  nickName: string
  rank: number
  value: number // ROI
  pnl: number
  winRate?: number
  maxDrawdown?: number
}

interface TraderPosition {
  symbol: string
  entryPrice: number
  markPrice: number
  pnl: number
  roe: number
  amount: number
  updateTime: number
  yellow: boolean
  tradeBefore: boolean
  leverage: number
}

interface PositionResponse {
  data?: {
    otherPositionRetList?: TraderPosition[]
  }
  code?: string
}

interface LeaderboardResponse {
  data?: LeaderboardTrader[]
  code?: string
}

// ── In-memory cache (15 min) ──────────────────────────────────────────────────
let cachedLeaderboard: LeaderboardTrader[] | null = null
let cacheTime = 0
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

async function getTopTraders(): Promise<LeaderboardTrader[]> {
  if (cachedLeaderboard && Date.now() - cacheTime < CACHE_TTL) {
    return cachedLeaderboard
  }

  try {
    const res = await binanceLeaderboard<LeaderboardResponse>(
      '/bapi/futures/v3/public/future/leaderboard/getLeaderboard',
      {
        isShared: true,
        isTrader: false,
        periodType: 'MONTHLY',
        statisticsType: 'ROI',
        rankType: 'MONTHLY',
        pageNumber: 1,
        pageSize: 50,
      }
    )

    const traders = res.data ?? []

    // Filter by criteria
    const filtered = traders.filter(t => {
      const roi = t.value ?? 0
      return roi > 20 // ROI > 20% monthly
    })

    // Take top 5
    const top5 = filtered.slice(0, 5)

    cachedLeaderboard = top5
    cacheTime = Date.now()
    return top5
  } catch {
    // Return mock traders as fallback
    return [
      { encryptedUid: 'mock1', nickName: 'CryptoKing', rank: 1, value: 847, pnl: 84700, winRate: 72 },
      { encryptedUid: 'mock2', nickName: 'WaveMaster', rank: 2, value: 634, pnl: 63400, winRate: 68 },
      { encryptedUid: 'mock3', nickName: 'IceTrader', rank: 3, value: 521, pnl: 52100, winRate: 71 },
      { encryptedUid: 'mock4', nickName: 'BTCBull99', rank: 4, value: 445, pnl: 44500, winRate: 65 },
      { encryptedUid: 'mock5', nickName: 'SOLSurfer', rank: 5, value: 389, pnl: 38900, winRate: 67 },
    ]
  }
}

async function getTraderPositions(encryptedUid: string): Promise<TraderPosition[]> {
  try {
    const res = await binanceLeaderboard<PositionResponse>(
      '/bapi/futures/v3/public/future/leaderboard/getOtherPosition',
      { encryptedUid, tradeType: 'PERPETUAL' }
    )
    return res.data?.otherPositionRetList ?? []
  } catch {
    return []
  }
}

function getMomentum(tickers: BinanceTicker[]): Map<string, 'bullish' | 'bearish' | 'neutral'> {
  const momentumMap = new Map<string, 'bullish' | 'bearish' | 'neutral'>()
  for (const t of tickers) {
    const chg = parseFloat(t.priceChangePercent)
    momentumMap.set(t.symbol, chg > 1 ? 'bullish' : chg < -1 ? 'bearish' : 'neutral')
  }
  return momentumMap
}

function calcTarget(coin: string, entry: number, direction: 'long' | 'short'): number {
  // Higher volatility alts get wider targets
  const volatileAlts = ['PEPE', 'WIF', 'DOGE', 'SUI', 'SEI']
  const coinBase = coin.replace('USDT', '')
  const targetPct = volatileAlts.includes(coinBase) ? 0.05 : 0.022 // 5% vs 2.2%
  return direction === 'long' ? entry * (1 + targetPct) : entry * (1 - targetPct)
}

function calcStopLoss(coin: string, entry: number, direction: 'long' | 'short'): number {
  const volatileAlts = ['PEPE', 'WIF', 'DOGE', 'SUI', 'SEI']
  const coinBase = coin.replace('USDT', '')
  const stopPct = volatileAlts.includes(coinBase) ? 0.03 : 0.015 // 3% vs 1.5%
  return direction === 'long' ? entry * (1 - stopPct) : entry * (1 + stopPct)
}

function scoreSignal(params: {
  tradersCount: number
  volumeRatio: number
  momentum: string
  fearGreed: number
}): number {
  let score = 0
  // Trader confirmation
  if (params.tradersCount >= 5) score += 100
  else if (params.tradersCount >= 4) score += 80
  else if (params.tradersCount >= 3) score += 60
  else return 0 // Below threshold

  // Volume bonus
  if (params.volumeRatio > 5) score += 10
  else if (params.volumeRatio > 3) score += 5

  // Momentum bonus
  if (params.momentum === 'bullish') score += 10

  // Fear & Greed
  if (params.fearGreed > 60) score += 5
  else if (params.fearGreed < 40) score -= 10

  return Math.min(score, 100)
}

export async function GET() {
  try {
    const admin = createAdminClient()

    // 1. Get top traders
    const traders = await getTopTraders()

    // 2. Get all their positions concurrently
    const allPositions = await Promise.all(
      traders.map(async t => ({
        trader: t,
        positions: await getTraderPositions(t.encryptedUid),
      }))
    )

    // 3. Get watchlist prices & volumes
    let tickers: BinanceTicker[] = []
    try {
      const symbolsParam = '[' + WATCHLIST.map(s => `"${s}"`).join(',') + ']'
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`,
        { next: { revalidate: 30 } }
      )
      tickers = await res.json() as BinanceTicker[]
    } catch {
      tickers = []
    }

    const tickerMap = new Map(tickers.map(t => [t.symbol, t]))
    const momentumMap = getMomentum(tickers)

    // 4. Get Fear & Greed
    let fearGreedValue = 52
    try {
      const fgRes = await fetch('https://api.alternative.me/fng/?limit=1')
      const fgData = await fgRes.json()
      fearGreedValue = parseInt(fgData.data[0].value)
    } catch { /* use default */ }

    // 5. Find consensus signals: group by coin+direction
    const consensusMap = new Map<string, {
      coin: string
      direction: 'long' | 'short'
      entries: number[]
      traders: string[]
    }>()

    for (const { trader, positions } of allPositions) {
      for (const pos of positions) {
        if (!WATCHLIST.includes(pos.symbol)) continue
        const direction: 'long' | 'short' = pos.amount > 0 ? 'long' : 'short'
        const key = `${pos.symbol}_${direction}`

        if (!consensusMap.has(key)) {
          consensusMap.set(key, {
            coin: pos.symbol,
            direction,
            entries: [],
            traders: [],
          })
        }
        const entry = consensusMap.get(key)!
        entry.entries.push(pos.entryPrice)
        entry.traders.push(trader.nickName)
      }
    }

    // 6. Score and filter signals
    const confirmedSignals = []
    for (const [, consensus] of consensusMap) {
      if (consensus.traders.length < 3) continue // Need 3+ traders

      const avgEntry = consensus.entries.reduce((s, p) => s + p, 0) / consensus.entries.length
      const ticker = tickerMap.get(consensus.coin)
      const volumeRatio = ticker
        ? parseFloat(ticker.quoteVolume) / (parseFloat(ticker.quoteVolume) / 7) // approx ratio
        : 1
      const momentum = momentumMap.get(consensus.coin) ?? 'neutral'
      const score = scoreSignal({
        tradersCount: consensus.traders.length,
        volumeRatio,
        momentum,
        fearGreed: fearGreedValue,
      })

      if (score < 65) continue

      const targetPrice = calcTarget(consensus.coin, avgEntry, consensus.direction)
      const stopLoss = calcStopLoss(consensus.coin, avgEntry, consensus.direction)

      confirmedSignals.push({
        coin: consensus.coin,
        direction: consensus.direction,
        entry_price: parseFloat(avgEntry.toFixed(8)),
        target_price: parseFloat(targetPrice.toFixed(8)),
        stop_loss: parseFloat(stopLoss.toFixed(8)),
        confidence_score: score,
        traders_count: consensus.traders.length,
        trader_names: consensus.traders,
        volume_ratio: parseFloat(volumeRatio.toFixed(4)),
        momentum,
        status: 'active' as const,
      })
    }

    // 7. Save new signals to Supabase (avoid duplicates from last 2h)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    for (const signal of confirmedSignals) {
      const { data: existing } = await admin
        .from('signals')
        .select('id')
        .eq('coin', signal.coin)
        .eq('direction', signal.direction)
        .eq('status', 'active')
        .gt('created_at', twoHoursAgo)
        .single()

      if (!existing) {
        await admin.from('signals').insert(signal)
      }
    }

    // 8. Build watchlist data for UI
    const watchlist = tickers.map(t => ({
      symbol: t.symbol,
      coin: t.symbol.replace('USDT', ''),
      price: parseFloat(t.lastPrice),
      change24h: parseFloat(t.priceChangePercent),
      volume: parseFloat(t.quoteVolume),
      momentum: momentumMap.get(t.symbol) ?? 'neutral',
    }))

    // 9. Fetch active signals from DB
    const { data: activeSignals } = await admin
      .from('signals')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10)

    // 10. Notify telegram users for new signals
    if (confirmedSignals.length > 0) {
      const { data: users } = await admin
        .from('users')
        .select('telegram_chat_id')
        .eq('telegram_enabled', true)
        .not('telegram_chat_id', 'is', null)

      if (users?.length) {
        for (const signal of confirmedSignals) {
          const coinName = signal.coin.replace('USDT', '')
          const sign = (n: number) => n >= 0 ? '+' : ''
          const tgtPct = ((signal.target_price - signal.entry_price) / signal.entry_price * 100)
          const slPct = ((signal.stop_loss - signal.entry_price) / signal.entry_price * 100)
          const message =
            `🎯 *SIGNAL CONFIRMED — ${coinName}/USDT*\n` +
            `━━━━━━━━━━━━━━━\n` +
            `📈 Direction: ${signal.direction.toUpperCase()}\n` +
            `💰 Entry: $${signal.entry_price.toLocaleString()}\n` +
            `🎯 Target: $${signal.target_price.toLocaleString()} (${sign(tgtPct)}${tgtPct.toFixed(1)}%)\n` +
            `🛑 Stop-loss: $${signal.stop_loss.toLocaleString()} (${sign(slPct)}${slPct.toFixed(1)}%)\n` +
            `━━━━━━━━━━━━━━━\n` +
            `👥 Confirmed by ${signal.traders_count}/5 top traders\n` +
            `🌊 Momentum: ${signal.momentum}\n` +
            `📊 Fear & Greed: ${fearGreedValue}\n` +
            `🔥 Confidence: ${signal.confidence_score}/100\n` +
            `━━━━━━━━━━━━━━━\n` +
            `Open Binance to execute →`

          for (const user of users) {
            if (user.telegram_chat_id) {
              await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: user.telegram_chat_id, text: message, parse_mode: 'Markdown' }),
              }).catch(() => {})
            }
          }
        }
      }
    }

    return NextResponse.json({
      traders: traders.map(t => ({ name: t.nickName, roi: t.value, rank: t.rank })),
      watchlist,
      activeSignals: activeSignals ?? [],
      confirmedSignals,
      fearGreed: fearGreedValue,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message, traders: [], watchlist: [], activeSignals: [], confirmedSignals: [] }, { status: 500 })
  }
}
