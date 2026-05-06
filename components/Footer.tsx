'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'



const COL_TITLE: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
  letterSpacing: '0.8px', color: 'rgba(255,255,255,0.35)',
  marginBottom: 16, fontFamily: 'DM Sans, sans-serif',
}

const COLUMNS = [
  {
    title: 'CLIENTS',
    links: [
      { label: "S'inscrire en tant que client", href: '/inscription' },
      { label: 'Déposer une demande', href: '/formulaire' },
      { label: 'Trouver un pro', href: '/professionnels' },
    ],
  },
  {
    title: 'PARTENAIRES',
    links: [
      { label: "S'inscrire en tant que partenaire", href: '/inscription?tab=partenaire' },
      { label: 'Nos certifications requises', href: '/certifications' },
      { label: 'Tarifs', href: '/tarifs' },
    ],
  },
  {
    title: 'LÉGAL',
    links: [
      { label: 'CGU', href: '/cgu' },
      { label: 'Politique de confidentialité', href: '/confidentialite' },
      { label: 'Mentions légales', href: '/mentions-legales' },
      { label: 'Charte de bonne conduite', href: '/charte' },
    ],
  },
]

function FooterLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [hover, setHover] = useState(false)

  const [hrefPath, hrefQuery] = href.split('?')
  const hrefParams = new URLSearchParams(hrefQuery ?? '')

  const currentTab = searchParams.get('tab') || 'client'
  const linkTab = hrefParams.get('tab') || 'client'
  const isActive = pathname === hrefPath && currentTab === linkTab

  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'block', marginBottom: 10,
        fontSize: 13, fontFamily: 'DM Sans, sans-serif', textDecoration: 'none',
        color: isActive ? 'var(--red)' : hover ? 'white' : 'rgba(255,255,255,0.55)',
        transition: 'color 0.15s',
      }}
    >
      {label}
    </Link>
  )
}

export default function Footer() {
  return (
    <footer style={{ background: '#0A0A0A', padding: '48px 40px 24px' }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: 40, marginBottom: 40,
      }}>
        {/* Brand */}
        <div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 16, color: 'white' }}>Désamianteurs</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--red)' }}>.fr</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 220, fontFamily: 'DM Sans, sans-serif' }}>
            La plateforme de référence pour tous vos besoins liés à l'amiante.
          </p>
        </div>

        {COLUMNS.map(col => (
          <div key={col.title}>
            <p style={COL_TITLE}>{col.title}</p>
            {col.links.map(link => (
              <Suspense key={link.href} fallback={<span style={{ display: 'block', marginBottom: 10, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{link.label}</span>}>
                <FooterLink href={link.href} label={link.label} />
              </Suspense>
            ))}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'DM Sans, sans-serif' }}>
          © 2026 Désamianteurs.fr — Tous droits réservés
        </p>
      </div>
    </footer>
  )
}
