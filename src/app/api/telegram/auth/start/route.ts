/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildClient } from '@/lib/telegram-client'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  try {
    const client = await buildClient()
    await client.connect()

    const result: any = await client.sendCode(
      { apiId: parseInt(process.env.TELEGRAM_API_ID ?? '0', 10), apiHash: process.env.TELEGRAM_API_HASH ?? '' },
      phone
    )

    const sessionString: string = client.session.save()

    // Store pre-auth session in Supabase (is_active: false until verified)
    const admin = createAdminClient()
    await admin.from('telegram_sessions').upsert(
      { user_id: user.id, session_string: sessionString, phone, is_active: false },
      { onConflict: 'user_id' }
    )

    await client.disconnect()

    return NextResponse.json({ status: 'code_sent', phoneCodeHash: result.phoneCodeHash })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send code'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
