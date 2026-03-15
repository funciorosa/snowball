import { NextRequest, NextResponse } from 'next/server'

const BOT_COMMANDS = [
  { command: 'balance',      description: 'Check your snowball balance & daily progress' },
  { command: 'portfolio',    description: 'View your crypto allocation breakdown' },
  { command: 'signal',       description: 'Get the latest BTC trading signal' },
  { command: 'streak',       description: 'See your win streak & monthly stats' },
  { command: 'calendar',     description: 'Monthly emoji calendar of wins/losses' },
  { command: 'achievements', description: 'View your unlocked badges' },
  { command: 'help',         description: 'List all available commands' },
  { command: 'stop',         description: 'Pause push notifications' },
]

export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not set' }, { status: 500 })

  const host = req.headers.get('host') ?? req.nextUrl.host
  const webhookUrl = `https://${host}/api/telegram/webhook`

  // 1. Register webhook
  const webhookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message'] }),
  })
  const webhookData = await webhookRes.json()

  // 2. Register commands (shows as suggestions in Telegram)
  const commandsRes = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commands: BOT_COMMANDS }),
  })
  const commandsData = await commandsRes.json()

  return NextResponse.json({
    webhookUrl,
    webhook: webhookData,
    commands: commandsData,
  })
}
