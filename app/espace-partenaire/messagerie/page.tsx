import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MessageriePartenaire from './MessageriePartenaire'

export const dynamic = 'force-dynamic'

export default async function MessageriePartenairePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // 1. Récupérer l'ID partenaire
  const { data: partner } = await supabase
    .from('partners')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!partner) {
    redirect('/')
  }

  // 2. Récupérer les conversations + messages en une seule requête (évite N+1)
  const [assignmentsRes, propertyTypesRes] = await Promise.all([
    supabase
      .from('quote_assignments')
      .select(`
        id, quote_id, status,
        quotes(id, address_city, property_type_id, clients(first_name, last_name)),
        messages(content, created_at, is_read, sender_id)
      `)
      .eq('partner_id', partner.id)
      .in('status', ['accepted', 'quote_sent']),
    supabase.from('ref_property_types').select('id, label'),
  ])

  const assignments = assignmentsRes.data || []
  const propertyTypes = propertyTypesRes.data || []

  // Agréger en JS (plus de requêtes N+1)
  const conversations = assignments.map(a => {
    const quote = a.quotes as any
    const client = quote?.clients
    const propertyType = propertyTypes.find((pt: any) => pt.id === quote?.property_type_id)
    const msgs: any[] = (a.messages || []).sort(
      (x: any, y: any) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
    )
    const lastMsg = msgs[0] || null
    const unreadCount = msgs.filter((m: any) => !m.is_read && m.sender_id !== user.id).length

    return {
      assignment_id: a.id,
      quote_id: a.quote_id,
      client_name: client ? `${client.first_name} ${client.last_name.substring(0, 1)}.` : 'Client',
      title: propertyType?.label || 'Demande',
      city: quote?.address_city || '',
      last_message: lastMsg?.content || null,
      last_message_at: lastMsg?.created_at || null,
      unread_count: unreadCount,
    }
  })

  // Trier par date du dernier message
  conversations.sort((a, b) => {
    const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
    const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
    return dateB - dateA
  })

  return (
    <div className="dashboard-content">
      <MessageriePartenaire initialConversations={conversations} userId={user.id} partnerId={partner.id} />
    </div>
  )
}
