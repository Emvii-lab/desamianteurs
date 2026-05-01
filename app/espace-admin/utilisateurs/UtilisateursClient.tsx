'use client'

import { useState, useMemo } from 'react'
import { 
  Search, User, ShieldCheck, 
  Building2, Mail, Phone, Calendar,
  MoreVertical, ChevronRight, Briefcase
} from 'lucide-react'
import { TYPE_LABEL } from '@/lib/constants'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, tableRowHover } from '@/lib/animations'

type UserRow = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  created_at: string
  role: string
  company_name?: string
  partner_type?: string
}

type Props = {
  initialUsers: UserRow[]
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  client:     { label: 'Client',     color: '#0284C7', bg: '#F0F9FF', Icon: User },
  partenaire: { label: 'Partenaire', color: '#059669', bg: '#F0FDF4', Icon: Building2 },
  admin:      { label: 'Admin',      color: 'var(--red)', bg: 'var(--red-light)', Icon: ShieldCheck },
}

export default function UtilisateursClient({ initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase()
      const matchesSearch = 
        fullName.includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.company_name?.toLowerCase().includes(search.toLowerCase())
      
      const matchesRole = !filterRole || u.role === filterRole

      return matchesSearch && matchesRole
    })
  }, [users, search, filterRole])

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      style={{ padding: '32px' }}
    >
      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>Tous les utilisateurs</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Consultez la liste globale de tous les comptes enregistrés sur la plateforme.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <StatCard label="Total" value={users.length} />
          <StatCard label="Clients" value={users.filter(u => u.role === 'client').length} />
        </div>
      </motion.div>

      <motion.div variants={fadeUp} style={{ 
        background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', 
        display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input 
            type="text" 
            placeholder="Rechercher un nom, un email ou une entreprise..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', 
              border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none'
            }}
          />
        </div>
        
        <select 
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', background: 'white' }}
        >
          <option value="">Tous les rôles</option>
          <option value="client">Clients</option>
          <option value="partenaire">Partenaires</option>
          <option value="admin">Admins</option>
        </select>
      </motion.div>

      <motion.div variants={fadeUp} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={thStyle}>Utilisateur</th>
              <th style={thStyle}>Rôle</th>
              <th style={thStyle}>Entreprise / Type</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Inscription</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer}>
            {filteredUsers.map((u) => {
              const role = ROLE_CONFIG[u.role] || ROLE_CONFIG.client
              const RoleIcon = role.Icon
              const dateInsc = u.created_at ? format(new Date(u.created_at), 'dd MMM yyyy', { locale: fr }) : '—'

              return (
                <motion.tr 
                  key={u.id} 
                  variants={fadeUp}
                  className="table-row"
                  style={{ borderBottom: '1px solid #F3F4F6' }}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: '#F3F4F6', color: '#4B5563',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '12px'
                      }}>
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{u.first_name} {u.last_name}</div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>ID: {u.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px', 
                      padding: '4px 10px', borderRadius: '20px', 
                      background: role.bg, color: role.color, 
                      fontSize: '11px', fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      <RoleIcon size={12} />
                      {role.label}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                      {u.company_name || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Particulier</span>}
                    </div>
                    {u.role === 'partenaire' && u.partner_type && (
                      <div style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Briefcase size={10} style={{ color: '#9CA3AF' }} /> {TYPE_LABEL[u.partner_type] || u.partner_type}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '13px', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} style={{ color: '#9CA3AF' }} /> {u.email}
                      </div>
                      {u.phone && (
                        <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={12} style={{ color: '#9CA3AF' }} /> {u.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} style={{ color: '#9CA3AF' }} /> {dateInsc}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: '#F9FAFB' }}
                      whileTap={{ scale: 0.98 }}
                      style={{ 
                        background: 'none', border: '1px solid #E5E7EB', padding: '6px 12px', borderRadius: '8px',
                        fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
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
