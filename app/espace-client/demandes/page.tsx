import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MyDemandesClient from './MyDemandesClient'

export const metadata = { title: 'Mes demandes | Désamianteurs.com' }

export default async function MesDemandesPage() {
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

  if (!client) {
    // Si pas de profil client, on redirige (peut-être un admin ou un pro égaré)
    redirect('/')
  }

  // 3. Récupération des demandes du client uniquement
  const { data: quotes } = await supabase
    .from('quotes')
    .select(`
      *,
      ref_property_types (label),
      quote_assignments (count)
    `)
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  return (
    <MyDemandesClient initialQuotes={quotes || []} />
  )
}
