'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ClipboardList, FileText, MessageSquare,
  User, Star, LogOut, Building2, Users, ShieldCheck,
  Bell, Settings, Wrench, BadgeCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'

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

const supabase = createClient()

export default function DashboardSidebar({ role, userId, userName = 'Utilisateur', userInitials = 'U' }: Props) {
  const pathname = usePathname()
  const [unreadTotal, setUnreadTotal] = useState(0)
  const menu = MENUS[role]

  const fetchUnreadCount = async () => {
    if (!userId) return
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', userId)
    
    setUnreadTotal(count || 0)
  }

  useEffect(() => {
    if (!userId) return
    fetchUnreadCount()

    const channel = supabase
      .channel('sidebar-unread')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchUnreadCount()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="sidebar" 
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* Brand */}
      <div style={{ padding: '32px 24px' }}>
        <Link href="/" className="brand" style={{ fontSize: '18px' }}>
          Désamianteurs<span>.fr</span>
        </Link>
      </div>

      {/* User info */}
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
            {userInitials}
          </motion.div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>{ROLE_LABELS[role]}</div>
          </div>
        </div>
      </div>

      {/* Main menu */}
      <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gray-400)', padding: '0 24px', marginBottom: 8 }}>PRINCIPAL</p>
        {menu.main.map(item => (
          <SidebarLink key={item.href} item={item} active={pathname === item.href} unreadTotal={unreadTotal} />
        ))}

        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gray-400)', padding: '24px 24px 8px' }}>COMPTE</p>
        {menu.compte.map(item => (
          <SidebarLink key={item.href} item={item} active={pathname === item.href} unreadTotal={unreadTotal} />
        ))}
      </div>
      
      {/* Version or Help */}
      <div style={{ padding: '24px', borderTop: '1px solid var(--gray-100)' }}>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>
          v1.0.4 — Plateforme certifiée
        </div>
      </div>
    </motion.div>
  )
}

function SidebarLink({ item, active, unreadTotal }: { item: SidebarItem; active: boolean; unreadTotal: number }) {
  const { Icon } = item
  const isMessagerie = item.label === 'Messagerie'

  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={item.href} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 24px', fontSize: 14,
        color: active ? 'var(--red)' : 'var(--gray-600)',
        background: active ? 'var(--red-light)' : 'transparent',
        fontWeight: active ? 700 : 500,
        borderLeft: active ? '4px solid var(--red)' : '4px solid transparent',
        transition: 'all 0.2s', textDecoration: 'none',
        position: 'relative',
      }}>
        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
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
    </motion.div>
  )
}
