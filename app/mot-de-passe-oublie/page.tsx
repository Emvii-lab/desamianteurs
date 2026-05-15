'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Footer from '@/components/Footer'

const SERIF = 'var(--font-serif, "DM Serif Display", Georgia, serif)'
const SANS  = 'var(--font-sans, DM Sans, sans-serif)'

export default function MotDePasseOubliePage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        {/* Côté gauche — noir */}
        <div style={{ background: '#111111', color: 'white', padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -200, right: -100, width: 600, height: 600, borderRadius: '50%', background: 'rgba(192,57,43,0.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, marginBottom: 20, color: 'white', lineHeight: 1.2 }}>
              Mot de passe<br />
              <span style={{ color: '#C0392B' }}>oublié ?</span>
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 380, lineHeight: 1.7 }}>
              Pas de panique. Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>
        </div>

        {/* Côté droit — blanc */}
        <div style={{ background: 'white', padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <Link href="/connexion" style={{ position: 'absolute', top: 32, right: 48, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#C0392B', textDecoration: 'none', fontFamily: SANS }}>
            <ArrowLeft size={15} /> Retour à la connexion
          </Link>

          <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
            {/* Logo */}
            <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, marginBottom: 40 }}>
              Désamianteurs<span style={{ color: '#C0392B' }}>.fr</span>
            </div>

            {sent ? (
              /* État succès */
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(192,57,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Mail size={32} color="#C0392B" strokeWidth={1.5} />
                </div>
                <h2 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#111' }}>
                  E-mail envoyé !
                </h2>
                <p style={{ fontFamily: SANS, fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 32 }}>
                  Si un compte existe avec l'adresse <strong style={{ color: '#111' }}>{email}</strong>,
                  vous recevrez un lien de réinitialisation dans quelques minutes.
                  Pensez à vérifier vos spams.
                </p>
                <Link href="/connexion" className="btn btn-red" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600, padding: '13px 28px' }}>
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              /* Formulaire */
              <>
                <h2 style={{ fontFamily: SANS, fontSize: 24, fontWeight: 700, marginBottom: 6, color: '#111' }}>
                  Réinitialiser le mot de passe
                </h2>
                <p style={{ fontFamily: SANS, color: '#9CA3AF', fontSize: 14, marginBottom: 28 }}>
                  Entrez votre adresse e-mail pour recevoir le lien de réinitialisation.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: SANS, fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4B5563' }}>
                      Adresse email
                    </label>
                    <input
                      type="email" className="input"
                      placeholder="jean.dupont@email.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {error && <div className="form-error">{error}</div>}

                  <button type="submit" className="btn btn-red" style={{ width: '100%', padding: 16, textTransform: 'none', letterSpacing: 0, fontWeight: 600 }} disabled={loading}>
                    {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                  </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 32, fontFamily: SANS, fontSize: 14, color: '#9CA3AF' }}>
                  Vous vous souvenez ?{' '}
                  <Link href="/connexion" style={{ color: '#C0392B', fontWeight: 700, textDecoration: 'none' }}>
                    Se connecter
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
