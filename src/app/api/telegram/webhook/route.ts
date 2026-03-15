import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage } from '@/lib/telegram'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRow {
  id: string
  initial_capital: number
  telegram_chat_id: string
  telegram_verification_code: string | null
  telegram_verification_expires_at: string | null
}

interface TradeRow {
  result_pct: number
  pnl_usd: number
  date: string
  coin: string
}

interface PortfolioRow {
  coin: string
  allocation_pct: number
  current_value: number
}

interface AchievementRow {
  badge_name: string
  unlocked_at: string
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

async function getUserByChatId(chatId: string): Promise<UserRow | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('id, initial_capital, telegram_chat_id, telegram_verification_code, telegram_verification_expires_at')
    .eq('telegram_chat_id', chatId)
    .single()
  return data as UserRow | null
}

async function getUserTrades(userId: string): Promise<TradeRow[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('trades')
    .select('result_pct, pnl_usd, date, coin')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  return (data as TradeRow[]) ?? []
}

async function getUserPortfolio(userId: string): Promise<PortfolioRow[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('portfolio')
    .select('coin, allocation_pct, current_value')
    .eq('user_id', userId)
  return (data as PortfolioRow[]) ?? []
}

async function getUserAchievements(userId: string): Promise<AchievementRow[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('achievements')
    .select('badge_name, unlocked_at')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: true })
  return (data as AchievementRow[]) ?? []
}

async function getLiveBtcData(): Promise<{ price: number; change24h: number } | null> {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', {
      next: { revalidate: 0 },
    })
    if (!res.ok) return null
    const d = await res.json()
    return { price: parseFloat(d.lastPrice), change24h: parseFloat(d.priceChangePercent) }
  } catch {
    return null
  }
}

async function getFearGreed(): Promise<{ value: string; classification: string } | null> {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1')
    if (!res.ok) return null
    const d = await res.json()
    return { value: d.data[0].value, classification: d.data[0].value_classification }
  } catch {
    return null
  }
}

// ─── Streak & stats helpers ───────────────────────────────────────────────────

function calcStreak(trades: TradeRow[]): { current: number; best: number } {
  if (!trades.length) return { current: 0, best: 0 }

  // Group trades by date, sum pnl per day
  const byDate = new Map<string, number>()
  for (const t of trades) {
    byDate.set(t.date, (byDate.get(t.date) ?? 0) + t.pnl_usd)
  }

  // Sort dates descending
  const days = Array.from(byDate.entries()).sort((a, b) => b[0].localeCompare(a[0]))

  let current = 0
  for (const [, pnl] of days) {
    if (pnl > 0) current++
    else break
  }

  let best = 0
  let running = 0
  for (const [, pnl] of [...days].reverse()) {
    if (pnl > 0) {
      running++
      best = Math.max(best, running)
    } else {
      running = 0
    }
  }

  return { current, best }
}

function calcWinRate(trades: TradeRow[]): number {
  if (!trades.length) return 0
  const wins = trades.filter(t => t.pnl_usd > 0).length
  return Math.round((wins / trades.length) * 100)
}

function calcBalance(initialCapital: number, trades: TradeRow[]): number {
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl_usd, 0)
  return initialCapital + totalPnl
}

function todayPnl(trades: TradeRow[]): { pct: number; usd: number } {
  const today = new Date().toISOString().slice(0, 10)
  const todayTrades = trades.filter(t => t.date === today)
  const usd = todayTrades.reduce((sum, t) => sum + t.pnl_usd, 0)
  const pct = todayTrades.reduce((sum, t) => sum + t.result_pct, 0)
  return { pct, usd }
}

// ─── Command handlers ─────────────────────────────────────────────────────────

async function handleBalance(chatId: string, user: UserRow): Promise<string> {
  const trades = await getUserTrades(user.id)
  const balance = calcBalance(user.initial_capital, trades)
  const today = todayPnl(trades)
  const { current: streak } = calcStreak(trades)
  const dayOfMonth = new Date().getDate()
  const monthGoal = user.initial_capital * Math.pow(1.02, 30)
  const goalProgress = Math.min(Math.round((balance / monthGoal) * 100), 100)
  const targetToday = user.initial_capital * Math.pow(1.02, dayOfMonth) - user.initial_capital * Math.pow(1.02, dayOfMonth - 1)
  const hitTarget = today.usd >= targetToday

  const sign = (n: number) => n >= 0 ? '+' : ''

  return `📊 *Your Snowball Balance*\n` +
    `💰 Current: $${balance.toFixed(2)}\n` +
    `📈 Today: ${sign(today.pct)}${today.pct.toFixed(1)}% (${sign(today.usd)}$${today.usd.toFixed(2)})\n` +
    `🎯 Target today: 2.0% ${hitTarget ? '✅' : '⏳'}\n` +
    `🔥 Streak: ${streak} day${streak !== 1 ? 's' : ''}\n` +
    `📅 Day ${dayOfMonth} of 30\n` +
    `🏁 Month goal: $${monthGoal.toFixed(0)} (${goalProgress}% there)`
}

async function handlePortfolio(chatId: string, user: UserRow): Promise<string> {
  const dbPortfolio = await getUserPortfolio(user.id)
  const trades = await getUserTrades(user.id)
  const balance = calcBalance(user.initial_capital, trades)

  // Use DB portfolio if available, else default 40/30/20/10 split
  const portfolio = dbPortfolio.length > 0 ? dbPortfolio : [
    { coin: 'BTC', allocation_pct: 40, current_value: balance * 0.40 },
    { coin: 'ETH', allocation_pct: 30, current_value: balance * 0.30 },
    { coin: 'SOL', allocation_pct: 20, current_value: balance * 0.20 },
    { coin: 'USDT', allocation_pct: 10, current_value: balance * 0.10 },
  ]

  // Mock 24h changes (would come from live prices in production)
  const mockChanges: Record<string, number> = { BTC: 1.8, ETH: 2.3, SOL: -0.4, USDT: 0.0 }
  const coinEmoji: Record<string, string> = { BTC: '🟡', ETH: '🔵', SOL: '🟣', USDT: '⚪' }

  const lines = portfolio.map(({ coin, current_value }) => {
    const chg = mockChanges[coin] ?? 0
    const isUsdt = coin === 'USDT'
    const sign = chg >= 0 ? '+' : ''
    return `${coinEmoji[coin] ?? '⚫'} ${coin} — $${current_value.toFixed(0)} ${isUsdt ? '(reserve)' : `(${sign}${chg.toFixed(1)}%)`}`
  })

  return `💼 *Your Portfolio*\n` + lines.join('\n')
}

async function handleSignal(chatId: string): Promise<string> {
  const [btc, fg] = await Promise.all([getLiveBtcData(), getFearGreed()])

  const price = btc?.price ?? 83200
  const target = price * 1.022
  const stop = price * 0.985
  const changeStr = btc ? `${btc.change24h >= 0 ? '+' : ''}${btc.change24h.toFixed(2)}%` : 'N/A'
  const fgStr = fg ? `${fg.value} — ${fg.classification}` : '52 — Neutral'

  return `📡 *Latest Signal*\n` +
    `BTC/USDT — Entry $${price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n` +
    `📊 24h: ${changeStr}\n` +
    `🎯 Target: $${target.toLocaleString(undefined, { maximumFractionDigits: 0 })} (+2.2%)\n` +
    `🛑 Stop-loss: $${stop.toLocaleString(undefined, { maximumFractionDigits: 0 })} (-1.5%)\n` +
    `Copying @CryptoKing (ROI 34%)\n` +
    `😨 Fear & Greed: ${fgStr}`
}

async function handleStreak(chatId: string, user: UserRow): Promise<string> {
  const trades = await getUserTrades(user.id)
  const { current, best } = calcStreak(trades)
  const winRate = calcWinRate(trades)

  // Count wins/losses this month
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthTrades = trades.filter(t => t.date.startsWith(thisMonth))
  const wins = monthTrades.filter(t => t.pnl_usd > 0).length
  const losses = monthTrades.filter(t => t.pnl_usd < 0).length

  const streakEmoji = current >= 7 ? '🔥🔥🔥' : current >= 3 ? '🔥🔥' : current > 0 ? '🔥' : '😐'

  return `🔥 *Your Current Streak*\n` +
    `${streakEmoji} ${current} green day${current !== 1 ? 's' : ''} in a row!\n` +
    `🏆 Best streak: ${best} day${best !== 1 ? 's' : ''}\n` +
    `📅 This month: ${wins} win${wins !== 1 ? 's' : ''} / ${losses} loss${losses !== 1 ? 'es' : ''}\n` +
    `📊 Win rate: ${winRate}%`
}

async function handleCalendar(chatId: string, user: UserRow): Promise<string> {
  const trades = await getUserTrades(user.id)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthStr = now.toLocaleString('en-US', { month: 'long' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayDay = now.getDate()
  const thisMonth = now.toISOString().slice(0, 7)

  // Group pnl by date
  const byDate = new Map<string, number>()
  for (const t of trades) {
    if (t.date.startsWith(thisMonth)) {
      byDate.set(t.date, (byDate.get(t.date) ?? 0) + t.pnl_usd)
    }
  }

  // Build emoji grid, 7 per row
  const emojis: string[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (d > todayDay) {
      emojis.push('⚪')
    } else {
      const pnl = byDate.get(dateStr)
      if (pnl === undefined) emojis.push('⬜')
      else if (pnl > 0) emojis.push('🟢')
      else emojis.push('🔴')
    }
  }

  // Split into rows of 7
  const rows: string[] = []
  for (let i = 0; i < emojis.length; i += 7) {
    rows.push(emojis.slice(i, i + 7).join(''))
  }

  const wins = emojis.filter(e => e === '🟢').length
  const losses = emojis.filter(e => e === '🔴').length

  return `📅 *${monthStr} ${year} Summary*\n` +
    rows.join('\n') +
    `\n\n🟢 = win  🔴 = loss  ⬜ = no trade  ⚪ = future\n` +
    `✅ ${wins} wins  ❌ ${losses} losses  (Day ${todayDay}/${daysInMonth})`
}

async function handleAchievements(chatId: string, user: UserRow): Promise<string> {
  const unlocked = await getUserAchievements(user.id)
  const unlockedNames = new Set(unlocked.map(a => a.badge_name))

  const ALL_BADGES = [
    'First Snowflake',
    'Ice Streak',
    'Wave Rider',
    'Snowball Effect',
    "Sabrina's Favorite",
    'SOL Surfer',
    'Diamond Hands',
    'Arctic Champion',
    'Compound King',
    'Arena Master',
    'BTC Believer',
    'Ice Queen',
  ]

  const now = new Date()
  const dayOfMonth = now.getDate()
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - dayOfMonth

  const lines = ALL_BADGES.map(badge => {
    if (unlockedNames.has(badge)) return `✅ ${badge}`
    return `🔒 ${badge}`
  })

  const unlockedCount = unlockedNames.size
  const total = ALL_BADGES.length

  return `🏆 *Your Achievements* (${unlockedCount}/${total})\n\n` +
    lines.join('\n') +
    `\n\n📅 ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left this month`
}

function handleHelp(): string {
  return `❄ *Snowball Bot Commands*\n\n` +
    `/balance — Your current balance & daily progress\n` +
    `/portfolio — Your crypto allocation breakdown\n` +
    `/signal — Latest BTC trading signal\n` +
    `/streak — Your win streak & monthly stats\n` +
    `/calendar — Monthly emoji calendar\n` +
    `/achievements — Your unlocked badges\n` +
    `/help — Show this message\n\n` +
    `💡 _Tip: You also receive automatic alerts for waves, targets, and stop-losses._`
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const message = body?.message as Record<string, unknown> | undefined
  if (!message) return NextResponse.json({ ok: true })

  const chatId = (message.chat as Record<string, unknown>)?.id?.toString()
  const text = ((message.text as string) ?? '').trim()
  if (!chatId || !text) return NextResponse.json({ ok: true })

  // Extract command (strip bot username suffix e.g. /balance@SnowballBot)
  const rawCmd = text.split(' ')[0].split('@')[0].toLowerCase()
  const admin = createAdminClient()

  // ── /start ────────────────────────────────────────────────────────────────
  if (rawCmd === '/start') {
    await sendTelegramMessage(chatId,
      `❄ *Welcome to Snowball Bot!*\n\n` +
      `To connect your account:\n` +
      `1. Open the Snowball app\n` +
      `2. Click *"Connect Telegram"* on the Dashboard\n` +
      `3. Send the 6-digit code here\n\n` +
      `Once connected, use /help to see all commands. 🌊`)
    return NextResponse.json({ ok: true })
  }

  // ── /help ─────────────────────────────────────────────────────────────────
  if (rawCmd === '/help') {
    await sendTelegramMessage(chatId, handleHelp())
    return NextResponse.json({ ok: true })
  }

  // ── 6-digit verification code ─────────────────────────────────────────────
  if (/^\d{6}$/.test(text)) {
    const now = new Date().toISOString()
    const { data: userRow } = await admin
      .from('users')
      .select('id, telegram_verification_code, telegram_verification_expires_at')
      .eq('telegram_verification_code', text)
      .gt('telegram_verification_expires_at', now)
      .single()

    if (!userRow) {
      await sendTelegramMessage(chatId, '❌ Code not found or expired. Please generate a new code in the app.')
      return NextResponse.json({ ok: true })
    }

    await admin.from('users').update({
      telegram_chat_id: chatId,
      telegram_enabled: true,
      telegram_verification_code: null,
      telegram_verification_expires_at: null,
    }).eq('id', (userRow as { id: string }).id)

    await sendTelegramMessage(chatId,
      `✅ *Connected! Your Snowball account is linked.*\n\n` +
      `You'll receive:\n🌊 Wave signals\n✅ Target alerts\n🛑 Stop-loss alerts\n📊 Daily summaries at 8pm\n\n` +
      `Try /balance or /help to get started! ❄`)
    return NextResponse.json({ ok: true })
  }

  // ── /stop ─────────────────────────────────────────────────────────────────
  if (rawCmd === '/stop') {
    await admin.from('users').update({ telegram_enabled: false }).eq('telegram_chat_id', chatId)
    await sendTelegramMessage(chatId, '🔕 Notifications paused. Send /start to re-enable.')
    return NextResponse.json({ ok: true })
  }

  // ── Commands that require a linked account ────────────────────────────────
  const DATA_COMMANDS = ['/balance', '/portfolio', '/signal', '/streak', '/calendar', '/achievements']

  if (DATA_COMMANDS.includes(rawCmd)) {
    // /signal doesn't need an account
    if (rawCmd === '/signal') {
      await sendTelegramMessage(chatId, await handleSignal(chatId))
      return NextResponse.json({ ok: true })
    }

    const user = await getUserByChatId(chatId)
    if (!user) {
      await sendTelegramMessage(chatId,
        `⚠️ Your Telegram is not linked to a Snowball account yet.\n\n` +
        `Open the app → Dashboard → *Connect Telegram* → send the 6-digit code here.`)
      return NextResponse.json({ ok: true })
    }

    let reply = ''
    switch (rawCmd) {
      case '/balance':      reply = await handleBalance(chatId, user);      break
      case '/portfolio':    reply = await handlePortfolio(chatId, user);    break
      case '/streak':       reply = await handleStreak(chatId, user);       break
      case '/calendar':     reply = await handleCalendar(chatId, user);     break
      case '/achievements': reply = await handleAchievements(chatId, user); break
    }

    if (reply) await sendTelegramMessage(chatId, reply)
    return NextResponse.json({ ok: true })
  }

  // ── Unknown input ─────────────────────────────────────────────────────────
  if (text.startsWith('/')) {
    await sendTelegramMessage(chatId, `Unknown command. Send /help to see all available commands.`)
  }

  return NextResponse.json({ ok: true })
}
