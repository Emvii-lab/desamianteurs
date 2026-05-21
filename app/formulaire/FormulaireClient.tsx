'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import { CheckCircle2, ShieldCheck, Check, Phone, LayoutDashboard, Mail } from 'lucide-react'
import { TIMINGS, BUDGET_OPTIONS, FLOOR_OPTIONS } from '@/lib/constants'
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

import { motion } from 'framer-motion'

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { n: 1, label: 'Votre besoin' },
    { n: 2, label: 'Localisation' },
    { n: 3, label: 'Vos coordonnées' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {steps.map((s, i) => {
        const done   = current > s.n
        const active = current === s.n
        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {/* Cercle animé */}
              <motion.div
                key={`${s.n}-${done ? 'done' : active ? 'active' : 'pending'}`}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: done ? 15 : 13, fontWeight: 700, flexShrink: 0,
                  background: active ? 'var(--red)' : done ? '#E5E7EB' : '#F3F4F6',
                  color:  active ? 'white' : done ? '#6B7280' : '#9CA3AF',
                  border: done ? '1.5px solid #D1D5DB' : 'none',
                }}
              >
                {done ? '✓' : s.n}
              </motion.div>

              {/* Label animé */}
              <motion.span
                className="step-label"
                animate={{
                  color: active ? '#C0392B' : done ? '#9CA3AF' : '#9CA3AF',
                  fontWeight: active ? 700 : 500,
                }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: 14 }}
              >
                {s.label}
              </motion.span>
            </div>

            {/* Connecteur */}
            {i < 2 && (
              <div style={{ flex: 1, height: 2, margin: '0 16px', background: '#E5E7EB', borderRadius: 1, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: done ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  style={{ height: '100%', background: '#D1D5DB', borderRadius: 1 }}
                />
              </div>
            )}
          </div>
        )
      })}
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
  const stepperRef = useRef<HTMLElement>(null)

  const form = useDemandeForm()
  const { watch, trigger, getValues } = form

  // Scroll vers le stepper à chaque changement d'étape (sauf au premier rendu)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (!stepperRef.current) return
    const top = stepperRef.current.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }, [step])

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
    if (step !== 3) return

    const { postalCode, department, serviceTypes } = getValues()

    // Département : champ dédié ou 2 premiers chiffres du CP
    const deptCode = department || (postalCode ? postalCode.slice(0, 2) : null)
    if (!deptCode) return

    // Mapping code service → type(s) partenaire
    const SERVICE_TO_PARTNER: Record<string, string[]> = {
      diagnostic_amiante:    ['diagnostician'],
      moe_amiante_plomb:     ['project_manager'],
      intervention_ss4:      ['asbestos_remover'],
      mise_en_securite:      ['asbestos_remover'],
      desamiantage:          ['asbestos_remover'],
      preleveur_air_materiaux: ['sampler_lab'],
      conseil_juridique:     ['legal_expert', 'specialized_lawyer'],
    }

    const partnerTypes = [
      ...new Set((serviceTypes ?? []).flatMap(st => SERVICE_TO_PARTNER[st] ?? [])),
    ]

    createClient()
      .rpc('count_eligible_partners', {
        dept_code: deptCode,
        p_types:   partnerTypes.length > 0 ? partnerTypes : null,
      })
      .then(({ data }) => setProsInZone(typeof data === 'number' ? data : 0))
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
    const businessFields = [
      'serviceTypes', 'userType', 'propertyType', 'timing', 'budget',
      'streetAddress', 'city', 'postalCode', 'floor', 'elevator',
    ] as const

    // undefined → trigger() sans argument = valide TOUS les champs (mode création compte)
    // login     → valide les champs métier + email/password uniquement
    // connecté  → valide les champs métier uniquement (email/mdp non affichés)
    const fieldsToValidate = isLoggedIn
      ? businessFields
      : authMode === 'login'
        ? ([...businessFields, 'email', 'password'] as const)
        : undefined

    const isValid = await trigger(fieldsToValidate as Parameters<typeof trigger>[0])
    if (!isValid) return

    setLoading(true)
    setError('')
    try {
      await demandeService.submitDemande(getValues(), files, isLoggedIn, authMode)
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  // Recap logic
  const values = watch()
  const TIMING_MAP = Object.fromEntries(TIMINGS.map(o => [o.id, o.label]))
  const BUDGET_MAP = Object.fromEntries(BUDGET_OPTIONS.map(o => [o.id, o.label]))
  const FLOOR_MAP = Object.fromEntries(FLOOR_OPTIONS.map(o => [o.id, o.label]))

  const fullAddress = [
    values.streetAddress,
    values.complement,
    [values.postalCode, values.city].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ')

  const recap = [
    values.serviceTypes?.length > 0 && { label: 'Prestation', value: initialServices.filter(s => values.serviceTypes.includes(s.id)).map(s => s.name).join(', ') },
    values.userType && { label: 'Profil', value: values.userType },
    values.propertyType && { label: 'Bien', value: initialPropertyTypes.find(p => p.id === values.propertyType)?.label ?? values.propertyType },
    values.surface && { label: 'Surface', value: `${values.surface} m²` },
    fullAddress && { label: 'Adresse', value: fullAddress },
    values.floor && { label: 'Étage', value: FLOOR_MAP[values.floor] ?? values.floor },
    values.elevator && { label: 'Ascenseur', value: values.elevator === 'oui' ? 'Oui' : 'Non' },
    values.timing && { label: 'Délai', value: TIMING_MAP[values.timing] ?? values.timing },
    values.budget && { label: 'Budget', value: BUDGET_MAP[values.budget] ?? values.budget },
    values.description && { label: 'Description', value: values.description },
  ].filter(Boolean) as { label: string; value: string }[]

  if (submitted) {
    return (
      <div className="fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <section className="formulaire-success" style={{ flex: 1, padding: '72px 24px 80px', textAlign: 'center' }}>

          {/* Icône */}
          <div className="formulaire-success-icon">
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(192,57,43,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={28} color="var(--red)" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Titre */}
          <h1 className="formulaire-success-title" style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.2, maxWidth: 640, margin: '0 auto 20px' }}>
            {!isLoggedIn && authMode === 'create'
              ? 'Votre compte a bien été créé et votre demande envoyée !'
              : 'Votre demande a bien été envoyée !'}
          </h1>

          {/* Sous-titre */}
          <p className="formulaire-success-text" style={{ fontSize: 15, maxWidth: 560, margin: '0 auto 4px' }}>
            Votre demande a été transmise à des professionnels certifiés de votre zone.
          </p>
          <p className="formulaire-success-text" style={{ fontSize: 15, maxWidth: 560, margin: '0 auto 48px' }}>
            Elle sera traitée en moyenne sous <strong>48h</strong>.
          </p>

          {/* Cartes info */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', maxWidth: 580, margin: '0 auto 48px', textAlign: 'left' }}>
            {([
              { Icon: Phone,           title: 'Les pros vous contactent sous 48h',              desc: 'Vous recevrez leurs devis directement par e-mail et dans votre espace client.' },
              { Icon: LayoutDashboard, title: "Suivez votre demande dans l'espace client",       desc: 'Comparez les devis, échangez avec les pros et acceptez la meilleure offre.' },
              { Icon: Mail,            title: 'Un e-mail de confirmation vous a été envoyé',     desc: 'Vérifiez votre boîte mail (et vos spams) pour retrouver le récapitulatif de votre demande.' },
            ] as const).map(({ Icon, title, desc }, i) => (
              <div key={title} style={{ display: 'flex', gap: 16, padding: '18px 24px', borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none', alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(192,57,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="var(--red)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/espace-client" className="btn btn-red">Accéder à mon espace client</Link>
            <Link href="/" className="btn btn-outline">Retour à l&apos;accueil</Link>
          </div>

        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="fade-in">
      <Navbar />
      <section className="formulaire-hero" style={{ background: '#111', textAlign: 'center' }}>
        <div className="badge badge-red" style={{ marginBottom: 28 }}>GRATUIT ET SANS ENGAGEMENT</div>
        <h1 style={{ color: 'white', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)' }}>
          Déposez votre demande<br /><em style={{ color: 'var(--red)', fontStyle: 'normal' }}>en quelques minutes</em>
        </h1>
      </section>

      <section ref={stepperRef} className="formulaire-stepper" style={{ background: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <StepIndicator current={step} />
        </div>
      </section>

      <div className="formulaire-content" style={{ background: '#F5F5F5' }}>
        <div className="formulaire-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 32, alignItems: 'start' }}>
          <div className="formulaire-card card" style={{ padding: 48 }}>
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

          <aside className="formulaire-aside" style={{ flexDirection: 'column', gap: 24, position: 'sticky', top: 96, alignSelf: 'start' }}>
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                style={{ background: '#111', borderRadius: 'var(--radius)', padding: '24px 20px', textAlign: 'center' }}
              >
                <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--red)', lineHeight: 1 }}>{prosInZone ?? '—'}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginTop: 8 }}>professionnels certifiés</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>dans votre zone recevront votre demande</div>
              </motion.div>
            )}

            {recap.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
                style={{
                background: 'white',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--gray-200)',
                padding: '20px 22px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF' }}>
                    Votre demande
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {recap.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500, flexShrink: 0, paddingTop: 1 }}>
                        {r.label}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111', textAlign: 'right', lineHeight: 1.4, maxWidth: '62%' }}>
                        {r.label === 'Prestation'
                          ? r.value.split(', ').map((v, j) => <span key={j} style={{ display: 'block' }}>{v}</span>)
                          : r.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Garanties */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
              style={{
                background: 'white',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--gray-200)',
                padding: '18px 22px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #F3F4F6' }}>
                <ShieldCheck size={13} color="var(--red)" strokeWidth={2.5} />
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF' }}>
                  Vos garanties
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {['Devis 100% gratuits', 'Pros certifiés vérifiés', 'Réponse sous 48h'].map(g => (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <CheckCircle2 size={14} color="#059669" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{g}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  )
}
