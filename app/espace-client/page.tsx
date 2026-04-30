import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ClientDashboard from './ClientDashboard'
import { STATUS_STYLE, STATUS_LABEL, AVATAR_COLORS } from '@/lib/constants'

export const metadata = {
  title: 'Mon Espace Client | Désamianteurs.fr',
}

export default async function EspaceClientPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion')
  }

  // User details
  const meta = user.user_metadata ?? {}
  const prenom = meta.prenom || user.email?.split('@')[0] || 'vous'

  // Get client ID
  const { data: clientRow } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  let clientId = clientRow?.id

  if (!clientId) {
    console.log('Client record missing, creating for user:', user.id)
    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        first_name: meta.prenom || '',
        last_name: meta.nom || '',
        email: user.email,
        phone: meta.telephone || ''
      })
      .select('id')
      .single()

    if (createError) {
      console.error('Failed to create client record:', createError)
      return <div>Erreur lors de la création de votre profil client. Veuillez contacter le support.</div>
    }
    clientId = newClient.id
  }

  // Fetch data in parallel
  const [quotesRes, assignRes, statsRes] = await Promise.all([
    // Quotes
    supabase
      .from('quotes')
      .select(`id, address_city, address_street, status, created_at,
               property_type:ref_property_types(label),
               assignments:quote_assignments(id)`)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(5),

    // Recent Devis
    supabase
      .from('quote_assignments')
      .select(`id, quote:quotes!inner(client_id),
               partner:partners(id, company_name, city, average_rating, user_id)`)
      .eq('quote.client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(3),

    // Stats
    (async () => {
      const { data: userQuotes } = await supabase.from('quotes').select('id').eq('client_id', clientId)
      const quoteIds = userQuotes?.map(q => q.id) || []
      
      const [qCount, aCount, mCount, rCount] = await Promise.all([
        supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
        quoteIds.length > 0 
          ? supabase.from('quote_assignments').select('id', { count: 'exact', head: true }).in('quote_id', quoteIds)
          : Promise.resolve({ count: 0 }),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
      ])
      
      return [qCount, aCount, mCount, rCount]
    })()
  ])

  // Map Demandes
  const demandes = (quotesRes.data || []).map(q => {
    const s = q.status ?? 'open'
    const style = STATUS_STYLE[s] ?? STATUS_STYLE.open
    return {
      id: q.id,
      title: (q.property_type as any)?.label ?? 'Demande',
      address: [q.address_street, q.address_city].filter(Boolean).join(', '),
      type: (q.property_type as any)?.label ?? '',
      date: new Date(q.created_at).toLocaleDateString('fr-FR'),
      devis: (q.assignments as any[])?.length ?? 0,
      status: STATUS_LABEL[s] ?? s,
      statusColor: style.bg,
      statusText: style.color,
    }
  })

  // Map Devis
  const devis = (assignRes.data || []).map((a, i) => {
    const p = a.partner as any
    const name = p?.company_name ?? 'Professionnel'
    const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    return {
      id: a.id,
      initials,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      company: name,
      city: p?.city ?? '',
      price: '—',
      rating: p?.average_rating ?? 0,
    }
  })

  // Stats result
  const stats = {
    demandes: statsRes[0].count ?? 0,
    devisCount: statsRes[1].count ?? 0,
    messages: statsRes[2].count ?? 0,
    reviews: statsRes[3].count ?? 0,
  }

  return (
    <ClientDashboard 
      prenom={prenom} 
      demandes={demandes} 
      devis={devis} 
      stats={stats} 
    />
  )
}
