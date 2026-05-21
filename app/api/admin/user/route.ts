import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: admin } = await supabase.from('admins').select('id').eq('user_id', user.id).single()
  return admin ? user : null
}

// ── POST : envoyer un email de réinitialisation du mot de passe ──────────────

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  if (!await verifyAdmin(supabase)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const admin  = getAdminClient()

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${origin}/reinitialiser-mot-de-passe` },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, link: data.properties?.action_link })
}

// ── DELETE : supprimer un utilisateur en cascade ─────────────────────────────

export async function DELETE(req: Request) {
  const supabase = await createServerSupabase()
  if (!await verifyAdmin(supabase)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { userId, role } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

  const admin = getAdminClient()

  try {
    if (role === 'partenaire') {
      const { data: partner } = await admin.from('partners').select('id').eq('user_id', userId).maybeSingle()
      if (partner) {
        await admin.from('quote_assignments').delete().eq('partner_id', partner.id)
        await admin.from('partner_domains').delete().eq('partner_id', partner.id)
        await admin.from('target_markets').delete().eq('partner_id', partner.id)
        await admin.from('intervention_zones').delete().eq('partner_id', partner.id)
      }
      await admin.from('partners').delete().eq('user_id', userId)

    } else if (role === 'client') {
      const { data: client } = await admin.from('clients').select('id').eq('user_id', userId).maybeSingle()
      if (client) {
        const { data: quotes } = await admin.from('quotes').select('id').eq('client_id', client.id)
        if (quotes?.length) {
          const ids = quotes.map(q => q.id)
          await admin.from('quote_service_types').delete().in('quote_id', ids)
          await admin.from('quote_assignments').delete().in('quote_id', ids)
          await admin.from('quotes').delete().eq('client_id', client.id)
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
