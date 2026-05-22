'use client'

import Link from 'next/link'

export function AlgoMatchingSection() {
  return (
    <div
      className="card"
      style={{ padding: 0, overflow: 'hidden', marginBottom: 24, border: '1px solid #F3F4F6' }}
    >
      {/* Header */}
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid #F3F4F6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 3 }}>
            Comment fonctionne le matching ?
          </h3>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
            Comprenez exactement pourquoi vous êtes sélectionné — ou non
          </p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color: '#6B7280',
          letterSpacing: '0.8px', textTransform: 'uppercase',
          padding: '3px 10px', border: '1px solid #E5E7EB', borderRadius: 999,
          whiteSpace: 'nowrap',
        }}>
          2 min 47s
        </span>
      </div>

      {/* Video player */}
      <div style={{ background: '#0A0A0A', lineHeight: 0 }}>
        <video
          src="/videos/algo-matching.mp4"
          controls
          playsInline
          preload="metadata"
          style={{ width: '100%', display: 'block', maxHeight: 500 }}
        />
      </div>

      {/* CTA footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        background: '#FAFAFA',
      }}>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Votre score et votre position sont mis à jour après chaque dossier traité.
        </p>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <Link href="/espace-partenaire/profil" className="btn btn-red btn-sm">
            Optimiser mon profil →
          </Link>
          <Link href="/tarifs" className="btn btn-outline btn-sm">
            Voir les forfaits
          </Link>
        </div>
      </div>
    </div>
  )
}
