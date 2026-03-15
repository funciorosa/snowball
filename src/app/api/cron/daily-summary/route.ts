import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage, formatDailySummary } from '@/lib/telegram'

export async function GET() {
  const admin = createAdminClient()

  // Fetch all users with telegram enabled
  const { data: users } = await admin
    .from('users')
    .select('telegram_chat_id, initial_capital')
    .eq('telegram_enabled', true)
    .not('telegram_chat_id', 'is', null)

  if (!users?.length) return NextResponse.json({ sent: 0 })

  // Panama time (UTC-5)
  const now = new Date()
  const panamaDate = new Date(now.getTime() - 5 * 60 * 60 * 1000)
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dateStr = `${months[panamaDate.getMonth()]} ${panamaDate.getDate()}, ${panamaDate.getFullYear()}`
  const dayOfMonth = panamaDate.getDate()

  let sent = 0
  for (const user of users) {
    if (!user.telegram_chat_id) continue
    const capital = user.initial_capital || 1000
    const balance = parseFloat((capital * Math.pow(1.02, dayOfMonth - 1)).toFixed(2))
    const todayGain = parseFloat((balance - capital * Math.pow(1.02, dayOfMonth - 2)).toFixed(2))

    const message = formatDailySummary({
      date: dateStr,
      balance,
      todayGain,
      streak: 6,
      winRate: 74,
      day: dayOfMonth,
      totalDays: 30,
    })
    await sendTelegramMessage(user.telegram_chat_id, message)
    sent++
  }

  return NextResponse.json({ sent, date: dateStr })
}
