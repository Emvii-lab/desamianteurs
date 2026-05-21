import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MesAvisClient from './MesAvisClient'

export const metadata: Metadata = { title: 'Mes avis | Désamianteurs.com' }

export default async function MesAvisPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: client } = await supabase
    .from('clients').select('id').eq('user_id', user.id).maybeSingle()
  if (!client) redirect('/')

  // Avis existants
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`id, rating, comment, status, created_at, partners(company_name, city), quotes(id, address_city)`)
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  // Professionnels avec qui le client a travaillé (via ses devis)
  const { data: quotes } = await supabase
    .from('quotes')
    .select(`id, address_city, quote_assignments(partner_id, partners(id, company_name, city))`)
    .eq('client_id', client.id)

  // Dédoublonner les partenaires disponibles
  const partnersMap = new Map<string, { id: string; company_name: string; city: string; quote_id: string }>()
  for (const q of quotes || []) {
    for (const a of (q.quote_assignments || []) as any[]) {
      const p = a.partners
      if (p && !partnersMap.has(p.id)) {
        partnersMap.set(p.id, { id: p.id, company_name: p.company_name, city: p.city, quote_id: q.id })
      }
    }
  }

  return (
    <MesAvisClient
      initialReviews={reviews || []}
      clientId={client.id}
      availablePartners={Array.from(partnersMap.values())}
    />
  )
}
