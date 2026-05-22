import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: admin } = await supabase.from('admins').select('id').eq('user_id', user.id).single()
  return admin ? user : null
}

export async function PATCH(req: Request) {
  const supabase = await createServerSupabase()
  if (!await verifyAdmin(supabase)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { partnerId, action, reason } = await req.json()
  if (!partnerId || !action) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

  const update = action === 'verify'
    ? { is_verified: true,  status: 'active',    rejection_reason: null }
    : { is_verified: false, status: 'rejected',  rejection_reason: reason ?? null }

  const { error } = await supabase
    .from('partners')
    .update(update)
    .eq('id', partnerId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
