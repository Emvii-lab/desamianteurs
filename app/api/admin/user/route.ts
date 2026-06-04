import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { verifyAdmin } from '@/lib/auth-helpers'

// ── POST : envoyer un email de réinitialisation du mot de passe ──────────────

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  if (!await verifyAdmin(supabase)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.desamianteurs.com'
  const admin  = createAdminSupabase()

  const { error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${appUrl}/reinitialiser-mot-de-passe` },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  // Ne pas retourner le lien au client — Supabase l'envoie par email directement
  return NextResponse.json({ ok: true })
}

// ── DELETE : supprimer un utilisateur en cascade ─────────────────────────────

export async function DELETE(req: Request) {
  const supabase = await createServerSupabase()
  if (!await verifyAdmin(supabase)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { userId, role } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

  const admin = createAdminSupabase()

  try {
    if (role === 'partenaire') {
      const { data: partner } = await admin.from('partners').select('id').eq('user_id', userId).maybeSingle()
      if (partner) {
        const pid = (partner as { id: string }).id
        await admin.from('quote_assignments').delete().eq('partner_id', pid)
        await admin.from('partner_domains').delete().eq('partner_id', pid)
        await admin.from('target_markets').delete().eq('partner_id', pid)
        await admin.from('intervention_zones').delete().eq('partner_id', pid)
      }
      await admin.from('partners').delete().eq('user_id', userId)

    } else if (role === 'client') {
      const { data: client } = await admin.from('clients').select('id').eq('user_id', userId).maybeSingle()
      if (client) {
        const cid = (client as { id: string }).id
        const { data: quotes } = await admin.from('quotes').select('id').eq('client_id', cid)
        if (quotes?.length) {
          const ids = (quotes as { id: string }[]).map(q => q.id)
          await admin.from('quote_service_types').delete().in('quote_id', ids)
          await admin.from('quote_assignments').delete().in('quote_id', ids)
          await admin.from('quotes').delete().eq('client_id', cid)
        }
      }
      await admin.from('clients').delete().eq('user_id', userId)

    } else if (role === 'admin') {
      await admin.from('admins').delete().eq('user_id', userId)
    }

    const { error: authErr } = await admin.auth.admin.deleteUser(userId)
    if (authErr) throw new Error(authErr.message)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[admin/user] DELETE error:', e.message)
    return NextResponse.json({ error: e.message || 'Erreur lors de la suppression' }, { status: 500 })
  }
}
