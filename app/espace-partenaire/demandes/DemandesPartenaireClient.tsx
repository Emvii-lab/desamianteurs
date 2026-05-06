'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, MapPin, Clock, ChevronRight, Zap, Info, CheckCircle2, Send, MessageSquare } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { fadeUp, staggerContainer } from '@/lib/animations'
import { createClient } from '@/lib/supabase'

type QuoteData = {
  id: string
  address_city: string
  address_postal_code: string
  address_department: string
  surface_m2: number | null
  timeline: string
  description: string | null
  quote_service_types: Array<{ service: { label: string; code: string } }>
}

type Assignment = {
  id: string
  wave: number
  sent_at: string
  contact_date: string | null
  quote_sent_date: string | null
  status: 'pending' | 'accepted' | 'quote_sent' | 'refused' | 'expired'
  is_exception: boolean
  quotes: QuoteData | QuoteData[]
}

const STATUS_CONFIG = {
  pending:    { label: 'À traiter',    color: '#D97706', bg: '#FEF3C7' },
  accepted:   { label: 'Contacté',     color: '#2563EB', bg: '#DBEAFE' },
  quote_sent: { label: 'Devis envoyé', color: '#059669', bg: '#D1FAE5' },
  refused:    { label: 'Refusé',       color: '#6B7280', bg: '#F3F4F6' },
  expired:    { label: 'Expiré',       color: '#9CA3AF', bg: '#F9FAFB' },
}

const TIMELINE_LABELS: Record<string, string> = {
  emergency:       'Urgent',
  within_1_month:  'Sous 1 mois',
  within_3_months: 'Sous 3 mois',
  over_3_months:   'Plus de 3 mois',
}

const WAVE_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Vague 1', color: '#DC2626', bg: '#FEF2F2' },
  2: { label: 'Vague 2', color: '#D97706', bg: '#FFFBEB' },
  3: { label: 'Vague 3', color: '#6B7280', bg: '#F9FAFB' },
}

function timeRemaining(sentAt: string): { text: string; urgent: boolean } {
  const deadline = new Date(sentAt).getTime() + 24 * 60 * 60 * 1000
  const diff = deadline - Date.now()
  if (diff <= 0) return { text: 'Expiré', urgent: false }
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return { text: `${h}h ${m}min`, urgent: h < 6 }
}

function serviceLabels(qs: Assignment['quotes']['quote_service_types']): string {
  return qs.map(x => x.service?.label).filter(Boolean).join(', ') || 'Prestation amiante'
}

export default function DemandesPartenaireClient({
  initialAssignments, stats,
}: {
  initialAssignments: Assignment[]
  stats: { pending: number; accepted: number; quote_sent: number }
}) {
  const router = useRouter()
  const supabase = createClient()
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const q: QuoteData = Array.isArray(a.quotes) ? a.quotes[0] : a.quotes
      const matchSearch = !search ||
        q.address_city?.toLowerCase().includes(search.toLowerCase()) ||
        q.address_postal_code?.includes(search) ||
        serviceLabels(q.quote_service_types).toLowerCase().includes(search.toLowerCase())
      const matchStatus = !filterStatus || a.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [assignments, search, filterStatus])

  const handleContact = async (assignment: Assignment) => {
    if (assignment.status !== 'pending') {
      router.push('/espace-partenaire/messagerie')
      return
    }
    setProcessing(assignment.id)
    await supabase
      .from('quote_assignments')
      .update({ status: 'accepted', contact_date: new Date().toISOString() })
      .eq('id', assignment.id)

    setAssignments(prev => prev.map(a =>
      a.id === assignment.id
        ? { ...a, status: 'accepted', contact_date: new Date().toISOString() }
        : a
    ))
    setProcessing(null)
    router.push('/espace-partenaire/messagerie')
  }

  const handleMarkQuoteSent = async (id: string) => {
    setProcessing(id)
    await supabase
      .from('quote_assignments')
      .update({ status: 'quote_sent', quote_sent_date: new Date().toISOString() })
      .eq('id', id)

    setAssignments(prev => prev.map(a =>
      a.id === id
        ? { ...a, status: 'quote_sent', quote_sent_date: new Date().toISOString() }
        : a
    ))
    setProcessing(null)
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>

      {/* Header + stats */}
      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', marginBottom: 4 }}>Nouvelles demandes</h1>
          <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>Demandes dans votre zone d'intervention. Répondez dans les 24h pour maximiser votre score de réactivité.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatCard label="À traiter"    value={stats.pending}    color="var(--red)" />
          <StatCard label="Contacté"     value={stats.accepted}   color="#2563EB" />
          <StatCard label="Devis envoyé" value={stats.quote_sent} color="#059669" />
        </div>
      </motion.div>

      {/* Filtres */}
      <motion.div variants={fadeUp} style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid var(--gray-200)', display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="text"
            placeholder="Rechercher par ville, code postal ou prestation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 14, outline: 'none' }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 14, outline: 'none', background: 'white' }}
        >
          <option value="">Tous les statuts</option>
          <option value="pending">À traiter</option>
          <option value="accepted">Contacté</option>
          <option value="quote_sent">Devis envoyé</option>
          <option value="expired">Expiré</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--gray-200)' }}>
              <th style={th}>Demande</th>
              <th style={th}>Prestation</th>
              <th style={th}>Vague</th>
              <th style={th}>Localisation</th>
              <th style={th}>Délai</th>
              <th style={th}>Statut</th>
              <th style={{ ...th, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer}>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)' }}>
                  <Info size={32} style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }} />
                  Aucune demande trouvée.
                </td>
              </tr>
            ) : filtered.map(a => {
              const q: QuoteData = Array.isArray(a.quotes) ? a.quotes[0] : a.quotes
              const wave = WAVE_CONFIG[a.wave] ?? WAVE_CONFIG[3]
              const status = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.expired
              const remaining = a.status === 'pending' ? timeRemaining(a.sent_at) : null
              const isLoading = processing === a.id

              return (
                <motion.tr
                  key={a.id}
                  variants={fadeUp}
                  style={{
                    borderBottom: '1px solid var(--gray-100)',
                    borderLeft: `3px solid ${a.wave === 1 ? (a.is_exception ? '#3B5BB5' : '#DC2626') : a.wave === 2 ? '#D97706' : 'transparent'}`,
                  }}
                >
                  {/* Demande */}
                  <td style={td}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--black)', marginBottom: 2 }}>
                      #{a.id.slice(0, 6)}
                    </div>
                    {q.surface_m2 && (
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{q.surface_m2} m²</div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 1 }}>
                      {TIMELINE_LABELS[q.timeline] ?? q.timeline}
                    </div>
                  </td>

                  {/* Prestation */}
                  <td style={td}>
                    <div style={{ fontSize: 13, color: 'var(--black)' }}>{serviceLabels(q.quote_service_types)}</div>
                  </td>

                  {/* Vague */}
                  <td style={td}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: wave.bg, color: wave.color }}>
                      {wave.label}
                    </span>
                    {a.is_exception && (
                      <div style={{ fontSize: 10, color: '#3B5BB5', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Zap size={10} /> Exception réactivité
                      </div>
                    )}
                  </td>

                  {/* Localisation */}
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <MapPin size={12} color="var(--gray-400)" />
                      {q.address_city}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginLeft: 16 }}>{q.address_postal_code}</div>
                  </td>

                  {/* Délai */}
                  <td style={td}>
                    {remaining ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: remaining.urgent ? 'var(--red)' : 'var(--gray-600)' }}>
                        <Clock size={12} /> {remaining.text}
                      </div>
                    ) : a.contact_date ? (
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                        Contacté le {format(new Date(a.contact_date), 'dd/MM', { locale: fr })}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                        {format(new Date(a.sent_at), 'dd/MM/yy', { locale: fr })}
                      </div>
                    )}
                  </td>

                  {/* Statut */}
                  <td style={td}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
                      {(a.status === 'pending' || a.status === 'accepted') && (
                        <button
                          className="btn btn-red btn-sm"
                          disabled={isLoading}
                          onClick={() => handleContact(a)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                        >
                          <MessageSquare size={12} />
                          {a.status === 'pending' ? 'Prendre contact' : 'Messagerie'}
                        </button>
                      )}
                      {a.status === 'accepted' && (
                        <button
                          className="btn btn-outline btn-sm"
                          disabled={isLoading}
                          onClick={() => handleMarkQuoteSent(a.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                        >
                          <CheckCircle2 size={12} />
                          Devis envoyé
                        </button>
                      )}
                      {a.status === 'quote_sent' && (
                        <span style={{ fontSize: 12, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Send size={12} /> Envoyé
                        </span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </motion.tbody>
        </table>
      </motion.div>

      {/* Info réactivité */}
      <motion.div variants={fadeUp} style={{ marginTop: 20, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Info size={16} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: '#1E40AF', margin: 0, lineHeight: 1.6 }}>
          Répondre dans les <strong>premières heures</strong> maximise votre score de réactivité.
          Base 24 pts — chaque heure de délai retire 1 pt. Un refus compte pour 0 pt.
        </p>
      </motion.div>
    </motion.div>
  )
}

function StatCard({ label, value, color = 'var(--black)' }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ background: 'white', padding: '12px 20px', borderRadius: 12, border: '1px solid var(--gray-200)', textAlign: 'center', minWidth: 90 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    </div>
  )
}

const th: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--gray-500)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const td: React.CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
}
