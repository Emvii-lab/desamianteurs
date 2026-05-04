'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, User, Building2, ShieldCheck, FileCheck, Info, Eye, EyeOff, CheckCircle, Loader, Gift, Search, Star } from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'
import CustomMultiSelect from '@/components/ui/CustomMultiSelect'
import { INSCRIPTION_CLIENT_TYPES, INSCRIPTION_PARTNER_TYPES, NEEDS_SIRET } from '@/lib/constants'
import { parseLocation } from '@/lib/utils'



export function InscriptionContent({ 
  initialRegions, 
  initialDepartments, 
  initialDocTypes,
  initialDomains
}: { 
  initialRegions: any[], 
  initialDepartments: any[], 
  initialDocTypes: any[],
  initialDomains: any[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userType, setUserType] = useState<'client' | 'partenaire'>('client')

  useEffect(() => {
    setUserType(searchParams.get('tab') === 'partenaire' ? 'partenaire' : 'client')
  }, [searchParams])

  const handleTabChange = (type: 'client' | 'partenaire') => {
    setUserType(type)
    const params = new URLSearchParams(searchParams.toString())
    if (type === 'partenaire') params.set('tab', 'partenaire')
    else params.delete('tab')
    router.replace(`/inscription?${params.toString()}`)
  }

  return (
    <div className="fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Left Side - Black */}
        <div style={{ background: 'var(--black)', color: 'white', padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '100px', position: 'relative', overflow: 'hidden' }}>

          {/* Cercle 1 — bas droite, flottant lentement */}
          <motion.div
            animate={{ y: [0, -14, 0], scale: [1, 1.02, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', bottom: -160, right: -120,
              width: 380, height: 380, borderRadius: '50%',
              background: 'rgba(192,57,43,0.20)', pointerEvents: 'none',
            }}
          />
          {/* Cercle 2 — haut gauche, déphasé */}
          <motion.div
            animate={{ y: [0, 10, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            style={{
              position: 'absolute', top: -160, left: -140,
              width: 300, height: 300, borderRadius: '50%',
              background: 'rgba(192,57,43,0.11)', pointerEvents: 'none',
            }}
          />

          <motion.div
            key={userType}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'relative', zIndex: 10 }}
          >
            <h1 style={{ margin: '0 0 20px', lineHeight: 1.1 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16, fontFamily: 'var(--font-sans)' }}>
                {userType === 'client' ? 'Vous êtes client' : 'Vous êtes professionnel'}
              </span>
              <span style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', fontSize: 52, fontWeight: 400, color: 'white', letterSpacing: '-0.5px' }}>
                Désamianteurs
              </span>
              <span style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', fontSize: 52, fontWeight: 400, color: 'var(--red)' }}>
                .fr
              </span>
            </h1>

            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', marginBottom: 56, maxWidth: 420, lineHeight: 1.65 }}>
              {userType === 'client'
                ? "Décrivez votre projet amiante et / ou plomb, recevez des devis gratuits de professionnels certifiés et choisissez sereinement."
                : "Accédez à un flux régulier de demandes qualifiées dans votre zone. Votre 1ère affaire est offerte — sans engagement."}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {(userType === 'client'
                ? [
                    { Icon: Search,     label: 'Devis gratuits et sans engagement' },
                    { Icon: ShieldCheck, label: 'Professionnels certifiés et vérifiés' },
                    { Icon: Info,        label: 'Données protégées (RGPD)' },
                  ]
                : [
                    { Icon: Gift,        label: '1ère affaire offerte — frais d\'inscription aussi' },
                    { Icon: Star,        label: 'Réseau de professionnels qualifiés' },
                    { Icon: Info,        label: 'Données protégées (RGPD)' },
                  ]
              ).map(({ Icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(192,57,43,0.12)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side - White */}
        <div style={{ background: 'white', padding: '60px 80px', position: 'relative' }}>
          <Link href="/" style={{ position: 'absolute', top: 40, right: 80, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--red)' }}>
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>

          <div style={{ maxWidth: 500, width: '100%', margin: '0 auto' }}>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 40 }}>
              Désamianteurs<span style={{ color: 'var(--red)' }}>.fr</span>
            </div>

            <h2 style={{ fontSize: 24, marginBottom: 8, fontFamily: 'var(--font-body)', fontWeight: 700 }}>Créer un compte</h2>
            <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 32 }}>Choisissez votre profil pour commencer.</p>

            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--gray-50)', padding: 3, borderRadius: 7, marginBottom: 32, gap: 2 }}>
              {([
                { key: 'client',     label: 'Client',      Icon: User      },
                { key: 'partenaire', label: 'Partenaire',  Icon: Building2 },
              ] as const).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '8px 12px', borderRadius: 5, fontSize: 13, fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    background: userType === key ? 'white' : 'transparent',
                    color:      userType === key ? 'var(--black)' : 'var(--gray-400)',
                    boxShadow:  userType === key ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <Icon size={13} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>

            <InscriptionForm 
              type={userType} 
              initialRegions={initialRegions} 
              initialDepartments={initialDepartments} 
              initialDocTypes={initialDocTypes}
              initialDomains={initialDomains}
            />

            <div style={{ margin: '32px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--gray-100)' }} />
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>ou</span>
              <div style={{ flex: 1, height: 1, background: 'var(--gray-100)' }} />
            </div>

            <button
              className="btn btn-outline"
              style={{ width: '100%', textTransform: 'none', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback?type=${userType}`,
                  },
                })
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
              Continuer avec Google
            </button>

            <p style={{ textAlign: 'center', marginTop: 48, fontSize: 14, color: 'var(--gray-400)' }}>
              Vous avez déjà un compte ? <Link href="/connexion" style={{ color: 'var(--red)', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InscriptionForm({ 
  type, 
  initialRegions, 
  initialDepartments, 
  initialDocTypes,
  initialDomains
}: { 
  type: 'client' | 'partenaire',
  initialRegions: any[],
  initialDepartments: any[],
  initialDocTypes: any[],
  initialDomains: any[]
}) {
  const router = useRouter()
  const [regions] = useState(initialRegions)
  const [departments] = useState(initialDepartments)
  const [docTypes] = useState(initialDocTypes)
  const [domains] = useState(initialDomains)

  const SANS = 'var(--font-sans, DM Sans, sans-serif)'
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7, fontFamily: SANS }

  const [prenom, setPrenom]           = useState('')
  const [nom, setNom]                 = useState('')
  const [email, setEmail]             = useState('')
  const [tel, setTel]                 = useState('')
  const [pwd, setPwd]                 = useState('')
  const [pwdConfirm, setPwdConfirm]   = useState('')
  const [showPwd, setShowPwd]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [clientType, setClientType]   = useState('')
  const [siret, setSiret]             = useState('')
  const [siretStatus, setSiretStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [siretData, setSiretData]     = useState<{raison_sociale:string;activite:string;adresse:string;ville:string;cp:string;est_actif:boolean;lat?:number;lng?:number} | null>(null)
  const [geoScope, setGeoScope]         = useState<'international' | 'national' | 'region' | 'department' | ''>('')
  const [selectedGeo, setSelectedGeo]   = useState<string[]>([])
  const [siretConfirmed, setSiretConfirmed] = useState(false)
  
  // Champs adresse éditables (pré-remplis par SIRET)
  const [manualAddress, setManualAddress] = useState('')
  const [manualCity, setManualCity]       = useState('')
  const [manualZip, setManualZip]         = useState('')
  const [promoCode, setPromoCode]         = useState('')
  const [promoValid, setPromoValid]       = useState(false) // true = 100% off confirmé via Stripe
  const [promoChecking, setPromoChecking] = useState(false)
  const [promoMsg, setPromoMsg]           = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' })
  const [cgu, setCgu]                 = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const siretTimer                    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedScrollY                  = useRef<number | null>(null)

  // États pour les sélections spécifiques
  const [selectedCerts, setSelectedCerts] = useState<string[]>([])
  const [selectedComp, setSelectedComp]   = useState<string[]>([])
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const [nbCertified, setNbCertified]     = useState<number>(0)

  const toggle = (list: string[], set: (v: string[]) => void, item: string) => {
    if (list.includes(item)) set(list.filter(i => i !== item))
    else set([...list, item])
  }

  // parseLocation importé depuis @/lib/utils

  useEffect(() => {
    const digits = siret.replace(/\D/g, '')
    if (digits.length !== 14) { setSiretStatus('idle');  return }

    setSiretStatus('loading')
    if (siretTimer.current) clearTimeout(siretTimer.current)
    siretTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/verify-siret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siret: digits }),
        })
        const data = await res.json()
        if (res.ok && data?.raison_sociale) {
          let finalAdresse = data.adresse ?? ''
          let finalVille   = data.ville   ?? ''
          let finalCp      = data.code_postal ?? data.cp ?? ''
          let finalLat     = undefined
          let finalLng     = undefined

          console.log("[SIRET] Raw data received:", { adresse: finalAdresse, ville: finalVille, cp: finalCp })

          const { city, zip } = parseLocation(finalVille, finalAdresse, finalCp)
          finalVille = city
          finalCp    = zip

          // 2. Géocodage pour validation et coordonnées
          try {
            const query = [finalAdresse, finalCp, finalVille].filter(Boolean).join(' ')
            console.log("[SIRET] Geocoding query:", query)
            
            const geoRes = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`)
            const geoData = await geoRes.json()
            
            if (geoData.features?.[0]) {
              const props = geoData.features[0].properties
              const coords = geoData.features[0].geometry.coordinates
              
              console.log("[SIRET] Geocoding result:", props)

              if (coords && coords.length === 2) {
                finalLng = coords[0]
                finalLat = coords[1]
              }
              
              // On privilégie les données BAN (propres) mais on garde l'adresse complète si demandée
              if (props.name)     finalAdresse = props.name
              if (props.city)     finalVille   = props.city.toUpperCase()
              if (props.postcode) finalCp      = props.postcode
            }
          } catch (e) {
            console.error("[SIRET] Geocoding failed:", e)
          }

          console.log("[SIRET] Final processed data:", { adresse: finalAdresse, ville: finalVille, cp: finalCp, lat: finalLat, lng: finalLng })

          setSiretData({
            raison_sociale: data.raison_sociale,
            activite:       data.activite ?? '',
            adresse:        finalAdresse,
            ville:          finalVille,
            cp:             finalCp,
            est_actif:      data.est_actif ?? true,
            lat:            finalLat,
            lng:            finalLng
          })
          setManualAddress(finalAdresse)
          setManualCity(finalVille)
          setManualZip(finalCp)
          if (data.activite) setCompanyDescription(data.activite)
          setSiretStatus('ok')
        } else {
          setSiretStatus('error')
          setSiretData(null)
        }
      } catch {
        setSiretStatus('error')
      }
    }, 600)
    return () => { if (siretTimer.current) clearTimeout(siretTimer.current) }
  }, [siret])

  // Validation du code promo via Stripe (debounced 600ms)
  useEffect(() => {
    if (!promoCode || promoCode.length < 4) {
      setPromoValid(false)
      setPromoMsg({ type: null, text: '' })
      return
    }
    setPromoChecking(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stripe/validate-promo?code=${encodeURIComponent(promoCode)}`)
        const data = await res.json()
        if (data.valid) {
          setPromoValid(data.isFull)
          setPromoMsg({ type: 'success', text: data.label })
        } else {
          setPromoValid(false)
          setPromoMsg({ type: 'error', text: data.error || 'Code invalide ou expiré' })
        }
      } catch {
        setPromoValid(false)
        setPromoMsg({ type: 'error', text: 'Impossible de vérifier le code' })
      } finally {
        setPromoChecking(false)
      }
    }, 600)
    return () => clearTimeout(t)
  }, [promoCode])

  // Restaure la position de scroll après que React insère le bloc conditionnel
  useLayoutEffect(() => {
    if (savedScrollY.current !== null) {
      window.scrollTo(0, savedScrollY.current)
      savedScrollY.current = null
    }
  }, [clientType])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (pwd !== pwdConfirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (pwd.length < 8)     { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (!tel)               { setError('Le numéro de téléphone est obligatoire.'); return }
    if (!cgu)               { setError('Veuillez accepter les Conditions Générales d\'Utilisation.'); return }

    if (type === 'partenaire') {
      if (needsSiret && !siretConfirmed) { setError('Veuillez confirmer votre SIRET.'); return }
      if (!manualAddress || !manualCity || !manualZip) { setError('L\'adresse complète de l\'entreprise est obligatoire.'); return }
    }

    setLoading(true)
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: pwd,
      options: {
        data: {
          prenom,
          nom,
          telephone: tel,
          client_type: clientType,
          qualifications: selectedCerts,
          competences:    selectedComp,
          markets:        selectedMarkets,
          geo_scope:      geoScope,
          geo_selection:  selectedGeo,
          ...(siretConfirmed && siretData ? {
            siret:          siret,
            raison_sociale: siretData.raison_sociale,
            activite:       siretData.activite,
            adresse:        siretData.adresse,
          } : {}),
        },
      },
    })
    
    if (authError) { setError(authError.message); setLoading(false); return }
    if (!authData.user) { setError("Erreur lors de la création du compte."); setLoading(false); return }

    // Insertion dans la table correspondante
    try {
      if (type === 'client') {
        const { error: insErr } = await supabase.from('clients').insert({
          user_id: authData.user.id,
          first_name: prenom,
          last_name: nom,
          email: email,
          phone: tel,
          client_type: clientType,
          ...(siretConfirmed && siretData ? {
            siret: siret.replace(/\D/g, ''),
            company_name: siretData.raison_sociale,
            company_address: siretData.adresse,
            company_activity: siretData.activite,
          } : {}),
          cgu_accepted_at: new Date().toISOString(),
        })
        if (insErr) throw insErr
      } else {
        // On utilise les données déjà nettoyées et géocodées dans siretData
        // On effectue une dernière passe de scission par sécurité juste avant l'insertion
        const initialCity = siretData?.ville || ''
        const initialCp   = siretData?.cp    || ''
        const initialAddr = siretData?.adresse || ''
        
        const { city, zip } = parseLocation(initialCity, initialAddr, initialCp)
        
        const lat  = siretData?.lat   || null
        const lng  = siretData?.lng   || null

        const { data: newPartner, error: insErr } = await supabase.from('partners').insert({
          user_id: authData.user.id,
          partner_type: clientType,
          first_name: prenom,
          last_name: nom,
          email: email,
          phone: tel,
          company_name: siretData?.raison_sociale || '',
          description: companyDescription || siretData?.activite || '',
          siret: siret,
          company_address: manualAddress,
          city: manualCity,
          zip_code: manualZip,
          company_activity: siretData?.activite || '',
          certified_workers_count: nbCertified,
          lat: lat,
          lng: lng,
          is_verified: false,
          validation_fee_paid: promoValid,
          cgu_accepted_at: new Date().toISOString()
        }).select('id').single()
        if (insErr) throw insErr

        // Insertion des zones d'intervention
        if (newPartner && geoScope) {
          const zonesToInsert = []
          if (geoScope === 'international') {
            zonesToInsert.push({ partner_id: newPartner.id, scope: 'international' })
          } else if (geoScope === 'national') {
            zonesToInsert.push({ partner_id: newPartner.id, scope: 'nationwide' })
          } else if (geoScope === 'region') {
            selectedGeo.forEach(code => {
              const r = regions.find(x => x.code === code)
              if (r) zonesToInsert.push({ partner_id: newPartner.id, scope: 'region', region_id: r.id })
            })
          } else if (geoScope === 'department') {
            selectedGeo.forEach(code => {
              const d = departments.find(x => x.code === code)
              if (d) zonesToInsert.push({ partner_id: newPartner.id, scope: 'department', department_id: d.id })
            })
          }

          if (zonesToInsert.length > 0) {
            const { error: zoneErr } = await supabase.from('intervention_zones').insert(zonesToInsert)
            if (zoneErr) console.error("Error inserting zones:", zoneErr.message, zoneErr.details, zoneErr.hint)
          }
        }

        // Insertion des marchés
        if (newPartner && selectedMarkets.length > 0) {
          const marketsToInsert = selectedMarkets.map(m => {
            let marketVal = ''
            if (m === 'Marché public') marketVal = 'public'
            if (m === 'Marché privé')  marketVal = 'private'
            if (m === 'Particulier')   marketVal = 'residential'
            return { partner_id: newPartner.id, market: marketVal }
          }).filter(m => m.market !== '')

          if (marketsToInsert.length > 0) {
            const { error: marketErr } = await supabase.from('target_markets').insert(marketsToInsert)
            if (marketErr) console.error("Error inserting markets:", marketErr.message, marketErr.details)
          }
        }

        // Insertion des domaines (certifications et compétences)
        const selectedDomainIds = [...selectedCerts, ...selectedComp]
        if (newPartner && selectedDomainIds.length > 0) {
          const domainsToInsert = selectedDomainIds.map(domainId => ({
            partner_id: newPartner.id,
            domain_id: domainId
          }))

          const { error: domainErr } = await supabase.from('partner_domains').insert(domainsToInsert)
          if (domainErr) console.error("Error inserting domains:", domainErr.message, domainErr.details)
        }

        // Redirect : Stripe si pas de promo 100%, dashboard sinon
        if (!promoValid && newPartner) {
          const res = await fetch('/api/stripe/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partnerId: newPartner.id }),
          })
          const { url, error: checkoutError } = await res.json()
          if (url) {
            window.location.href = url
            return
          }
          throw new Error(checkoutError || 'Erreur lors de la création de la session de paiement')
        } else {
          router.push('/espace-partenaire')
        }
      }

      if (type === 'client') {
        router.push('/espace-client')
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'enregistrement des données.")
      setLoading(false)
    }
  }

  const needsSiret = NEEDS_SIRET.includes(clientType)
  const progress   = Math.min((siret.replace(/\D/g, '').length / 14) * 100, 100)

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-400)', letterSpacing: '0.5px', fontFamily: SANS }}>INFORMATIONS PERSONNELLES</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div><label style={lbl}>Prénom</label><input className="input" placeholder="Jean" value={prenom} onChange={e => setPrenom(e.target.value)} required /></div>
        <div><label style={lbl}>Nom</label><input className="input" placeholder="Dupont" value={nom} onChange={e => setNom(e.target.value)} required /></div>
      </div>

      <div><label style={lbl}>Adresse email</label><input type="email" className="input" placeholder="jean.dupont@email.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
      <div><label style={lbl}>Téléphone <span style={{ color: 'var(--red)' }}>*</span></label><input type="tel" className="input" placeholder="06 00 00 00 00" value={tel} onChange={e => setTel(e.target.value)} required /></div>

      {/* Mots de passe */}
      <div>
        <label style={lbl}>Mot de passe</label>
        <div style={{ position: 'relative' }}>
          <input type={showPwd ? 'text' : 'password'} className="input" placeholder="8 caractères minimum" value={pwd} onChange={e => setPwd(e.target.value)} required minLength={8} style={{ paddingRight: 44 }} />
          <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
            {showPwd ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
      </div>
      <div>
        <label style={lbl}>Confirmer le mot de passe</label>
        <div style={{ position: 'relative' }}>
          <input type={showConfirm ? 'text' : 'password'} className="input" placeholder="Confirmez votre mot de passe" value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} required style={{ paddingRight: 44 }} />
          <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
            {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
      </div>

      {/* Type de client — enum Supabase */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-400)', letterSpacing: '0.5px', fontFamily: SANS, marginBottom: 12 }}>
          {type === 'client' ? 'TYPE DE CLIENT' : 'TYPE DE PARTENAIRE'}
        </p>
        <label style={lbl}>Je suis un·e</label>
        <CustomSelect
          options={type === 'client' ? INSCRIPTION_CLIENT_TYPES : INSCRIPTION_PARTNER_TYPES}
          value={clientType}
          onChange={v => {
            savedScrollY.current = window.scrollY
            setClientType(v)
            setSiret('')
            setSiretStatus('idle')
            setSiretData(null)
            setSiretConfirmed(false)
          }}
          placeholder="Choisir votre activité principale..."
        />
      </div>

      {/* Section spécifique Diagnostiqueur */}
      {type === 'partenaire' && clientType === 'diagnostician' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>
          
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-400)', letterSpacing: '0.5px', fontFamily: SANS, marginBottom: 16 }}>CERTIFICATIONS DIAGNOSTIQUEUR</p>
            <label style={{ ...lbl, marginBottom: 12 }}>Certifications détenues (par personne)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {domains
                .filter(d => d.partner_type === clientType && d.category === 'certification')
                .map(d => (
                <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ accentColor: 'var(--red)' }} 
                    checked={selectedCerts.includes(d.id)}
                    onChange={() => toggle(selectedCerts, setSelectedCerts, d.id)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ ...lbl, marginBottom: 12 }}>Compétences</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {domains
                .filter(d => d.partner_type === clientType && d.category === 'domain')
                .map(d => (
                <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ accentColor: 'var(--red)' }} 
                    checked={selectedComp.includes(d.id)}
                    onChange={() => toggle(selectedComp, setSelectedComp, d.id)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.8px', fontFamily: SANS, marginBottom: 20, textTransform: 'uppercase' }}>
              ZONE GÉOGRAPHIQUE D'INTERVENTION
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Couverture géographique</label>
                <CustomSelect
                  options={[
                    { id: 'international', label: 'International' },
                    { id: 'national',   label: 'France entière (National)' },
                    { id: 'region',     label: 'Par Région' },
                    { id: 'department', label: 'Par Département' },
                  ]}
                  value={geoScope}
                  onChange={v => { setGeoScope(v as any); setSelectedGeo([]) }}
                  placeholder="Choisir l'échelle d'intervention..."
                />
              </div>

              {geoScope === 'region' && (
                <div className="fade-in">
                  <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner la région</label>
                  <CustomMultiSelect
                    options={regions.map(r => ({ id: r.code, label: r.label }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Choisir une ou plusieurs régions..."
                  />
                </div>
              )}

              {geoScope === 'department' && (
                <div className="fade-in">
                  <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner le département</label>
                  <CustomMultiSelect
                    options={departments.map(d => ({ id: d.code, label: `${d.code} - ${d.label}` }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Choisir un ou plusieurs départements..."
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={lbl}>Marchés couverts</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Marché public', 'Marché privé', 'Particulier'].map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ accentColor: 'var(--red)' }} 
                    checked={selectedMarkets.includes(m)}
                    onChange={() => toggle(selectedMarkets, setSelectedMarkets, m)}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section spécifique Maître d'oeuvre (MOE) */}
      {type === 'partenaire' && clientType === 'project_manager' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.8px', fontFamily: SANS, marginBottom: 16, textTransform: 'uppercase' }}>CERTIFICATIONS MAÎTRE D'OEUVRE</p>
            <label style={{ ...lbl, marginBottom: 12 }}>Certifications détenues (par personne)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {domains
                .filter(d => d.partner_type === clientType && d.category === 'certification')
                .map(d => (
                <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ accentColor: 'var(--red)' }} 
                    checked={selectedCerts.includes(d.id)}
                    onChange={() => toggle(selectedCerts, setSelectedCerts, d.id)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ ...lbl, marginBottom: 12 }}>Missions proposées</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {domains
                .filter(d => d.partner_type === clientType && d.category === 'domain')
                .map(d => (
                <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ accentColor: 'var(--red)' }} 
                    checked={selectedComp.includes(d.id)}
                    onChange={() => toggle(selectedComp, setSelectedComp, d.id)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={lbl}>Nb. de personnes certifiées SS3</label>
            <input 
              type="number" 
              className="input" 
              placeholder="ex. 3" 
              min="0" 
              value={nbCertified}
              onChange={e => setNbCertified(parseInt(e.target.value) || 0)}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.8px', fontFamily: SANS, marginBottom: 20, textTransform: 'uppercase' }}>
              ZONE GÉOGRAPHIQUE D'INTERVENTION
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Couverture géographique</label>
                <CustomSelect
                  options={[
                    { id: 'international', label: 'International' },
                    { id: 'national',   label: 'France entière (National)' },
                    { id: 'region',     label: 'Par Région' },
                    { id: 'department', label: 'Par Département' },
                  ]}
                  value={geoScope}
                  onChange={v => { setGeoScope(v as any); setSelectedGeo([]) }}
                  placeholder="Choisir l'échelle d'intervention..."
                />
              </div>

              {geoScope === 'region' && (
                <div className="fade-in">
                  <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner la région</label>
                  <CustomMultiSelect
                    options={regions.map(r => ({ id: r.code, label: r.label }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Choisir une ou plusieurs régions..."
                  />
                </div>
              )}

              {geoScope === 'department' && (
                <div className="fade-in">
                  <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner le département</label>
                  <CustomMultiSelect
                    options={departments.map(d => ({ id: d.code, label: `${d.code} - ${d.label}` }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Choisir un ou plusieurs départements..."
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={lbl}>Marchés couverts</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Marché public', 'Marché privé', 'Particulier'].map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ accentColor: 'var(--red)' }} 
                    checked={selectedMarkets.includes(m)}
                    onChange={() => toggle(selectedMarkets, setSelectedMarkets, m)}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section spécifique Laboratoire / Préleveur */}
      {type === 'partenaire' && clientType === 'sampler_lab' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.8px', fontFamily: SANS, marginBottom: 16, textTransform: 'uppercase' }}>ACCRÉDITATIONS LABORATOIRE / PRÉLEVEUR</p>
            <label style={{ ...lbl, marginBottom: 12 }}>Prestations proposées</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {domains
                .filter(d => d.partner_type === clientType && (d.category === 'domain' || d.category === 'certification'))
                .map(d => (
                <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ accentColor: 'var(--red)' }} 
                    checked={selectedComp.includes(d.id)}
                    onChange={() => toggle(selectedComp, setSelectedComp, d.id)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

            <div>
              <label style={lbl}>Nb. de préleveurs certifiés</label>
              <input 
                type="number" 
                className="input" 
                placeholder="ex. 4" 
                min="0" 
                value={nbCertified}
                onChange={e => setNbCertified(parseInt(e.target.value) || 0)}
              />
            </div>


          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.8px', fontFamily: SANS, marginBottom: 20, textTransform: 'uppercase' }}>
              ZONE GÉOGRAPHIQUE D'INTERVENTION
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Couverture géographique</label>
                <CustomSelect
                  options={[
                    { id: 'international', label: 'International' },
                    { id: 'national',   label: 'France entière (National)' },
                    { id: 'region',     label: 'Par Région' },
                    { id: 'department', label: 'Par Département' },
                  ]}
                  value={geoScope}
                  onChange={v => { setGeoScope(v as any); setSelectedGeo([]) }}
                  placeholder="Choisir l'échelle d'intervention..."
                />
              </div>

              {geoScope === 'region' && (
                <div className="fade-in">
                  <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner la région</label>
                  <CustomMultiSelect
                    options={regions.map(r => ({ id: r.code, label: r.label }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Choisir une ou plusieurs régions..."
                  />
                </div>
              )}

              {geoScope === 'department' && (
                <div className="fade-in">
                  <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner le département</label>
                  <CustomMultiSelect
                    options={departments.map(d => ({ id: d.code, label: `${d.code} - ${d.label}` }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Choisir un ou plusieurs départements..."
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={lbl}>Marchés couverts</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Marché public', 'Marché privé', 'Particulier'].map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ accentColor: 'var(--red)' }} 
                    checked={selectedMarkets.includes(m)}
                    onChange={() => toggle(selectedMarkets, setSelectedMarkets, m)}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section spécifique Désamianteur */}
      {type === 'partenaire' && clientType === 'asbestos_remover' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.8px', fontFamily: SANS, marginBottom: 16, textTransform: 'uppercase' }}>QUALIFICATIONS DÉSAMIANTEUR</p>
            <label style={{ ...lbl, marginBottom: 12 }}>Certifications détenues (par personne)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {domains
                .filter(d => d.partner_type === clientType && d.category === 'certification')
                .map(d => (
                <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ accentColor: 'var(--red)' }} 
                    checked={selectedCerts.includes(d.id)}
                    onChange={() => toggle(selectedCerts, setSelectedCerts, d.id)}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

            <div>
              <label style={{ ...lbl, marginBottom: 12 }}>Domaines d'intervention certifiés</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {domains
                  .filter(d => d.partner_type === clientType && d.category === 'domain')
                  .map(d => (
                  <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ accentColor: 'var(--red)' }} 
                      checked={selectedComp.includes(d.id)}
                      onChange={() => toggle(selectedComp, setSelectedComp, d.id)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={lbl}>Nb. de désamianteurs certifiés</label>
              <input 
                type="number" 
                className="input" 
                placeholder="ex. 5" 
                min="0" 
                value={nbCertified}
                onChange={e => setNbCertified(parseInt(e.target.value) || 0)}
              />
            </div>


          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.8px', fontFamily: SANS, marginBottom: 20, textTransform: 'uppercase' }}>
              ZONE GÉOGRAPHIQUE D'INTERVENTION
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Couverture géographique</label>
                <CustomSelect
                  options={[
                    { id: 'international', label: 'International' },
                    { id: 'national',   label: 'France entière (National)' },
                    { id: 'region',     label: 'Par Région' },
                    { id: 'department', label: 'Par Département' },
                  ]}
                  value={geoScope}
                  onChange={v => { setGeoScope(v as any); setSelectedGeo([]) }}
                  placeholder="Choisir l'échelle d'intervention..."
                />
              </div>

              {geoScope === 'region' && (
                <div className="fade-in">
                  <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner la région</label>
                  <CustomMultiSelect
                    options={regions.map(r => ({ id: r.code, label: r.label }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Choisir une ou plusieurs régions..."
                  />
                </div>
              )}

              {geoScope === 'department' && (
                <div className="fade-in">
                  <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner le département</label>
                  <CustomMultiSelect
                    options={departments.map(d => ({ id: d.code, label: `${d.code} - ${d.label}` }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Choisir un ou plusieurs départements..."
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={lbl}>Marchés couverts</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Marché public', 'Marché privé', 'Particulier'].map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ accentColor: 'var(--red)' }} 
                    checked={selectedMarkets.includes(m)}
                    onChange={() => toggle(selectedMarkets, setSelectedMarkets, m)}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section spécifique Expert Judiciaire / Avocat */}
      {type === 'partenaire' && (clientType === 'legal_expert' || clientType === 'specialized_lawyer') && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>

          {/* Compétences */}
          {domains.filter(d => d.partner_type === clientType && d.category === 'domain').length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-400)', letterSpacing: '0.5px', fontFamily: SANS, marginBottom: 16, textTransform: 'uppercase' }}>
                {clientType === 'legal_expert' ? 'COMPÉTENCES EXPERT JUDICIAIRE' : 'COMPÉTENCES AVOCAT'}
              </p>
              <label style={{ ...lbl, marginBottom: 12 }}>Compétences exercées</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {domains
                  .filter(d => d.partner_type === clientType && d.category === 'domain')
                  .map(d => (
                    <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        style={{ accentColor: 'var(--red)' }}
                        checked={selectedComp.includes(d.id)}
                        onChange={() => toggle(selectedComp, setSelectedComp, d.id)}
                      />
                      {d.label}
                    </label>
                  ))}
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.8px', fontFamily: SANS, marginBottom: 20, textTransform: 'uppercase' }}>
              ZONE GÉOGRAPHIQUE D'INTERVENTION
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Couverture géographique</label>
                <CustomSelect
                  options={[
                    { id: 'international', label: 'International' },
                    { id: 'national',   label: 'France entière (National)' },
                    { id: 'region',     label: 'Par Région' },
                    { id: 'department', label: 'Par Département' },
                  ]}
                  value={geoScope}
                  onChange={v => { setGeoScope(v as any); setSelectedGeo([]) }}
                  placeholder="Choisir l'échelle d'intervention..."
                />
              </div>

              {geoScope === 'region' && (
                <div className="fade-in">
                  <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner la région</label>
                  <CustomMultiSelect
                    options={regions.map(r => ({ id: r.code, label: r.label }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Choisir une ou plusieurs régions..."
                  />
                </div>
              )}

              {geoScope === 'department' && (
                <div className="fade-in">
                  <label style={{ ...lbl, fontSize: 14, marginBottom: 8 }}>Sélectionner le département</label>
                  <CustomMultiSelect
                    options={departments.map(d => ({ id: d.code, label: `${d.code} - ${d.label}` }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Choisir un ou plusieurs départements..."
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={lbl}>Marchés couverts</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Marché public', 'Marché privé', 'Particulier'].map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ accentColor: 'var(--red)' }} 
                    checked={selectedMarkets.includes(m)}
                    onChange={() => toggle(selectedMarkets, setSelectedMarkets, m)}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SIRET — affiché pour pro privé et public */}
      {needsSiret && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-400)', letterSpacing: '0.5px', fontFamily: SANS, marginBottom: 12 }}>ENTREPRISE</p>
          <label style={lbl}>Numéro SIRET</label>
          <div style={{ position: 'relative' }}>
            <input 
              className="input" 
              placeholder="123 456 789 00012" 
              value={siret} 
              onChange={e => setSiret(e.target.value.replace(/\s/g, ''))} 
              maxLength={14}
              style={{ paddingRight: 40 }}
            />
            <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
              {siretStatus === 'loading' && <Loader size={16} className="animate-spin" style={{ color: 'var(--red)' }} />}
              {siretStatus === 'ok' && <CheckCircle size={16} style={{ color: '#10B981' }} />}
            </div>
          </div>

          {/* Progress bar - visible until 14 digits or while loading */}
          {siret.length > 0 && siretStatus !== 'ok' && (
            <div style={{ height: 2, background: 'var(--gray-100)', marginTop: 4, borderRadius: 1 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--red)', transition: 'width 0.3s', borderRadius: 1 }} />
            </div>
          )}

          {/* Résultat SIRET */}
          {siretStatus === 'ok' && siretData && (
            <div style={{ marginTop: 12, padding: 14, background: 'var(--gray-50)', borderRadius: 6, border: '1px solid var(--gray-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{siretData.raison_sociale}</span>
                <span style={{ fontSize: 10, background: siretData.est_actif ? '#E8F5E9' : '#FFEBEE', color: siretData.est_actif ? '#2E7D32' : '#C62828', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                  {siretData.est_actif ? 'ACTIF' : 'INACTIF'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>{siretData.activite}</p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{siretData.adresse} {siretData.cp} {siretData.ville}</p>
              
              {!siretConfirmed && (
                <button 
                  type="button"
                  onClick={() => setSiretConfirmed(true)}
                  className="btn btn-red btn-sm"
                  style={{ width: '100%', marginTop: 12 }}
                >
                  Confirmer cette entreprise
                </button>
              )}
              {siretConfirmed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: 12, fontWeight: 600, marginTop: 12, justifyContent: 'center' }}>
                  <CheckCircle size={14} /> Entreprise confirmée
                </div>
              )}
            </div>
          )}

          {siretConfirmed && (
            <div className="fade-in" style={{ marginTop: 18 }}>
              <label style={lbl}>Description de l'entreprise</label>
              <textarea 
                className="input" 
                placeholder="Présentez votre activité en quelques lignes..." 
                style={{ minHeight: 100, paddingTop: 12, resize: 'vertical' }}
                value={companyDescription}
                onChange={e => setCompanyDescription(e.target.value)}
              />
              <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6, lineHeight: 1.4 }}>
                Cette description sera visible par les clients sur votre profil.
              </p>

              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 16 }}>
                <div>
                  <label style={lbl}>Adresse du siège <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input className="input" value={manualAddress} onChange={e => setManualAddress(e.target.value)} placeholder="Adresse" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                  <div>
                    <label style={lbl}>Code Postal <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input className="input" value={manualZip} onChange={e => setManualZip(e.target.value)} placeholder="CP" required />
                  </div>
                  <div>
                    <label style={lbl}>Ville <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input className="input" value={manualCity} onChange={e => setManualCity(e.target.value)} placeholder="Ville" required />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          
        </div>
      )}

      {/* CGU */}
      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={cgu} onChange={e => setCgu(e.target.checked)} style={{ accentColor: 'var(--red)' }} />
          <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>
            J'accepte les <Link href="/cgu" style={{ color: 'var(--red)', textDecoration: 'none', fontWeight: 600 }}>Conditions Générales d'Utilisation</Link>
          </span>
        </label>
      </div>

      {error && <p style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center' }}>{error}</p>}

      {/* Documents à fournir - Recap at the end for Partners */}
      {type === 'partenaire' && (clientType === 'diagnostician' || clientType === 'project_manager' || clientType === 'asbestos_remover' || clientType === 'sampler_lab') && (() => {
        const docs = (() => {
          let dList = docTypes.filter(d => d.partner_type === clientType)
          if (clientType === 'project_manager') {
            dList = dList.filter(d => d.label !== 'Organigramme')
            if (!dList.find(d => d.label === 'Encadrement SS3')) {
              dList.push({ id: 'manual-ss3', label: 'Encadrement SS3', partner_type: 'project_manager' } as any)
            }
          }
          if (clientType === 'asbestos_remover') {
            if (!dList.find(d => d.label === 'Certification Qualibat 1552')) {
              dList.push({ id: 'manual-qualibat', label: 'Certification Qualibat 1552', partner_type: 'asbestos_remover' } as any)
            }
          }
          if (clientType === 'sampler_lab') {
            dList = dList.map(d => 
              d.label === 'Attestations SS4 préleveur' 
                ? { ...d, label: 'SS4 (si pratiqué)' } 
                : d
            )
          }
          return dList
        })()

        if (docs.length === 0) return null

        return (
          <div style={{ background: 'white', borderRadius: 12, padding: '28px 32px', border: '1px solid var(--gray-100)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(192, 57, 43, 0.08)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileCheck size={18} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, fontFamily: SANS, color: 'var(--black)' }}>Documents à fournir</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {docs.map(d => (
                <div key={d.id} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ marginTop: 4, width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--black)', marginBottom: 2, fontFamily: SANS }}>{d.label}</div>
                    {d.description && <p style={{ fontSize: 12, color: 'var(--gray-400)', lineHeight: 1.4 }}>{d.description}</p>}
                  </div>
                </div>
              ))}
            </div>

              <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(52, 152, 219, 0.05)', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Info size={16} style={{ color: '#3498DB', marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: '#34495E', lineHeight: 1.5 }}>
                  Ces documents seront à téléverser dans votre espace partenaire après la validation de votre compte par nos services.
                </p>
              </div>
            </div>
          )
        })()}

      <button type="submit" className="btn btn-red" disabled={loading} style={{ width: '100%', marginTop: 12, padding: 16 }}>
        {loading ? <Loader size={18} className="animate-spin" /> : 'Créer mon compte'}
      </button>
    </form>
  )
}
