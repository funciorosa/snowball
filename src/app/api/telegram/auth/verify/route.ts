import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { saveSession } from '@/lib/telegram-client'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, phoneCodeHash } = await req.json()
  if (!code || !phoneCodeHash) {
    return NextResponse.json({ error: 'code and phoneCodeHash required' }, { status: 400 })
  }

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
    const { TelegramClient } = await import('telegram')
    const { StringSession } = await import('telegram/sessions')

    const apiId = parseInt(process.env.TELEGRAM_API_ID ?? '0', 10)
    const apiHash = process.env.TELEGRAM_API_HASH ?? ''

    const client = new TelegramClient(new StringSession(sessionRow.session_string), apiId, apiHash, { connectionRetries: 3 })
    await client.connect()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (client as any).signIn({ apiId, apiHash }, { phoneNumber: sessionRow.phone, phoneCodeHash, phoneCode: code })

    const finalSession: string = (client.session as InstanceType<typeof StringSession>).save()
    await saveSession(user.id, finalSession, sessionRow.phone)
    await client.disconnect()

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed'
    if (message.includes('SESSION_PASSWORD_NEEDED')) {
      return NextResponse.json({ error: 'Two-factor authentication enabled. 2FA not supported yet.' }, { status: 422 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
