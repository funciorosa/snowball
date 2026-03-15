import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildClient, saveSession } from '@/lib/telegram-client'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, phoneCodeHash } = await req.json()
  if (!code || !phoneCodeHash) {
    return NextResponse.json({ error: 'code and phoneCodeHash required' }, { status: 400 })
  }

  // Load the pre-auth session from Supabase
  const admin = createAdminClient()
  const { data: sessionRow } = await admin
    .from('telegram_sessions')
    .select('session_string, phone')
    .eq('user_id', user.id)
    .single()

  if (!sessionRow) {
    return NextResponse.json({ error: 'No pending auth session. Call /auth/start first.' }, { status: 400 })
  }

  try {
    const client = buildClient(sessionRow.session_string)
    await client.connect()

    await client.signIn(
      { apiId: parseInt(process.env.TELEGRAM_API_ID ?? '0', 10), apiHash: process.env.TELEGRAM_API_HASH ?? '' },
      { phoneNumber: sessionRow.phone, phoneCodeHash, phoneCode: code }
    )

    const finalSession = (client.session as import('telegram/sessions').StringSession).save()
    await saveSession(user.id, finalSession, sessionRow.phone)
    await client.disconnect()

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed'
    // Handle 2FA (password required)
    if (message.includes('SESSION_PASSWORD_NEEDED')) {
      return NextResponse.json({ error: 'Two-factor authentication is enabled. 2FA not supported yet.' }, { status: 422 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
