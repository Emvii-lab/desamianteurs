import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DemandesClient from './DemandesClient'

export const metadata = { title: 'Toutes les demandes | Désamianteurs.fr' }

export default async function DemandesPage() {
  const supabase = await createServerSupabase()
  
  // 1. Vérification Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: adminCheck } = await supabase.from('admins').select('id').eq('user_id', user.id).maybeSingle()
  if (!adminCheck) redirect('/')

  // 2. Récupération des demandes
  const { data: quotes } = await supabase
    .from('quotes')
    .select(`
      *,
      ref_property_types (label),
      quote_assignments (count),
      clients (company_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <DemandesClient initialQuotes={quotes || []} />
  )
}
