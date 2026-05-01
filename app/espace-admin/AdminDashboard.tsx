'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { staggerContainer, fadeUp } from '@/lib/animations'
import { StatGrid } from '@/components/ui/StatGrid'
import { DashboardCard } from '@/components/ui/DashboardCard'
import { DataTable } from '@/components/ui/DataTable'
import type { AdminStats, PendingPartner, PendingReview, DraftQuote } from '@/lib/types'

interface AdminDashboardProps {
  stats: AdminStats
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

  const activeDraftQuotes = draftQuotes.filter(q => !publishedIds.has(q.id))

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Tableau de bord Admin</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>Supervision de la plateforme Désamianteurs.fr</p>
      </motion.div>

      <StatGrid 
        columns={5}
        stats={[
          { label: 'Clients',             value: stats.users,    sub: 'inscrits' },
          { label: 'Partenaires validés', value: stats.partners, sub: 'actifs' },
          { label: 'En attente',          value: stats.pending,  sub: 'à valider', highlight: stats.pending > 0 },
          { label: 'Demandes',            value: stats.quotes,   sub: 'totales' },
          { label: 'Avis',                value: stats.reviews,  sub: 'à modérer', highlight: stats.reviews > 0 },
        ]}
      />

      <DashboardCard 
        title="Demandes à publier" 
        noPadding 
        style={{ marginBottom: 24 }}
        badge={activeDraftQuotes.length > 0 && (
          <span className="badge badge-red">{activeDraftQuotes.length} en attente</span>
        )}
      >
        <DataTable
          data={draftQuotes}
          getRowKey={(q) => q.id}
          emptyMessage="Aucune demande en attente de publication."
          columns={[
            {
              header: 'Localisation',
              render: (q) => (
                <>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{q.city}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{q.postalCode}</div>
                </>
              )
            },
            { header: 'Type client', render: (q) => q.clientType },
            { header: 'Prestations', render: (q) => q.services, style: { maxWidth: 200 } },
            { header: 'Reçue', render: (q) => q.created },
            {
              header: 'Action',
              render: (q) => {
                const done = publishedIds.has(q.id)
                return done ? (
                  <span className="badge" style={{ background: 'rgba(5,150,105,0.08)', color: '#059669' }}>Publié ✓</span>
                ) : (
                  <button
                    className="btn btn-red btn-sm"
                    disabled={publishing === q.id}
                    onClick={() => publishQuote(q.id)}
                  >
                    {publishing === q.id ? '...' : 'Publier'}
                  </button>
                )
              }
            }
          ]}
        />
      </DashboardCard>

      <DashboardCard 
        title="Comptes PRO en attente de validation" 
        noPadding 
        style={{ marginBottom: 24 }}
        badge={stats.pending > 0 && <span className="badge badge-red">{stats.pending} en attente</span>}
      >
        <DataTable
          data={pendingPartners}
          getRowKey={(p) => p.id}
          emptyMessage="Aucun partenaire en attente de validation."
          columns={[
            {
              header: 'Dénomination',
              render: (p) => (
                <>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>SIRET : {p.siret}</div>
                </>
              )
            },
            { header: 'Type', render: (p) => p.type },
            { header: 'Inscription', render: (p) => p.date },
            {
              header: 'Documents',
              render: (p) => (
                <span className="badge" style={{ 
                  background: p.docs === 0 ? 'rgba(192,57,43,0.05)' : 'var(--gray-100)', 
                  color: p.docs === 0 ? 'var(--red)' : 'var(--gray-600)' 
                }}>
                  {p.docs} doc{p.docs !== 1 ? 's' : ''}
                </span>
              )
            },
            {
              header: 'Action',
              render: () => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-red btn-sm">Valider</button>
                  <button className="btn btn-ghost btn-sm">Refuser</button>
                </div>
              )
            }
          ]}
        />
      </DashboardCard>

      <DashboardCard 
        title="Avis en attente de modération"
        badge={stats.reviews > 0 && <span className="badge badge-orange" style={{ background: '#FFF7ED', color: '#EA580C' }}>{stats.reviews} avis</span>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pendingReviews.length === 0 ? (
            <div style={{ color: 'var(--gray-400)', fontSize: 14 }}>Aucun avis à modérer.</div>
          ) : pendingReviews.map(r => (
            <div 
              key={r.id} 
              className="card"
              style={{ padding: 16, border: '1px solid var(--gray-100)' }}
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
            </div>
          ))}
        </div>
      </DashboardCard>
    </motion.div>
  )
}
