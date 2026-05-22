'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { BtnRed } from './ui/Btn'
import { createClient } from '@/lib/supabase'

type UserInfo = { initials: string; href: string } | null

const SERIF = 'var(--font-serif, "DM Serif Display", Georgia, serif)'
const SANS  = 'var(--font-sans, DM Sans, sans-serif)'

const NAV_LINKS = [
  { href: '/#comment-ca-fonctionne', label: 'Comment ça fonctionne ?' },
  { href: '/professionnels', label: 'Trouver un pro' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/actualites', label: 'Actualités' },
]

export default function Navbar() {
  const [user, setUser]         = useState<UserInfo>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      try {
        // getSession() lit les cookies localement sans appel réseau → instantané
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) { setUser(null); return }

        const user     = session.user
        const meta     = user.user_metadata ?? {}
        const fullName = meta.full_name || meta.name || ''
        const prenom   = meta.prenom || (fullName ? fullName.split(' ')[0] : '')
        const nom      = meta.nom    || (fullName ? fullName.split(' ').slice(1).join(' ') : '')
        const email    = user.email ?? ''

        const initials = prenom && nom
          ? `${prenom[0]}${nom[0]}`.toUpperCase()
          : prenom ? prenom.slice(0, 2).toUpperCase() : email.slice(0, 2).toUpperCase()

        let href = '/espace-client'
        try {
          const [adminRes, partnerRes] = await Promise.all([
            supabase.from('admins').select('id').eq('user_id', user.id).maybeSingle(),
            supabase.from('partners').select('id').eq('user_id', user.id).maybeSingle(),
          ])
          if (adminRes?.data)        href = '/espace-admin'
          else if (partnerRes?.data) href = '/espace-partenaire'
        } catch { /* fallback */ }

        setUser({ initials, href })
      } catch { setUser(null) }
    }

    loadUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => loadUser())
    return () => subscription.unsubscribe()
  }, [])

  return (
    // Le wrapper n'est PAS sticky ici — la page gère le positionnement fixed
    <div>
      {/* Barre principale */}
      <nav
        className="nav-inner"
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',        // overridé par .nav-inner sur mobile
          justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'baseline', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 22, color: '#0A0A0A', letterSpacing: '-0.5px' }}>Désamianteurs</span>
          <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 22, color: 'var(--red)' }}>.com</span>
        </Link>

        {/* Desktop : liens + auth — masqué sur mobile via CSS */}
        <div className="nav-desktop-links">
          {NAV_LINKS.map(({ href, label }) => (
            <NavLink key={href} href={href}>{label}</NavLink>
          ))}
          <div style={{ width: 1, height: 24, background: '#E5E7EB', margin: '0 4px' }} />
          <AuthDesktop user={user} />
        </div>

        {/* Mobile : hamburger — masqué sur desktop via CSS */}
        <div className="nav-mobile-toggle">
          {user && (
            <Link href={user.href} style={{ textDecoration: 'none' }}>
              <Avatar initials={user.initials} size={34} />
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 8, borderRadius: 6, color: '#0A0A0A',
              display: 'flex', alignItems: 'center',
            }}
          >
            {menuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </nav>

      {/* Dropdown mobile — contrôlé uniquement par JS (inline style) */}
      <div
        style={{
          display: menuOpen ? 'flex' : 'none',
          flexDirection: 'column',
          background: '#ffffff',
          borderBottom: '1px solid #E5E7EB',
          padding: '8px 20px 20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          zIndex: 10,
          position: 'relative',
        }}
      >
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={(e) => {
              setMenuOpen(false)
              // Ancre sur la même page : scroll manuel après fermeture du menu
              if (href.startsWith('/#')) {
                e.preventDefault()
                const id = href.slice(2)
                setTimeout(() => {
                  const el = document.getElementById(id)
                  if (el) {
                    const offset = 110 // navbar + promobar
                    const top = el.getBoundingClientRect().top + window.scrollY - offset
                    window.scrollTo({ top, behavior: 'smooth' })
                  }
                }, 50)
              }
            }}
            style={{
              fontSize: 15, fontWeight: 500, color: '#111111',
              padding: '13px 0', borderBottom: '1px solid #F3F4F6',
              textDecoration: 'none', display: 'block',
            }}
          >
            {label}
          </Link>
        ))}

        {!user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            <Link
              href="/connexion"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', textAlign: 'center', padding: '12px',
                border: '1.5px solid #E5E7EB', borderRadius: 8,
                fontSize: 14, fontWeight: 700, color: '#0A0A0A', textDecoration: 'none',
              }}
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', textAlign: 'center', padding: '12px',
                background: 'var(--red)', borderRadius: 8,
                fontSize: 14, fontWeight: 700, color: 'white', textDecoration: 'none',
              }}
            >
              S'inscrire
            </Link>
          </div>
        ) : (
          <Link
            href={user.href}
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block', textAlign: 'center', padding: '12px', marginTop: 16,
              border: '1.5px solid #0A0A0A', borderRadius: 8,
              fontSize: 14, fontWeight: 700, color: '#0A0A0A', textDecoration: 'none',
            }}
          >
            Mon espace
          </Link>
        )}
      </div>
    </div>
  )
}

/* ── Sous-composants ─────────────────────────────────────────────── */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: '#4B5563', textDecoration: 'none' }}
      onMouseEnter={e => (e.currentTarget.style.color = '#0A0A0A')}
      onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}
    >
      {children}
    </Link>
  )
}

function Avatar({ initials, size }: { initials: string; size: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: '#0A0A0A', color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700, fontFamily: SANS,
    }}>
      {initials}
    </div>
  )
}

function AuthDesktop({ user }: { user: UserInfo }) {
  if (user) {
    return (
      <Link href={user.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', fontFamily: SANS }}>Mon espace</span>
        <div
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: '#0A0A0A', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: SANS,
            border: '2px solid transparent', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#C0392B')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
        >
          {user.initials}
        </div>
      </Link>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Link href="/connexion" style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', textDecoration: 'none', padding: '8px 12px' }}>
        Connexion
      </Link>
      <BtnRed href="/inscription" size="sm" style={{ padding: '10px 24px', borderRadius: 8 }}>
        S'inscrire
      </BtnRed>
    </div>
  )
}
