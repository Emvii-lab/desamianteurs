'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Star, Send, MessageSquare } from 'lucide-react'
import { FormMessage } from '@/components/ui/FormMessage'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'

type Review = any

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'En attente de modération', color: '#D97706', bg: '#FEF3C7' },
  published: { label: 'Publié',                   color: '#059669', bg: '#D1FAE5' },
  rejected:  { label: 'Refusé',                   color: '#DC2626', bg: '#FEE2E2' },
}

function StarRating({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{ background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default', padding: 2 }}
        >
          <Star
            size={24}
            fill={(hovered || value) >= n ? '#F59E0B' : 'none'}
            color={(hovered || value) >= n ? '#F59E0B' : '#D1D5DB'}
          />
        </button>
      ))}
    </div>
  )
}

type AvailablePartner = { id: string; company_name: string; city: string; quote_id: string }

export default function MesAvisClient({ initialReviews, clientId, availablePartners = [] }: {
  initialReviews: Review[]
  clientId: string
  availablePartners?: AvailablePartner[]
}) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [partnerId, setPartnerId] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const selectedPartner = availablePartners.find(p => p.id === partnerId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerId) { setMessage({ type: 'error', text: 'Veuillez sélectionner un professionnel.' }); return }
    if (rating === 0) { setMessage({ type: 'error', text: 'Veuillez sélectionner une note.' }); return }
    setSaving(true)
    setMessage(null)

    const { data, error } = await supabase
      .from('reviews')
      .insert({ client_id: clientId, partner_id: partnerId, quote_id: selectedPartner?.quote_id, rating, comment, status: 'pending' })
      .select(`id, rating, comment, status, created_at, partners(company_name, city), quotes(id, address_city)`)
      .single()

    if (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi. Veuillez réessayer.' })
    } else {
      setReviews(prev => [data, ...prev])
      setShowForm(false)
      setPartnerId('')
      setRating(0)
      setComment('')
      setMessage({ type: 'success', text: 'Votre avis a été soumis et sera publié après modération.' })
    }
    setSaving(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mes avis</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Les avis que vous avez laissés aux professionnels.</p>
        </div>
        <button className="btn btn-red" onClick={() => setShowForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageSquare size={16} /> {showForm ? 'Annuler' : 'Laisser un avis'}
        </button>
      </div>

      {message && <FormMessage type={message.type} text={message.text} />}

      {/* Formulaire */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 24 }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Nouvel avis</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Professionnel *</label>
              {availablePartners.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Aucun professionnel disponible. Vous pourrez laisser un avis après votre première mission.</p>
              ) : (
                <select
                  value={partnerId}
                  onChange={e => setPartnerId(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', background: 'white' }}
                >
                  <option value="">Sélectionner un professionnel</option>
                  {availablePartners.map(p => (
                    <option key={p.id} value={p.id}>{p.company_name}{p.city ? ` — ${p.city}` : ''}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Note *</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Commentaire</label>
              <textarea
                rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Décrivez votre expérience avec ce professionnel..."
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" disabled={saving} className="btn btn-red" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <Send size={15} /> {saving ? 'Envoi...' : 'Soumettre l\'avis'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
          <Star size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Aucun avis pour l&apos;instant</p>
          <p style={{ fontSize: 14, margin: 0 }}>Vos avis apparaîtront ici après chaque mission.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map((r: any) => {
            const st = STATUS_LABEL[r.status] || STATUS_LABEL.pending
            const date = r.created_at ? format(new Date(r.created_at), 'dd MMMM yyyy', { locale: fr }) : '—'
            return (
              <div key={r.id} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                      {r.partners?.company_name || 'Professionnel'}
                    </div>
                    {r.partners?.city && (
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{r.partners.city}</div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>
                <StarRating value={r.rating} />
                {r.comment && (
                  <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, margin: '12px 0 0' }}>
                    &ldquo;{r.comment}&rdquo;
                  </p>
                )}
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 12 }}>{date}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
