'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

const SERIF = 'var(--font-serif, "DM Serif Display", Georgia, serif)'
const SANS  = 'var(--font-sans, DM Sans, sans-serif)'

export default function ReinitialiserMotDePassePage() {
  const router = useRouter()
  const [password, setPassword]           = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPwd, setShowPwd]             = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [done, setDone]                   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== passwordConfirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
    setTimeout(() => router.push('/connexion'), 3000)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        {/* Côté gauche */}
        <div style={{ background: '#111111', color: 'white', padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -200, right: -100, width: 600, height: 600, borderRadius: '50%', background: 'rgba(192,57,43,0.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, marginBottom: 20, color: 'white', lineHeight: 1.2 }}>
              Nouveau<br />
              <span style={{ color: '#C0392B' }}>mot de passe</span>
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 380, lineHeight: 1.7 }}>
              Choisissez un mot de passe sécurisé d'au moins 8 caractères. Vous serez redirigé vers la connexion après la mise à jour.
            </p>
          </div>
        </div>

        {/* Côté droit */}
        <div style={{ background: 'white', padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
            <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, marginBottom: 40 }}>
              Désamianteurs<span style={{ color: '#C0392B' }}>.com</span>
            </div>

            {done ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E6F9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h2 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, marginBottom: 10, color: '#111' }}>Mot de passe mis à jour !</h2>
                <p style={{ fontFamily: SANS, fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
                  Vous allez être redirigé vers la connexion dans quelques secondes.
                </p>
                <Link href="/connexion" className="btn btn-red" style={{ textTransform: 'none', letterSpacing: 0, padding: '13px 28px', fontWeight: 600 }}>
                  Se connecter
                </Link>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: SANS, fontSize: 24, fontWeight: 700, marginBottom: 6, color: '#111' }}>
                  Réinitialiser le mot de passe
                </h2>
                <p style={{ fontFamily: SANS, color: '#9CA3AF', fontSize: 14, marginBottom: 28 }}>
                  Choisissez votre nouveau mot de passe.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: SANS, fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4B5563' }}>Nouveau mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPwd ? 'text' : 'password'} className="input" placeholder="8 caractères minimum" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                      <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                        {showPwd ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: SANS, fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4B5563' }}>Confirmer le mot de passe</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showConfirm ? 'text' : 'password'} className="input" placeholder="Confirmez le mot de passe" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required style={{ paddingRight: 44 }} />
                      <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                        {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && <div className="form-error">{error}</div>}

                  <button type="submit" className="btn btn-red" style={{ width: '100%', padding: 16, textTransform: 'none', letterSpacing: 0, fontWeight: 600 }} disabled={loading}>
                    {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
