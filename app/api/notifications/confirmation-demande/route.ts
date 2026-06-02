import { NextRequest, NextResponse } from 'next/server'

const TIMELINE_LABELS: Record<string, string> = {
  emergency:       'Urgent',
  within_1_month:  'Sous 1 mois',
  within_3_months: 'Sous 3 mois',
  over_3_months:   'Plus de 3 mois',
}

export async function POST(req: NextRequest) {
  try {
    const { createServerSupabase } = await import('@/lib/supabase-server')
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await req.json()
    const { prenom, email, service, type_bien, ville, code_postal, delai, ref_demande } = body

    if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })
    if (email !== user.email) return NextResponse.json({ error: 'Email non autorisé' }, { status: 403 })

    const webhookUrl = process.env.N8N_WEBHOOK_CONFIRMATION_DEMANDE
    if (!webhookUrl) throw new Error('N8N_WEBHOOK_CONFIRMATION_DEMANDE non configuré')

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to:          email,
        prenom:      prenom || 'Client',
        service:     service || '—',
        type_bien:   type_bien || '—',
        ville:       ville || '—',
        code_postal: code_postal || '—',
        delai:       TIMELINE_LABELS[delai] || delai || '—',
        ref_demande: ref_demande?.slice(0, 8).toUpperCase() || '—',
      }),
    })

    if (!res.ok) throw new Error(`n8n webhook error: ${res.status}`)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[confirmation-demande]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
