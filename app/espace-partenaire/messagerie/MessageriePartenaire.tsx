'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  assignment_id: string
  is_read: boolean
}

interface Conversation {
  assignment_id: string
  client_name: string
  last_message?: string | null
  last_message_at?: string | null
  unread_count: number
  quote_id: string
  title?: string
  city?: string
}

export default function MessageriePartenaire({
  userId,
  partnerId,
  initialConversations = []
}: {
  userId: string,
  partnerId: string,
  initialConversations?: Conversation[]
}) {
  const supabase = createClient()

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConv, setActiveConv] = useState<string | null>(initialConversations[0]?.assignment_id || null)
  const [mobilePanelView, setMobilePanelView] = useState<'list' | 'chat'>('list')
  const [messagesCache, setMessagesCache] = useState<Record<string, Message[]>>({})
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(!initialConversations.length)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeMessages = activeConv ? (messagesCache[activeConv] || []) : []

  useEffect(() => {
    fetchConversations()

    // Filtre le channel sur les seuls assignments du partenaire
    const assignmentIds = initialConversations.map(c => c.assignment_id)
    const filter = assignmentIds.length === 1
      ? `assignment_id=eq.${assignmentIds[0]}`
      : assignmentIds.length > 1
        ? `assignment_id=in.(${assignmentIds.join(',')})`
        : undefined

    const channelOpts = filter
      ? { event: '*' as const, schema: 'public', table: 'messages', filter }
      : { event: '*' as const, schema: 'public', table: 'messages' }

    const channel = supabase
      .channel(`partner-messages-${userId}`)
      .on('postgres_changes', channelOpts, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const msg = payload.new as Message

          setMessagesCache(prev => {
            const current = prev[msg.assignment_id] || []
            if (current.some(m => m.id === msg.id)) return prev
            return { ...prev, [msg.assignment_id]: [...current, msg] }
          })

          if (msg.sender_id !== userId) {
            if (activeConv && msg.assignment_id === activeConv) {
              markAsRead(activeConv)
            }
            updateConversationPreview(msg)
          }
        } else if (payload.eventType === 'UPDATE') {
          const msg = payload.new as Message
          if (msg.is_read) fetchConversations()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeConv, userId])

  useEffect(() => {
    if (activeConv) {
      if (!messagesCache[activeConv]) fetchMessages(activeConv)
      markAsRead(activeConv)
    }
  }, [activeConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages])

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from('quote_assignments')
      .select(`
        id, quote_id,
        quote:quotes!quote_id(id, client_id),
        messages(content, created_at, is_read, sender_id)
      `)
      .eq('partner_id', partnerId)

    if (error) console.error('fetchConversations:', error.message)

    if (data) {
      const formatted: Conversation[] = data.map((item: any) => {
        const msgs = item.messages || []
        const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null
        const unread = msgs.filter((m: any) => !m.is_read && m.sender_id !== userId).length
        return {
          assignment_id: item.id,
          client_name: 'Client #' + (item.quote?.client_id?.substring(0, 5) || '?'),
          last_message: lastMsg?.content,
          last_message_at: lastMsg?.created_at,
          unread_count: unread,
          quote_id: item.quote_id,
        }
      })
      setConversations(formatted)
      if (!activeConv && formatted.length > 0) setActiveConv(formatted[0].assignment_id)
    }
    setLoading(false)
  }

  const updateConversationPreview = (msg: Message) => {
    setConversations(prev => prev.map(c =>
      c.assignment_id === msg.assignment_id
        ? { ...c, last_message: msg.content, last_message_at: msg.created_at, unread_count: msg.sender_id !== userId ? c.unread_count + 1 : c.unread_count }
        : c
    ))
  }

  const fetchMessages = async (assignmentId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('id, content, created_at, sender_id, assignment_id, is_read')
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: true })
    if (data) setMessagesCache(prev => ({ ...prev, [assignmentId]: data }))
  }

  const markAsRead = async (assignmentId: string) => {
    setConversations(prev => prev.map(c =>
      c.assignment_id === assignmentId ? { ...c, unread_count: 0 } : c
    ))
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('assignment_id', assignmentId)
      .eq('is_read', false)
      .neq('sender_id', userId)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConv) return

    const currentConv = conversations.find(c => c.assignment_id === activeConv)
    if (!currentConv?.quote_id) return

    const tempId = `temp-${Date.now()}`
    const tempMsg: Message = {
      id: tempId,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      sender_id: userId,
      assignment_id: activeConv,
      is_read: true,
    }

    setMessagesCache(prev => ({ ...prev, [activeConv]: [...(prev[activeConv] || []), tempMsg] }))
    setNewMessage('')
    updateConversationPreview(tempMsg)

    const { error, data } = await supabase
      .from('messages')
      .insert({
        assignment_id: activeConv,
        sender_id: userId,
        content: tempMsg.content,
        quote_id: currentConv.quote_id,
        is_read: false,
      })
      .select()
      .single()

    if (!error && data) {
      setMessagesCache(prev => ({
        ...prev,
        [activeConv]: (prev[activeConv] || []).map(m => m.id === tempId ? data : m),
      }))
    }
  }

  if (loading) return <div className="p-8">Chargement...</div>

  const currentConv = conversations.find(c => c.assignment_id === activeConv)

  return (
    <div className={`msg-layout ${mobilePanelView === 'chat' ? 'msg-show-chat' : 'msg-show-list'}`}>
      <div className="conv-list">
        <div className="conv-head">
          Messages Clients
          {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0) > 0 && (
            <span className="unread-dot" />
          )}
        </div>
        <div className="conv-items">
          {conversations.map((conv) => (
            <div
              key={conv.assignment_id}
              className={`conv-item ${activeConv === conv.assignment_id ? 'active' : ''}`}
              onClick={() => { setActiveConv(conv.assignment_id); setMobilePanelView('chat') }}
            >
              <div className={`conv-av ${activeConv === conv.assignment_id ? 'red' : ''}`}>CL</div>
              <div className="conv-meta">
                <div className="conv-name">{conv.client_name}</div>
                <div className="conv-preview">
                  {conv.last_message || 'Dossier #' + conv.assignment_id.substring(0, 8)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {conv.last_message_at && (
                  <div className="conv-time">
                    {format(new Date(conv.last_message_at), 'HH:mm', { locale: fr })}
                  </div>
                )}
                {conv.unread_count > 0 && <div className="unread-dot" />}
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">Aucun message client.</div>
          )}
        </div>
      </div>

      <div className="chat-area">
        {activeConv ? (
          <>
            <div className="chat-header">
              <button className="msg-back-btn" onClick={() => setMobilePanelView('list')} aria-label="Retour">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div className="conv-av red">CL</div>
              <div className="info">
                <h3>{currentConv?.client_name}</h3>
                <p>Dossier #{currentConv?.assignment_id.substring(0, 8)}</p>
              </div>
            </div>

            <div className="chat-messages">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`msg-bubble ${msg.sender_id === userId ? 'me' : 'them'}`}>
                  <div className="bubble">{msg.content}</div>
                  <span className="time">
                    {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-wrap" onSubmit={sendMessage}>
              <input
                type="text"
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-red btn-sm">
                Envoyer
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>
    </div>
  )
}
