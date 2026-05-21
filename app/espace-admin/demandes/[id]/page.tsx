import { createServerSupabase } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import QuoteDetailClient from './QuoteDetailClient'

export const metadata = { title: 'Détails de la demande | Désamianteurs.com' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const supabase = await createServerSupabase()
  const resolvedParams = await params
  const id = resolvedParams.id

  // 1. Vérification Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: adminCheck } = await supabase.from('admins').select('id').eq('user_id', user.id).maybeSingle()
  if (!adminCheck) redirect('/')

  // 2. Récupération complète de la demande
  const { data: quote } = await supabase
    .from('quotes')
    .select(`
      *,
      ref_property_types (label),
      clients (company_name, email, phone),
      quote_service_types (
        service:ref_service_types (label)
      ),
      quote_assignments (
        id,
        created_at,
        partner:partners (company_name, email, phone)
      )
    `)
    .eq('id', id)
    .single()

  if (!quote) notFound()

  return <QuoteDetailClient quote={quote} />
}
