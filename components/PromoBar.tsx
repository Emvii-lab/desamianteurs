'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ArrowRight, Gift } from 'lucide-react'
import { useIsMobile } from '@/lib/hooks/useIsMobile'

const STORAGE_KEY = 'promobar_dismissed_v6'

export default function PromoBar() {
  const [visible, setVisible] = useState(false)
  const [collapsing, setCollapsing] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  function dismiss(e: React.MouseEvent) {
    e.preventDefault()
    setCollapsing(true)
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, '1')
      setVisible(false)
    }, 300)
  }

  if (!visible) return null

  return (
    <div style={{
      overflow: 'hidden',
      maxHeight: collapsing ? 0 : 120,
      opacity: collapsing ? 0 : 1,
      transition: 'max-height 0.3s ease, opacity 0.25s ease',
    }}>
      <div style={{
        background: 'linear-gradient(90deg, #111 0%, #1c0806 40%, #200b08 60%, #111 100%)',
        borderBottom: '1px solid rgba(192,57,43,0.3)',
        padding: isMobile ? '10px 44px 10px 16px' : '12px 56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? 12 : 20,
        position: 'relative',
        minHeight: 48,
      }}>
        {/* Icône + badge — masqués sur mobile */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(192,57,43,0.2)',
              border: '1px solid rgba(192,57,43,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Gift size={16} color="#e8604a" strokeWidth={2} />
            </div>
            <span style={{
              background: 'rgba(192,57,43,0.2)',
              border: '1px solid rgba(192,57,43,0.4)',
              color: '#e8604a',
              fontSize: 10, fontWeight: 800,
              letterSpacing: '1px', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: 999,
              whiteSpace: 'nowrap',
            }}>
              Offre lancement
            </span>
          </div>
        )}

        {/* Message */}
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: isMobile ? 12 : 14,
          fontWeight: 400,
          margin: 0,
          lineHeight: 1.4,
          textAlign: isMobile ? 'left' : 'center',
          flex: isMobile ? 1 : undefined,
        }}>
          {isMobile ? (
            <>Inscription <strong style={{ color: '#fff' }}>offerte</strong> — 1ère affaire incluse.</>
          ) : (
            <>
              Les frais d'inscription{' '}
              <span style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }}>80€</span>
              {' '}sont{' '}
              <strong style={{ color: '#ffffff', fontWeight: 700 }}>offerts</strong>
              {' '}— votre 1ère affaire aussi.{' '}
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                Code promo appliqué automatiquement.
              </span>
            </>
          )}
        </p>

        {/* CTA */}
        <Link
          href="/inscription?tab=partenaire"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#C0392B',
            color: 'white',
            fontSize: isMobile ? 12 : 13,
            fontWeight: 700,
            padding: isMobile ? '6px 12px' : '8px 18px',
            borderRadius: 6,
            textDecoration: 'none', whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow: '0 0 20px rgba(192,57,43,0.4)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#922B21' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#C0392B' }}
        >
          {isMobile ? 'Rejoindre' : 'Rejoindre le réseau'}
          <ArrowRight size={12} strokeWidth={2.5} />
        </Link>

        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Fermer le bandeau"
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', padding: 5, display: 'flex',
            alignItems: 'center', borderRadius: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
        >
          <X size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
