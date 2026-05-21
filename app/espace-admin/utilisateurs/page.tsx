import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import UtilisateursClient from './UtilisateursClient'

export const metadata = { title: 'Tous les utilisateurs | Désamianteurs.com' }

export default async function UtilisateursPage() {
  const supabase = await createServerSupabase()
  
  // 1. Vérification Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: adminCheck } = await supabase.from('admins').select('id').eq('user_id', user.id).maybeSingle()
  if (!adminCheck) redirect('/')

  // 2. Récupération des données multi-tables
  const [clientsRes, partnersRes, adminsRes] = await Promise.all([
    supabase.from('clients').select('id, user_id, first_name, last_name, email, phone, created_at, company_name'),
    supabase.from('partners').select('id, user_id, first_name, last_name, email, phone, created_at, company_name, partner_type'),
    supabase.from('admins').select('id, user_id, first_name, last_name, email, created_at')
  ])

  // 3. Agrégation
  const allUsers = [
    ...(clientsRes.data || []).map(u => ({ ...u, role: 'client' })),
    ...(partnersRes.data || []).map(u => ({ ...u, role: 'partenaire' })),
    ...(adminsRes.data || []).map(u => ({ ...u, role: 'admin' })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <UtilisateursClient initialUsers={allUsers} />
  )
}
