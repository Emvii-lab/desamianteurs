import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { verifyCronSecret } from '@/lib/cron-auth'
import { notifyNewAssignments } from '@/lib/notify-partners'

export async function POST(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminSupabase()

  const [wave2, wave3] = await Promise.all([
    supabase.rpc('escalate_quotes_wave_2'),
    supabase.rpc('escalate_quotes_wave_3'),
  ])

  if (wave2.error) console.error('[cron/wave-escalation] wave2:', wave2.error.message)
  if (wave3.error) console.error('[cron/wave-escalation] wave3:', wave3.error.message)

  if (wave2.error || wave3.error) {
    return NextResponse.json({
      wave2: wave2.error ? 'error' : 'ok',
      wave3: wave3.error ? 'error' : 'ok',
    }, { status: 500 })
  }

  await notifyNewAssignments()

  return NextResponse.json({ ok: true })
}
