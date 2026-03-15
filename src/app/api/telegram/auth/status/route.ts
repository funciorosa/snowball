import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ connected: false })

  const admin = createAdminClient()
  const { data } = await admin
    .from('telegram_sessions')
    .select('phone, created_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  return NextResponse.json({ connected: !!data, phone: data?.phone })
}
