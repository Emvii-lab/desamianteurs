import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PrestationsClient from './PrestationsClient'

export const metadata = { title: 'Types de prestation | Désamianteurs.com' }

export default async function PrestationsPage() {
  const supabase = await createServerSupabase()
  
  // 1. Vérification Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: adminCheck } = await supabase.from('admins').select('id').eq('user_id', user.id).maybeSingle()
  if (!adminCheck) redirect('/')

  // 2. Récupération des données de référence
  const [servicesRes, domainsRes] = await Promise.all([
    supabase
      .from('ref_service_types')
      .select('*')
      .order('sort_order'),
    supabase
      .from('ref_domains')
      .select('*')
      .order('partner_type, sort_order')
  ])

  return (
    <PrestationsClient 
      services={servicesRes.data || []} 
      domains={domainsRes.data || []} 
    />
  )
}
