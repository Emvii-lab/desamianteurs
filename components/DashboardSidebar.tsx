'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ClipboardList, FileText, MessageSquare,
  User, Star, LogOut, Building2, Users, ShieldCheck,
  Bell, Settings, Wrench, BadgeCheck, FileCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { getInitials } from '@/lib/utils'

type SidebarItem = {
  label: string
  href: string
  Icon: LucideIcon
  badge?: number
}

type Props = {
  role: 'client' | 'partenaire' | 'admin'
  userId?: string
  userName?: string
  userInitials?: string
}

const MENUS: Record<string, { main: SidebarItem[]; compte: SidebarItem[] }> = {
  client: {
    main: [
      { label: 'Tableau de bord', href: '/espace-client', Icon: LayoutDashboard },
      { label: 'Mes demandes', href: '/espace-client/demandes', Icon: ClipboardList },
      { label: 'Mes devis', href: '/espace-client/devis', Icon: FileText },
      { label: 'Messagerie', href: '/espace-client/messagerie', Icon: MessageSquare },
    ],
    compte: [
      { label: 'Mon profil', href: '/espace-client/profil', Icon: User },
      { label: 'Mes avis', href: '/espace-client/avis', Icon: Star },
      { label: 'Déconnexion', href: '/connexion', Icon: LogOut },
    ],
  },
  partenaire: {
    main: [
      { label: 'Tableau de bord', href: '/espace-partenaire', Icon: LayoutDashboard },
      { label: 'Nouvelles demandes', href: '/espace-partenaire/demandes', Icon: Bell },
      { label: 'Mes devis envoyés', href: '/espace-partenaire/devis', Icon: FileText },
      { label: 'Messagerie', href: '/espace-partenaire/messagerie', Icon: MessageSquare },
    ],
    compte: [
      { label: 'Mon profil partenaire', href: '/espace-partenaire/profil', Icon: User },
      { label: 'Documents obligatoires', href: '/espace-partenaire/documents', Icon: FileCheck },
      { label: 'Certifications', href: '/espace-partenaire/certifications', Icon: BadgeCheck },
      { label: 'Mes avis', href: '/espace-partenaire/avis', Icon: Star },
      { label: 'Déconnexion', href: '/connexion', Icon: LogOut },
    ],
  },
  admin: {
    main: [
      { label: "Vue d'ensemble", href: '/espace-admin', Icon: LayoutDashboard },
      { label: 'Comptes partenaires', href: '/espace-admin/partenaires', Icon: Building2 },
      { label: 'Tous les utilisateurs', href: '/espace-admin/utilisateurs', Icon: Users },
      { label: 'Avis à modérer', href: '/espace-admin/avis', Icon: ShieldCheck },
    ],
    compte: [
      { label: 'Demandes', href: '/espace-admin/demandes', Icon: ClipboardList },
      { label: 'Types de prestation', href: '/espace-admin/prestations', Icon: Wrench },
      { label: 'Paramètres', href: '/espace-admin/parametres', Icon: Settings },
      { label: 'Déconnexion', href: '/connexion', Icon: LogOut },
    ],
  },
}

const ROLE_LABELS: Record<string, string> = {
  client: 'Compte Client',
  partenaire: 'Compte partenaire',
  admin: 'Admin entreprise',
}

export default function DashboardSidebar({ role, userId, userName = 'Utilisateur' }: Props) {
  const pathname = usePathname()
  const [unreadTotal, setUnreadTotal] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [absenceModal, setAbsenceModal] = useState(false)
  const [absenceStart, setAbsenceStart] = useState('')
  const [absenceEnd, setAbsenceEnd]     = useState('')
  const [isAbsent, setIsAbsent]         = useState(false)
  const [savingAbsence, setSavingAbsence] = useState(false)
  const menu = MENUS[role]
  const initials = getInitials(userName)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/connexion'
  }

  // Chargement du statut d'absence (partenaire uniquement)
  useEffect(() => {
    if (role !== 'partenaire' || !userId) return
    supabase
      .from('partners')
      .select('absence_start, absence_end')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.absence_start && data?.absence_end) {
          const now   = new Date()
          const start = new Date(data.absence_start)
          const end   = new Date(data.absence_end)
          setIsAbsent(now >= start && now <= end)
          setAbsenceStart(data.absence_start.slice(0, 10))
          setAbsenceEnd(data.absence_end.slice(0, 10))
        }
      })
  }, [role, userId])

  const saveAbsence = async () => {
    if (!absenceStart || !absenceEnd) return
    setSavingAbsence(true)
    await fetch('/api/partner/absence', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        absence_start: new Date(absenceStart).toISOString(),
        absence_end:   new Date(absenceEnd).toISOString(),
      }),
    })
    const now   = new Date()
    const start = new Date(absenceStart)
    const end   = new Date(absenceEnd)
    setIsAbsent(now >= start && now <= end)
    setSavingAbsence(false)
    setAbsenceModal(false)
  }

  const clearAbsence = async () => {
    setSavingAbsence(true)
    await fetch('/api/partner/absence', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ absence_start: null, absence_end: null }),
    })
    setIsAbsent(false)
    setAbsenceStart('')
    setAbsenceEnd('')
    setSavingAbsence(false)
    setAbsenceModal(false)
  }

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', userId)
      setUnreadTotal(count || 0)
    }

    fetchUnreadCount()

    const channel = supabase
      .channel('sidebar-unread')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchUnreadCount)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return (
    <>
    {/* Barre mobile sticky (visible uniquement sur mobile) */}
    <div className="admin-mobile-bar">
      <Link href="/" className="brand" style={{ margin: 0, fontSize: 18 }}>
        Désamianteurs<span>.fr</span>
      </Link>
      <button
        onClick={() => setMobileOpen(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--black)', display: 'flex', alignItems: 'center' }}
        aria-label="Ouvrir le menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>

    {/* Overlay (ferme la sidebar en cliquant à côté) */}
    {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: '32px 24px' }}>
        <Link href="/" className="brand" style={{ fontSize: '18px' }}>
          Désamianteurs<span>.fr</span>
        </Link>
      </div>

      <div style={{ padding: '0 24px 24px', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--gray-100)', borderRadius: 12 }}>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--black)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}
          >
            {initials}
          </motion.div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>{ROLE_LABELS[role]}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--gray-400)', padding: '16px 24px 8px' }}>PRINCIPAL</p>
        {menu.main.map(item => (
          <SidebarLink key={item.href} item={item} active={pathname === item.href} unreadTotal={unreadTotal} onClose={() => setMobileOpen(false)} />
        ))}

        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--gray-400)', padding: '24px 24px 8px' }}>COMPTE</p>
        {menu.compte
          .filter(item => !(role === 'partenaire' && item.label === 'Déconnexion'))
          .map(item => (
            <SidebarLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              unreadTotal={unreadTotal}
              onClose={() => setMobileOpen(false)}
              onLogout={item.label === 'Déconnexion' ? handleLogout : undefined}
            />
          ))}

        {/* Bouton mode absence — partenaire uniquement */}
        {role === 'partenaire' && (
          <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }} onClick={() => setMobileOpen(false)}>
            <div
              onClick={() => setAbsenceModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 24px', fontSize: 14, cursor: 'pointer',
                color: isAbsent ? '#2563EB' : 'var(--gray-600)',
                background: isAbsent ? 'rgba(37,99,235,0.06)' : 'transparent',
                borderLeft: `4px solid ${isAbsent ? '#2563EB' : 'transparent'}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span style={{ flex: 1 }}>Mode absence</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                background: isAbsent ? '#DBEAFE' : 'var(--gray-100)',
                color: isAbsent ? '#1D4ED8' : 'var(--gray-400)',
              }}>
                {isAbsent ? 'Activé' : 'Désactivé'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Déconnexion — toujours en dernier pour le partenaire */}
        {role === 'partenaire' && (() => {
          const logoutItem = menu.compte.find(i => i.label === 'Déconnexion')
          return logoutItem ? (
            <SidebarLink
              key={logoutItem.href}
              item={logoutItem}
              active={false}
              unreadTotal={0}
              onClose={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          ) : null
        })()}
      </div>

      <div style={{ padding: '24px', borderTop: '1px solid var(--gray-100)' }}>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>
          v1.0.5 — Plateforme certifiée
        </div>
      </div>

    </motion.div>

    {/* Modale mode absence — en dehors du motion.div pour éviter le stacking context */}
    {absenceModal && (
      <div
        onClick={e => e.target === e.currentTarget && setAbsenceModal(false)}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FFF3CD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Mode absence</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Mettez votre compte en veille temporairement</div>
            </div>
          </div>

          {/* Avertissement */}
          <div style={{ background: '#FFFBF0', border: '1px solid #F0D080', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#7A5A00', lineHeight: 1.6 }}>
            Pendant votre absence, <strong>aucune demande ne vous sera envoyée</strong>. Votre score de réactivité est conservé et recalculé à votre retour sur les 2 derniers mois d'activité réelle.
          </div>

          {/* Dates */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Date de départ</label>
            <input type="date" className="input" value={absenceStart} min={new Date().toISOString().slice(0, 10)} onChange={e => setAbsenceStart(e.target.value)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Date de retour estimée</label>
            <input type="date" className="input" value={absenceEnd} min={absenceStart || new Date().toISOString().slice(0, 10)} onChange={e => setAbsenceEnd(e.target.value)} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAbsenceModal(false)}>Annuler</button>
            {isAbsent && (
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={clearAbsence} disabled={savingAbsence}>Désactiver</button>
            )}
            <button className="btn btn-red" style={{ flex: 1, justifyContent: 'center' }} onClick={saveAbsence} disabled={savingAbsence || !absenceStart || !absenceEnd}>
              {savingAbsence ? '...' : 'Activer'}
            </button>
          </div>
        </motion.div>
      </div>
    )}
    </>
  )
}

function SidebarLink({ item, active, unreadTotal, onLogout, onClose }: { item: SidebarItem; active: boolean; unreadTotal: number; onLogout?: () => void; onClose?: () => void }) {
  const { Icon } = item
  const isMessagerie = item.label === 'Messagerie'

  return (
    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
      {onLogout ? (
        <div onClick={() => { onClose?.(); onLogout() }} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 24px', fontSize: 14,
          color: 'var(--gray-600)',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s', textDecoration: 'none',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20 }}>
            <Icon size={18} />
          </div>
          <span style={{ flex: 1 }}>{item.label}</span>
        </div>
      ) : (
        <Link href={item.href} onClick={onClose} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 24px', fontSize: 14,
        color: active ? 'var(--red)' : 'var(--gray-600)',
        background: active ? 'var(--red-light)' : 'transparent',
        fontWeight: active ? 700 : 500,
        borderLeft: '4px solid',
        borderLeftColor: active ? 'var(--red)' : 'transparent',
        transition: 'all 0.2s', textDecoration: 'none',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20 }}>
          <Icon size={18} strokeWidth={active ? 2.5 : 2} />
        </div>
        <span style={{ flex: 1 }}>{item.label}</span>
        {isMessagerie && unreadTotal > 0 && (
          <span style={{
            background: 'var(--red)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '10px',
            minWidth: '18px',
            textAlign: 'center',
          }}>
            {unreadTotal}
          </span>
        )}
      </Link>
      )}
    </motion.div>
  )
}
