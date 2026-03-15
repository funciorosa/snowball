import { createAdminClient } from '@/lib/supabase/admin'

// GramJS MTProto client — loaded dynamically at runtime only
// (package installed separately on server, not bundled at build time)

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
