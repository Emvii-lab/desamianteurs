'use client'

import { useState } from 'react'
import { 
  Star, Check, X,
  User, Building2, Calendar, MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, cardHover } from '@/lib/animations'

type Review = any

type Props = {
  initialReviews: Review[]
}

export default function AvisClient({ initialReviews }: Props) {
  const [reviews, setReviews] = useState(initialReviews)
  const [filter, setFilter] = useState('pending')
  const supabase = createClient()

  const filteredReviews = reviews.filter(r => filter === 'all' || r.status === filter)

  const handleAction = async (id: string, status: 'published' | 'rejected') => {
    const { error } = await supabase.from('reviews').update({ status }).eq('id', id)
    if (!error) {
      setReviews(reviews.map(r => r.id === id ? { ...r, status } : r))
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      style={{ padding: '32px' }}
    >
      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>Modération des avis</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Approuvez ou rejetez les avis laissés par les clients.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
          {['all', 'pending', 'published', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: filter === f ? 'white' : 'transparent',
                color: filter === f ? '#111827' : '#6B7280',
                boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {f === 'pending' ? 'À modérer' : f === 'published' ? 'Publiés' : f === 'rejected' ? 'Refusés' : 'Tous'}
              {f === 'pending' && reviews.filter(r => r.status === 'pending').length > 0 && (
                <span style={{ marginLeft: '6px', background: 'var(--red)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '10px' }}>
                  {reviews.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {filteredReviews.map((r) => (
          <motion.div key={r.id} variants={fadeUp} whileHover={cardHover}>
            <ReviewCard review={r} onAction={handleAction} />
          </motion.div>
        ))}
      </motion.div>

      {filteredReviews.length === 0 && (
        <motion.div variants={fadeUp} style={{ padding: '64px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px dashed #E5E7EB' }}>
          <MessageSquare size={48} style={{ margin: '0 auto 16px', color: '#E5E7EB' }} />
          <p style={{ color: '#6B7280' }}>Aucun avis à afficher pour ce filtre.</p>
        </motion.div>
      )}
    </motion.div>
  )
}

function ReviewCard({ review, onAction }: { review: any; onAction: any }) {
  const date = format(new Date(review.created_at), 'dd MMMM yyyy', { locale: fr })
  
  return (
    <div style={{ 
      background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', 
      padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative', height: '100%'
    }}>
      {/* Header: Rating & Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={18} 
                fill={star <= review.rating ? '#FBBF24' : 'none'} 
                color={star <= review.rating ? '#FBBF24' : '#E5E7EB'} 
              />
            ))}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{review.rating}/5</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {review.status !== 'pending' && (
            <div style={{ 
              padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800,
              textTransform: 'uppercase', 
              background: review.status === 'published' ? '#D1FAE5' : 'var(--red-light)',
              color: review.status === 'published' ? '#059669' : 'var(--red)'
            }}>
              {review.status === 'published' ? 'Publié' : 'Refusé'}
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} /> {date}
          </div>
        </div>
      </div>

      {/* Comment */}
      <div style={{ 
        fontSize: '15px', color: '#374151', lineHeight: '1.6', flex: 1,
        fontStyle: review.comment ? 'normal' : 'italic'
      }}>
        {review.comment ? `"${review.comment}"` : "Aucun commentaire laissé."}
      </div>

      {/* Relations: Client & Partner */}
      <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px' }}>Client</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={14} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
              {review.clients?.first_name} {review.clients?.last_name?.[0]}.
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px' }}>Partenaire</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#F0FDF4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={14} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {review.partners?.company_name}
            </div>
          </div>
        </div>
      </div>

      {/* Actions (only for pending) */}
      {review.status === 'pending' && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button 
            onClick={() => onAction(review.id, 'published')}
            className="btn btn-red"
            style={{ 
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '14px'
            }}
          >
            <Check size={18} /> Approuver
          </button>
          <button 
            onClick={() => onAction(review.id, 'rejected')}
            className="btn btn-outline"
            style={{ 
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '14px'
            }}
          >
            <X size={18} /> Rejeter
          </button>
        </div>
      )}
    </div>
  )
}
