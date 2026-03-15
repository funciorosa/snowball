import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConnectedClient } from '@/lib/telegram-client'
import { createAdminClient } from '@/lib/supabase/admin'
import { Api } from 'telegram'

// GET — list all Telegram channels the user is a member of
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await getConnectedClient(user.id)
  if (!client) return NextResponse.json({ error: 'not_connected', message: 'Connect your Telegram account first' }, { status: 400 })

  try {
    const dialogs = await client.getDialogs({ limit: 200 })
    const channels = dialogs
      .filter((d) => d.isChannel && !d.isGroup)
      .map((d) => ({
        id: d.id?.toString(),
        title: d.title,
        username: (d.entity as Api.Channel)?.username ?? null,
        memberCount: (d.entity as Api.Channel)?.participantsCount ?? 0,
      }))
      .filter((c) => c.username) // Only public channels with usernames

    await client.disconnect()
    return NextResponse.json({ channels })
  } catch (err: unknown) {
    await client.disconnect().catch(() => null)
    const message = err instanceof Error ? err.message : 'Failed to fetch channels'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST — add a channel to monitoring list
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { channel_username, channel_id, channel_title } = await req.json()
  if (!channel_username) return NextResponse.json({ error: 'channel_username required' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('monitored_channels').upsert({
    user_id: user.id,
    channel_username: channel_username.replace('@', ''),
    channel_title: channel_title ?? channel_username,
    channel_id: channel_id ?? null,
    is_active: true,
  }, { onConflict: 'user_id,channel_username' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
