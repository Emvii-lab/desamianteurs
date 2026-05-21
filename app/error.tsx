'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Error boundary]', error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(192,57,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <AlertTriangle size={28} color="var(--red, #C0392B)" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Une erreur est survenue</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>
          Quelque chose s&apos;est mal passé. Vous pouvez réessayer ou retourner à l&apos;accueil.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{ padding: '10px 24px', borderRadius: 8, background: '#C0392B', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
          >
            Réessayer
          </button>
          <Link href="/" style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #E5E7EB', color: '#374151', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
