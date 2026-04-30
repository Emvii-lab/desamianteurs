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

  // 2. Récupérer les conversations
  // On récupère les assignments liés au partenaire
  const { data: assignments } = await supabase
    .from('quote_assignments')
    .select(`
      id,
      quote_id,
      status,
      quotes (
        id,
        address_city,
        property_type_id,
        clients (
          first_name,
          last_name
        )
      )
    `)
    .eq('partner_id', partner.id)
    .in('status', ['accepted', 'quote_sent'])

  // Récupérer les labels des types de biens
  const { data: propertyTypes } = await supabase.from('ref_property_types').select('id, label')

  // Enrichir avec les derniers messages et les comptes non lus
  const conversations = await Promise.all((assignments || []).map(async a => {
    const quote = a.quotes as any
    const client = quote?.clients
    const propertyType = propertyTypes?.find(pt => pt.id === quote?.property_type_id)
    
    const { data: lastMsg } = await supabase
      .from('messages')
      .select('content, created_at, is_read, sender_id')
      .eq('assignment_id', a.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('assignment_id', a.id)
      .eq('is_read', false)
      .neq('sender_id', user.id)

    return {
      assignment_id: a.id,
      quote_id: a.quote_id,
      client_name: client ? `${client.first_name} ${client.last_name.substring(0, 1)}.` : 'Client',
      title: propertyType?.label || 'Demande',
      city: quote?.address_city || '',
      last_message: lastMsg?.content || null,
      last_message_at: lastMsg?.created_at || null,
      unread_count: unreadCount || 0
    }
  }))

  // Trier par date du dernier message
  conversations.sort((a, b) => {
    const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
    const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
    return dateB - dateA
  })

  return (
    <div className="dashboard-content">
      <MessageriePartenaire initialConversations={conversations} userId={user.id} />
    </div>
  )
}
