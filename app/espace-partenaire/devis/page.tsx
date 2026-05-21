import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import DevisPartenaireClient from './DevisPartenaireClient'

export const metadata = { title: 'Mes devis envoyés | Désamianteurs.com' }

export default async function DevisPartenairePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: partner } = await supabase
    .from('partners')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!partner) redirect('/espace-client')

  const { data: assignments } = await supabase
    .from('quote_assignments')
    .select(`
      id, wave, status, sent_at, contact_date, quote_sent_date, reactivity_points,
      quotes!inner(
        id, address_city, address_postal_code, surface_m2, timeline, client_type,
        quote_service_types( service:ref_service_types(label) )
      )
    `)
    .eq('partner_id', partner.id)
    .in('status', ['accepted', 'quote_sent'])
    .order('sent_at', { ascending: false })

  const stats = {
    total:      (assignments ?? []).length,
    accepted:   (assignments ?? []).filter(a => a.status === 'accepted').length,
    quote_sent: (assignments ?? []).filter(a => a.status === 'quote_sent').length,
  }

  return (
    <div className="dashboard-content">
      <DevisPartenaireClient
        initialAssignments={(assignments ?? []) as any}
        stats={stats}
      />
    </div>
  )
}
