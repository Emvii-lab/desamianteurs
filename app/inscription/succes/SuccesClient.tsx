'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react'

type Status = 'loading' | 'paid' | 'pending' | 'error'

export default function SuccesClient({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('loading')
  const [email, setEmail] = useState('')

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 8

    async function check() {
      try {
        const res = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        const data = await res.json()

        if (data.paid) {
          setEmail(data.email ?? '')
          setStatus('paid')
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(check, 1500)
        } else {
          setStatus('pending')
        }
      } catch {
        setStatus('error')
      }
    }

    check()
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={styles.sub}>Vérification du paiement en cours…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={styles.center}>
        <AlertCircle size={56} color="#EF4444" strokeWidth={1.5} />
        <h2 style={{ ...styles.title, marginTop: 20 }}>Une erreur est survenue</h2>
        <p style={styles.sub}>Contactez-nous si le problème persiste.</p>
        <Link href="/inscription" style={styles.btnOutline}>Retour à l'inscription</Link>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div style={styles.center}>
        <div style={{ ...styles.iconWrap, background: 'rgba(245,158,11,0.1)' }}>
          <Clock size={40} color="#F59E0B" strokeWidth={1.5} />
        </div>
        <h2 style={{ ...styles.title, marginTop: 20 }}>Paiement en cours de traitement</h2>
        <p style={styles.sub}>Votre paiement est en cours de validation. Vous recevrez une confirmation par e-mail sous peu.</p>
        <Link href="/espace-partenaire" style={styles.btn}>Accéder à mon espace <ArrowRight size={16} /></Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={styles.card}>
        {/* Animated check */}
        <div style={{ ...styles.iconWrap, background: 'rgba(5,150,105,0.08)' }}>
          <CheckCircle size={48} color="#059669" strokeWidth={1.5} />
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginTop: 24, marginBottom: 10, textAlign: 'center' }}>
          Paiement confirmé 🎉
        </h1>
        <p style={{ fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 1.6, marginBottom: 32 }}>
          Votre cotisation a bien été reçue{email ? ` (confirmation envoyée à ${email})` : ''}.
          <br />Votre dossier est maintenant en cours de validation par notre équipe.
        </p>

        {/* Steps */}
        <div style={styles.stepsWrap}>
          {[
            { label: 'Inscription', done: true },
            { label: 'Paiement cotisation', done: true },
            { label: 'Validation dossier', done: false, current: true },
            { label: 'Accès plateforme', done: false },
          ].map(({ label, done, current }, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: done ? '#059669' : current ? '#F59E0B' : '#E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: (done || current) ? 'white' : '#9CA3AF',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 14, fontWeight: current ? 700 : 500, color: done ? '#059669' : current ? '#D97706' : '#9CA3AF' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
          <Link href="/espace-partenaire" style={styles.btn}>
            Accéder à mon espace partenaire <ArrowRight size={16} />
          </Link>
          <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
            Délai de validation habituel : 24–48h ouvrées
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  center: {
    minHeight: '100vh',
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40,
  },
  card: {
    background: 'white', borderRadius: 20, padding: '48px 56px',
    boxShadow: '0 8px 48px rgba(0,0,0,0.08)', maxWidth: 520, width: '100%',
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
    border: '1px solid #F3F4F6',
  },
  iconWrap: {
    width: 88, height: 88, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: 700, color: '#111827', textAlign: 'center' as const },
  sub: { fontSize: 14, color: '#6B7280', textAlign: 'center' as const, maxWidth: 380 },
  stepsWrap: {
    display: 'flex', flexDirection: 'column' as const, gap: 14,
    background: '#F9FAFB', borderRadius: 12, padding: '20px 24px',
    border: '1px solid #F3F4F6', width: '100%',
  },
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px 28px', background: '#C0392B', borderRadius: 8,
    fontSize: 15, fontWeight: 700, color: 'white', textDecoration: 'none',
    width: '100%',
  },
  btnOutline: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '12px 24px', border: '1.5px solid #E5E7EB', borderRadius: 8,
    fontSize: 14, fontWeight: 600, color: '#374151', textDecoration: 'none',
  },
  spinner: {
    width: 48, height: 48, borderRadius: '50%',
    border: '3px solid #F3F4F6', borderTopColor: '#C0392B',
    animation: 'spin 0.8s linear infinite',
  },
}
