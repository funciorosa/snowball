import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ signals: [] })

  const admin = createAdminClient()

  // Get signals from channels monitored by this user, last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data } = await admin
    .from('signals')
    .select('id, coin, direction, entry_price, target_price, stop_loss, confidence_score, source_channel, source_message, created_at')
    .eq('source_type', 'channel')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ signals: data ?? [] })
}
