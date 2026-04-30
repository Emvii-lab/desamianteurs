import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import CompleterClient from './CompleterClient'

export const metadata = { title: 'Compléter votre profil | Désamianteurs.fr' }

export default async function CompleterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  // Sécurité : si un profil existe déjà, rediriger
  const [{ data: partner }, { data: client }, { data: admin }] = await Promise.all([
    supabase.from('partners').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('clients').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('admins').select('id').eq('user_id', user.id).maybeSingle(),
  ])
  if (admin)   redirect('/espace-admin')
  if (partner) redirect('/espace-partenaire')
  if (client)  redirect('/espace-client')

  const params = await searchParams
  const type = params.type === 'partenaire' ? 'partenaire' : 'client'

  const [regionsRes, depsRes, docTypesRes, domainsRes] = await Promise.all([
    supabase.from('ref_regions').select('id, code, name').order('name'),
    supabase.from('ref_departments').select('id, code, name').order('name'),
    supabase.from('ref_document_types').select('id, label, partner_type, is_required').order('label'),
    supabase.from('ref_domains').select('id, label, category, partner_type').order('label'),
  ])

  return (
    <CompleterClient
      initialType={type}
      googleName={user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''}
      googleEmail={user.email ?? ''}
      initialRegions={regionsRes.data ?? []}
      initialDepartments={depsRes.data ?? []}
      initialDocTypes={docTypesRes.data ?? []}
      initialDomains={domainsRes.data ?? []}
    />
  )
}
