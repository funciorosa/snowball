import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import { createAdminClient } from '@/lib/supabase/admin'

const API_ID = parseInt(process.env.TELEGRAM_API_ID ?? '0', 10)
const API_HASH = process.env.TELEGRAM_API_HASH ?? ''

// Build a fresh client with an optional saved session string
export function buildClient(sessionString = ''): TelegramClient {
  const session = new StringSession(sessionString)
  return new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 3,
    useWSS: true,
  })
}

// Load the saved session string for a given user from Supabase
export async function loadSession(userId: string): Promise<string | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('telegram_sessions')
    .select('session_string')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
  return data?.session_string ?? null
}

// Persist the session string after auth completes
export async function saveSession(userId: string, sessionString: string, phone: string) {
  const supabase = createAdminClient()
  await supabase
    .from('telegram_sessions')
    .upsert({ user_id: userId, session_string: sessionString, phone, is_active: true }, { onConflict: 'user_id' })
}

// Delete the session (disconnect)
export async function deleteSession(userId: string) {
  const supabase = createAdminClient()
  await supabase.from('telegram_sessions').delete().eq('user_id', userId)
}

// Get a connected client using the user's stored session. Returns null if no session.
export async function getConnectedClient(userId: string): Promise<TelegramClient | null> {
  const sessionString = await loadSession(userId)
  if (!sessionString) return null

  const client = buildClient(sessionString)
  await client.connect()
  return client
}
