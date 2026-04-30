import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PartnerDashboard from './PartnerDashboard'
import { AVATAR_COLORS } from '@/lib/constants'

export const metadata = {
  title: 'Espace Partenaire | Désamianteurs.fr',
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return "Il y a moins d'1h"
  if (h < 24) return `Il y a ${h}h`
  return `Il y a ${Math.floor(h / 24)}j`
}

export default async function EspacePartenairePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion')
  }

  const { data: partner } = await supabase
    .from('partners')
    .select('id, is_verified, missions_completed, average_rating, review_count')
    .eq('user_id', user.id).maybeSingle()

  if (!partner) {
    // Check if user is admin instead
    const { data: admin } = await supabase.from('admins').select('id').eq('user_id', user.id).maybeSingle()
    if (admin) redirect('/espace-admin')
    redirect('/espace-client')
  }

  const [assignRes, reviewsRes, countRes] = await Promise.all([
    // Nouvelles demandes
    supabase
      .from('quote_assignments')
      .select(`id, sent_at, quote:quotes(id, address_city, address_street, address_postal_code)`)
      .eq('partner_id', partner.id)
      .eq('status', 'pending')
      .order('sent_at', { ascending: false })
      .limit(5),

    // Avis récents
    supabase
      .from('reviews')
      .select(`id, rating, comment, created_at, client:clients(first_name, last_name)`)
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })
      .limit(3),

    // Stats
    supabase
      .from('quote_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('partner_id', partner.id)
      .eq('status', 'pending')
  ])

  const demandes = (assignRes.data ?? []).map(a => {
    const q = a.quote as any
    return {
      id: a.id,
      title: 'Demande de prestation',
      address: q?.address_street ?? '',
      type: 'Prestation amiante',
      location: [q?.address_postal_code, q?.address_city].filter(Boolean).join(' '),
      published: timeAgo(a.sent_at),
    }
  })

  const avis = (reviewsRes.data ?? []).map((r, i) => {
    const c = r.client as any
    const name = c ? `${c.first_name ?? ''} ${((c.last_name ?? '')[0] ?? '')}.`.trim() : 'Client'
    return {
      id: r.id,
      initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      name, rating: r.rating ?? 0,
      text: r.comment ?? '',
      detail: new Date(r.created_at).toLocaleDateString('fr-FR'),
    }
  })

  const stats = {
    demandes: countRes.count ?? 0,
    missions: partner.missions_completed ?? 0,
    rating: partner.average_rating ?? 0,
    reviewCount: partner.review_count ?? 0,
  }

  return (
    <PartnerDashboard 
      isValid={partner.is_verified ?? false}
      demandes={demandes}
      avis={avis}
      stats={stats}
    />
  )
}
