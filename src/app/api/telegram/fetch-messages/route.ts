/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildClient } from '@/lib/telegram-client'

export async function POST() {
  const admin = createAdminClient()

  const { data: channels } = await admin
    .from('monitored_channels')
    .select('id, user_id, channel_username, channel_id, last_message_id')
    .eq('is_active', true)

  if (!channels || channels.length === 0) {
    return NextResponse.json({ fetched: 0 })
  }

  const byUser: Record<string, typeof channels> = {}
  for (const ch of channels) {
    if (!byUser[ch.user_id]) byUser[ch.user_id] = []
    byUser[ch.user_id].push(ch)
  }

  let totalFetched = 0

  for (const [userId, userChannels] of Object.entries(byUser)) {
    const { data: sessionRow } = await admin
      .from('telegram_sessions')
      .select('session_string')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (!sessionRow?.session_string) continue

    let client: any = null
    try {
      client = await buildClient(sessionRow.session_string)
      await client.connect()

      for (const channel of userChannels) {
        try {
          const entityParam = channel.channel_id
            ? BigInt(channel.channel_id)
            : `@${channel.channel_username}`
          const entity = await client.getEntity(entityParam)

          const messages = await client.getMessages(entity, {
            limit: 15,
            minId: channel.last_message_id ?? 0,
          })

          if (!messages.length) continue

          const rows = (messages as any[])
            .filter((m: any) => m.message && m.message.trim().length > 10)
            .map((m: any) => ({
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

            const maxId = Math.max(...rows.map((r: any) => r.message_id))
            await admin
              .from('monitored_channels')
              .update({ last_message_id: maxId, last_checked_at: new Date().toISOString() })
              .eq('id', channel.id)
          }
        } catch (chErr) {
          console.error(`Error fetching @${channel.channel_username}:`, chErr)
        }

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

export { POST as GET }
