import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MyDevisClient from './MyDevisClient'

export const metadata = { title: 'Mes devis reçus | Désamianteurs.com' }

export default async function MesDevisPage() {
  const supabase = await createServerSupabase()
  
  // 1. Authentification
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  // 2. Récupération du profil client
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!client) redirect('/')

  // 3. Récupération des devis (quote_assignments)
  // On récupère les assignations liées aux demandes du client
  const { data: devis } = await supabase
    .from('quote_assignments')
    .select(`
      *,
      partner:partners (
        id, company_name, city, average_rating, review_count
      ),
      quote:quotes!inner (
        id, address_city, client_id,
        ref_property_types (label)
      )
    `)
    .eq('quote.client_id', client.id)
    .neq('status', 'pending') // On ne montre pas les dossiers en recherche de pro si besoin
    .order('created_at', { ascending: false })

  return (
    <MyDevisClient initialDevis={devis || []} />
  )
}
