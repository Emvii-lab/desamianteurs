'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Global error boundary]', error)
  }, [error])

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Erreur critique</h1>
          <p style={{ color: '#6B7280', marginBottom: 24 }}>Une erreur inattendue s&apos;est produite.</p>
          <button
            onClick={reset}
            style={{ padding: '10px 24px', borderRadius: 8, background: '#C0392B', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
