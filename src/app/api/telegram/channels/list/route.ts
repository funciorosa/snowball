import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ channels: [] })

  const admin = createAdminClient()
  const { data } = await admin
    .from('monitored_channels')
    .select('id, channel_username, channel_title, last_checked_at, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('added_at', { ascending: false })

  return NextResponse.json({ channels: data ?? [] })
}
