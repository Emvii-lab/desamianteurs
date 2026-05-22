'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useCookieConsent } from '@/lib/hooks/useCookieConsent'

const SERIF = 'var(--font-serif, "DM Serif Display", Georgia, serif)'

export default function CookieConsent() {
  const { consent, ready, acceptAll, declineAll, saveCustom } = useCookieConsent()
  const [showModal, setShowModal] = useState(false)
  const [mapsEnabled, setMapsEnabled] = useState(true)

  if (!ready || consent?.decided) return null

  return (
    <>
      {/* Bannière principale */}
      {!showModal && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
          background: 'white', borderTop: '1px solid var(--gray-200)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.10)',
          padding: '20px 24px',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(192,57,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={18} color="var(--red)" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>
                  Nous utilisons des cookies
                </p>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                  Certains cookies tiers (Google Maps) améliorent votre expérience.{' '}
                  <Link href="/confidentialite" style={{ color: 'var(--red)', textDecoration: 'underline', fontSize: 12 }}>
                    Politique de confidentialité
                  </Link>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: '9px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  background: 'none', border: '1px solid var(--gray-200)', color: '#6B7280',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Personnaliser
              </button>
              <button
                onClick={declineAll}
                style={{
                  padding: '9px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  background: 'none', border: '1px solid var(--gray-300)', color: '#374151',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Refuser
              </button>
              <button
                onClick={acceptAll}
                style={{
                  padding: '9px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                  background: 'var(--red)', border: '1.5px solid var(--red)', color: 'white',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal personnalisation */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 0 0 0',
        }}>
          <div style={{
            background: 'white', width: '100%', maxWidth: 600,
            borderRadius: '16px 16px 0 0',
            maxHeight: '85vh', overflowY: 'auto',
            padding: '28px 24px 32px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: '#111', margin: 0 }}>
                  Préférences cookies
                </h2>
                <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4, margin: '4px 0 0' }}>
                  Choisissez les cookies que vous acceptez.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9CA3AF' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Catégorie : Essentiels */}
            <div style={{ border: '1px solid var(--gray-200)', borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#FAFAFA' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>Cookies essentiels</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                    Authentification, sécurité, session. Toujours actifs.
                  </p>
                </div>
                <div style={{ padding: '4px 12px', borderRadius: 99, background: '#D1FAE5', color: '#059669', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  Toujours actif
                </div>
              </div>
            </div>

            {/* Catégorie : Cartes */}
            <div style={{ border: '1px solid var(--gray-200)', borderRadius: 10, marginBottom: 24, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>Cartes interactives</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                    Google Maps pour afficher les professionnels sur la carte.
                  </p>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => setMapsEnabled(v => !v)}
                  style={{
                    width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
                    background: mapsEnabled ? 'var(--red)' : '#D1D5DB',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: 16,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: mapsEnabled ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={declineAll}
                style={{
                  flex: 1, padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: 'none', border: '1px solid var(--gray-300)', color: '#374151',
                  cursor: 'pointer',
                }}
              >
                Tout refuser
              </button>
              <button
                onClick={() => saveCustom(mapsEnabled)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                  background: '#111', border: '1.5px solid #111', color: 'white',
                  cursor: 'pointer',
                }}
              >
                Enregistrer
              </button>
              <button
                onClick={acceptAll}
                style={{
                  flex: 1, padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                  background: 'var(--red)', border: '1.5px solid var(--red)', color: 'white',
                  cursor: 'pointer',
                }}
              >
                Tout accepter
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#9CA3AF' }}>
              Vous pouvez modifier vos préférences à tout moment depuis notre{' '}
              <Link href="/confidentialite" style={{ color: 'var(--red)', textDecoration: 'underline' }}>
                politique de confidentialité
              </Link>.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
