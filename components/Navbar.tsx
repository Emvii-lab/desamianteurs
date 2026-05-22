'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BtnRed, BtnOutline } from './ui/Btn'
import { createClient } from '@/lib/supabase'


type UserInfo = { initials: string; href: string } | null

export default function Navbar() {
  const [user, setUser] = useState<UserInfo>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser()
        if (!data.user) { 
          setUser(null)
          return 
        }

        const meta = data.user.user_metadata ?? {}
        // Google utilise souvent 'full_name' ou 'name'
        const fullName = meta.full_name || meta.name || ''
        const prenom = meta.prenom || (fullName ? fullName.split(' ')[0] : '')
        const nom = meta.nom || (fullName ? fullName.split(' ').slice(1).join(' ') : '')
        const email = data.user.email ?? ''
        
        const initials = prenom && nom
          ? `${prenom[0]}${nom[0]}`.toUpperCase()
          : prenom 
            ? prenom.slice(0, 2).toUpperCase()
            : email.slice(0, 2).toUpperCase()

        // Détermine le bon espace
        let href = '/espace-client'
        try {
          const [adminRes, partnerRes, clientRes] = await Promise.all([
            supabase.from('admins').select('id').eq('user_id', data.user.id).maybeSingle(),
            supabase.from('partners').select('id').eq('user_id', data.user.id).maybeSingle(),
            supabase.from('clients').select('id').eq('user_id', data.user.id).maybeSingle(),
          ])
          
          if (adminRes?.data) href = '/espace-admin'
          else if (partnerRes?.data) href = '/espace-partenaire'
          else if (clientRes?.data) href = '/espace-client'
          else href = '/inscription/completer' // Si aucun profil n'existe encore
        } catch { /* fallback */ }

        setUser({ initials, href })
      } catch (e) {
        console.error("Error loading user:", e)
        setUser(null)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <nav style={{
        background: '#FFFFFF', borderBottom: '1px solid #E5E7EB',
        height: 64, // Slightly taller for more air
        display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'baseline', textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', fontWeight: 400, fontSize: 22, color: '#0A0A0A', letterSpacing: '-0.5px' }}>Désamianteurs</span>
          <span style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', fontWeight: 400, fontSize: 22, color: 'var(--red)' }}>.fr</span>
        </Link>

        {/* Liens + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <NavLink href="/#comment-ca-fonctionne">Comment ça fonctionne ?</NavLink>
          <NavLink href="/professionnels">Trouver un pro</NavLink>
          <NavLink href="/tarifs">Tarifs</NavLink>
          <NavLink href="/actualites">Actualités</NavLink>

          <div style={{ width: 1, height: 24, background: '#E5E7EB', margin: '0 4px' }} />

          {/* Avatar si connecté, sinon boutons par défaut */}
          {user ? (
            <Link href={user.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', fontFamily: 'var(--font-sans)' }}>Mon espace</span>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: '#0A0A0A', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                border: '2px solid transparent',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#C0392B')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
              >
                {user.initials}
              </div>
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link href="/connexion" style={{ fontSize: 13, fontWeight: 700, color: '#0A0A0A', textDecoration: 'none', padding: '8px 12px' }}>Connexion</Link>
              <BtnRed href="/inscription" size="sm" style={{ padding: '10px 24px', borderRadius: 8 }}>S'inscrire</BtnRed>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
      color: '#4B5563', textDecoration: 'none',
    }}
      onMouseEnter={e => (e.currentTarget.style.color = '#0A0A0A')}
      onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}
    >
      {children}
    </Link>
  )
}
