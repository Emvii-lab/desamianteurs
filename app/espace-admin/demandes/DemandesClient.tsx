'use client'

import { useState, useMemo } from 'react'
import { 
  Search, MapPin, ChevronRight, Clock,
  CheckCircle2, AlertCircle, FileText, Send,
  User, Mail, Phone, Calendar, ClipboardList
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, tableRowHover } from '@/lib/animations'

type Quote = any

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  draft:       { label: 'Brouillon',  color: '#6B7280', bg: '#F3F4F6', Icon: FileText },
  submitted:   { label: 'Envoyée',    color: '#D97706', bg: '#FEF3C7', Icon: Clock },
  in_progress: { label: 'En cours',   color: '#2563EB', bg: '#DBEAFE', Icon: Send },
  completed:   { label: 'Terminée',   color: '#059669', bg: '#D1FAE5', Icon: CheckCircle2 },
  cancelled:   { label: 'Annulée',    color: 'var(--red)', bg: 'var(--red-light)', Icon: AlertCircle },
  published:   { label: 'Publiée',    color: '#059669', bg: '#D1FAE5', Icon: Send },
}

const TIMELINE_LABELS: Record<string, string> = {
  emergency:       'Urgent',
  within_1_month:  'Sous 1 mois',
  within_3_months: 'Sous 3 mois',
  over_3_months:   '+ 3 mois',
}

export default function DemandesClient({ initialQuotes }: { initialQuotes: Quote[] }) {
  const [quotes, setQuotes] = useState(initialQuotes)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const contactName = `${q.contact_first_name || ''} ${q.contact_last_name || ''}`.toLowerCase()
      const matchesSearch = 
        contactName.includes(search.toLowerCase()) ||
        q.address_city?.toLowerCase().includes(search.toLowerCase()) ||
        q.id.toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = !filterStatus || q.status === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [quotes, search, filterStatus])

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      style={{ padding: '32px' }}
    >
      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>Toutes les demandes</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Suivez l'état d'avancement des demandes de devis.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <StatCard label="Total" value={quotes.length} />
          <StatCard label="En cours" value={quotes.filter(q => q.status === 'in_progress').length} color="#2563EB" />
        </div>
      </motion.div>

      {/* Barre de recherche et filtres */}
      <motion.div variants={fadeUp} style={{ 
        background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', 
        display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input 
            type="text" 
            placeholder="Rechercher par ville, nom ou ID..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', 
              border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none'
            }}
          />
        </div>
        
        <select 
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', background: 'white' }}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([val, conf]) => (
            <option key={val} value={val}>{conf.label}</option>
          ))}
        </select>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={thStyle}>Référence / Bien</th>
              <th style={thStyle}>Localisation</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Détails</th>
              <th style={thStyle}>Pros</th>
              <th style={thStyle}>Statut</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer}>
            {filteredQuotes.map((q) => {
              const status = STATUS_CONFIG[q.status] || STATUS_CONFIG.draft
              const StatusIcon = status.Icon
              const date = q.created_at ? format(new Date(q.created_at), 'dd/MM/yy', { locale: fr }) : '—'
              const prosCount = q.quote_assignments?.[0]?.count || 0

              return (
                <motion.tr 
                  key={q.id} 
                  variants={fadeUp}
                  className="table-row"
                  style={{ borderBottom: '1px solid #F3F4F6' }}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>#{q.id.slice(0, 6)}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{q.ref_property_types?.label || 'Propriété'}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#374151' }}>
                      <MapPin size={12} style={{ color: '#9CA3AF' }} /> {q.address_city}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '16px' }}>{q.address_department}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{q.contact_first_name} {q.contact_last_name}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{q.contact_email}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '12px', color: '#374151' }}>{q.surface_m2} m²</div>
                    <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>{TIMELINE_LABELS[q.timeline] || q.timeline}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      background: prosCount > 0 ? '#F0FDF4' : '#F3F4F6',
                      color: prosCount > 0 ? '#15803D' : '#9CA3AF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, border: '1px solid currentColor'
                    }}>
                      {prosCount}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px', 
                      padding: '4px 10px', borderRadius: '20px', 
                      background: status.bg, color: status.color, 
                      fontSize: '11px', fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      <StatusIcon size={12} />
                      {status.label}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: '#F9FAFB' }}
                      whileTap={{ scale: 0.98 }}
                      style={{ 
                        background: 'none', border: '1px solid #E5E7EB', padding: '6px 12px', borderRadius: '8px',
                        fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s'
                      }}
                    >
                      Détails <ChevronRight size={14} />
                    </motion.button>
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

function StatCard({ label, value, color = '#111827' }: { label: string; value: number; color?: string }) {
  return (
    <motion.div 
      variants={fadeUp}
      whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
      style={{ background: 'white', padding: '12px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}
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
