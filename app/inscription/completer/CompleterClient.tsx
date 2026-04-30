'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import CustomSelect from '@/components/ui/CustomSelect'
import CustomMultiSelect from '@/components/ui/CustomMultiSelect'
import { ArrowLeft, CheckCircle, Loader, ShieldCheck } from 'lucide-react'
import { INSCRIPTION_CLIENT_TYPES, INSCRIPTION_PARTNER_TYPES, NEEDS_SIRET } from '@/lib/constants'

const SANS = 'var(--font-sans, DM Sans, sans-serif)'
const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 7, fontFamily: SANS }

type Props = {
  initialType: 'client' | 'partenaire'
  googleName: string
  googleEmail: string
  initialRegions: any[]
  initialDepartments: any[]
  initialDocTypes: any[]
  initialDomains: any[]
}

export default function CompleterClient({
  initialType, googleName, googleEmail,
  initialRegions, initialDepartments, initialDocTypes, initialDomains,
}: Props) {
  const router = useRouter()

  const [type, setType] = useState<'client' | 'partenaire'>(initialType)
  const [step, setStep] = useState<'type' | 'profil' | 'zones' | 'cgu' | 'siret_client'>('type')

  // Identité pré-remplie depuis Google
  const nameParts = googleName.split(' ')
  const [prenom, setPrenom] = useState(nameParts[0] ?? '')
  const [nom, setNom]       = useState(nameParts.slice(1).join(' ') ?? '')
  const [tel, setTel]       = useState('')

  // Partenaire
  const [clientType, setClientType] = useState('')
  const [siret, setSiret]           = useState('')
  const [siretStatus, setSiretStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [siretData, setSiretData]   = useState<{
    raison_sociale: string; activite: string; adresse: string
    ville: string; cp: string; est_actif: boolean; lat?: number; lng?: number
  } | null>(null)
  const [siretConfirmed, setSiretConfirmed] = useState(false)
  const [companyDescription, setCompanyDescription] = useState('')
  const [nbCertified, setNbCertified] = useState(0)
  const [selectedCerts, setSelectedCerts]   = useState<string[]>([])
  const [selectedComp, setSelectedComp]     = useState<string[]>([])
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const [geoScope, setGeoScope]   = useState<'international' | 'national' | 'region' | 'department' | ''>('')
  const [selectedGeo, setSelectedGeo] = useState<string[]>([])

  // Client
  const [clientAccountType, setClientAccountType] = useState('')

  const [cgu, setCgu]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const siretTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Vérification SIRET automatique
  useEffect(() => {
    const digits = siret.replace(/\D/g, '')
    if (digits.length !== 14) { setSiretStatus('idle'); return }
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
          let finalVille   = data.ville ?? ''
          let finalCp      = data.code_postal ?? data.cp ?? ''
          let finalLat, finalLng

          try {
            const query = [finalAdresse, finalCp, finalVille].filter(Boolean).join(' ')
            const geoRes = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`)
            const geoData = await geoRes.json()
            if (geoData.features?.[0]) {
              const props = geoData.features[0].properties
              const coords = geoData.features[0].geometry.coordinates
              if (coords?.length === 2) { finalLng = coords[0]; finalLat = coords[1] }
              if (props.label)    finalAdresse = props.label
              if (props.city)     finalVille   = props.city.toUpperCase()
              if (props.postcode) finalCp      = props.postcode
            }
          } catch {}

          setSiretData({ raison_sociale: data.raison_sociale, activite: data.activite ?? '',
            adresse: finalAdresse, ville: finalVille, cp: finalCp,
            est_actif: data.est_actif ?? true, lat: finalLat, lng: finalLng })
          if (data.activite) setCompanyDescription(data.activite)
          setSiretStatus('ok')
        } else {
          setSiretStatus('error'); setSiretData(null)
        }
      } catch { setSiretStatus('error') }
    }, 600)
    return () => { if (siretTimer.current) clearTimeout(siretTimer.current) }
  }, [siret])

  const toggle = (list: string[], set: (v: string[]) => void, item: string) => {
    set(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  async function handleSubmit() {
    if (!cgu) { setError("Veuillez accepter les CGU."); return }
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Session expirée. Veuillez vous reconnecter."); setLoading(false); return }

    try {
      if (type === 'client') {
        const clientNeedsSiret = NEEDS_SIRET.includes(clientAccountType)
        const { error: err } = await supabase.from('clients').insert({
          user_id: user.id,
          first_name: prenom,
          last_name: nom,
          email: googleEmail,
          phone: tel,
          client_type: clientAccountType || 'individual',
          ...(clientNeedsSiret && siretConfirmed && siretData ? {
            siret: siret.replace(/\D/g, ''),
            company_name: siretData.raison_sociale,
            company_address: siretData.adresse,
            company_activity: siretData.activite,
          } : {}),
          cgu_accepted_at: new Date().toISOString(),
        })
        if (err) throw err
        router.push('/espace-client')
      } else {
        const { data: newPartner, error: err } = await supabase.from('partners').insert({
          user_id: user.id,
          partner_type: clientType,
          first_name: prenom,
          last_name: nom,
          email: googleEmail,
          phone: tel,
          company_name: siretData?.raison_sociale ?? '',
          description: companyDescription || siretData?.activite || '',
          siret: siret.replace(/\D/g, ''),
          company_address: siretData?.adresse ?? '',
          city: siretData?.ville ?? '',
          zip_code: siretData?.cp ?? '',
          company_activity: siretData?.activite ?? '',
          certified_workers_count: nbCertified,
          lat: siretData?.lat ?? null,
          lng: siretData?.lng ?? null,
          is_active: true,
          is_verified: false,
          cgu_accepted_at: new Date().toISOString(),
        }).select('id').single()
        if (err) throw err

        if (newPartner && geoScope) {
          const zones: any[] = []
          if (geoScope === 'international') {
            zones.push({ partner_id: newPartner.id, scope: 'international' })
          } else if (geoScope === 'national') {
            zones.push({ partner_id: newPartner.id, scope: 'nationwide' })
          } else if (geoScope === 'region') {
            selectedGeo.forEach(code => {
              const r = initialRegions.find(x => x.code === code)
              if (r) zones.push({ partner_id: newPartner.id, scope: 'region', region_id: r.id })
            })
          } else if (geoScope === 'department') {
            selectedGeo.forEach(code => {
              const d = initialDepartments.find(x => x.code === code)
              if (d) zones.push({ partner_id: newPartner.id, scope: 'department', department_id: d.id })
            })
          }
          if (zones.length > 0) await supabase.from('intervention_zones').insert(zones)
        }

        if (newPartner && selectedMarkets.length > 0) {
          const markets = selectedMarkets.map(m => ({
            partner_id: newPartner.id,
            market: m === 'Marché public' ? 'public' : m === 'Marché privé' ? 'private' : 'residential',
          })).filter(m => m.market)
          if (markets.length > 0) await supabase.from('target_markets').insert(markets)
        }

        const domainIds = [...selectedCerts, ...selectedComp]
        if (newPartner && domainIds.length > 0) {
          await supabase.from('partner_domains').insert(
            domainIds.map(domain_id => ({ partner_id: newPartner.id, domain_id }))
          )
        }

        router.push('/espace-partenaire')
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'enregistrement.")
      setLoading(false)
    }
  }

  const needsSiret = NEEDS_SIRET.includes(clientType)
  const domains = initialDomains
  const docTypes = initialDocTypes

  // Calcul de la progression des étapes
  const clientNeedsSiret = type === 'client' && NEEDS_SIRET.includes(clientAccountType)
  
  const steps =
    type === 'client'
      ? (clientNeedsSiret ? ['type', 'siret_client', 'cgu'] : ['type', 'cgu'])
      : ['type', 'profil', 'zones', 'cgu']
  const stepIdx = steps.indexOf(step as any)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-serif, DM Serif Display)', fontSize: 18, fontWeight: 400 }}>
          Désamianteurs<span style={{ color: '#C0392B' }}>.fr</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {steps.map((s, i) => (
            <div key={s} style={{
              width: 28, height: 4, borderRadius: 2,
              background: i <= stepIdx ? '#C0392B' : '#E5E7EB',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', maxWidth: 560, width: '100%', padding: '48px' }}>

          {/* Bannière compte Google */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 16px', marginBottom: 32 }}>
            <CheckCircle size={16} color="#16A34A" strokeWidth={2} />
            <span style={{ fontSize: 13, color: '#166534', fontFamily: SANS }}>
              Compte Google connecté — <strong>{googleEmail}</strong>
            </span>
          </div>

          {/* ÉTAPE : Choix du type */}
          {step === 'type' && (
            <div>
              <h1 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Bienvenue !</h1>
              <p style={{ fontFamily: SANS, fontSize: 14, color: '#9CA3AF', marginBottom: 32 }}>
                Votre compte Google a bien été créé. Quelques informations pour finaliser votre profil.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                <div><label style={lbl}>Prénom</label>
                  <input className="input" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Jean" />
                </div>
                <div><label style={lbl}>Nom</label>
                  <input className="input" value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" />
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={lbl}>Téléphone <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(facultatif)</span></label>
                <input type="tel" className="input" value={tel} onChange={e => setTel(e.target.value)} placeholder="06 00 00 00 00" />
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={lbl}>Je suis <span style={{ color: '#C0392B' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {([
                    { value: 'client', label: 'Client', sub: 'Je cherche un professionnel' },
                    { value: 'partenaire', label: 'Professionnel', sub: 'Je propose mes services' },
                  ] as const).map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setType(opt.value)}
                      style={{
                        padding: '16px', border: `1.5px solid ${type === opt.value ? '#C0392B' : '#E5E7EB'}`,
                        borderRadius: 10, background: type === opt.value ? 'rgba(192,57,43,0.04)' : 'white',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 14, color: type === opt.value ? '#C0392B' : '#111', marginBottom: 4 }}>{opt.label}</div>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: '#9CA3AF' }}>{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {type === 'client' && (
                <div style={{ marginBottom: 28 }}>
                  <label style={lbl}>Type de compte <span style={{ color: '#C0392B' }}>*</span></label>
                  <CustomSelect
                    options={INSCRIPTION_CLIENT_TYPES}
                    value={clientAccountType}
                    onChange={setClientAccountType}
                    placeholder="Sélectionnez votre profil"
                  />
                </div>
              )}

              <button
                className="btn btn-red"
                style={{ width: '100%', padding: 16, textTransform: 'none', letterSpacing: 0 }}
                onClick={() => {
                  if (!prenom.trim()) { setError('Le prénom est requis.'); return }
                  if (type === 'client' && !clientAccountType) { setError('Choisissez votre type de compte.'); return }
                  setError('')
                  if (type === 'client') {
                    setStep(clientNeedsSiret ? 'siret_client' : 'cgu')
                  } else {
                    setStep('profil')
                  }
                }}
              >
                Continuer →
              </button>
              {error && <p style={{ color: '#C0392B', fontSize: 13, marginTop: 12, fontFamily: SANS }}>{error}</p>}
            </div>
          )}

          {/* ÉTAPE : Profil professionnel */}
          {step === 'profil' && (
            <div>
              <button type="button" onClick={() => setStep('type')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 13, marginBottom: 24, fontFamily: SANS }}>
                <ArrowLeft size={14} /> Retour
              </button>
              <h2 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Votre activité professionnelle</h2>
              <p style={{ fontFamily: SANS, fontSize: 14, color: '#9CA3AF', marginBottom: 28 }}>
                Ces informations permettront de vous mettre en relation avec les bons dossiers.
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Type de métier <span style={{ color: '#C0392B' }}>*</span></label>
                <CustomSelect
                  options={INSCRIPTION_PARTNER_TYPES}
                  value={clientType}
                  onChange={setClientType}
                  placeholder="Sélectionnez votre métier"
                />
              </div>

              {needsSiret && (
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>SIRET <span style={{ color: '#C0392B' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input" placeholder="Ex : 123 456 789 00012"
                      value={siret} onChange={e => setSiret(e.target.value)}
                      style={{ paddingRight: 44 }}
                    />
                    <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
                      {siretStatus === 'loading' && <Loader size={16} color="#9CA3AF" className="spin" />}
                      {siretStatus === 'ok'      && <CheckCircle size={16} color="#059669" />}
                      {siretStatus === 'error'   && <span style={{ fontSize: 18, color: '#C0392B' }}>✗</span>}
                    </div>
                  </div>
                  {siretStatus === 'error' && (
                    <p style={{ fontSize: 12, color: '#C0392B', marginTop: 4, fontFamily: SANS }}>SIRET introuvable ou invalide.</p>
                  )}
                  {siretStatus === 'ok' && siretData && (
                    <div style={{ marginTop: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#166534', fontFamily: SANS }}>{siretData.raison_sociale}</div>
                      <div style={{ fontSize: 12, color: '#4B7A5E', marginTop: 2, fontFamily: SANS }}>{siretData.adresse} — {siretData.cp} {siretData.ville}</div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer', fontSize: 13, color: '#374151', fontFamily: SANS }}>
                        <input type="checkbox" checked={siretConfirmed} onChange={e => setSiretConfirmed(e.target.checked)} style={{ accentColor: '#C0392B' }} />
                        Je confirme que c'est bien mon entreprise
                      </label>
                    </div>
                  )}
                </div>
              )}

              {siretStatus === 'ok' && siretData && (
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Description de l'activité</label>
                  <textarea className="input" rows={3} value={companyDescription}
                    onChange={e => setCompanyDescription(e.target.value)}
                    placeholder="Décrivez brièvement votre activité..."
                    style={{ resize: 'vertical', fontFamily: SANS }}
                  />
                </div>
              )}

              {/* Certifications */}
              {clientType && (
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Certifications</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {domains.filter(d => d.partner_type === clientType && d.category === 'certification').map(d => {
                      const active = selectedCerts.includes(d.id)
                      return (
                        <button key={d.id} type="button"
                          onClick={() => toggle(selectedCerts, setSelectedCerts, d.id)}
                          style={{
                            padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            fontFamily: SANS, transition: 'all 0.15s',
                            border: `1.5px solid ${active ? '#C0392B' : '#E5E7EB'}`,
                            background: active ? 'rgba(192,57,43,0.08)' : 'white',
                            color: active ? '#C0392B' : '#6B7280',
                          }}>
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Compétences */}
              {clientType && domains.some(d => d.partner_type === clientType && d.category === 'domain') && (
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Compétences</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {domains.filter(d => d.partner_type === clientType && d.category === 'domain').map(d => {
                      const active = selectedComp.includes(d.id)
                      return (
                        <button key={d.id} type="button"
                          onClick={() => toggle(selectedComp, setSelectedComp, d.id)}
                          style={{
                            padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            fontFamily: SANS, transition: 'all 0.15s',
                            border: `1.5px solid ${active ? '#111' : '#E5E7EB'}`,
                            background: active ? '#111' : 'white',
                            color: active ? 'white' : '#6B7280',
                          }}>
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Nombre de salariés certifiés</label>
                <input type="number" className="input" min={0} value={nbCertified}
                  onChange={e => setNbCertified(parseInt(e.target.value) || 0)} />
              </div>

              {/* Marchés */}
              <div style={{ marginBottom: 28 }}>
                <label style={lbl}>Marchés cibles</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Marché public', 'Marché privé', 'Particulier'].map(m => {
                    const active = selectedMarkets.includes(m)
                    return (
                      <button key={m} type="button"
                        onClick={() => toggle(selectedMarkets, setSelectedMarkets, m)}
                        style={{
                          flex: 1, padding: '10px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          fontFamily: SANS, transition: 'all 0.15s',
                          border: `1.5px solid ${active ? '#C0392B' : '#E5E7EB'}`,
                          background: active ? 'rgba(192,57,43,0.06)' : 'white',
                          color: active ? '#C0392B' : '#6B7280',
                        }}>
                        {m}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                className="btn btn-red"
                style={{ width: '100%', padding: 16, textTransform: 'none', letterSpacing: 0 }}
                onClick={() => {
                  if (!clientType) { setError('Choisissez votre type de métier.'); return }
                  if (needsSiret && !siretConfirmed) { setError('Veuillez vérifier et confirmer votre SIRET.'); return }
                  setError('')
                  setStep('zones')
                }}
              >
                Continuer →
              </button>
              {error && <p style={{ color: '#C0392B', fontSize: 13, marginTop: 12, fontFamily: SANS }}>{error}</p>}
            </div>
          )}

          {/* ÉTAPE : Zones d'intervention */}
          {step === 'zones' && (
            <div>
              <button type="button" onClick={() => setStep('profil')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 13, marginBottom: 24, fontFamily: SANS }}>
                <ArrowLeft size={14} /> Retour
              </button>
              <h2 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Zone d'intervention</h2>
              <p style={{ fontFamily: SANS, fontSize: 14, color: '#9CA3AF', marginBottom: 28 }}>
                Définissez la portée géographique de votre activité.
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Périmètre <span style={{ color: '#C0392B' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {([
                    { value: 'department', label: 'Département(s)' },
                    { value: 'region',     label: 'Région(s)' },
                    { value: 'national',   label: 'National' },
                    { value: 'international', label: 'International' },
                  ] as const).map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => { setGeoScope(opt.value); setSelectedGeo([]) }}
                      style={{
                        padding: '12px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        fontFamily: SANS, transition: 'all 0.15s',
                        border: `1.5px solid ${geoScope === opt.value ? '#C0392B' : '#E5E7EB'}`,
                        background: geoScope === opt.value ? 'rgba(192,57,43,0.04)' : 'white',
                        color: geoScope === opt.value ? '#C0392B' : '#374151',
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {geoScope === 'region' && (
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Régions <span style={{ color: '#C0392B' }}>*</span></label>
                  <CustomMultiSelect
                    options={initialRegions.map(r => ({ id: r.code, label: r.name }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Sélectionnez une ou plusieurs régions"
                  />
                </div>
              )}

              {geoScope === 'department' && (
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>Départements <span style={{ color: '#C0392B' }}>*</span></label>
                  <CustomMultiSelect
                    options={initialDepartments.map(d => ({ id: d.code, label: `${d.code} — ${d.name}` }))}
                    value={selectedGeo}
                    onChange={setSelectedGeo}
                    placeholder="Sélectionnez un ou plusieurs départements"
                  />
                </div>
              )}

              {(geoScope === 'national' || geoScope === 'international') && (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: '#166534', fontFamily: SANS, margin: 0 }}>
                    Vous interviendrez sur tout le territoire {geoScope === 'international' ? 'et à l\'international' : 'français'}.
                  </p>
                </div>
              )}

              <button
                className="btn btn-red"
                style={{ width: '100%', padding: 16, textTransform: 'none', letterSpacing: 0 }}
                onClick={() => {
                  if (!geoScope) { setError('Choisissez votre périmètre d\'intervention.'); return }
                  if ((geoScope === 'region' || geoScope === 'department') && selectedGeo.length === 0) {
                    setError('Sélectionnez au moins une zone.'); return
                  }
                  setError('')
                  setStep('cgu')
                }}
              >
                Continuer →
              </button>
              {error && <p style={{ color: '#C0392B', fontSize: 13, marginTop: 12, fontFamily: SANS }}>{error}</p>}
            </div>
          )}

          {/* ÉTAPE : SIRET Client Pro/Public */}
          {step === 'siret_client' && (
            <div>
              <button type="button" onClick={() => setStep('type')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 13, marginBottom: 24, fontFamily: SANS }}>
                <ArrowLeft size={14} /> Retour
              </button>
              <h2 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Informations entreprise</h2>
              <p style={{ fontFamily: SANS, fontSize: 14, color: '#9CA3AF', marginBottom: 28 }}>
                En tant que professionnel ou collectivité, nous avons besoin de votre SIRET pour valider votre compte.
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>SIRET <span style={{ color: '#C0392B' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input" placeholder="Ex : 123 456 789 00012"
                    value={siret} onChange={e => setSiret(e.target.value)}
                    style={{ paddingRight: 44 }}
                  />
                  <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
                    {siretStatus === 'loading' && <Loader size={16} color="#9CA3AF" className="spin" />}
                    {siretStatus === 'ok'      && <CheckCircle size={16} color="#059669" />}
                    {siretStatus === 'error'   && <span style={{ fontSize: 18, color: '#C0392B' }}>✗</span>}
                  </div>
                </div>
                {siretStatus === 'error' && (
                  <p style={{ fontSize: 12, color: '#C0392B', marginTop: 4, fontFamily: SANS }}>SIRET introuvable ou invalide.</p>
                )}
                {siretStatus === 'ok' && siretData && (
                  <div style={{ marginTop: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#166534', fontFamily: SANS }}>{siretData.raison_sociale}</div>
                    <div style={{ fontSize: 12, color: '#4B7A5E', marginTop: 2, fontFamily: SANS }}>{siretData.adresse} — {siretData.cp} {siretData.ville}</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer', fontSize: 13, color: '#374151', fontFamily: SANS }}>
                      <input type="checkbox" checked={siretConfirmed} onChange={e => setSiretConfirmed(e.target.checked)} style={{ accentColor: '#C0392B' }} />
                      Je confirme que c'est bien mon entreprise
                    </label>
                  </div>
                )}
              </div>

              <button
                className="btn btn-red"
                style={{ width: '100%', padding: 16, textTransform: 'none', letterSpacing: 0 }}
                onClick={() => {
                  if (!siretConfirmed) { setError('Veuillez vérifier et confirmer votre SIRET.'); return }
                  setError('')
                  setStep('cgu')
                }}
              >
                Continuer →
              </button>
              {error && <p style={{ color: '#C0392B', fontSize: 13, marginTop: 12, fontFamily: SANS }}>{error}</p>}
            </div>
          )}

          {/* ÉTAPE : CGU + Soumission */}
          {step === 'cgu' && (
            <div>
              <button type="button" onClick={() => {
                if (type === 'client') {
                  setStep(clientNeedsSiret ? 'siret_client' : 'type')
                } else {
                  setStep('zones')
                }
              }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 13, marginBottom: 24, fontFamily: SANS }}>
                <ArrowLeft size={14} /> Retour
              </button>
              <h2 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Dernière étape</h2>
              <p style={{ fontFamily: SANS, fontSize: 14, color: '#9CA3AF', marginBottom: 28 }}>
                Acceptez les conditions pour finaliser votre inscription.
              </p>

              {/* Récapitulatif */}
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: SANS, marginBottom: 12 }}>Récapitulatif</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: SANS }}>
                    <span style={{ color: '#6B7280' }}>Compte</span>
                    <span style={{ fontWeight: 600 }}>{googleEmail}</span>
                  </div>
                  {type === 'partenaire' && siretData && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: SANS }}>
                      <span style={{ color: '#6B7280' }}>Entreprise</span>
                      <span style={{ fontWeight: 600 }}>{siretData.raison_sociale}</span>
                    </div>
                  )}
                  {type === 'partenaire' && clientType && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: SANS }}>
                      <span style={{ color: '#6B7280' }}>Métier</span>
                      <span style={{ fontWeight: 600 }}>
                        {INSCRIPTION_PARTNER_TYPES.find(p => p.id === clientType)?.label ?? clientType}
                      </span>
                    </div>
                  )}
                  {type === 'partenaire' && geoScope && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: SANS }}>
                      <span style={{ color: '#6B7280' }}>Zone</span>
                      <span style={{ fontWeight: 600 }}>
                        {geoScope === 'national' ? 'France entière' : geoScope === 'international' ? 'International' : `${selectedGeo.length} zone(s)`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {type === 'partenaire' && (
                <div style={{ background: 'rgba(192,57,43,0.04)', border: '1px solid rgba(192,57,43,0.12)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10 }}>
                  <ShieldCheck size={16} color="#C0392B" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0, fontFamily: SANS, lineHeight: 1.6 }}>
                    Votre compte sera soumis à validation par notre équipe sous 5 jours ouvrés. Vous recevrez un e-mail de confirmation.
                  </p>
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#4B5563', cursor: 'pointer', fontFamily: SANS, marginBottom: 24 }}>
                <input type="checkbox" checked={cgu} onChange={e => setCgu(e.target.checked)} style={{ accentColor: '#C0392B', marginTop: 2 }} />
                <span>J'accepte les <Link href="/cgu" style={{ color: '#C0392B' }}>Conditions Générales d'Utilisation</Link> et la <Link href="/confidentialite" style={{ color: '#C0392B' }}>Politique de confidentialité</Link></span>
              </label>

              {error && (
                <div style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#C0392B', fontFamily: SANS }}>
                  {error}
                </div>
              )}

              <button
                className="btn btn-red"
                style={{ width: '100%', padding: 16, textTransform: 'none', letterSpacing: 0, opacity: loading ? 0.7 : 1 }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Création du profil...' : 'Finaliser mon inscription'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
