'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
const supabase = createClient()
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
  partner_name: string
  last_message?: string | null
  last_message_at?: string | null
  unread_count: number
  quote_id: string
  title?: string
  city?: string
}

export default function MessagerieClient({ 
  userId, 
  initialConversations = [] 
}: { 
  userId: string,
  initialConversations?: Conversation[]
}) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConv, setActiveConv] = useState<string | null>(initialConversations[0]?.assignment_id || null)
  const [mobilePanelView, setMobilePanelView] = useState<'list' | 'chat'>('list')
  const [messagesCache, setMessagesCache] = useState<Record<string, Message[]>>({})
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(!initialConversations.length)
  const [clientId, setClientId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeMessages = activeConv ? (messagesCache[activeConv] || []) : []

  useEffect(() => {
    const init = async () => {
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      if (clientData) {
        setClientId(clientData.id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [userId])

  useEffect(() => {
    if (clientId) {
      fetchConversations()

      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const msg = payload.new as Message
            
            setMessagesCache(prev => {
              const currentMessages = prev[msg.assignment_id] || []
              // SÉCURITÉ : On n'ajoute que si le message n'est pas déjà là
              if (currentMessages.some(m => m.id === msg.id)) return prev
              
              return {
                ...prev,
                [msg.assignment_id]: [...currentMessages, msg]
              }
            })

            if (msg.sender_id !== userId) {
              if (activeConv && msg.assignment_id === activeConv) {
                markAsRead(activeConv)
              }
              updateConversationPreview(msg)
            }
          } else if (payload.eventType === 'UPDATE') {
            const msg = payload.new as Message
            if (msg.is_read) {
              fetchConversations()
            }
          }
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [clientId, activeConv])

  useEffect(() => {
    if (activeConv) {
      if (!messagesCache[activeConv]) {
        fetchMessages(activeConv)
      }
      markAsRead(activeConv)
    }
  }, [activeConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages])

  const fetchConversations = async () => {
    if (!clientId) return
    const { data } = await supabase
      .from('quote_assignments')
      .select(`
        id,
        quote_id,
        partner:partners!partner_id(company_name),
        quote:quotes!quote_id(id, client_id),
        messages(content, created_at, is_read, sender_id)
      `)
      .eq('quotes.client_id', clientId)

    if (data) {
      const formatted: Conversation[] = data.map((item: any) => {
        const msgs = item.messages || []
        const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null
        const unread = msgs.filter((m: any) => !m.is_read && m.sender_id !== userId).length

        return {
          assignment_id: item.id,
          partner_name: item.partner?.company_name || 'Partenaire',
          last_message: lastMsg?.content,
          last_message_at: lastMsg?.created_at,
          unread_count: unread,
          quote_id: item.quote_id
        }
      })
      setConversations(formatted)
      if (!activeConv && formatted.length > 0) setActiveConv(formatted[0].assignment_id)
    }
    setLoading(false)
  }

  const updateConversationPreview = (msg: Message) => {
    setConversations(prev => prev.map(c => {
      if (c.assignment_id === msg.assignment_id) {
        return {
          ...c,
          last_message: msg.content,
          last_message_at: msg.created_at,
          unread_count: msg.sender_id !== userId ? c.unread_count + 1 : c.unread_count
        }
      }
      return c
    }))
  }

  const fetchMessages = async (assignmentId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: true })
    if (data) {
      setMessagesCache(prev => ({
        ...prev,
        [assignmentId]: data
      }))
    }
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

    const tempMsg: Message = {
      id: 'temp-' + Math.random().toString(), // On préfixe pour éviter les conflits d'ID réels
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      sender_id: userId,
      assignment_id: activeConv,
      is_read: true
    }

    setMessagesCache(prev => ({
      ...prev,
      [activeConv]: [...(prev[activeConv] || []), tempMsg]
    }))
    
    setNewMessage('')
    updateConversationPreview(tempMsg)

    const { error, data } = await supabase.from('messages').insert({
      assignment_id: activeConv,
      sender_id: userId,
      content: tempMsg.content,
      quote_id: currentConv.quote_id,
      is_read: false
    }).select().single()

    if (error) {
      console.error("Erreur insertion:", error)
      setMessagesCache(prev => ({
        ...prev,
        [activeConv]: (prev[activeConv] || []).filter(m => m.id !== tempMsg.id)
      }))
    } else if (data) {
      setMessagesCache(prev => ({
        ...prev,
        [activeConv]: (prev[activeConv] || []).map(m => m.id === tempMsg.id ? data : m)
      }))
    }
  }

  if (loading) return <div className="p-8">Chargement de la messagerie...</div>

  const currentConv = conversations.find(c => c.assignment_id === activeConv)

  return (
    <div className={`msg-layout ${mobilePanelView === 'chat' ? 'msg-show-chat' : 'msg-show-list'}`}>
      <div className="conv-list">
        <div className="conv-head">
          Messages
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
              <div className={`conv-av ${activeConv === conv.assignment_id ? 'red' : ''}`}>
                {conv.partner_name.substring(0, 2).toUpperCase()}
              </div>
              <div className="conv-meta">
                <div className="conv-name">{conv.partner_name}</div>
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
            <div className="p-8 text-center text-gray-400 text-sm">
              Aucune conversation pour le moment.
            </div>
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
              <div className="conv-av red">
                {currentConv?.partner_name.substring(0, 2).toUpperCase()}
              </div>
              <div className="info">
                <h3>{currentConv?.partner_name}</h3>
                <p>Dossier #{currentConv?.assignment_id.substring(0, 8)}</p>
              </div>
            </div>

            <div className="chat-messages">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`msg-bubble ${msg.sender_id === userId ? 'me' : 'them'}`}>
                  <div className="bubble">
                    {msg.content}
                  </div>
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
