'use client'

import { useState, useMemo } from 'react'
import { 
  Search, CheckCircle2, AlertCircle, 
  MoreVertical, Mail, Phone, MapPin, Building2,
  Briefcase, Calendar, ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, tableRowHover } from '@/lib/animations'

type Partner = any
type PartnerType = any

type Props = {
  initialPartners: Partner[]
  partnerTypes: PartnerType[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: 'Actif',     color: '#059669', bg: '#D1FAE5' },
  pending:  { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
  suspended: { label: 'Suspendu',  color: 'var(--red)', bg: 'var(--red-light)' },
  rejected: { label: 'Refusé',    color: '#4B5563', bg: '#F3F4F6' },
}

export default function PartenairesClient({ initialPartners, partnerTypes }: Props) {
  const [partners, setPartners] = useState(initialPartners)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      const matchesSearch = 
        p.company_name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.siret?.includes(search)
      
      const matchesType = !filterType || p.partner_type === filterType
      const matchesStatus = !filterStatus || p.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [partners, search, filterType, filterStatus])

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      style={{ padding: '32px' }}
    >
      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>Comptes partenaires</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Gérez les professionnels inscrits sur la plateforme.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <StatCard label="Total" value={partners.length} />
          <StatCard label="En attente" value={partners.filter(p => p.status === 'pending').length} color="#D97706" />
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
            placeholder="Rechercher par entreprise, email, SIRET..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', 
              border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <select 
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', background: 'white' }}
          >
            <option value="">Tous les métiers</option>
            {partnerTypes.map(t => (
              <option key={t.partner_type} value={t.partner_type}>{t.label}</option>
            ))}
          </select>

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
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={thStyle}>Entreprise</th>
              <th style={thStyle}>Métier</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Date inscription</th>
              <th style={thStyle}>Statut</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer}>
            {filteredPartners.map((p) => {
              const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
              const date = p.created_at ? format(new Date(p.created_at), 'dd/MM/yyyy', { locale: fr }) : '—'
              const type = partnerTypes.find(t => t.partner_type === p.partner_type)

              return (
                <motion.tr 
                  key={p.id} 
                  variants={fadeUp}
                  className="table-row"
                  style={{ borderBottom: '1px solid #F3F4F6' }}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{p.company_name}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>SIRET: {p.siret}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151' }}>
                      <Briefcase size={14} style={{ color: '#9CA3AF' }} /> {type?.label || p.partner_type}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px', color: '#111827' }}>{p.email}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{p.phone}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151' }}>
                      <Calendar size={14} style={{ color: '#9CA3AF' }} /> {date}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px', 
                      padding: '4px 10px', borderRadius: '20px', 
                      background: status.bg, color: status.color, 
                      fontSize: '11px', fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: status.color }} />
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

        {filteredPartners.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
            <Building2 size={48} style={{ margin: '0 auto 16px', color: '#E5E7EB' }} />
            <p>Aucun partenaire ne correspond à votre recherche.</p>
          </div>
        )}
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
  fontSize: '12px',
  fontWeight: 600,
  color: '#4B5563',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
  padding: '16px',
  verticalAlign: 'middle',
}
