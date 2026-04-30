'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, tableRowHover, cardHover } from '@/lib/animations'

type PendingPartner = { id: string; name: string; siret: string; type: string; date: string; docs: number }
type PendingReview  = { id: string; author: string; target: string; rating: number; text: string }
type DraftQuote     = { id: string; city: string; postalCode: string; services: string; created: string; clientType: string }

interface AdminDashboardProps {
  stats: { users: number; partners: number; pending: number; quotes: number; reviews: number }
  pendingPartners: PendingPartner[]
  pendingReviews: PendingReview[]
  draftQuotes: DraftQuote[]
}

export default function AdminDashboard({ stats, pendingPartners, pendingReviews, draftQuotes }: AdminDashboardProps) {
  const [publishing, setPublishing] = useState<string | null>(null)
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set())

  async function publishQuote(quoteId: string) {
    setPublishing(quoteId)
    const supabase = createClient()
    const { error } = await supabase
      .from('quotes')
      .update({ status: 'published' })
      .eq('id', quoteId)
    if (!error) setPublishedIds(prev => new Set([...prev, quoteId]))
    setPublishing(null)
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, marginBottom: 4 }}>Tableau de bord Admin</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>Supervision de la plateforme Désamianteurs.fr</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Clients',             value: stats.users,    sub: 'inscrits',         highlight: false },
          { label: 'Partenaires validés', value: stats.partners, sub: 'actifs',            highlight: false },
          { label: 'En attente',          value: stats.pending,  sub: 'à valider',         highlight: stats.pending > 0 },
          { label: 'Demandes',            value: stats.quotes,   sub: 'totales',           highlight: false },
          { label: 'Avis',                value: stats.reviews,  sub: 'à modérer',         highlight: stats.reviews > 0 },
        ].map(s => (
          <motion.div 
            key={s.label} 
            variants={fadeUp}
            whileHover={cardHover}
            className="stat-card" 
            style={{ 
              border: s.highlight ? '1.5px solid var(--red)' : '1px solid var(--gray-200)',
              background: 'white',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div className="stat-number" style={{ color: s.highlight ? 'var(--red)' : undefined }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: 11, color: s.highlight ? 'var(--red)' : 'var(--gray-400)', marginTop: 2 }}>{s.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Demandes à publier */}
      <motion.div variants={fadeUp} className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Demandes à publier</span>
          {draftQuotes.filter(q => !publishedIds.has(q.id)).length > 0 && (
            <span className="badge badge-red">{draftQuotes.filter(q => !publishedIds.has(q.id)).length} en attente</span>
          )}
        </div>
        {draftQuotes.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--gray-400)', fontSize: 14 }}>Aucune demande en attente de publication.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  <th style={thStyle}>Localisation</th>
                  <th style={thStyle}>Type client</th>
                  <th style={thStyle}>Prestations</th>
                  <th style={thStyle}>Reçue</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer}>
                {draftQuotes.map(q => {
                  const done = publishedIds.has(q.id)
                  return (
                    <motion.tr 
                      key={q.id} 
                      variants={fadeUp}
                      className="table-row"
                      style={{ 
                        opacity: done ? 0.5 : 1,
                        cursor: 'default',
                        position: 'relative',
                        // On force la suppression de toute transition CSS pour éviter les conflits
                        transition: 'none' 
                      }}
                    >
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{q.city}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{q.postalCode}</div>
                      </td>
                      <td style={tdStyle}>{q.clientType}</td>
                      <td style={{ ...tdStyle, maxWidth: 200 }}>{q.services}</td>
                      <td style={tdStyle}>{q.created}</td>
                      <td style={tdStyle}>
                        {done ? (
                          <span className="badge" style={{ background: 'rgba(5,150,105,0.08)', color: '#059669' }}>Publié ✓</span>
                        ) : (
                          <button
                            className="btn btn-red btn-sm"
                            disabled={publishing === q.id}
                            onClick={() => publishQuote(q.id)}
                          >
                            {publishing === q.id ? '...' : 'Publier'}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Partenaires en attente */}
      <motion.div variants={fadeUp} className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Comptes PRO en attente de validation</span>
          {stats.pending > 0 && <span className="badge badge-red">{stats.pending} en attente</span>}
        </div>
        {pendingPartners.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--gray-400)', fontSize: 14 }}>Aucun partenaire en attente de validation.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  <th style={thStyle}>Dénomination</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Inscription</th>
                  <th style={thStyle}>Documents</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer}>
                {pendingPartners.map(p => (
                  <motion.tr 
                    key={p.id} 
                    variants={fadeUp}
                    className="table-row"
                    style={{ position: 'relative', transition: 'none' }}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>SIRET : {p.siret}</div>
                    </td>
                    <td style={tdStyle}>{p.type}</td>
                    <td style={tdStyle}>{p.date}</td>
                    <td style={tdStyle}>
                      <span className="badge" style={{ background: p.docs === 0 ? 'rgba(192,57,43,0.05)' : 'var(--gray-100)', color: p.docs === 0 ? 'var(--red)' : 'var(--gray-600)' }}>
                        {p.docs} doc{p.docs !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-red btn-sm">Valider</button>
                        <button className="btn btn-ghost btn-sm">Refuser</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Avis à modérer */}
      <motion.div variants={fadeUp} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Avis en attente de modération</span>
          {stats.reviews > 0 && <span className="badge badge-orange" style={{ background: '#FFF7ED', color: '#EA580C' }}>{stats.reviews} avis</span>}
        </div>
        <motion.div variants={staggerContainer} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pendingReviews.length === 0 ? (
            <div style={{ color: 'var(--gray-400)', fontSize: 14 }}>Aucun avis à modérer.</div>
          ) : pendingReviews.map(r => (
            <motion.div 
              key={r.id} 
              variants={fadeUp}
              whileHover={cardHover}
              style={{ border: '1px solid var(--gray-100)', borderRadius: 8, padding: 16, background: 'white' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.author}</span>
                  <span style={{ fontSize: 13, color: 'var(--gray-600)' }}> → {r.target}</span>
                </div>
                <span style={{ color: '#F59E0B', fontSize: 14 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} {r.rating}/5</span>
              </div>
              {r.text && <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 12 }}>"{r.text}"</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-red btn-sm">Approuver</button>
                <button className="btn btn-ghost btn-sm">Rejeter</button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--gray-500)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid var(--gray-100)'
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
  fontSize: '13px',
  color: 'var(--gray-600)',
  borderBottom: '1px solid var(--gray-50)'
}
