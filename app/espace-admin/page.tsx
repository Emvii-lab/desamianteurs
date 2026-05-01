import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'
import { AVATAR_COLORS, TYPE_LABEL } from '@/lib/constants'

export const metadata = {
  title: 'Administration | Désamianteurs.fr',
}

export default async function EspaceAdminPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion')
  }

  // Check if admin
  const { data: admin } = await supabase.from('admins').select('id').eq('user_id', user.id).maybeSingle()
  if (!admin) {
    redirect('/espace-client')
  }

  // Fetch all stats and lists
  const [
    usersCount,
    partnersCount,
    pendingCount,
    quotesCount,
    reviewsCount,
    pendingPartnersData,
    reviewsData,
    draftQuotesData
  ] = await Promise.all([
    supabase.from('clients').select('id',   { count: 'exact', head: true }),
    supabase.from('partners').select('id',  { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('partners').select('id',  { count: 'exact', head: true }).eq('is_verified', false),
    supabase.from('quotes').select('id',    { count: 'exact', head: true }),
    supabase.from('reviews').select('id',   { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('partners')
      .select(`id, company_name, siret, partner_type, created_at,
               docs:partner_documents(id)`)
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('reviews')
      .select(`id, rating, comment,
               client:clients(first_name, last_name),
               partner:partners(company_name)`)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('quotes')
      .select(`id, address_city, address_postal_code, client_type, created_at,
               services:quote_service_types(service:ref_service_types(label))`)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(20)
  ])

  const stats = {
    users:    usersCount.count   ?? 0,
    partners: partnersCount.count ?? 0,
    pending:  pendingCount.count  ?? 0,
    quotes:   quotesCount.count   ?? 0,
    reviews:  reviewsCount.count  ?? 0,
  }

  const pendingPartners = (pendingPartnersData.data ?? []).map(p => ({
    id: p.id,
    name: p.company_name ?? 'Inconnu',
    siret: p.siret ?? '—',
    type: TYPE_LABEL[p.partner_type as string] || p.partner_type || '—',
    date: new Date(p.created_at).toLocaleDateString('fr-FR'),
    docs: (p.docs as any[])?.length ?? 0,
  }))

  const pendingReviews = (reviewsData.data ?? []).map(r => {
    const c = r.client as any
    const author = c ? `${c.first_name ?? ''} ${(c.last_name ?? '')[0] ?? ''}.`.trim() : 'Client'
    return {
      id: r.id,
      author,
      target: (r.partner as any)?.company_name ?? 'Partenaire',
      rating: r.rating ?? 0,
      text: r.comment ?? '',
    }
  })

  const CLIENT_TYPE_LABELS: Record<string, string> = {
    individual: 'Particulier',
    private_professional: 'Pro privé',
    public_authority: 'Public / collectivité',
  }

  const draftQuotes = (draftQuotesData.data ?? []).map(q => ({
    id: q.id,
    city: q.address_city ?? '—',
    postalCode: q.address_postal_code ?? '—',
    clientType: CLIENT_TYPE_LABELS[q.client_type as string] ?? q.client_type ?? '—',
    services: (q.services as any[])
      ?.map((s: any) => s.service?.label)
      .filter(Boolean)
      .join(', ') || '—',
    created: new Date(q.created_at).toLocaleDateString('fr-FR'),
  }))

  return (
    <AdminDashboard
      stats={stats}
      pendingPartners={pendingPartners}
      pendingReviews={pendingReviews}
      draftQuotes={draftQuotes}
    />
  )
}
