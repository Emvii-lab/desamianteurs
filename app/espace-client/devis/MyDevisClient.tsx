'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Search, MapPin, ChevronRight, Star, 
  Building2, Calendar, FileText, Download,
  CheckCircle2, Info
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'

type Devis = any

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  quote_sent: { label: 'Reçu', color: '#059669', bg: '#D1FAE5' },
  accepted:   { label: 'Accepté', color: '#2563EB', bg: '#DBEAFE' },
  pending:    { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
}

export default function MyDevisClient({ initialDevis }: { initialDevis: Devis[] }) {
  const [devisList] = useState(initialDevis)
  const [search, setSearch] = useState('')

  const filteredDevis = useMemo(() => {
    return devisList.filter(d => {
      const partnerName = d.partner?.company_name?.toLowerCase() || ''
      const quoteRef = d.quote?.id?.toLowerCase() || ''
      const city = d.partner?.city?.toLowerCase() || ''
      
      return partnerName.includes(search.toLowerCase()) || 
             quoteRef.includes(search.toLowerCase()) ||
             city.includes(search.toLowerCase())
    })
  }, [devisList, search])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="admin-page-content"
    >
      <motion.div variants={fadeUp} className="admin-page-header">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>Mes devis reçus</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Consultez et comparez les propositions chiffrées envoyées par les professionnels.</p>
        </div>
        <div className="admin-header-actions">
          <StatCard label="Devis reçus" value={devisList.length} />
          <StatCard label="À comparer" value={devisList.filter(d => d.status === 'quote_sent').length} color="var(--red)" />
        </div>
      </motion.div>

      {/* Barre de recherche */}
      <motion.div variants={fadeUp} className="admin-filter-bar">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input 
            type="text" 
            placeholder="Rechercher par professionnel, ville ou n° de demande..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', 
              border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none'
            }}
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} className="admin-table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={thStyle}>Professionnel</th>
              <th style={thStyle}>Demande concernée</th>
              <th style={thStyle}>Date réception</th>
              <th style={thStyle}>Note Pro</th>
              <th style={thStyle}>Statut</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer}>
            {filteredDevis.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
                  <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                  Aucun devis reçu pour le moment.
                </td>
              </tr>
            ) : filteredDevis.map((d) => {
              const status = STATUS_CONFIG[d.status] || STATUS_CONFIG.pending
              const date = d.quote_sent_date ? format(new Date(d.quote_sent_date), 'dd MMMM yyyy', { locale: fr }) : '—'
              const rating = d.partner?.average_rating || 0

              return (
                <motion.tr 
                  key={d.id} 
                  variants={fadeUp}
                  className="table-row"
                  style={{ borderBottom: '1px solid #F3F4F6' }}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: 'var(--red-light)', color: 'var(--red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px'
                      }}>
                        {d.partner?.company_name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{d.partner?.company_name}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} /> {d.partner?.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                      #{d.quote?.id.slice(0, 6)} - {d.quote?.ref_property_types?.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{d.quote?.address_city}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4B5563' }}>
                      <Calendar size={14} style={{ color: '#9CA3AF' }} /> {date}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                      <Star size={14} fill="#FBBF24" color="#FBBF24" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginLeft: '4px' }}>{rating.toFixed(1)}</span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '2px' }}>({d.partner?.review_count})</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px', 
                      padding: '4px 10px', borderRadius: '20px', 
                      background: status.bg, color: status.color, 
                      fontSize: '11px', fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      {status.label}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: '#F9FAFB' }}
                        whileTap={{ scale: 0.98 }}
                        style={{ 
                          background: 'none', border: '1px solid #E5E7EB', padding: '6px 12px', borderRadius: '8px',
                          fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <Download size={14} /> Devis
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: 'var(--red)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{ 
                          background: 'var(--red)', border: 'none', padding: '6px 12px', borderRadius: '8px',
                          fontSize: '12px', fontWeight: 700, color: 'white', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        Détails <ChevronRight size={14} />
                      </motion.button>
                    </div>
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

function StatCard({ label, value, color = '#111827' }: { label: string; value: number | string; color?: string }) {
  return (
    <motion.div 
      variants={fadeUp}
      whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
      style={{ background: 'white', padding: '12px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', textAlign: 'center' }}
    >
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color }}>{value}</div>
    </motion.div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#4B5563',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
  padding: '16px',
  verticalAlign: 'middle',
}
