import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loadSession } from '@/lib/telegram-client'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionString = await loadSession(user.id)
  if (!sessionString) {
    return NextResponse.json({ error: 'not_connected', message: 'Connect your Telegram account first' }, { status: 400 })
  }

  try {
    const { TelegramClient } = await import('telegram')
    const { StringSession } = await import('telegram/sessions')

    const apiId = parseInt(process.env.TELEGRAM_API_ID ?? '0', 10)
    const apiHash = process.env.TELEGRAM_API_HASH ?? ''

    const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, { connectionRetries: 3 })
    await client.connect()

    const dialogs = await client.getDialogs({ limit: 200 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channels = (dialogs as any[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((d: any) => d.isChannel && !d.isGroup)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((d: any) => ({
        id: d.id?.toString(),
        title: d.title,
        username: d.entity?.username ?? null,
        memberCount: d.entity?.participantsCount ?? 0,
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((c: any) => c.username)

    await client.disconnect()
    return NextResponse.json({ channels })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch channels'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { channel_username, channel_id, channel_title } = await req.json()
  if (!channel_username) return NextResponse.json({ error: 'channel_username required' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('monitored_channels').upsert(
    {
      user_id: user.id,
      channel_username: channel_username.replace('@', ''),
      channel_title: channel_title ?? channel_username,
      channel_id: channel_id ?? null,
      is_active: true,
    },
    { onConflict: 'user_id,channel_username' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
