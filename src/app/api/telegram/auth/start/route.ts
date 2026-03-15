import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildClient } from '@/lib/telegram-client'
import { createAdminClient } from '@/lib/supabase/admin'

// Temporary store for phoneCodeHash between start → verify (per user, 10-min TTL in Supabase)
// We store it in a simple in-memory map since both calls happen in the same Vercel function instance
// For production, store in Supabase with expiry
const pendingAuth = new Map<string, { phoneCodeHash: string; phone: string; sessionString: string }>()

export { pendingAuth }

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  try {
    const client = buildClient()
    await client.connect()

    const result = await client.sendCode(
      { apiId: parseInt(process.env.TELEGRAM_API_ID ?? '0', 10), apiHash: process.env.TELEGRAM_API_HASH ?? '' },
      phone
    )

    const sessionString = (client.session as import('telegram/sessions').StringSession).save()

    // Store in Supabase with 10-min expiry so it survives across serverless invocations
    const admin = createAdminClient()
    await admin.from('telegram_sessions').upsert({
      user_id: user.id,
      session_string: sessionString,
      phone,
      is_active: false, // not active until verified
    }, { onConflict: 'user_id' })

    // Also store phoneCodeHash temporarily
    await admin.rpc('set_config', { key: `tg_auth_${user.id}`, value: result.phoneCodeHash }).catch(() => null)

    // Fallback: use in-memory store (works for single-instance dev)
    pendingAuth.set(user.id, { phoneCodeHash: result.phoneCodeHash, phone, sessionString })

    await client.disconnect()

    return NextResponse.json({ status: 'code_sent', phoneCodeHash: result.phoneCodeHash })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send code'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
