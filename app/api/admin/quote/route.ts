import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/auth-request'

export async function PATCH(req: Request) {
  const { user, supabase } = await verifyAdminRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { quoteId } = await req.json()
  if (!quoteId) return NextResponse.json({ error: 'quoteId manquant' }, { status: 400 })

  const { error } = await supabase
    .from('quotes')
    .update({ status: 'published' })
    .eq('id', quoteId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
