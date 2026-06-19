import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/auth-request'

export async function PATCH(req: Request) {
  const { user, supabase } = await verifyAdminRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { reviewId, action, reason } = await req.json()
  if (!reviewId || !action) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

  const ALLOWED_ACTIONS = ['approved', 'rejected', 'pending'] as const
  if (!ALLOWED_ACTIONS.includes(action)) return NextResponse.json({ error: 'Action invalide' }, { status: 400 })

  const { error } = await supabase
    .from('reviews')
    .update({ status: action, rejection_reason: reason ?? null })
    .eq('id', reviewId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
