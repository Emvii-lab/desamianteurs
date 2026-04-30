'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase'
import CustomSelect from '@/components/ui/CustomSelect'
import GoogleAddressMap from '@/components/ui/GoogleAddressMap'
import {
  ChevronRight, ChevronLeft, CheckCircle2,
  MapPin, ShieldCheck, User, Building2, Euro,
  Maximize2, Calendar, Search, Wrench, Shield,
  Home, FlaskConical, Layers, AlertCircle,
  Eye, EyeOff, Send, Phone, LayoutDashboard, Mail,
} from 'lucide-react'
import { 
  ICON_MAP, SITUATIONS_PHASE, SITUATIONS_CONTEXT, 
  TIMINGS, BUDGET_OPTIONS, ACCESSIBILITY_OPTIONS, 
  FLOOR_OPTIONS, ELEVATOR_OPTIONS, USER_TYPES, CATEGORY_MAP,
  INTERVENTION_TYPES_SS3, PHASES_MOE, ACCREDITATIONS_LABO
} from '@/lib/constants'

type Step = 1 | 2 | 3

type ServiceType = {
  id: string
  name: string
  description: string
  code: string
}

type PropertyType = {
  id: string
  label: string
  category?: string
  code: string
}

interface FormulaireClientProps {
  initialServices: ServiceType[]
  initialPropertyTypes: PropertyType[]
}

function StepIndicator({ current }: { current: Step }) {
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
              transition: 'all 0.25s',
              background: current === s.n ? 'var(--red)' : current > s.n ? '#374151' : '#E5E7EB',
              border: 'none',
              color: current === s.n || current > s.n ? 'white' : '#9CA3AF',
              fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
            }}>
              {current > s.n ? '✓' : s.n}
            </div>
            <span style={{
              fontSize: 14, fontWeight: current === s.n ? 700 : 500,
              fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
              color: current === s.n ? '#C0392B' : current > s.n ? '#374151' : '#9CA3AF',
              transition: 'color 0.25s',
            }}>
              {s.label}
            </span>
          </div>
          {i < 2 && (
            <div style={{
              flex: 1, height: 2, margin: '0 16px',
              background: current > s.n ? '#111' : '#E5E7EB',
              transition: 'background 0.25s',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function FormulaireClient({ initialServices, initialPropertyTypes }: FormulaireClientProps) {
  const [step, setStep] = useState<Step>(1)
  const [services] = useState<ServiceType[]>(initialServices)
  const [allPropertyTypes] = useState<PropertyType[]>(initialPropertyTypes)
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [userType, setUserType] = useState<string>('')
  
  // States du formulaire
  const [propertyType, setPropertyType] = useState<string>('')
  const [surface, setSurface] = useState<string>('')
  const [situationPhase, setSituationPhase] = useState<string>('')
  const [situationContext, setSituationContext] = useState<string[]>([])
  const [interventionTypes, setInterventionTypes] = useState<string[]>([])
  const [moePhase, setMoePhase] = useState<string>('')
  const [accreditations, setAccreditations] = useState<string[]>([])
  const [timing, setTiming] = useState<string>('')
  const [budget, setBudget] = useState<string>('')
  const [addressSearch, setAddressSearch] = useState<string>('')
  const [streetAddress, setStreetAddress] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [postalCode, setPostalCode] = useState<string>('')
  const [department, setDepartment] = useState<string>('')
  const [complement, setComplement] = useState<string>('')
  const [accessibility, setAccessibility] = useState<string>('')
  const [floor, setFloor] = useState<string>('')
  const [elevator, setElevator] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [files, setFiles] = useState<File[]>([])
  const [step1Errors, setStep1Errors] = useState<string[]>([])
  
  // Step 3 (Auth)
  const [authMode, setAuthMode] = useState<'create' | 'login'>('create')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedInName, setLoggedInName] = useState('')
  const [prosInZone, setProsInZone] = useState<number | null>(null)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [s3Email, setS3Email] = useState('')
  const [s3Tel, setS3Tel] = useState('')
  const [s3Password, setS3Password] = useState('')
  const [s3PasswordConfirm, setS3PasswordConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showPwdConfirm, setShowPwdConfirm] = useState(false)
  const [cgu, setCgu] = useState(false)
  const [notifs, setNotifs] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [step3Loading, setStep3Loading] = useState(false)
  const [step3Error, setStep3Error] = useState('')

  // PERSISTENCE DU FORMULAIRE
  useEffect(() => {
    const saved = localStorage.getItem('desamianteurs_form_draft')
    if (saved) {
      try {
        const d = JSON.parse(saved)
        if (d.step) setStep(d.step)
        if (d.serviceTypes) setServiceTypes(d.serviceTypes)
        if (d.userType) setUserType(d.userType)
        if (d.propertyType) setPropertyType(d.propertyType)
        if (d.surface) setSurface(d.surface)
        if (d.streetAddress) setStreetAddress(d.streetAddress)
        if (d.city) setCity(d.city)
        if (d.postalCode) setPostalCode(d.postalCode)
        if (d.complement) setComplement(d.complement)
        if (d.timing) setTiming(d.timing)
        if (d.budget) setBudget(d.budget)
        if (d.description) setDescription(d.description)
        if (d.situationPhase) setSituationPhase(d.situationPhase)
        if (d.situationContext) setSituationContext(d.situationContext)
        if (d.interventionTypes) setInterventionTypes(d.interventionTypes)
        if (d.moePhase) setMoePhase(d.moePhase)
        if (d.accreditations) setAccreditations(d.accreditations)
        if (d.accessibility) setAccessibility(d.accessibility)
        if (d.floor) setFloor(d.floor)
        if (d.elevator) setElevator(d.elevator)
        if (d.prenom) setPrenom(d.prenom)
        if (d.nom) setNom(d.nom)
        if (d.s3Email) setS3Email(d.s3Email)
        if (d.s3Tel) setS3Tel(d.s3Tel)
      } catch (e) { console.error("Error loading draft", e) }
    }
  }, [])

  useEffect(() => {
    if (submitted) return
    const draft = {
      step, serviceTypes, userType, propertyType, surface,
      streetAddress, city, postalCode, complement, timing,
      budget, description, situationPhase, situationContext,
      interventionTypes, moePhase, accreditations,
      accessibility, floor, elevator, prenom, nom, s3Email, s3Tel
    }
    localStorage.setItem('desamianteurs_form_draft', JSON.stringify(draft))
  }, [
    submitted, step, serviceTypes, userType, propertyType, surface,
    streetAddress, city, postalCode, complement, timing,
    budget, description, situationPhase, situationContext,
    interventionTypes, moePhase, accreditations,
    accessibility, floor, elevator, prenom, nom, s3Email, s3Tel
  ])

  // Vérifie la session Supabase + compte les pros dans la zone quand on arrive au step 3
  useEffect(() => {
    if (step !== 3) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setIsLoggedIn(true)
        setLoggedInName(data.user.user_metadata?.prenom ?? data.user.email ?? '')
      }
    })
    if (postalCode || city) {
      supabase
        .from('public_partners')
        .select('id', { count: 'exact', head: true })
        .then(({ count }) => setProsInZone(count ?? 0))
    }
  }, [step, postalCode, city])

  async function handleSubmitDemande() {
    // Récapitulatif complet pour Debug
    console.log("[FORM] Starting submission. Data Recap:", {
      isLoggedIn,
      authMode,
      identity: { prenom, nom, email: s3Email, tel: s3Tel },
      userType,
      serviceTypes,
      propertyType,
      surface,
      city,
      postalCode,
      streetAddress,
      timing,
      budget,
      filesCount: files.length
    })

    setStep3Error('')
    setStep3Loading(true)
    
    // On crée un client SANS PERSISTANCE au début
    const { createBrowserClient } = await import('@supabase/ssr')
    let supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )
    
    console.log("[FORM] Non-persistent Supabase client initialized")

    try {
      if (!isLoggedIn) {
        if (authMode === 'create') {
          console.log("[FORM] Mode: Create account. Calling signUp directly...")
          
          if (!cgu) { 
            setStep3Error('Veuillez accepter les Conditions Générales d\'Utilisation.')
            setStep3Loading(false)
            return 
          }
          if (s3Password !== s3PasswordConfirm) { 
            setStep3Error('Les mots de passe ne correspondent pas.')
            setStep3Loading(false)
            return 
          }

          try {
            console.log("[FORM] Bypassing library: Manual fetch signUp...")
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
              method: 'POST',
              headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: s3Email,
                password: s3Password,
                data: {
                  prenom,
                  nom,
                  telephone: s3Tel,
                  client_type: CATEGORY_MAP[userType] || 'individual'
                }
              })
            })

            const authResult = await response.json()
            console.log("[FORM] Manual signUp result:", response.status, authResult)

            if (!response.ok) {
              if (authResult.msg?.includes("already registered")) {
                console.log("[FORM] User already exists, checking if we can proceed...")
              } else {
                throw new Error(authResult.msg || "Erreur d'inscription manuelle")
              }
            }

            if (!response.ok) throw new Error(authResult.msg || "Erreur d'inscription")

            const userId = authResult.id || authResult.user?.id
            if (!userId) throw new Error("Impossible de récupérer l'ID utilisateur après inscription.")
            
            console.log("[FORM] Manual signUp successful. User ID:", userId)
            
            if (authResult.session?.access_token) {
              console.log("[FORM] Injecting session manually into headers...")
              const { createBrowserClient } = await import('@supabase/ssr')
              supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { 
                  global: { headers: { Authorization: `Bearer ${authResult.session.access_token}` } },
                  auth: { persistSession: false }
                }
              ) as any
            }

            var currentUser = { id: userId, email: s3Email } as any
            
          } catch (e: any) {
            console.error("[FORM] Manual signUp failure:", e)
            setStep3Error(`Erreur d'inscription : ${e.message}`)
            setStep3Loading(false)
            return
          }
        } else {
          console.log("[FORM] Mode: Login. Bypassing library with manual fetch...")
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
              method: 'POST',
              headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: s3Email,
                password: s3Password,
              })
            })

            const authResult = await response.json()
            if (!response.ok) throw new Error(authResult.error_description || authResult.msg || "Erreur de connexion")

            console.log("[FORM] Manual signIn success")
            var currentUser = authResult.user
            var accessToken = authResult.access_token
          } catch (e: any) {
            console.error("[FORM] Manual signIn failure:", e)
            setStep3Error(`Erreur : ${e.message}`)
            setStep3Loading(false)
            return
          }
        }
      } else {
         // Déjà connecté
         console.log("[FORM] User already logged in, getting session...")
         const { data: { session } } = await supabase.auth.getSession()
         var currentUser = session?.user as any
         var accessToken = session?.access_token as any
      }

      if (!currentUser || !accessToken) throw new Error('Utilisateur non identifié.')

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

      // 2. Get/Create Client Row via FETCH
      console.log("[FORM] Fetching/Creating client row via manual fetch...")
      let cid: string | null = null
      
      const checkRes = await fetch(`${supabaseUrl}/rest/v1/clients?user_id=eq.${currentUser.id}&select=id`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${accessToken}` }
      })
      const checkData = await checkRes.json()
      
      if (checkData && checkData.length > 0) {
        cid = checkData[0].id
        console.log("[FORM] Existing client found via fetch:", cid)
      } else {
        console.log("[FORM] Creating new client via fetch...")
        const dbClientType = CATEGORY_MAP[userType] || 'individual'
        const createRes = await fetch(`${supabaseUrl}/rest/v1/clients`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            first_name: prenom || '',
            last_name: nom || '',
            email: s3Email || currentUser.email,
            phone: s3Tel || '',
            client_type: dbClientType
          })
        })
        const newData = await createRes.json()
        if (!createRes.ok) throw new Error(newData.message || "Erreur profil client (fetch)")
        cid = newData[0].id
        console.log("[FORM] New client created via fetch:", cid)
      }

      // 3. Create Quote via FETCH
      console.log("[FORM] Creating quote via manual fetch (safe columns only)...")
      const quoteRes = await fetch(`${supabaseUrl}/rest/v1/quotes`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          client_id: cid,
          property_type_id: propertyType,
          address_street: streetAddress,
          address_complement: complement,
          address_city: city,
          address_postal_code: postalCode,
          address_department: postalCode?.startsWith('97') ? postalCode.substring(0, 3) : postalCode?.substring(0, 2) || null,
          client_type: CATEGORY_MAP[userType] || 'individual',
          timeline: timing,
          budget: budget,
          description: description,
          surface_m2: parseFloat(surface) || 0,
          contact_first_name: prenom || '',
          contact_last_name: nom || '',
          contact_email: s3Email || currentUser.email,
          contact_phone: s3Tel || '',
          project_phase: [
            ...(situationPhase ? [situationPhase] : []),
            ...(situationContext || []),
            ...(moePhase ? [moePhase] : [])
          ],
          intervention_type: interventionTypes || [],
          sampling_type: accreditations || [],
          site_access: accessibility || null,
          floor: floor || null,
          has_elevator: elevator === 'oui',
          status: 'submitted'
        })
      })
      
      const quoteData = await quoteRes.json()
      if (!quoteRes.ok) throw new Error(quoteData.message || "Erreur devis (fetch)")
      
      const finalQuoteId = quoteData[0].id
      console.log("[FORM] Quote created successfully via fetch! ID:", finalQuoteId)

      // 4. UPLOAD FILES to Storage
      if (files.length > 0) {
        console.log("[FORM] Uploading files to bucket 'quote-documents'...")
        const uploadedPaths: string[] = []

        for (const file of files) {
          const filePath = `${finalQuoteId}/${file.name}`
          const storageRes = await fetch(`${supabaseUrl}/storage/v1/object/quote-documents/${filePath}`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${accessToken}`,
            },
            body: file
          })

          if (storageRes.ok) {
            uploadedPaths.push(filePath)
            console.log("[FORM] File uploaded:", file.name)
          } else {
            const err = await storageRes.json()
            console.error("[FORM] Upload error for", file.name, err)
          }
        }

        // Update quote with document paths
        if (uploadedPaths.length > 0) {
          await fetch(`${supabaseUrl}/rest/v1/quotes?id=eq.${finalQuoteId}`, {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ documents_url: uploadedPaths })
          })
        }
      }

      // 5. Create multi-services links via FETCH
      if (serviceTypes.length > 0) {
        console.log("[FORM] Linking services via fetch...")
        await fetch(`${supabaseUrl}/rest/v1/quote_service_types`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(serviceTypes.map(sid => ({
            quote_id: finalQuoteId,
            service_type_id: sid
          })))
        })
      }

      console.log("[FORM] All steps completed successfully via fetch!")
      localStorage.removeItem('desamianteurs_form_draft')
      setSubmitted(true)
    } catch (err: any) {
      console.error('[FORM] General submission error:', err)
      setStep3Error(err.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      console.log("[FORM] Finalizing submission state")
      setStep3Loading(false)
    }
  }

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size))
      const added = Array.from(newFiles).filter(f => !existing.has(f.name + f.size))
      return [...prev, ...added]
    })
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  const categoryValue = CATEGORY_MAP[userType]
  const propertyOptions = categoryValue
    ? allPropertyTypes.filter(p => !p.category || p.category === categoryValue)
    : []

  // Lookups pour le récapitulatif
  const BUDGET_MAP    = Object.fromEntries(BUDGET_OPTIONS.map(o => [o.id, o.label]))
  const TIMING_MAP    = Object.fromEntries(TIMINGS.map(o => [o.id, o.label]))
  const ACCESS_MAP    = Object.fromEntries(ACCESSIBILITY_OPTIONS.map(o => [o.id, o.label]))
  const PHASE_MAP     = Object.fromEntries([...SITUATIONS_PHASE, ...SITUATIONS_CONTEXT].map(o => [o.id, o.label]))
  const FLOOR_LABELS  = Object.fromEntries(FLOOR_OPTIONS.map(o => [o.id, o.label]))

  const situationValue = [situationPhase, ...situationContext]
    .filter(Boolean).map(id => PHASE_MAP[id] ?? id).join(' — ')

  const recap = [
    serviceTypes.length > 0 && { icon: <CheckCircle2 size={15} />, label: 'Type de prestation', value: services.filter(s => serviceTypes.includes(s.id)).map(s => s.name).join(', ') },
    userType       && { icon: <User size={15} />,      label: 'Vous êtes',              value: userType },
    propertyType   && { icon: <Building2 size={15} />, label: 'Type de bien',           value: allPropertyTypes.find(p => p.id === propertyType)?.label ?? propertyType },
    situationValue && { icon: <MapPin size={15} />,    label: 'La prestation se situe', value: situationValue },
    surface        && { icon: <Maximize2 size={15} />, label: 'Surface',                value: `${surface} m²` },
    timing         && { icon: <Calendar size={15} />,  label: 'Prestation prévue',      value: TIMING_MAP[timing] ?? timing },
    budget         && { icon: <Euro size={15} />,      label: 'Budget prévu',           value: BUDGET_MAP[budget] ?? budget },
    addressSearch  && { icon: <MapPin size={15} />,    label: 'Adresse',                value: complement ? `${addressSearch} — ${complement}` : addressSearch },
    accessibility  && { icon: <CheckCircle2 size={15} />, label: 'Accessibilité',       value: ACCESS_MAP[accessibility] ?? accessibility },
    floor          && { icon: <Building2 size={15} />, label: 'Étage',                  value: FLOOR_LABELS[floor] ?? floor },
    elevator       && { icon: <CheckCircle2 size={15} />, label: 'Ascenseur',           value: elevator === 'oui' ? 'Oui' : 'Non' },
  ].filter(Boolean) as { icon: any; label: string; value: string }[]

  if (submitted) {
    return (
      <div>
        <Navbar />
        <section style={{ background: '#111111', padding: '72px 40px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -180, left: -180, width: 480, height: 480, borderRadius: '50%', background: 'rgba(192,57,43,0.22)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -120, right: -120, width: 380, height: 380, borderRadius: '50%', background: 'rgba(192,57,43,0.22)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(192,57,43,0.18)', color: '#C0392B', padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', marginBottom: 28 }}>
              GRATUIT ET SANS ENGAGEMENT
            </div>
            <h1 style={{ fontFamily: 'var(--font-sans, DM Sans, sans-serif)', fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.15, color: 'white', fontWeight: 700, marginBottom: 20 }}>
              Déposez votre demande<br />
              <em style={{ color: '#C0392B', fontStyle: 'normal' }}>en quelques minutes</em>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto' }}>
              Des professionnels certifiés de votre zone vous répondent sous 24 h<br />avec des devis gratuits.
            </p>
          </div>
        </section>

        <section style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '18px 40px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center' }}>
            {[{ n: 1, label: 'Votre besoin' }, { n: 2, label: 'Localisation' }, { n: 3, label: 'Vos coordonnées' }].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 2 ? '#E5E7EB' : '#111', border: 'none', color: i < 2 ? '#9CA3AF' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>✓</div>
                  <span style={{ fontSize: 13, fontWeight: i === 2 ? 700 : 400, color: i === 2 ? '#111' : '#9CA3AF', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>{s.label}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, margin: '0 14px', background: '#C0392B' }} />}
              </div>
            ))}
          </div>
        </section>

        <div style={{ background: '#F5F5F5', minHeight: '70vh', padding: '64px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', marginBottom: 32 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(192,57,43,0.12)' }} />
            <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={32} color="#C0392B" strokeWidth={2.5} />
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-sans, DM Sans, sans-serif)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, textAlign: 'center', marginBottom: 16, maxWidth: 520 }}>
            {authMode === 'create'
              ? 'Votre compte a bien été créé et votre demande envoyée !'
              : 'Votre demande a bien été envoyée !'}
          </h1>

          <p style={{ fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 40, maxWidth: 460, lineHeight: 1.7, fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
            Votre demande a été transmise à des professionnels certifiés de votre zone.<br />
            Elle sera traitée en moyenne sous <strong style={{ color: '#111' }}>48h</strong>.
          </p>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', maxWidth: 560, width: '100%', overflow: 'hidden', marginBottom: 40 }}>
            {[
              { Icon: Phone, title: 'Les pros vous contactent sous 48h', sub: 'Vous recevrez leurs devis directement par e-mail et dans votre espace client.' },
              { Icon: LayoutDashboard, title: "Suivez votre demande dans l'espace client", sub: 'Comparez les devis, échangez avec les pros et acceptez la meilleure offre.' },
              { Icon: Mail, title: 'Un e-mail de confirmation vous a été envoyé', sub: 'Vérifiez votre boîte mail (et vos spams) pour retrouver le récapitulatif de votre demande.' },
            ].map(({ Icon, title, sub }, i, arr) => (
              <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 24px', borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(192,57,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="#C0392B" strokeWidth={1.8} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 3, fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>{title}</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.5, fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/espace-client" className="btn btn-red" style={{ padding: '14px 28px', textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>
              Accéder à mon espace client
            </Link>
            <Link href="/" className="btn btn-outline" style={{ padding: '14px 28px', textTransform: 'none', letterSpacing: 0 }}>
              Retour à l'accueil
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="fade-in">
      <Navbar />

      {/* Hero */}
      <section style={{ background: '#111111', padding: '72px 40px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: 'rgba(192,57,43,0.18)', color: '#C0392B',
          padding: '6px 16px', borderRadius: 20,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.8px',
          marginBottom: 28,
        }}>
          GRATUIT ET SANS ENGAGEMENT
        </div>

        <h1 style={{
          fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
          fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.15,
          color: 'white', fontWeight: 700, marginBottom: 20,
        }}>
          Déposez votre demande<br />
          <em style={{ color: '#C0392B', fontStyle: 'normal' }}>en quelques minutes</em>
        </h1>

        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 520, margin: '0 auto' }}>
          Des professionnels certifiés de votre zone vous répondent sous 24 h<br />
          avec des devis gratuits.
        </p>
      </section>

      <section style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '20px 40px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <StepIndicator current={step} />
        </div>
      </section>

      <div style={{ background: '#F5F5F5', padding: '40px 40px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          <div className="card fade-in" style={{ padding: 48 }}>
            {step === 1 && (
              <div className="fade-in-up">
                <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-sans, DM Sans, sans-serif)', marginBottom: 8 }}>Décrivez votre besoin</h2>
                <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 32 }}>Étape 1 sur 3 — Plus vous êtes précis, mieux les professionnels pourront vous répondre.</p>

                <div style={{ marginBottom: 40 }}>
                  <label className="label" style={{ marginBottom: 16 }}>Type de prestation <span style={{ color: 'var(--red)' }}>*</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {services.map(st => {
                      const selected = serviceTypes.includes(st.id)
                      const Icon = ICON_MAP[st.code] ?? AlertCircle
                      return (
                        <button key={st.id} type="button"
                          onClick={() => setServiceTypes(prev =>
                            prev.includes(st.id) ? prev.filter(id => id !== st.id) : [...prev, st.id]
                          )}
                          style={{
                            padding: '16px 18px',
                            border: `1.5px solid ${selected ? '#C0392B' : '#E5E7EB'}`,
                            borderRadius: 10,
                            background: selected ? 'rgba(192,57,43,0.04)' : 'white',
                            textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <Icon size={15} strokeWidth={1.8} color={selected ? '#C0392B' : '#6B7280'} />
                            <span style={{ fontFamily: 'var(--font-sans, DM Sans, sans-serif)', fontWeight: 700, fontSize: 13, color: selected ? '#C0392B' : '#111', lineHeight: 1.3 }}>
                              {st.name}
                            </span>
                          </div>
                          <div style={{ fontFamily: 'var(--font-sans, DM Sans, sans-serif)', fontSize: 11, color: '#9CA3AF', lineHeight: 1.5, paddingLeft: 23 }}>
                            {st.description}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 40 }}>
                  <label className="label" style={{ marginBottom: 16 }}>Vous êtes <span style={{ color: 'var(--red)' }}>*</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {USER_TYPES.map(t => (
                      <button key={t} type="button" onClick={() => setUserType(t)} style={{
                        padding: '11px 8px',
                        border: `1.5px solid ${userType === t ? '#C0392B' : '#E5E7EB'}`,
                        borderRadius: 8,
                        background: userType === t ? 'rgba(192,57,43,0.04)' : 'white',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                        color: userType === t ? '#C0392B' : '#374151',
                        transition: 'all 0.15s',
                      }}>{t}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                  <div>
                    <label className="label">Type de bien <span style={{ color: 'var(--red)' }}>*</span></label>
                    <CustomSelect
                      options={propertyOptions.map(p => ({ id: p.id, label: p.label }))}
                      value={propertyType}
                      onChange={setPropertyType}
                      placeholder={userType ? 'Sélectionner le type de bien' : "Sélectionnez d'abord votre profil"}
                      disabled={!userType}
                    />
                  </div>
                  <div>
                    <label className="label">Surface estimée (m²)</label>
                    <div style={{ position: 'relative' }}>
                      <input type="number" className="input" placeholder="Ex : 75" value={surface} onChange={e => setSurface(e.target.value)} />
                      <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--gray-400)', fontWeight: 700 }}>m²</span>
                    </div>
                  </div>
                </div>

                {/* QUESTIONS CONDITIONNELLES SELON LE MÉTIER */}
                
                {services.some(s => serviceTypes.includes(s.id) && s.code === 'diagnostic_amiante') && (
                  <div style={{ marginBottom: 32 }} className="fade-in">
                    <label className="label" style={{ marginBottom: 12 }}>Phase du projet (Diagnostic) <span style={{ color: 'var(--red)' }}>*</span></label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
                      {SITUATIONS_PHASE.map(s => (
                        <button key={s.id} type="button" onClick={() => setSituationPhase(s.id)} style={{
                          padding: '12px 8px', border: `1.5px solid ${situationPhase === s.id ? '#C0392B' : '#E5E7EB'}`,
                          borderRadius: 8, background: situationPhase === s.id ? 'rgba(192,57,43,0.04)' : 'white',
                          fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                          color: situationPhase === s.id ? '#C0392B' : '#374151',
                          transition: 'all 0.15s',
                        }}>{s.label}</button>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {SITUATIONS_CONTEXT.map(s => {
                        const active = situationContext.includes(s.id)
                        return (
                          <button key={s.id} type="button"
                            onClick={() => setSituationContext(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                            style={{
                              padding: '12px 8px', border: `1.5px solid ${active ? '#C0392B' : '#E5E7EB'}`,
                              borderRadius: 8, background: active ? 'rgba(192,57,43,0.04)' : 'white',
                              fontSize: 13, fontWeight: 700, cursor: 'pointer',
                              fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                              color: active ? '#C0392B' : '#374151',
                              transition: 'all 0.15s',
                            }}>{s.label}</button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {services.some(s => serviceTypes.includes(s.id) && s.code === 'desamiantage') && (
                  <div style={{ marginBottom: 32 }} className="fade-in">
                    <label className="label" style={{ marginBottom: 12 }}>Type d'intervention (Désamiantage) <span style={{ color: 'var(--red)' }}>*</span></label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      {INTERVENTION_TYPES_SS3.map(s => {
                        const active = interventionTypes.includes(s.id)
                        return (
                          <button key={s.id} type="button"
                            onClick={() => setInterventionTypes(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                            style={{
                              padding: '12px 8px', border: `1.5px solid ${active ? '#C0392B' : '#E5E7EB'}`,
                              borderRadius: 8, background: active ? 'rgba(192,57,43,0.04)' : 'white',
                              fontSize: 13, fontWeight: 700, cursor: 'pointer',
                              fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                              color: active ? '#C0392B' : '#374151',
                              transition: 'all 0.15s',
                            }}>{s.label}</button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {services.some(s => serviceTypes.includes(s.id) && s.code === 'moe_amiante_plomb') && (
                  <div style={{ marginBottom: 32 }} className="fade-in">
                    <label className="label" style={{ marginBottom: 12 }}>Mission MOE / AMO <span style={{ color: 'var(--red)' }}>*</span></label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {PHASES_MOE.map(s => (
                        <button key={s.id} type="button" onClick={() => setMoePhase(s.id)} style={{
                          padding: '12px 8px', border: `1.5px solid ${moePhase === s.id ? '#C0392B' : '#E5E7EB'}`,
                          borderRadius: 8, background: moePhase === s.id ? 'rgba(192,57,43,0.04)' : 'white',
                          fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                          color: moePhase === s.id ? '#C0392B' : '#374151',
                          transition: 'all 0.15s',
                        }}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                )}

                {services.some(s => serviceTypes.includes(s.id) && s.code === 'preleveur_air_materiaux') && (
                  <div style={{ marginBottom: 32 }} className="fade-in">
                    <label className="label" style={{ marginBottom: 12 }}>Besoins d'analyse (Laboratoire) <span style={{ color: 'var(--red)' }}>*</span></label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      {ACCREDITATIONS_LABO.map(s => {
                        const active = accreditations.includes(s.id)
                        return (
                          <button key={s.id} type="button"
                            onClick={() => setAccreditations(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                            style={{
                              padding: '12px 8px', border: `1.5px solid ${active ? '#C0392B' : '#E5E7EB'}`,
                              borderRadius: 8, background: active ? 'rgba(192,57,43,0.04)' : 'white',
                              fontSize: 13, fontWeight: 700, cursor: 'pointer',
                              fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                              color: active ? '#C0392B' : '#374151',
                              transition: 'all 0.15s',
                            }}>{s.label}</button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 32 }}>
                  <label className="label" style={{ marginBottom: 12 }}>Quand est prévue la prestation ? <span style={{ color: 'var(--red)' }}>*</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {TIMINGS.map(t => (
                      <button key={t.id} type="button" onClick={() => setTiming(t.id)} style={{
                        padding: '12px 8px', border: `1.5px solid ${timing === t.id ? '#C0392B' : '#E5E7EB'}`,
                        borderRadius: 8, background: timing === t.id ? 'rgba(192,57,43,0.04)' : 'white',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                        color: timing === t.id ? '#C0392B' : '#374151',
                        transition: 'all 0.15s',
                      }}>{t.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label className="label" style={{ marginBottom: 12 }}>Budget prévu <span style={{ color: 'var(--red)' }}>*</span></label>
                  <CustomSelect
                    options={BUDGET_OPTIONS}
                    value={budget}
                    onChange={setBudget}
                    placeholder="Sélectionner un budget"
                  />
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label className="label" style={{ marginBottom: 12 }}>
                    Documents et photos <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(facultatif)</span>
                  </label>
                  <label
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 8, padding: '32px 24px', cursor: 'pointer',
                      border: '1.5px dashed #D1D5DB', borderRadius: 10,
                      background: '#FAFAFA', transition: 'border-color 0.15s',
                    }}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#C0392B' }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB' }}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#D1D5DB'; handleFiles(e.dataTransfer.files) }}
                  >
                    <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.docx"
                      style={{ display: 'none' }}
                      onChange={e => handleFiles(e.target.files)}
                    />
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/>
                    </svg>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#374151', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                      Glissez vos documents et vos photos
                    </span>
                    <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                      Types de fichiers autorisés JPG, PNG, PDF, DOCX
                    </span>
                    <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                      Taille max. du fichier : 10 MB
                    </span>
                  </label>

                  {files.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {files.map((file, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 8,
                          border: '1px solid #E5E7EB', background: 'white',
                        }}>
                          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(192,57,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {file.name}
                            </div>
                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                              {formatSize(file.size)}
                            </div>
                          </div>
                          <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9CA3AF', flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {step1Errors.length > 0 && (
                  <div style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#C0392B', marginBottom: 6, fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                      Merci de renseigner les champs suivants :
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {step1Errors.map(e => (
                        <li key={e} style={{ fontSize: 13, color: '#C0392B', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-red"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px' }}
                    onClick={() => {
                      const errors: string[] = []
                      if (serviceTypes.length === 0) errors.push('Type de prestation')
                      if (!userType)       errors.push('Vous êtes')
                      if (!propertyType)   errors.push('Type de bien')
                      const needsPhase = services.some(s => serviceTypes.includes(s.id) && s.code === 'diagnostic_amiante')
                      if (needsPhase && !situationPhase) errors.push('La prestation se situe (ligne du haut)')
                      if (!timing)         errors.push('Quand est prévue la prestation ?')
                      if (errors.length > 0) { setStep1Errors(errors); return }
                      setStep1Errors([])
                      setStep(2)
                    }}
                  >
                    Étape suivante <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="fade-in-up">
                <h2 style={{ fontFamily: 'var(--font-sans, DM Sans, sans-serif)', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
                  Localisation & détails du chantier
                </h2>
                <p style={{ fontFamily: 'var(--font-sans, DM Sans, sans-serif)', fontSize: 13, color: '#9CA3AF', marginBottom: 32 }}>
                  Étape 2 sur 3 — Adresse, accessibilité, délai et description du chantier.
                </p>

                <div style={{ marginBottom: 24 }}>
                  <label className="label">Adresse du bien <span style={{ color: 'var(--red)' }}>*</span></label>
                  <GoogleAddressMap
                    searchValue={addressSearch}
                    onSearchChange={setAddressSearch}
                    onSelect={r => {
                      setStreetAddress(r.street)
                      setCity(r.city)
                      setPostalCode(r.postalCode)
                      setDepartment(r.department)
                    }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr', gap: 10, marginTop: 10 }}>
                    <input className="input" placeholder="Numéro et nom de rue" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} />
                    <input className="input" placeholder="Code postal" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                    <input className="input" placeholder="Ville" value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label className="label">Complément d'adresse <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(facultatif)</span></label>
                  <input className="input" placeholder="Bâtiment, appartement, étage, digicode..." value={complement} onChange={e => setComplement(e.target.value)} />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label className="label">Accessibilité du chantier <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(facultatif)</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {ACCESSIBILITY_OPTIONS.map(opt => {
                      const active = accessibility === opt.id
                      return (
                        <button key={opt.id} type="button"
                          onClick={() => setAccessibility(accessibility === opt.id ? '' : opt.id)}
                          style={{
                            padding: '12px 8px', border: `1.5px solid ${active ? '#C0392B' : '#E5E7EB'}`,
                            borderRadius: 8, background: active ? 'rgba(192,57,43,0.04)' : 'white',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
                            color: active ? '#C0392B' : '#374151', transition: 'all 0.15s',
                          }}
                        >{opt.label}</button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label className="label">Étage <span style={{ color: 'var(--red)' }}>*</span></label>
                    <CustomSelect
                      options={FLOOR_OPTIONS}
                      value={floor} onChange={setFloor} placeholder="Sélectionnez"
                    />
                  </div>
                  <div>
                    <label className="label">Ascenseur <span style={{ color: 'var(--red)' }}>*</span></label>
                    <CustomSelect
                      options={ELEVATOR_OPTIONS}
                      value={elevator} onChange={setElevator} placeholder="Sélectionnez"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label className="label">Description complémentaire</label>
                  <textarea
                    className="input" rows={4}
                    placeholder="Ex : Plafond avec dalles suspectes dans couloir + cuisine, bâtiment de 1972, travaux prévus en mai..."
                    value={description} onChange={e => setDescription(e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px' }}>
                    <ChevronLeft size={18} /> Retour
                  </button>
                  <button className="btn btn-red" onClick={() => setStep(3)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px' }}
                    disabled={!city}
                  >
                    Étape suivante <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="fade-in-up">
                <h2 style={{ fontFamily: 'var(--font-sans, DM Sans, sans-serif)', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
                  Vos coordonnées
                </h2>
                <p style={{ fontFamily: 'var(--font-sans, DM Sans, sans-serif)', fontSize: 13, color: '#9CA3AF', marginBottom: 28 }}>
                  Étape 3 sur 3 — Dernière étape avant d'envoyer votre demande aux pros.
                </p>

                {isLoggedIn ? (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle2 size={20} color="#16A34A" strokeWidth={2} />
                    <span style={{ fontSize: 14, color: '#166534', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                      Connecté en tant que <strong>{loggedInName}</strong> — votre demande sera envoyée directement.
                    </span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', border: '1.5px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', marginBottom: 28 }}>
                      {([
                        { key: 'create', label: 'Créer mon compte', Icon: User },
                        { key: 'login',  label: 'J\'ai déjà un compte', Icon: CheckCircle2 },
                      ] as const).map(({ key, label, Icon }) => (
                        <button key={key} type="button" onClick={() => setAuthMode(key)} style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '13px 16px', border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--font-sans, DM Sans, sans-serif)', fontSize: 14, fontWeight: 600,
                          background: authMode === key ? '#C0392B' : 'white',
                          color: authMode === key ? 'white' : '#374151',
                          transition: 'all 0.15s',
                        }}>
                          <Icon size={16} strokeWidth={2} /> {label}
                        </button>
                      ))}
                    </div>

                    {authMode === 'create' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div>
                            <label className="label">Prénom</label>
                            <input className="input" placeholder="Jean" value={prenom} onChange={e => setPrenom(e.target.value)} />
                          </div>
                          <div>
                            <label className="label">Nom</label>
                            <input className="input" placeholder="Dupont" value={nom} onChange={e => setNom(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <label className="label">Adresse email</label>
                          <input type="email" className="input" placeholder="jean.dupont@email.com" value={s3Email} onChange={e => setS3Email(e.target.value)} />
                        </div>
                        <div>
                          <label className="label">Téléphone</label>
                          <input type="tel" className="input" placeholder="00 00 00 00 00" value={s3Tel} onChange={e => setS3Tel(e.target.value)} />
                        </div>
                        <div>
                          <label className="label">Mot de passe</label>
                          <div style={{ position: 'relative' }}>
                            <input type={showPwd ? 'text' : 'password'} className="input" placeholder="8 caractères minimum" value={s3Password} onChange={e => setS3Password(e.target.value)} style={{ paddingRight: 44 }} />
                            <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                              {showPwd ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="label">Confirmer le mot de passe</label>
                          <div style={{ position: 'relative' }}>
                            <input type={showPwdConfirm ? 'text' : 'password'} className="input" placeholder="Confirmez votre mot de passe" value={s3PasswordConfirm} onChange={e => setS3PasswordConfirm(e.target.value)} style={{ paddingRight: 44 }} />
                            <button type="button" onClick={() => setShowPwdConfirm(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                              {showPwdConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <label className="label">Adresse email</label>
                          <input type="email" className="input" placeholder="jean.dupont@email.com" value={s3Email} onChange={e => setS3Email(e.target.value)} />
                        </div>
                        <div>
                          <label className="label">Mot de passe</label>
                          <div style={{ position: 'relative' }}>
                            <input type={showPwd ? 'text' : 'password'} className="input" placeholder="••••••••" value={s3Password} onChange={e => setS3Password(e.target.value)} style={{ paddingRight: 44 }} />
                            <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                              {showPwd ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {authMode === 'create' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#4B5563', cursor: 'pointer', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                          <input type="checkbox" checked={cgu} onChange={e => setCgu(e.target.checked)} style={{ accentColor: '#C0392B', marginTop: 2 }} />
                          <span>J'accepte les <a href="/cgu" style={{ color: '#C0392B' }}>Conditions Générales d'Utilisation</a> et la <a href="/confidentialite" style={{ color: '#C0392B' }}>Politique de confidentialité</a></span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#4B5563', cursor: 'pointer', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                          <input type="checkbox" checked={notifs} onChange={e => setNotifs(e.target.checked)} style={{ accentColor: '#C0392B' }} />
                          J'accepte de recevoir des notifications par e-mail concernant mes demandes et devis
                        </label>
                      </div>
                    )}
                  </>
                )}

                {step3Error && (
                  <div style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 8, padding: '10px 14px', marginTop: 16, fontSize: 13, color: '#C0392B', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                    {step3Error}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button className="btn btn-outline" onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px' }}>
                    <ChevronLeft size={18} /> Retour
                  </button>
                  <button className="btn btn-red" onClick={handleSubmitDemande} disabled={step3Loading}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', opacity: step3Loading ? 0.7 : 1 }}>
                    <Send size={16} strokeWidth={2} />
                    {step3Loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {step === 3 && (
              <div style={{ background: '#111111', borderRadius: 10, padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 52, fontWeight: 800, color: '#C0392B', lineHeight: 1, fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                  {prosInZone ?? '—'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginTop: 8, fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                  professionnels certifiés
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
                  dans votre zone recevront votre demande
                </div>
              </div>
            )}

            {recap.length > 0 && (
              <div style={{ background: 'white', borderRadius: 10, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
                <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20, fontFamily: 'var(--font-sans, DM Sans, sans-serif)', color: '#9CA3AF' }}>
                  Votre demande
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {recap.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'rgba(192,57,43,0.10)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, color: '#C0392B',
                      }}>
                        {r.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500, marginBottom: 2, fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>{r.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>{r.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div style={{ background: 'white', borderRadius: 8, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <ShieldCheck size={16} color="#C0392B" strokeWidth={2} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Vos garanties</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Devis 100 % gratuits',      sub: 'Aucun frais, sans engagement'   },
                    { label: 'Pros certifiés vérifiés',    sub: 'Accréditations contrôlées'      },
                    { label: 'Réponse sous 48 h',          sub: 'Délai moyen constaté'           },
                    { label: 'Données protégées RGPD',     sub: 'Hébergement France'             },
                  ].map(g => (
                    <div key={g.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(5,150,105,0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{g.label}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{g.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(192,57,43,0.05)', borderRadius: 8, border: '1px solid rgba(192,57,43,0.12)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#C0392B' }}>Besoin d'aide ?</span>
              </div>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.6 }}>
                Notre équipe est disponible du lundi au vendredi, de 9h à 18h.
              </p>
              <a href="https://wa.me/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px', borderRadius: 6, border: '1.5px solid #22C55E', color: '#16A34A', textDecoration: 'none', fontSize: 13, fontWeight: 600, background: 'transparent', marginBottom: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#22C55E"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Nous contacter
              </a>
              <a href="mailto:contact@desamianteurs.fr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px', borderRadius: 6, border: '1.5px solid #111', color: '#111', textDecoration: 'none', fontSize: 13, fontWeight: 600, background: 'transparent' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Nous contacter
              </a>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  )
}
