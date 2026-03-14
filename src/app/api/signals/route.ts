import { NextResponse } from 'next/server'

interface BinanceTicker {
  symbol: string
  lastPrice: string
  priceChangePercent: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
}

interface CoinData {
  coin: string
  price: number
  change24h: number
  high24h: number
  low24h: number
  volume: number
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']
const COIN_MAP: Record<string, string> = {
  BTCUSDT: 'BTC',
  ETHUSDT: 'ETH',
  SOLUSDT: 'SOL',
}

export async function GET() {
  try {
    const promises = SYMBOLS.map((symbol) =>
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, {
        next: { revalidate: 30 },
      }).then((r) => r.json() as Promise<BinanceTicker>)
    )

    const results = await Promise.all(promises)

    const data: CoinData[] = results.map((ticker) => ({
      coin: COIN_MAP[ticker.symbol],
      price: parseFloat(ticker.lastPrice),
      change24h: parseFloat(ticker.priceChangePercent),
      high24h: parseFloat(ticker.highPrice),
      low24h: parseFloat(ticker.lowPrice),
      volume: parseFloat(ticker.quoteVolume),
    }))

    return NextResponse.json(data)
  } catch {
    // Return fallback data if Binance is unavailable
    const fallback: CoinData[] = [
      { coin: 'BTC', price: 67420.5, change24h: 2.34, high24h: 68200, low24h: 65800, volume: 42800000000 },
      { coin: 'ETH', price: 3280.25, change24h: -0.82, high24h: 3350, low24h: 3200, volume: 18500000000 },
      { coin: 'SOL', price: 148.5, change24h: 5.12, high24h: 155, low24h: 140, volume: 4200000000 },
    ]
    return NextResponse.json(fallback)
  }
}
