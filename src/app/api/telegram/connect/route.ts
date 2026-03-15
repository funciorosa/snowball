import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

  const admin = createAdminClient()
  await admin.from('users').update({
    telegram_verification_code: code,
    telegram_verification_expires_at: expiresAt,
  }).eq('id', user.id)

  return NextResponse.json({ code })
}

export async function GET() {
  // Returns current telegram connection status
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase.from('users').select('telegram_chat_id,telegram_enabled').eq('id', user.id).single()
  return NextResponse.json({ connected: !!data?.telegram_chat_id, enabled: !!data?.telegram_enabled })
}
