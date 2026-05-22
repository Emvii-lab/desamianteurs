import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AvisClient from './AvisClient'

export const metadata = { title: 'Modération des avis | Désamianteurs.fr' }

export default async function AvisPage() {
  const supabase = await createServerSupabase()
  
  // 1. Vérification Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: adminCheck } = await supabase.from('admins').select('id').eq('user_id', user.id).maybeSingle()
  if (!adminCheck) redirect('/')

  // 2. Récupération des avis avec jointures
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      clients (first_name, last_name, email),
      partners (company_name, partner_type)
    `)
    .order('created_at', { ascending: false })

  return (
    <AvisClient initialReviews={reviews || []} />
  )
}
