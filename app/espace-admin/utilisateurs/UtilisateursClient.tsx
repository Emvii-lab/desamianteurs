'use client'

import { useState, useMemo } from 'react'
import {
  Search, User, ShieldCheck,
  Building2, Mail, Phone, Calendar,
  ChevronRight, Briefcase, X, Trash2,
  KeyRound, AlertTriangle, CheckCircle, Loader,
} from 'lucide-react'
import { TYPE_LABEL } from '@/lib/constants'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'

type UserRow = {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  created_at: string
  role: string
  company_name?: string
  partner_type?: string
}

type Props = { initialUsers: UserRow[] }

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  client:     { label: 'Client',     color: '#0284C7', bg: '#F0F9FF', Icon: User },
  partenaire: { label: 'Partenaire', color: '#059669', bg: '#F0FDF4', Icon: Building2 },
  admin:      { label: 'Admin',      color: 'var(--red)', bg: 'var(--red-light)', Icon: ShieldCheck },
}

const SANS = 'var(--font-sans, DM Sans, sans-serif)'

// ─── Modale détails ───────────────────────────────────────────────────────────

function UserDetailModal({
  user,
  onClose,
  onDeleted,
}: {
  user: UserRow
  onClose: () => void
  onDeleted: (userId: string) => void
}) {
  const [resetState, setResetState]       = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [resetMsg, setResetMsg]           = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.client
  const RoleIcon = role.Icon
  const dateInsc = user.created_at
    ? format(new Date(user.created_at), 'dd MMMM yyyy', { locale: fr })
    : '—'

  async function handleResetPassword() {
    setResetState('loading')
    try {
      const res  = await fetch('/api/admin/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setResetState('ok')
      setResetMsg('Email de réinitialisation envoyé.')
    } catch (e: any) {
      setResetState('error')
      setResetMsg(e.message || 'Erreur lors de l\'envoi.')
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={onClose}
      >
        <div
          style={{ background: 'white', borderRadius: 16, width: 500, maxWidth: '92vw', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#4B5563', flexShrink: 0 }}>
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#111', fontFamily: SANS }}>{user.first_name} {user.last_name}</div>
                <div style={{ fontSize: 13, color: '#6B7280', fontFamily: SANS, marginTop: 2 }}>{user.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: role.bg, color: role.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                    <RoleIcon size={11} />{role.label}
                  </span>
                  <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: SANS, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} /> {dateInsc}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} aria-label="Fermer la modale" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, borderRadius: 6, display: 'flex' }}>
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Infos supplémentaires */}
            {(user.phone || user.company_name) && (
              <div style={{ display: 'flex', gap: 16, padding: '12px 16px', background: '#F9FAFB', borderRadius: 10 }}>
                {user.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', fontFamily: SANS }}>
                    <Phone size={13} color="#9CA3AF" /> {user.phone}
                  </div>
                )}
                {user.company_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', fontFamily: SANS }}>
                    <Briefcase size={13} color="#9CA3AF" /> {user.company_name}
                  </div>
                )}
              </div>
            )}

            {/* Réinitialiser mot de passe */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111', fontFamily: SANS, marginBottom: 3 }}>Réinitialiser le mot de passe</div>
                  <div style={{ fontSize: 12, color: '#6B7280', fontFamily: SANS }}>Un email de récupération sera envoyé à l'utilisateur.</div>
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={resetState === 'loading' || resetState === 'ok'}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    fontFamily: SANS, cursor: resetState === 'ok' ? 'default' : 'pointer',
                    border: '1.5px solid #E5E7EB',
                    background: resetState === 'ok' ? '#F0FDF4' : 'white',
                    color: resetState === 'ok' ? '#059669' : '#374151',
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                >
                  {resetState === 'loading' && <Loader size={14} className="animate-spin" />}
                  {resetState === 'ok'      && <CheckCircle size={14} />}
                  {resetState === 'idle'    && <KeyRound size={14} />}
                  {resetState === 'ok' ? 'Email envoyé' : resetState === 'loading' ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
              {resetState === 'error' && <p className="error-text" style={{ marginTop: 8 }}>{resetMsg}</p>}
            </div>

            {/* Zone danger */}
            <div style={{ border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '16px', background: 'rgba(220,38,38,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#DC2626', fontFamily: SANS, marginBottom: 3 }}>Supprimer ce compte</div>
                  <div style={{ fontSize: 12, color: '#6B7280', fontFamily: SANS }}>Action irréversible. Toutes les données seront supprimées.</div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    fontFamily: SANS, cursor: 'pointer',
                    border: '1.5px solid rgba(220,38,38,0.3)',
                    background: 'rgba(220,38,38,0.06)', color: '#DC2626',
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modale de confirmation suppression */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          user={user}
          onCancel={() => setShowDeleteConfirm(false)}
          onDeleted={() => { onDeleted(user.user_id); onClose() }}
        />
      )}
    </>
  )
}

// ─── Modale confirmation suppression ─────────────────────────────────────────

function DeleteConfirmModal({
  user,
  onCancel,
  onDeleted,
}: {
  user: UserRow
  onCancel: () => void
  onDeleted: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const cascadeItems: Record<string, string[]> = {
    client:     ['Le profil client', 'Toutes les demandes de devis', 'L\'historique des messages'],
    partenaire: ['Le profil partenaire', 'Les zones d\'intervention', 'Les devis envoyés', 'Les certifications associées'],
    admin:      ['Le profil administrateur'],
  }
  const items = cascadeItems[user.role] ?? []

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/admin/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.user_id, role: user.role }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onDeleted()
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la suppression.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ background: 'white', borderRadius: 16, width: 440, maxWidth: '92vw', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #FEE2E2', background: '#FFF5F5', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} color="#DC2626" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#DC2626', fontFamily: SANS }}>Supprimer définitivement ?</div>
            <div style={{ fontSize: 13, color: '#6B7280', fontFamily: SANS, marginTop: 1 }}>{user.first_name} {user.last_name} — {user.email}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 14, color: '#374151', fontFamily: SANS, marginBottom: 16, lineHeight: 1.6 }}>
            Cette action est <strong>irréversible</strong>. Les éléments suivants seront définitivement supprimés :
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 0, listStyle: 'none', marginBottom: 20 }}>
            {['Le compte d\'authentification', ...items].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', fontFamily: SANS }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>

          {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onCancel}
              disabled={loading}
              style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 600, color: '#374151', fontFamily: SANS, cursor: 'pointer' }}
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{
                flex: 1, padding: '11px', borderRadius: 8,
                border: '1.5px solid #DC2626',
                background: loading ? 'rgba(220,38,38,0.6)' : '#DC2626',
                color: 'white', fontSize: 14, fontWeight: 700,
                fontFamily: SANS, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s',
              }}
            >
              {loading ? <Loader size={15} className="animate-spin" /> : <Trash2 size={15} />}
              {loading ? 'Suppression...' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function UtilisateursClient({ initialUsers }: Props) {
  const [users, setUsers]         = useState(initialUsers)
  const [search, setSearch]       = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase()
      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.company_name?.toLowerCase().includes(search.toLowerCase())
      const matchesTab = activeTab === 'all' || u.role === activeTab
      return matchesSearch && matchesTab
    })
  }, [users, search, activeTab])

  function handleDeleted(deletedUserId: string) {
    setUsers(prev => prev.filter(u => u.user_id !== deletedUserId))
    setSelectedUser(null)
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="admin-page-content"
      >
        {/* En-tête */}
        <motion.div variants={fadeUp} className="admin-page-header">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>Tous les utilisateurs</h1>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Consultez la liste globale de tous les comptes enregistrés sur la plateforme.</p>
          </div>
          <div className="admin-header-actions">
            <StatCard label="Total"   value={users.length} />
            <StatCard label="Clients" value={users.filter(u => u.role === 'client').length} />
          </div>
        </motion.div>

        {/* Tabs + recherche */}
        <motion.div variants={fadeUp} className="admin-tabs-row">
          <div className="admin-tabs-list">
            {[
              { id: 'all',        label: 'Tous',        count: users.length },
              { id: 'partenaire', label: 'Partenaires', count: users.filter(u => u.role === 'partenaire').length },
              { id: 'client',     label: 'Clients',     count: users.filter(u => u.role === 'client').length },
              { id: 'admin',      label: 'Admins',      count: users.filter(u => u.role === 'admin').length },
            ].map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 16px', fontSize: '14px', fontWeight: 600,
                    color: isActive ? 'var(--red)' : '#6B7280',
                    background: 'none', border: 'none',
                    borderBottom: isActive ? '2px solid var(--red)' : '2px solid transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.2s', marginBottom: '-1px',
                  }}
                >
                  {tab.label}
                  <span style={{ fontSize: '11px', background: isActive ? 'var(--red-light)' : '#F3F4F6', color: isActive ? 'var(--red)' : '#9CA3AF', padding: '2px 8px', borderRadius: '10px' }}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="admin-tabs-search" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div variants={fadeUp} className="admin-table-container">
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
                const role    = ROLE_CONFIG[u.role] || ROLE_CONFIG.client
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
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F3F4F6', color: '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '12px' }}>
                          {u.first_name?.[0]}{u.last_name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{u.first_name} {u.last_name}</div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>ID: {u.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', background: role.bg, color: role.color, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
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
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="btn-outline btn-sm"
                        style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        Détails <ChevronRight size={14} />
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </motion.tbody>
          </table>
        </motion.div>
      </motion.div>

      {/* Modale détails */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderColor: '#D1D5DB' }}
      style={{ background: 'white', padding: '12px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', textAlign: 'center', transition: 'all 0.2s ease' }}
    >
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{value}</div>
    </motion.div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '16px', fontSize: '12px', fontWeight: 600,
  color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = { padding: '16px', verticalAlign: 'middle' }
