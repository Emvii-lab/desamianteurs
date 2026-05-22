import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MessagerieClient from './MessagerieClient'

export const dynamic = 'force-dynamic'

export default async function MessageriePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) redirect('/')

  // Récupère les assignments + partenaires + infos devis en une seule requête
  const { data: assignments } = await supabase
    .from('quote_assignments')
    .select(`
      id, quote_id, status, partner_id,
      partners(company_name),
      quotes!inner(id, address_city, property_type_id, client_id)
    `)
    .eq('quotes.client_id', client.id)
    .in('status', ['accepted', 'quote_sent'])

  const [propertyTypesRes, messagesRes] = await Promise.all([
    supabase.from('ref_property_types').select('id, label'),
    // Batch : un seul aller-retour pour tous les messages de toutes les conversations
    supabase
      .from('messages')
      .select('assignment_id, content, created_at, is_read, sender_id')
      .in('assignment_id', (assignments || []).map(a => a.id))
      .order('created_at', { ascending: false }),
  ])

  // Calcul des stats par conversation côté serveur (pas de N+1)
  const msgStats = new Map<string, {
    last_message: string | null
    last_message_at: string | null
    unread_count: number
  }>()

  for (const msg of messagesRes.data || []) {
    if (!msgStats.has(msg.assignment_id)) {
      msgStats.set(msg.assignment_id, {
        last_message: msg.content,
        last_message_at: msg.created_at,
        unread_count: 0,
      })
    }
    if (!msg.is_read && msg.sender_id !== user.id) {
      msgStats.get(msg.assignment_id)!.unread_count++
    }
  }

  const conversations = (assignments || [])
    .map(a => {
      const stats = msgStats.get(a.id) ?? { last_message: null, last_message_at: null, unread_count: 0 }
      const propertyType = propertyTypesRes.data?.find(pt => pt.id === (a.quotes as any)?.property_type_id)
      return {
        assignment_id: a.id,
        quote_id:      a.quote_id,
        partner_name:  (a.partners as any)?.company_name || 'Partenaire',
        title:         propertyType?.label || 'Demande',
        city:          (a.quotes as any)?.address_city || '',
        ...stats,
      }
    })
    .sort((a, b) => {
      const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
      const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
      return tb - ta
    })

  return (
    <div className="dashboard-content">
      <MessagerieClient initialConversations={conversations} userId={user.id} />
    </div>
  )
}
