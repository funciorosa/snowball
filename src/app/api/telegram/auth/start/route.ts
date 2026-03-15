import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  try {
    // Dynamically load gramjs at runtime (not bundled at build time)
    const { TelegramClient } = await import('telegram')
    const { StringSession } = await import('telegram/sessions')

    const apiId = parseInt(process.env.TELEGRAM_API_ID ?? '0', 10)
    const apiHash = process.env.TELEGRAM_API_HASH ?? ''

    const client = new TelegramClient(new StringSession(''), apiId, apiHash, { connectionRetries: 3 })
    await client.connect()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await client.sendCode({ apiId, apiHash }, phone)
    const sessionString: string = (client.session as InstanceType<typeof StringSession>).save()

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
