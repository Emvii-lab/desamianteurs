'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ArrowRight, Gift } from 'lucide-react'

const STORAGE_KEY = 'promobar_dismissed_v1'

export default function PromoBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  function dismiss(e: React.MouseEvent) {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #111 0%, #1c0806 40%, #200b08 60%, #111 100%)',
        borderBottom: '1px solid rgba(192,57,43,0.3)',
        padding: '12px 56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        position: 'relative',
        minHeight: 52,
      }}
    >
      {/* Icône + badge */}
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

      {/* Message */}
      <p style={{
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14, fontWeight: 400,
        margin: 0, lineHeight: 1.5,
        textAlign: 'center',
      }}>
        Les frais d'inscription{' '}
        <span style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through' }}>80€</span>
        {' '}sont{' '}
        <strong style={{ color: '#ffffff', fontWeight: 700 }}>offerts</strong>
        {' '}— votre 1ère affaire aussi.{' '}
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
          Code promo appliqué automatiquement.
        </span>
      </p>

      {/* CTA */}
      <Link
        href="/inscription?tab=partenaire"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#C0392B',
          color: 'white',
          fontSize: 13, fontWeight: 700,
          padding: '8px 18px', borderRadius: 6,
          textDecoration: 'none', whiteSpace: 'nowrap',
          flexShrink: 0,
          boxShadow: '0 0 20px rgba(192,57,43,0.4)',
          transition: 'background 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#922B21'
          e.currentTarget.style.boxShadow = '0 0 28px rgba(192,57,43,0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#C0392B'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(192,57,43,0.4)'
        }}
      >
        Rejoindre le réseau
        <ArrowRight size={14} strokeWidth={2.5} />
      </Link>

      {/* Close */}
      <button
        onClick={dismiss}
        aria-label="Fermer le bandeau"
        style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.35)', padding: 6, display: 'flex',
          alignItems: 'center', borderRadius: 4,
          transition: 'color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'white'
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
          e.currentTarget.style.background = 'none'
        }}
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  )
}
