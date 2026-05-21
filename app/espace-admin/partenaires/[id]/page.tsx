import { createServerSupabase } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import PartenaireDetailClient from './PartenaireDetailClient'

export const metadata = { title: 'Détail partenaire | Désamianteurs.com' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PartenaireDetailPage({ params }: PageProps) {
  const supabase = await createServerSupabase()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: admin } = await supabase.from('admins').select('id').eq('user_id', user.id).maybeSingle()
  if (!admin) redirect('/')

  const [{ data: partner }, { data: partnerTypes }] = await Promise.all([
    supabase
      .from('partners')
      .select(`
        *,
        partner_documents (
          id, document_type_id, file_url, file_name, status, uploaded_at, expires_at,
          doc_type:ref_document_types (label)
        )
      `)
      .eq('id', id)
      .single(),
    supabase.from('ref_partner_types').select('partner_type, label'),
  ])

  if (!partner) notFound()

  const partnerTypeLabel = partnerTypes?.find(t => t.partner_type === partner.partner_type)?.label ?? partner.partner_type

  return <PartenaireDetailClient partner={partner} partnerTypeLabel={partnerTypeLabel} />
}
