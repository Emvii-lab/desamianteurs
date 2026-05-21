'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, CheckCircle, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

const SERIF = 'var(--font-serif, "DM Serif Display", Georgia, serif)'
const SANS  = 'var(--font-sans, DM Sans, sans-serif)'

async function getRoleRedirect(supabase: ReturnType<typeof import('@/lib/supabase').createClient>, userId: string): Promise<string> {
  try {
    const [adminRes, partnerRes] = await Promise.all([
      supabase.from('admins').select('id').eq('user_id', userId).maybeSingle(),
      supabase.from('partners').select('id').eq('user_id', userId).maybeSingle(),
    ])
    if (adminRes.data)   return '/espace-admin'
    if (partnerRes.data) return '/espace-partenaire'
  } catch {}
  return '/espace-client'
}

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Filet de sécurité : si Supabase ne répond pas du tout (réseau coupé, service down)
    const timeout = setTimeout(() => {
      setLoading(false)
      setError('Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.')
    }, 12000)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      clearTimeout(timeout)

      if (authError || !data.user) {
        const code = authError?.code ?? ''
        const status = authError?.status ?? 0

        if (status === 429 || code.includes('rate') || code.includes('limit')) {
          setError('Trop de tentatives. Patientez quelques minutes avant de réessayer.')
        } else if (code === 'invalid_credentials' || code === 'user_not_found' || status === 400) {
          setError('Email ou mot de passe incorrect.')
        } else if (code === 'email_not_confirmed') {
          setError('Veuillez confirmer votre adresse email avant de vous connecter.')
        } else {
          setError(authError?.message || 'Email ou mot de passe incorrect.')
        }
        setLoading(false)
        return
      }

      const redirectPath = await getRoleRedirect(supabase, data.user.id)
      router.push(redirectPath)
    } catch (err) {
      clearTimeout(timeout)
      console.error('Login error:', err)
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar — visible sur mobile uniquement (desktop a son propre branding) */}
      <div className="mobile-only" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <Navbar />
      </div>

      <div className="connexion-split" style={{ flex: 1, display: 'grid' }}>

        {/* Côté gauche — noir */}
        <div className="connexion-left" style={{ background: '#111111', color: 'white', padding: '80px', paddingTop: '100px', flexDirection: 'column', justifyContent: 'flex-start', position: 'relative', overflow: 'hidden' }}>
          <motion.div
            animate={{ y: [0, -14, 0], scale: [1, 1.02, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', bottom: -160, right: -120, width: 380, height: 380, borderRadius: '50%', background: 'rgba(192,57,43,0.20)', pointerEvents: 'none' }}
          />
          <motion.div
            animate={{ y: [0, 10, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            style={{ position: 'absolute', top: -160, left: -140, width: 300, height: 300, borderRadius: '50%', background: 'rgba(192,57,43,0.11)', pointerEvents: 'none' }}
          />

          <div style={{ position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, marginBottom: 20, lineHeight: 1.2, margin: '0 0 20px' }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 14, fontFamily: SANS }}>
                Bon retour
              </span>
              <span style={{ color: 'white' }}>Désamianteurs</span>
              <span style={{ color: '#C0392B' }}>.com</span>
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 56, maxWidth: 380, lineHeight: 1.7 }}>
              Accédez à votre espace personnel pour gérer vos demandes, devis et messages.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { Icon: Lock,           label: 'Connexion 100% sécurisée' },
                { Icon: CheckCircle,    label: 'Professionnels certifiés vérifiés' },
                { Icon: MessageSquare,  label: 'Messagerie intégrée' },
              ].map(({ Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(192,57,43,0.12)', color: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Côté droit — blanc */}
        <div className="connexion-right" style={{ background: 'white', padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          <Link href="/" className="connexion-back" style={{ position: 'absolute', top: 32, right: 48, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#C0392B', textDecoration: 'none', fontFamily: SANS }}>
            <ArrowLeft size={15} /> Retour à l&apos;accueil
          </Link>

          <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
            {/* Logo — masqué sur mobile (Navbar l'affiche déjà) */}
            <div className="connexion-logo" style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, marginBottom: 40 }}>
              Désamianteurs<span style={{ color: '#C0392B' }}>.com</span>
            </div>

            <h2 style={{ fontFamily: SANS, fontSize: 24, fontWeight: 700, marginBottom: 6, color: '#111' }}>Se connecter</h2>
            <p style={{ fontFamily: SANS, color: '#9CA3AF', fontSize: 14, marginBottom: 28 }}>Entrez vos identifiants pour accéder à votre espace.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontFamily: SANS, fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4B5563' }}>Adresse email</label>
                <input type="email" className="input" placeholder="jean.dupont@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: SANS, fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4B5563' }}>Mot de passe</label>
                <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <Link href="/mot-de-passe-oublie" style={{ fontFamily: SANS, fontSize: 12, color: '#C0392B', fontWeight: 600, textDecoration: 'none' }}>Mot de passe oublié ?</Link>
                </div>
              </div>

              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="btn btn-red" style={{ width: '100%', padding: 16, textTransform: 'none', letterSpacing: 0, fontWeight: 600 }} disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
              <span style={{ fontFamily: SANS, fontSize: 12, color: '#9CA3AF' }}>ou</span>
              <div style={{ flex: 1, height: 1, background: '#F3F4F6' }} />
            </div>

            <button onClick={handleGoogle} className="btn btn-outline" style={{ width: '100%', padding: 16, textTransform: 'none', letterSpacing: 0, gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
              Continuer avec Google
            </button>

            <p style={{ textAlign: 'center', marginTop: 40, fontFamily: SANS, fontSize: 14, color: '#9CA3AF' }}>
              Pas encore de compte ?{' '}
              <Link href="/inscription" style={{ color: '#C0392B', fontWeight: 700, textDecoration: 'none' }}>S&apos;inscrire gratuitement</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
