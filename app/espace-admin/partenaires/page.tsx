import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PartenairesClient from './PartenairesClient'

export const metadata = { title: 'Comptes partenaires | Désamianteurs.com' }

export default async function PartenairesPage() {
  const supabase = await createServerSupabase()
  
  // 1. Vérification Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: admin } = await supabase.from('admins').select('id').eq('user_id', user.id).maybeSingle()
  if (!admin) redirect('/')

  // 2. Récupération des données
  const [partnersRes, typesRes] = await Promise.all([
    supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('ref_partner_types')
      .select('*')
      .order('sort_order')
  ])

  return (
    <PartenairesClient 
      initialPartners={partnersRes.data || []} 
      partnerTypes={typesRes.data || []} 
    />
  )
}
