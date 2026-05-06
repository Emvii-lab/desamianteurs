import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { TYPE_LABEL } from '@/lib/constants'
import DocumentsClient from './DocumentsClient'

export const metadata = { title: 'Documents obligatoires | Désamianteurs.fr' }

export default async function DocumentsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: partner } = await supabase
    .from('partners')
    .select('id, partner_type, is_verified')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!partner) redirect('/espace-client')

  const [refDocsRes, uploadedDocsRes] = await Promise.all([
    supabase
      .from('ref_document_types')
      .select('id, code, label, description, is_required, sort_order')
      .eq('partner_type', partner.partner_type)
      .order('sort_order'),
    supabase
      .from('partner_documents')
      .select('id, document_type_id, status, file_name, file_size, uploaded_at, verified_at, expires_at, notes, rejection_reason')
      .eq('partner_id', partner.id),
  ])

  return (
    <div className="dashboard-content">
      <DocumentsClient
        partnerId={partner.id}
        userId={user.id}
        partnerTypeLabel={TYPE_LABEL[partner.partner_type] ?? partner.partner_type}
        isVerified={partner.is_verified}
        refDocs={refDocsRes.data ?? []}
        uploadedDocs={uploadedDocsRes.data ?? []}
      />
    </div>
  )
}
