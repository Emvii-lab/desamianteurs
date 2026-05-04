'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { staggerContainer, fadeUp } from '@/lib/animations'
import { StatGrid } from '@/components/ui/StatGrid'
import { DashboardCard } from '@/components/ui/DashboardCard'
import { DataTable } from '@/components/ui/DataTable'
import type { AdminStats, PendingPartner, PendingReview, DraftQuote, PartnerDoc } from '@/lib/types'

interface AdminDashboardProps {
  stats: AdminStats
  pendingPartners: PendingPartner[]
  pendingReviews: PendingReview[]
  draftQuotes: DraftQuote[]
}

export default function AdminDashboard({ stats, pendingPartners, pendingReviews, draftQuotes }: AdminDashboardProps) {
  const [publishing, setPublishing] = useState<string | null>(null)
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set())
  const [handledPartnerIds, setHandledPartnerIds] = useState<Set<string>>(new Set())
  const [handledReviewIds, setHandledReviewIds] = useState<Set<string>>(new Set())
  const [rejectionModal, setRejectionModal] = useState<{ id: string; name: string; type: 'partner' | 'review' } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  const supabase = createClient()

  async function publishQuote(quoteId: string) {
    setPublishing(quoteId)
    const { error } = await supabase
      .from('quotes')
      .update({ status: 'published' })
      .eq('id', quoteId)
    if (!error) setPublishedIds(prev => new Set([...prev, quoteId]))
    setPublishing(null)
  }

  async function handlePartnerAction(id: string, action: 'verify' | 'reject', reason?: string) {
    setProcessing(id)
    const update = action === 'verify' 
      ? { is_verified: true, status: 'active', rejection_reason: null }
      : { is_verified: false, status: 'rejected', rejection_reason: reason }

    const { error } = await supabase
      .from('partners')
      .update(update)
      .eq('id', id)

    if (!error) {
      setHandledPartnerIds(prev => new Set([...prev, id]))
      setRejectionModal(null)
      setRejectionReason('')
    }
    setProcessing(null)
  }

  async function handleReviewAction(id: string, action: 'published' | 'rejected', reason?: string) {
    setProcessing(id)
    const { error } = await supabase
      .from('reviews')
      .update({ status: action, rejection_reason: reason })
      .eq('id', id)

    if (!error) {
      setHandledReviewIds(prev => new Set([...prev, id]))
      setRejectionModal(null)
      setRejectionReason('')
    }
    setProcessing(null)
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
          { label: 'Clients', value: stats.users, sub: 'inscrits' },
          { label: 'Partenaires validés', value: stats.partners, sub: 'actifs' },
          { label: 'Partenaires en attente', value: stats.pending, sub: 'à valider', highlight: stats.pending > 0 },
          { label: 'Demandes', value: stats.quotes, sub: 'totales' },
          { label: 'Avis', value: stats.reviews, sub: 'à modérer', highlight: stats.reviews > 0 },
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
        title="Comptes partenaires en attente de validation"
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
                <div style={{ display: 'flex', gap: 6 }}>
                  {p.docs.map((doc: PartnerDoc) => {
                    const statusColors: Record<string, { bg: string, color: string, border: string }> = {
                      missing: { bg: 'transparent', color: 'var(--gray-400)', border: '1px dashed var(--gray-300)' },
                      pending: { bg: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' },
                      verified: { bg: '#D1FAE5', color: '#059669', border: '1px solid #A7F3D0' },
                      rejected: { bg: 'var(--red-light)', color: 'var(--red)', border: '1px solid #FECACA' },
                      expired: { bg: 'var(--gray-100)', color: 'var(--gray-600)', border: '1px solid var(--gray-200)' },
                    }
                    const getInitials = (code: string) => {
                      if (code.startsWith('rc_pro')) return 'RC'
                      if (code.startsWith('kbis')) return 'KB'
                      if (code.startsWith('duerp')) return 'DU'
                      if (code.startsWith('organigramme')) return 'OR'
                      if (code.startsWith('moyens_humains')) return 'MH'
                      if (code.startsWith('moyens_materiels')) return 'MM'
                      if (code === 'qualibat_1552') return '15'
                      if (code === 'certif_individuelle') return 'CI'
                      if (code === 'cofrac_accreditation') return 'CO'
                      if (code === 'ss4_attestation') return 'S4'
                      if (code === 'opqibi_opqtec_moe') return 'OP'
                      return code.substring(0, 2).toUpperCase()
                    }

                    const initials = getInitials(doc.code)
                    const style = statusColors[doc.status] || statusColors.missing

                    return (
                      <div 
                        key={doc.code}
                        title={`${doc.label} : ${doc.status}`}
                        style={{ 
                          width: 28, height: 28, borderRadius: 6, 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700,
                          ...style
                        }}
                      >
                        {initials}
                      </div>
                    )
                  })}
                </div>
              )
            },
            {
              header: 'Action',
              render: (p) => {
                const isHandled = handledPartnerIds.has(p.id)
                if (isHandled) return <span className="badge badge-success">Traité ✓</span>

                return (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="btn btn-red btn-sm"
                      disabled={processing === p.id}
                      onClick={() => handlePartnerAction(p.id, 'verify')}
                    >
                      {processing === p.id ? '...' : 'Valider'}
                    </button>
                    <button 
                      className="btn btn-outline btn-sm"
                      disabled={processing === p.id}
                      onClick={() => setRejectionModal({ id: p.id, name: p.name, type: 'partner' })}
                    >
                      Refuser
                    </button>
                  </div>
                )
              }
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
                {handledReviewIds.has(r.id) ? (
                  <span className="badge badge-success">Modéré ✓</span>
                ) : (
                  <>
                    <button 
                      className="btn btn-red btn-sm"
                      disabled={processing === r.id}
                      onClick={() => handleReviewAction(r.id, 'published')}
                    >
                      {processing === r.id ? '...' : 'Approuver'}
                    </button>
                    <button 
                      className="btn btn-outline btn-sm"
                      disabled={processing === r.id}
                      onClick={() => setRejectionModal({ id: r.id, name: `l'avis de ${r.author}`, type: 'review' })}
                    >
                      Rejeter
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Modal de Refus */}
      {rejectionModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ background: 'white', padding: 32, borderRadius: 16, width: '100%', maxWidth: 500 }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {rejectionModal.type === 'partner' ? 'Refuser le partenaire' : 'Rejeter l\'avis'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 20 }}>
              Veuillez indiquer la raison du rejet pour <strong>{rejectionModal.name}</strong>.
            </p>
            
            <textarea
              autoFocus
              placeholder={rejectionModal.type === 'partner' 
                ? "Ex: Votre attestation d'assurance décennale est périmée ou illisible..." 
                : "Ex: Contenu inapproprié, langage offensant ou avis hors sujet..."}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{ 
                width: '100%', height: 120, padding: 12, borderRadius: 8, 
                border: '1px solid var(--gray-200)', marginBottom: 20, 
                fontSize: 14, outline: 'none', resize: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-outline"
                onClick={() => setRejectionModal(null)}
              >
                Annuler
              </button>
              <button 
                className="btn btn-red"
                disabled={!rejectionReason.trim() || processing !== null}
                onClick={() => {
                  if (rejectionModal.type === 'partner') {
                    handlePartnerAction(rejectionModal.id, 'reject', rejectionReason)
                  } else {
                    handleReviewAction(rejectionModal.id, 'rejected', rejectionReason)
                  }
                }}
              >
                Confirmer le rejet
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
