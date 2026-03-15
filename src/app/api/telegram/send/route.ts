import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const { chat_id, message } = await req.json()
  if (!chat_id || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const ok = await sendTelegramMessage(chat_id, message)
  return NextResponse.json({ ok })
}
