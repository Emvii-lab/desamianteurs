import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import DemandesPartenaireClient from './DemandesPartenaireClient'

export const metadata = { title: 'Nouvelles demandes | Désamianteurs.fr' }

export default async function DemandesPartenairePage() {
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
      id, wave, sent_at, contact_date, quote_sent_date, status, is_exception,
      quotes!inner(
        id, address_city, address_postal_code, address_department,
        surface_m2, timeline, description,
        quote_service_types( service:ref_service_types(label, code) )
      )
    `)
    .eq('partner_id', partner.id)
    .neq('status', 'refused')
    .order('sent_at', { ascending: false })

  const stats = {
    pending:    (assignments ?? []).filter(a => a.status === 'pending').length,
    accepted:   (assignments ?? []).filter(a => a.status === 'accepted').length,
    quote_sent: (assignments ?? []).filter(a => a.status === 'quote_sent').length,
  }

  return (
    <div className="dashboard-content">
      <DemandesPartenaireClient
        initialAssignments={assignments ?? []}
        stats={stats}
      />
    </div>
  )
}
