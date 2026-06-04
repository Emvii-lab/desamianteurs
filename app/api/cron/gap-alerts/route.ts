import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { verifyCronSecret } from '@/lib/cron-auth'

export async function POST(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminSupabase()
  const { error } = await supabase.rpc('process_opportunity_gaps')

  if (error) {
    console.error('[cron/gap-alerts]', error.message)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
