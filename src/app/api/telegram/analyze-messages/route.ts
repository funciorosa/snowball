import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a crypto trading signal extractor.
Analyze this Telegram message and extract any trading signals. Return JSON only:
{
  "has_signal": boolean,
  "coin": string or null,
  "pair": string or null,
  "direction": "long" | "short" | "neutral" | null,
  "entry_price": number or null,
  "target_price": number or null,
  "stop_loss": number or null,
  "conviction": "high" | "medium" | "low" | null,
  "summary": "one line summary in English",
  "raw_mention": "exact coin mention from text"
}
If no trading signal found, return has_signal: false.`

// Known Binance USDT pairs for verification bonus
const BINANCE_COINS = new Set([
  'BTC','ETH','SOL','BNB','AVAX','DOGE','PEPE','WIF','SUI','APT','SEI','INJ','TIA',
  'LINK','MATIC','DOT','ADA','XRP','LTC','ATOM','UNI','NEAR','FTM','SAND','MANA',
  'TRIA','BONK','JUP','PYTH','RNDR','ARB','OP','IMX',
])

function calcConfidenceScore(signal: {
  entry_price: number | null
  target_price: number | null
  stop_loss: number | null
  conviction: string | null
  coin: string | null
}): number {
  let score = 0
  if (signal.entry_price) score += 25
  if (signal.target_price) score += 20
  if (signal.stop_loss) score += 20
  if (signal.conviction === 'high') score += 20
  else if (signal.conviction === 'medium') score += 10
  if (signal.coin && BINANCE_COINS.has(signal.coin.toUpperCase())) score += 15
  return score
}

export async function POST() {
  const admin = createAdminClient()

  // Grab up to 20 unprocessed messages
  const { data: messages } = await admin
    .from('channel_messages')
    .select('id, user_id, channel_username, message_text')
    .eq('processed', false)
    .not('message_text', 'is', null)
    .order('created_at', { ascending: true })
    .limit(20)

  if (!messages || messages.length === 0) {
    return NextResponse.json({ analyzed: 0 })
  }

  // Get all users who have Telegram notifications enabled (for broadcasting)
  const { data: notifUsers } = await admin
    .from('users')
    .select('id, telegram_chat_id')
    .eq('telegram_enabled', true)
    .not('telegram_chat_id', 'is', null)

  let analyzed = 0

  for (const msg of messages) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: msg.message_text ?? '' }],
      })

      const raw = (response.content[0] as { type: string; text: string }).text.trim()
      // Strip markdown code fences if Claude wrapped it
      const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      const signal = JSON.parse(jsonStr)

      if (signal.has_signal) {
        const score = calcConfidenceScore(signal)
        const coin = signal.coin?.toUpperCase() ?? 'UNKNOWN'

        // Save signal to signals table
        const { data: inserted } = await admin
          .from('signals')
          .insert({
            coin,
            direction: signal.direction === 'long' || signal.direction === 'short' ? signal.direction : 'long',
            entry_price: signal.entry_price,
            target_price: signal.target_price,
            stop_loss: signal.stop_loss,
            confidence_score: score,
            traders_count: 1,
            trader_names: [`@${msg.channel_username}`],
            source_type: 'channel',
            source_channel: msg.channel_username,
            source_message: msg.message_text?.slice(0, 200),
            status: 'active',
          })
          .select('id')
          .single()

        // Mark message with signal reference
        await admin
          .from('channel_messages')
          .update({ processed: true, has_signal: true, signal_id: inserted?.id })
          .eq('id', msg.id)

        // Send Telegram notification if score is high enough
        if (score >= 50 && process.env.TELEGRAM_BOT_TOKEN) {
          const botToken = process.env.TELEGRAM_BOT_TOKEN
          const dirEmoji = signal.direction === 'long' ? '📈' : signal.direction === 'short' ? '📉' : '➡️'
          const text = [
            `💬 *Signal from @${msg.channel_username}*`,
            `━━━━━━━━━━━━━━━`,
            `🪙 Coin: ${coin}${signal.pair ? `/${signal.pair.split('/')[1] ?? 'USDT'}` : '/USDT'}`,
            `${dirEmoji} Direction: ${(signal.direction ?? 'neutral').toUpperCase()}`,
            signal.entry_price ? `💰 Entry: $${signal.entry_price}` : `💰 Entry: not specified`,
            signal.target_price ? `🎯 Target: $${signal.target_price}` : `🎯 Target: not specified`,
            signal.stop_loss ? `🛑 Stop-loss: $${signal.stop_loss}` : `🛑 Stop-loss: not specified`,
            `━━━━━━━━━━━━━━━`,
            `📝 _"${signal.summary}"_`,
            `━━━━━━━━━━━━━━━`,
            `🔍 Confidence: ${score}/100`,
            score < 65 ? `⚠️ No entry/target specified — research before trading` : '',
          ].filter(Boolean).join('\n')

          // Broadcast to all users with Telegram enabled
          for (const notifUser of notifUsers ?? []) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: notifUser.telegram_chat_id,
                text,
                parse_mode: 'Markdown',
              }),
            }).catch(() => null)
          }
        }
      } else {
        // No signal — just mark as processed
        await admin
          .from('channel_messages')
          .update({ processed: true, has_signal: false })
          .eq('id', msg.id)
      }

      analyzed++
    } catch (err) {
      console.error(`Error analyzing message ${msg.id}:`, err)
      // Mark as processed to avoid infinite retry on parse failures
      await admin
        .from('channel_messages')
        .update({ processed: true })
        .eq('id', msg.id)
    }

    // Small delay between Claude calls to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200))
  }

  return NextResponse.json({ analyzed })
}

export { POST as GET }
