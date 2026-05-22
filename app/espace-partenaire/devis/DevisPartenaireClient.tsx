'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Clock, Search, Info, Zap, CheckCircle2, Send } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { fadeUp, staggerContainer } from '@/lib/animations'

type Assignment = {
  id: string
  wave: number
  status: 'accepted' | 'quote_sent'
  sent_at: string
  contact_date: string | null
  quote_sent_date: string | null
  reactivity_points: number | null
  quotes: {
    id: string
    address_city: string
    address_postal_code: string
    surface_m2: number | null
    timeline: string
    client_type: string
    quote_service_types: Array<{ service: { label: string } }>
  } | Array<{
    id: string
    address_city: string
    address_postal_code: string
    surface_m2: number | null
    timeline: string
    client_type: string
    quote_service_types: Array<{ service: { label: string } }>
  }>
}

const STATUS_CONFIG = {
  accepted:   { label: 'Contacté',     color: '#2563EB', bg: '#DBEAFE', Icon: Clock },
  quote_sent: { label: 'Devis envoyé', color: '#059669', bg: '#D1FAE5', Icon: Send },
}

const TIMELINE_LABELS: Record<string, string> = {
  emergency:       'Urgent',
  within_1_month:  'Sous 1 mois',
  within_3_months: 'Sous 3 mois',
  over_3_months:   'Plus de 3 mois',
}

function getQuote(a: Assignment) {
  return Array.isArray(a.quotes) ? a.quotes[0] : a.quotes
}

function serviceLabels(a: Assignment): string {
  const q = getQuote(a)
  return q?.quote_service_types?.map(x => x.service?.label).filter(Boolean).join(', ') || 'Prestation amiante'
}

export default function DevisPartenaireClient({
  initialAssignments,
  stats,
}: {
  initialAssignments: Assignment[]
  stats: { total: number; accepted: number; quote_sent: number }
}) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(() => {
    return initialAssignments.filter(a => {
      const q = getQuote(a)
      const matchSearch = !search ||
        q?.address_city?.toLowerCase().includes(search.toLowerCase()) ||
        q?.address_postal_code?.includes(search) ||
        serviceLabels(a).toLowerCase().includes(search.toLowerCase())
      const matchStatus = !filterStatus || a.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [initialAssignments, search, filterStatus])

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>

      {/* Header + stats */}
      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--black)', marginBottom: 4 }}>Mes devis envoyés</h1>
          <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>Dossiers pour lesquels vous avez pris contact ou envoyé un devis.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatCard label="Total"        value={stats.total}      />
          <StatCard label="En contact"   value={stats.accepted}   color="#2563EB" />
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
          style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 14, background: 'white', outline: 'none' }}
        >
          <option value="">Tous les statuts</option>
          <option value="accepted">En contact</option>
          <option value="quote_sent">Devis envoyé</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--gray-200)' }}>
              <th style={th}>Dossier</th>
              <th style={th}>Prestation</th>
              <th style={th}>Localisation</th>
              <th style={th}>Contact</th>
              <th style={th}>Devis envoyé</th>
              <th style={th}>Réactivité</th>
              <th style={th}>Statut</th>
              <th style={{ ...th, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer}>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)' }}>
                  <Info size={32} style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }} />
                  Aucun devis envoyé pour l'instant.
                </td>
              </tr>
            ) : filtered.map(a => {
              const q = getQuote(a)
              const cfg = STATUS_CONFIG[a.status]
              const StatusIcon = cfg.Icon

              return (
                <motion.tr
                  key={a.id}
                  variants={fadeUp}
                  style={{ borderBottom: '1px solid var(--gray-100)' }}
                >
                  {/* Dossier */}
                  <td style={td}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>#{a.id.slice(0, 6)}</div>
                    {q?.surface_m2 && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{q.surface_m2} m²</div>}
                    <div style={{ fontSize: 11, color: '#D97706', fontWeight: 600 }}>{TIMELINE_LABELS[q?.timeline ?? ''] ?? q?.timeline}</div>
                  </td>

                  {/* Prestation */}
                  <td style={td}>
                    <div style={{ fontSize: 13 }}>{serviceLabels(a)}</div>
                  </td>

                  {/* Localisation */}
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <MapPin size={12} color="var(--gray-400)" /> {q?.address_city}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginLeft: 16 }}>{q?.address_postal_code}</div>
                  </td>

                  {/* Date contact */}
                  <td style={td}>
                    {a.contact_date
                      ? <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{format(new Date(a.contact_date), 'dd MMM yyyy', { locale: fr })}</div>
                      : <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>—</span>
                    }
                  </td>

                  {/* Date devis */}
                  <td style={td}>
                    {a.quote_sent_date
                      ? <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={12} /> {format(new Date(a.quote_sent_date), 'dd MMM yyyy', { locale: fr })}
                        </div>
                      : <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>—</span>
                    }
                  </td>

                  {/* Réactivité */}
                  <td style={td}>
                    {a.reactivity_points != null
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                          <Zap size={12} color="#D97706" />
                          <span style={{ fontWeight: 600, color: '#D97706' }}>{a.reactivity_points} pts</span>
                        </div>
                      : <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>—</span>
                    }
                  </td>

                  {/* Statut */}
                  <td style={td}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <StatusIcon size={11} /> {cfg.label}
                    </span>
                  </td>

                  {/* Action */}
                  <td style={{ ...td, textAlign: 'right' }}>
                    <Link
                      href="/espace-partenaire/messagerie"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      Messagerie
                    </Link>
                  </td>
                </motion.tr>
              )
            })}
          </motion.tbody>
        </table>
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
