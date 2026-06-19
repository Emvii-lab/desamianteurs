import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/auth-request'

export async function PATCH(req: Request) {
  const { user, supabase } = await verifyAdminRequest(req)
  if (!user) {
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
