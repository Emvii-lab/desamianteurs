import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { verifyAdmin } from '@/lib/auth-helpers'

export async function PATCH(req: Request) {
  const supabase = await createServerSupabase()
  if (!await verifyAdmin(supabase)) {
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
