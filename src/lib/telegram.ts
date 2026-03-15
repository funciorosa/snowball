const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    })
    return res.ok
  } catch {
    return false
  }
}

export function formatEntrySignal(params: {
  coin: string; entryPrice: number; targetPrice: number; stopLoss: number;
  traderName: string; traderRoi: string; fearGreed: number; fearGreedLabel: string; windowMin: number;
}): string {
  return `🌊 *WAVE DETECTED — ${params.coin}/USDT*\n` +
    `Entry: $${params.entryPrice.toLocaleString()}\n` +
    `Target (+2.2%): $${params.targetPrice.toLocaleString()}\n` +
    `Stop-loss (-1.5%): $${params.stopLoss.toLocaleString()}\n` +
    `Copying: @${params.traderName} (ROI ${params.traderRoi})\n` +
    `Fear & Greed: ${params.fearGreed} — ${params.fearGreedLabel}\n` +
    `⏱ Window: ~${params.windowMin} min`
}

export function formatSellAlert(params: {
  coin: string; exitPrice: number; gainPct: number; gainUsd: number; achievement?: string;
}): string {
  return `✅ *TARGET REACHED — ${params.coin}/USDT*\n` +
    `Exit price: $${params.exitPrice.toLocaleString()}\n` +
    `Gain: +${params.gainPct.toFixed(1)}% · +$${params.gainUsd.toFixed(2)}\n` +
    (params.achievement ? `🏆 Achievement unlocked: ${params.achievement}` : '')
}

export function formatStopLoss(params: {
  coin: string; exitPrice: number; lossPct: number; lossUsd: number;
}): string {
  return `🛑 *STOP-LOSS HIT — ${params.coin}/USDT*\n` +
    `Exit price: $${params.exitPrice.toLocaleString()}\n` +
    `Loss: -${params.lossPct.toFixed(1)}% · -$${params.lossUsd.toFixed(2)}\n` +
    `Snowball protected 🧊`
}

export function formatDailySummary(params: {
  date: string; balance: number; todayGain: number; streak: number; winRate: number; day: number; totalDays: number;
}): string {
  const sign = params.todayGain >= 0 ? '+' : ''
  return `📊 *Snowball Daily Summary*\n` +
    `Date: ${params.date}\n` +
    `Balance: $${params.balance.toFixed(2)} (${sign}$${params.todayGain.toFixed(2)} today)\n` +
    `Streak: ${params.streak} days 🔥\n` +
    `Win rate: ${params.winRate}%\n` +
    `Goal progress: Day ${params.day}/${params.totalDays}`
}

export function formatWaveChallenge(params: {
  coin: string; changePct: number; timeframeMin: number; volumeMultiple: number; windowMin: number;
}): string {
  return `⚡ *WAVE CHALLENGE — ${params.coin}/USDT*\n` +
    `+${params.changePct.toFixed(1)}% in last ${params.timeframeMin} min\n` +
    `Volume ${params.volumeMultiple}x average\n` +
    `Window: ~${params.windowMin} min\n` +
    `Open Snowball to ride it →`
}
