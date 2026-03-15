import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const message = body?.message
  if (!message) return NextResponse.json({ ok: true })

  const chatId = message.chat?.id?.toString()
  const text = message.text?.trim()
  if (!chatId || !text) return NextResponse.json({ ok: true })

  const admin = createAdminClient()

  // Handle /start command
  if (text === '/start' || text.startsWith('/start')) {
    await sendTelegramMessage(chatId,
      `❄ *Welcome to Snowball Bot!*\n\nTo connect your account:\n1. Go to your Snowball app\n2. Click "Connect Telegram"\n3. Send the 6-digit code here\n\nI'll notify you about wave signals, targets, and daily summaries! 🌊`)
    return NextResponse.json({ ok: true })
  }

  // Handle 6-digit verification code
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
    }).eq('id', userRow.id)

    await sendTelegramMessage(chatId,
      `✅ *Connected!* Your Snowball account is now linked.\n\nYou'll receive:\n🌊 Wave signals\n✅ Target alerts\n🛑 Stop-loss alerts\n📊 Daily summaries at 8pm\n\nLet it snowball! ❄`)
    return NextResponse.json({ ok: true })
  }

  // Handle /stop command
  if (text === '/stop') {
    await admin.from('users').update({ telegram_enabled: false }).eq('telegram_chat_id', chatId)
    await sendTelegramMessage(chatId, '🔕 Notifications paused. Send /start to re-enable anytime.')
    return NextResponse.json({ ok: true })
  }

  // Handle /status command
  if (text === '/status') {
    await sendTelegramMessage(chatId, '✅ Bot is active. You are receiving Snowball notifications. Send /stop to pause.')
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
