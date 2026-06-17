import { NextRequest, NextResponse } from 'next/server'
import { TIMINGS } from '@/lib/constants'
import { rateLimit } from '@/lib/rate-limit'

const TIMELINE_LABELS: Record<string, string> = Object.fromEntries(
  TIMINGS.map(t => [t.id, t.label])
)

export async function POST(req: NextRequest) {
  try {
    const { getRequestUser } = await import('@/lib/auth-request')
    const { user, supabase } = await getRequestUser(req)
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Rate-limit : 5 mails de confirmation / 10 min / utilisateur
    const rl = rateLimit(`confirmation-demande:${user.id}`, 5, 10 * 60 * 1000)
    if (!rl.ok) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
    }

    const body = await req.json()
    const { prenom, email, serviceTypeIds, propertyTypeId, ville, code_postal, delai, ref_demande } = body

    if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })
    if (email !== user.email) return NextResponse.json({ error: 'Email non autorisé' }, { status: 403 })

    // Résolution des UUID en libellés lisibles
    const [serviceRes, propertyRes] = await Promise.all([
      Array.isArray(serviceTypeIds) && serviceTypeIds.length > 0
        ? supabase.from('ref_service_types').select('label').in('id', serviceTypeIds)
        : Promise.resolve({ data: [] as { label: string }[] }),
      propertyTypeId
        ? supabase.from('ref_property_types').select('label').eq('id', propertyTypeId).maybeSingle()
        : Promise.resolve({ data: null }),
    ])

    const service   = (serviceRes.data as { label: string }[] | null)?.map(s => s.label).join(', ') || '—'
    const type_bien = (propertyRes.data as { label: string } | null)?.label || '—'

    const webhookUrl = process.env.N8N_WEBHOOK_CONFIRMATION_DEMANDE
    if (!webhookUrl) throw new Error('N8N_WEBHOOK_CONFIRMATION_DEMANDE non configuré')

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to:          email,
        prenom:      prenom || 'Client',
        service,
        type_bien,
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
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
