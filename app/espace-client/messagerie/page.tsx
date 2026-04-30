import { createServerSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MessagerieClient from './MessagerieClient'

export const dynamic = 'force-dynamic'

export default async function MessageriePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // 1. Récupérer l'ID client
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    redirect('/')
  }

  // 2. Récupérer les conversations
  // On récupère les assignments liés aux demandes du client
  const { data: assignments } = await supabase
    .from('quote_assignments')
    .select(`
      id,
      quote_id,
      status,
      partner_id,
      partners (
        company_name
      ),
      quotes (
        id,
        address_city,
        property_type_id
      )
    `)
    .eq('quotes.client_id', client.id)
    .in('status', ['accepted', 'quote_sent'])

  // Récupérer les labels des types de biens pour le titre
  const { data: propertyTypes } = await supabase.from('ref_property_types').select('id, label')

  // Enrichir avec les derniers messages et les comptes non lus
  const conversations = await Promise.all((assignments || []).map(async a => {
    const propertyType = propertyTypes?.find(pt => pt.id === (a.quotes as any)?.property_type_id)
    
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
      partner_name: (a.partners as any)?.company_name || 'Partenaire',
      title: propertyType?.label || 'Demande',
      city: (a.quotes as any)?.address_city || '',
      last_message: lastMsg?.content || null,
      last_message_at: lastMsg?.created_at || null,
      unread_count: unreadCount || 0
    }
  }))

  // Trier par date du dernier message (plus récent en haut)
  conversations.sort((a, b) => {
    const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
    const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
    return dateB - dateA
  })

  return (
    <div className="dashboard-content">
      <MessagerieClient initialConversations={conversations} userId={user.id} />
    </div>
  )
}
