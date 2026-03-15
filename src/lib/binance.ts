import crypto from 'crypto'

const API_KEY = process.env.BINANCE_API_KEY ?? ''
const SECRET_KEY = process.env.BINANCE_SECRET_KEY ?? ''
const BASE_URL = 'https://api.binance.com'
export const FUTURES_BASE = 'https://fapi.binance.com'

// HMAC SHA256 signature for authenticated endpoints
function sign(queryString: string): string {
  return crypto.createHmac('sha256', SECRET_KEY).update(queryString).digest('hex')
}

// Authenticated request to Binance REST API
export async function binanceAuth<T>(endpoint: string, params: Record<string, string> = {}, baseUrl = BASE_URL): Promise<T> {
  const timestamp = Date.now().toString()
  const query = new URLSearchParams({ ...params, timestamp })
  const signature = sign(query.toString())
  query.append('signature', signature)

  const res = await fetch(`${baseUrl}${endpoint}?${query}`, {
    headers: { 'X-MBX-APIKEY': API_KEY },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Binance API error: ${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

// Public request (no auth needed)
export async function binancePublic<T>(endpoint: string, params: Record<string, string> = {}, baseUrl = BASE_URL): Promise<T> {
  const query = new URLSearchParams(params)
  const url = query.toString() ? `${baseUrl}${endpoint}?${query}` : `${baseUrl}${endpoint}`
  const res = await fetch(url, { next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`Binance public API error: ${res.status}`)
  return res.json() as Promise<T>
}

// Leaderboard API (unofficial, uses bapi)
export async function binanceLeaderboard<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`https://www.binance.com${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'clienttype': 'web',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Leaderboard API error: ${res.status}`)
  return res.json() as Promise<T>
}

// Get 24hr ticker for multiple symbols
export async function get24hrTickers(symbols: string[]): Promise<BinanceTicker[]> {
  const res = await fetch(
    `${BASE_URL}/api/v3/ticker/24hr?symbols=${encodeURIComponent('[' + symbols.map(s => `"${s}"`).join(',') + ']')}`,
    { next: { revalidate: 30 } }
  )
  if (!res.ok) throw new Error('Ticker fetch failed')
  return res.json() as Promise<BinanceTicker[]>
}

// Get klines (candlestick data) for momentum calculation
export async function getKlines(symbol: string, interval: string, limit: number): Promise<number[][]> {
  const res = await fetch(
    `${BASE_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
    { next: { revalidate: 60 } }
  )
  if (!res.ok) throw new Error('Klines fetch failed')
  return res.json() as Promise<number[][]>
}

export interface BinanceTicker {
  symbol: string
  lastPrice: string
  priceChangePercent: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
}

export interface BinanceBalance {
  asset: string
  free: string
  locked: string
}

export interface BinanceAccountInfo {
  balances: BinanceBalance[]
}

export interface BinanceTrade {
  symbol: string
  id: number
  orderId: number
  price: string
  qty: string
  quoteQty: string
  commission: string
  commissionAsset: string
  time: number
  isBuyer: boolean
  isMaker: boolean
}

