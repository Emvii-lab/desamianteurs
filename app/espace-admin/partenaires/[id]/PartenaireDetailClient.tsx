'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, FileText, CheckCircle2, XCircle, Clock, ShieldCheck, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Actif',       color: '#059669', bg: '#D1FAE5' },
  pending:   { label: 'En attente',  color: '#D97706', bg: '#FEF3C7' },
  suspended: { label: 'Suspendu',    color: '#C0392B', bg: 'rgba(192,57,43,0.08)' },
  rejected:  { label: 'Refusé',      color: '#4B5563', bg: '#F3F4F6' },
}

const DOC_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'À vérifier',   color: '#D97706', bg: '#FEF3C7' },
  verified: { label: 'Vérifié',      color: '#059669', bg: '#D1FAE5' },
  rejected: { label: 'Refusé',       color: '#C0392B', bg: 'rgba(192,57,43,0.08)' },
  expired:  { label: 'Expiré',       color: '#6B7280', bg: '#F3F4F6' },
  missing:  { label: 'Manquant',     color: '#9CA3AF', bg: '#F9FAFB' },
}

export default function PartenaireDetailClient({ partner, partnerTypeLabel }: { partner: any; partnerTypeLabel: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [processing, setProcessing] = useState(false)
  const [rejectionModal, setRejectionModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const status = STATUS_CONFIG[partner.status] || STATUS_CONFIG.pending
  const dateStr = partner.created_at ? format(new Date(partner.created_at), 'dd MMMM yyyy', { locale: fr }) : '—'
  const docs = partner.partner_documents || []

  async function handleAction(action: 'verify' | 'reject' | 'suspend', reason?: string) {
    setProcessing(true)
    const res = await fetch('/api/admin/partner', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: partner.id, action, reason }),
    })
    if (res.ok) router.push('/espace-admin/partenaires')
    else setProcessing(false)
  }

  const sectionStyle = {
    background: 'white',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--gray-200)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="admin-page-content"
    >
      {/* Retour */}
      <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
        <Link href="/espace-admin/partenaires" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6B7280', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={16} /> Retour aux partenaires
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={fadeUp} style={{ ...sectionStyle, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} color="var(--gray-500)" />
              </div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A0A0A', margin: 0 }}>{partner.company_name}</h1>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{partnerTypeLabel}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: status.bg, color: status.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.color }} />
                {status.label}
              </span>
              {partner.is_verified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: '#D1FAE5', color: '#059669', fontSize: 11, fontWeight: 700 }}>
                  <ShieldCheck size={11} /> Vérifié
                </span>
              )}
              {partner.validation_fee_paid && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: '#DBEAFE', color: '#2563EB', fontSize: 11, fontWeight: 700 }}>
                  <CreditCard size={11} /> Frais payés
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {partner.status === 'pending' && (
              <>
                <button
                  className="btn btn-red btn-sm"
                  onClick={() => setRejectionModal(true)}
                  disabled={processing}
                  style={{ textTransform: 'none' }}
                >
                  <XCircle size={14} /> Refuser
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleAction('verify')}
                  disabled={processing}
                  style={{ textTransform: 'none', color: '#059669', borderColor: '#059669' }}
                >
                  <CheckCircle2 size={14} /> Valider
                </button>
              </>
            )}
            {partner.status === 'active' && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleAction('suspend')}
                disabled={processing}
                style={{ textTransform: 'none' }}
              >
                Suspendre
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Infos entreprise */}
        <motion.div variants={fadeUp} style={sectionStyle}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 20 }}>Entreprise</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {partner.siret && (
              <div style={{ display: 'flex', gap: 10 }}>
                <FileText size={16} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>SIRET</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{partner.siret}</div>
                </div>
              </div>
            )}
            {(partner.address || partner.city) && (
              <div style={{ display: 'flex', gap: 10 }}>
                <MapPin size={16} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Adresse</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{[partner.address, partner.zip_code, partner.city].filter(Boolean).join(', ')}</div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <Calendar size={16} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Inscrit le</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{dateStr}</div>
              </div>
            </div>
            {partner.subscription && (
              <div style={{ display: 'flex', gap: 10 }}>
                <CreditCard size={16} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Abonnement</div>
                  <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' as const }}>{partner.subscription}</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div variants={fadeUp} style={sectionStyle}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 20 }}>Contact</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(partner.first_name || partner.last_name) && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {(partner.first_name?.[0] || '') + (partner.last_name?.[0] || '')}
                </div>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{partner.first_name} {partner.last_name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Responsable</div>
                </div>
              </div>
            )}
            {partner.email && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Mail size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
                <a href={`mailto:${partner.email}`} style={{ fontSize: 14, color: 'var(--red)', textDecoration: 'none', fontWeight: 500 }}>{partner.email}</a>
              </div>
            )}
            {partner.phone && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Phone size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
                <a href={`tel:${partner.phone}`} style={{ fontSize: 14, color: '#374151', textDecoration: 'none' }}>{partner.phone}</a>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Documents */}
      {docs.length > 0 && (
        <motion.div variants={fadeUp} style={{ ...sectionStyle, marginBottom: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 20 }}>Documents ({docs.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {docs.map((doc: any) => {
              const ds = DOC_STATUS[doc.status] || DOC_STATUS.missing
              return (
                <div key={doc.id} style={{ border: '1px solid var(--gray-200)', borderRadius: 8, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      {doc.doc_type?.label || doc.file_name || doc.document_type_id}
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 99, background: ds.bg, color: ds.color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const }}>
                      {ds.label}
                    </span>
                  </div>
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ textTransform: 'none', padding: '4px 10px', flexShrink: 0 }}>
                      Voir
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Description */}
      {partner.description && (
        <motion.div variants={fadeUp} style={sectionStyle}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 16 }}>Description</h2>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{partner.description}</p>
        </motion.div>
      )}

      {/* Modal refus */}
      {rejectionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', padding: 28, borderRadius: 'var(--radius)', width: '100%', maxWidth: 500 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Refuser le partenaire</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>Indiquez la raison du refus pour <strong>{partner.company_name}</strong>.</p>
            <textarea
              autoFocus
              placeholder="Ex : Attestation d'assurance décennale périmée ou illisible..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              style={{ width: '100%', height: 120, padding: 12, borderRadius: 8, border: '1px solid var(--gray-200)', marginBottom: 20, fontSize: 14, outline: 'none', resize: 'none' as const, fontFamily: 'var(--font-body)' }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setRejectionModal(false)}>Annuler</button>
              <button className="btn btn-red" disabled={!rejectionReason.trim() || processing} onClick={() => handleAction('reject', rejectionReason)}>
                Confirmer le refus
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
