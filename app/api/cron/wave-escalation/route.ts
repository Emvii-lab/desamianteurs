import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { notifyNewAssignments } from '@/lib/notify-partners'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
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
      wave2: wave2.error?.message ?? 'ok',
      wave3: wave3.error?.message ?? 'ok',
    }, { status: 500 })
  }

  // Notifier les partenaires nouvellement assignés en vagues 2 & 3
  await notifyNewAssignments()

  return NextResponse.json({ ok: true })
}
