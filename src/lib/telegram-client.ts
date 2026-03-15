/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '@/lib/supabase/admin'

const API_ID = parseInt(process.env.TELEGRAM_API_ID ?? '0', 10)
const API_HASH = process.env.TELEGRAM_API_HASH ?? ''

// Lazy-load gramjs only on server to avoid build issues
async function getTelegramModules() {
  const { TelegramClient } = await import('telegram')
  const { StringSession } = await import('telegram/sessions')
  return { TelegramClient, StringSession }
}

export async function buildClient(sessionString = ''): Promise<any> {
  const { TelegramClient, StringSession } = await getTelegramModules()
  const session = new StringSession(sessionString)
  return new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 3,
  })
}

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

export async function saveSession(userId: string, sessionString: string, phone: string) {
  const supabase = createAdminClient()
  await supabase
    .from('telegram_sessions')
    .upsert(
      { user_id: userId, session_string: sessionString, phone, is_active: true },
      { onConflict: 'user_id' }
    )
}

export async function deleteSession(userId: string) {
  const supabase = createAdminClient()
  await supabase.from('telegram_sessions').delete().eq('user_id', userId)
}

export async function getConnectedClient(userId: string): Promise<any | null> {
  const sessionString = await loadSession(userId)
  if (!sessionString) return null
  const client = await buildClient(sessionString)
  await client.connect()
  return client
}
