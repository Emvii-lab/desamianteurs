'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import { CheckCircle2, Phone, LayoutDashboard, Mail, ShieldCheck } from 'lucide-react'
import { TIMINGS, BUDGET_OPTIONS, ACCESSIBILITY_OPTIONS, FLOOR_OPTIONS, SITUATIONS_PHASE, SITUATIONS_CONTEXT } from '@/lib/constants'
import { ServiceType, PropertyType } from '@/lib/types'
import { useDemandeForm } from '@/hooks/useDemandeForm'
import { demandeService } from '@/services/demandeService'
import { Step1Besoin } from './components/Step1Besoin'
import { Step2Localisation } from './components/Step2Localisation'
import { Step3Coordonnees } from './components/Step3Coordonnees'

interface FormulaireClientProps {
  initialServices: ServiceType[]
  initialPropertyTypes: PropertyType[]
}

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { n: 1, label: 'Votre besoin' },
    { n: 2, label: 'Localisation' },
    { n: 3, label: 'Vos coordonnées' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
              background: current === s.n ? 'var(--red)' : current > s.n ? '#374151' : '#E5E7EB',
              color: current === s.n || current > s.n ? 'white' : '#9CA3AF',
            }}>
              {current > s.n ? '✓' : s.n}
            </div>
            <span style={{
              fontSize: 14, fontWeight: current === s.n ? 700 : 500,
              color: current === s.n ? '#C0392B' : current > s.n ? '#374151' : '#9CA3AF',
            }}>{s.label}</span>
          </div>
          {i < 2 && (
            <div style={{ flex: 1, height: 2, margin: '0 16px', background: current > s.n ? '#111' : '#E5E7EB' }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function FormulaireClient({ initialServices, initialPropertyTypes }: FormulaireClientProps) {
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<File[]>([])
  const [authMode, setAuthMode] = useState<'create' | 'login'>('create')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedInName, setLoggedInName] = useState('')
  const [prosInZone, setProsInZone] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useDemandeForm()
  const { watch, trigger, getValues } = form

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setIsLoggedIn(true)
        setLoggedInName(data.user.user_metadata?.prenom ?? data.user.email ?? '')
      }
    })
  }, [])

  useEffect(() => {
    if (step === 3) {
      const { postalCode, city } = getValues()
      if (postalCode || city) {
        const supabase = createClient()
        supabase
          .from('public_partners')
          .select('id', { count: 'exact', head: true })
          .then(({ count }) => setProsInZone(count ?? 0))
      }
    }
  }, [step])

  const nextStep = async () => {
    const fields = step === 1 
      ? ['serviceTypes', 'userType', 'propertyType', 'timing', 'budget'] as const
      : ['streetAddress', 'city', 'postalCode', 'floor', 'elevator'] as const
    
    const isValid = await trigger(fields)
    if (isValid) setStep(prev => prev + 1)
  }

  const prevStep = () => setStep(prev => prev - 1)

  const onSubmit = async () => {
    const isValid = await trigger()
    if (!isValid) return

    setLoading(true)
    setError('')
    try {
      await demandeService.submitDemande(getValues(), files, isLoggedIn, authMode)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Recap logic
  const values = watch()
  const TIMING_MAP = Object.fromEntries(TIMINGS.map(o => [o.id, o.label]))
  const BUDGET_MAP = Object.fromEntries(BUDGET_OPTIONS.map(o => [o.id, o.label]))
  const PHASE_MAP = Object.fromEntries([...SITUATIONS_PHASE, ...SITUATIONS_CONTEXT].map(o => [o.id, o.label]))
  const FLOOR_MAP = Object.fromEntries(FLOOR_OPTIONS.map(o => [o.id, o.label]))

  const recap = [
    values.serviceTypes?.length > 0 && { label: 'Prestation', value: initialServices.filter(s => values.serviceTypes.includes(s.id)).map(s => s.name).join(', ') },
    values.userType && { label: 'Profil', value: values.userType },
    values.propertyType && { label: 'Bien', value: initialPropertyTypes.find(p => p.id === values.propertyType)?.label ?? values.propertyType },
    values.surface && { label: 'Surface', value: `${values.surface} m²` },
    values.city && { label: 'Ville', value: values.city },
    values.timing && { label: 'Délai', value: TIMING_MAP[values.timing] ?? values.timing },
    values.budget && { label: 'Budget', value: BUDGET_MAP[values.budget] ?? values.budget },
  ].filter(Boolean) as { label: string; value: string }[]

  if (submitted) {
    return (
      <div className="fade-in">
        <Navbar />
        <section style={{ background: '#111', padding: '100px 40px', textAlign: 'center' }}>
          <CheckCircle2 size={64} color="var(--red)" style={{ marginBottom: 24 }} />
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Demande envoyée !</h1>
          <p style={{ color: '#9CA3AF', maxWidth: 500, margin: '0 auto 40px' }}>
            Des professionnels certifiés de votre zone vous contacteront sous 48h.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href="/espace-client" className="btn btn-red">Accéder à mon espace</Link>
            <Link href="/" className="btn btn-outline">Retour à l'accueil</Link>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="fade-in">
      <Navbar />
      <section style={{ background: '#111', padding: '72px 40px 56px', textAlign: 'center' }}>
        <div className="badge badge-red" style={{ marginBottom: 28 }}>GRATUIT ET SANS ENGAGEMENT</div>
        <h1 style={{ color: 'white', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700 }}>
          Déposez votre demande<br /><em style={{ color: 'var(--red)', fontStyle: 'normal' }}>en quelques minutes</em>
        </h1>
      </section>

      <section style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '20px 40px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <StepIndicator current={step} />
        </div>
      </section>

      <div style={{ background: '#F5F5F5', padding: '40px 40px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          <div className="card" style={{ padding: 48 }}>
            {step === 1 && (
              <Step1Besoin 
                form={form} 
                services={initialServices} 
                propertyTypes={initialPropertyTypes} 
                onNext={nextStep} 
                files={files} 
                onFilesChange={setFiles} 
              />
            )}
            {step === 2 && (
              <Step2Localisation 
                form={form} 
                onNext={nextStep} 
                onBack={prevStep} 
              />
            )}
            {step === 3 && (
              <Step3Coordonnees 
                form={form} 
                onBack={prevStep} 
                onSubmit={onSubmit} 
                loading={loading} 
                error={error} 
                isLoggedIn={isLoggedIn} 
                loggedInName={loggedInName} 
                authMode={authMode} 
                setAuthMode={setAuthMode} 
              />
            )}
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {step === 3 && (
              <div style={{ background: '#111', borderRadius: 10, padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--red)', lineHeight: 1 }}>{prosInZone ?? '—'}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginTop: 8 }}>professionnels certifiés</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>dans votre zone recevront votre demande</div>
              </div>
            )}

            {recap.length > 0 && (
              <div className="card" style={{ padding: '20px 24px' }}>
                <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 20 }}>Votre demande</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {recap.map((r, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{r.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{r.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <ShieldCheck size={16} color="var(--red)" />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Vos garanties</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Devis 100% gratuits', 'Pros certifiés vérifiés', 'Réponse sous 48h'].map(g => (
                  <li key={g} style={{ fontSize: 13, color: '#4B5563', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={14} color="#059669" /> {g}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  )
}
