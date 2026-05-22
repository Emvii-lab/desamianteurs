import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ParametresClient from './ParametresClient'

export const metadata = { title: 'Paramètres | Désamianteurs.fr' }

export default async function ParametresPage() {
  const supabase = await createServerSupabase()
  
  // 1. Vérification Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
    
  if (!admin) redirect('/')

  return (
    <ParametresClient initialAdmin={admin} />
  )
}
