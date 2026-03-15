import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildClient } from '@/lib/telegram-client'

// Called by cron every 10 minutes
// Fetches new messages from all monitored channels for all users
export async function POST() {
  const admin = createAdminClient()

  // Get all active monitored channels with their user sessions
  const { data: channels } = await admin
    .from('monitored_channels')
    .select('id, user_id, channel_username, channel_id, last_message_id')
    .eq('is_active', true)

  if (!channels || channels.length === 0) {
    return NextResponse.json({ fetched: 0 })
  }

  // Group channels by user to reuse one client connection per user
  const byUser: Record<string, typeof channels> = {}
  for (const ch of channels) {
    if (!byUser[ch.user_id]) byUser[ch.user_id] = []
    byUser[ch.user_id].push(ch)
  }

  let totalFetched = 0

  for (const [userId, userChannels] of Object.entries(byUser)) {
    // Load session for this user
    const { data: sessionRow } = await admin
      .from('telegram_sessions')
      .select('session_string')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (!sessionRow?.session_string) continue

    let client: import('telegram').TelegramClient | null = null
    try {
      client = buildClient(sessionRow.session_string)
      await client.connect()

      for (const channel of userChannels) {
        try {
          const entity = await client.getEntity(
            channel.channel_id ? BigInt(channel.channel_id) : `@${channel.channel_username}`
          )

          // Fetch messages newer than the last known message ID
          const messages = await client.getMessages(entity, {
            limit: 15,
            minId: channel.last_message_id ?? 0,
          })

          if (!messages.length) continue

          const rows = messages
            .filter((m) => m.message && m.message.trim().length > 10)
            .map((m) => ({
              user_id: userId,
              channel_username: channel.channel_username,
              message_id: Number(m.id),
              message_text: m.message,
              message_date: new Date(Number(m.date) * 1000).toISOString(),
              processed: false,
            }))

          if (rows.length > 0) {
            await admin
              .from('channel_messages')
              .upsert(rows, { onConflict: 'user_id,channel_username,message_id', ignoreDuplicates: true })

            totalFetched += rows.length

            // Update last_message_id to the highest seen
            const maxId = Math.max(...rows.map((r) => r.message_id))
            await admin
              .from('monitored_channels')
              .update({ last_message_id: maxId, last_checked_at: new Date().toISOString() })
              .eq('id', channel.id)
          }
        } catch (chErr) {
          // FloodWaitError or channel access error — skip this channel
          console.error(`Error fetching @${channel.channel_username}:`, chErr)
        }

        // Rate limit: 300ms between channels
        await new Promise((r) => setTimeout(r, 300))
      }
    } catch (err) {
      console.error(`Error connecting for user ${userId}:`, err)
    } finally {
      if (client) await client.disconnect().catch(() => null)
    }
  }

  return NextResponse.json({ fetched: totalFetched })
}

// Allow Vercel cron to call via GET as well
export { POST as GET }
