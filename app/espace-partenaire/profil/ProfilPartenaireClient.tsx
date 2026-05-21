'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'
import { Camera, CheckCircle, ExternalLink, Loader, Star, Briefcase, Users, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase'

type Partner = {
  id: string
  first_name: string; last_name: string; email: string; phone: string | null
  company_name: string; siret: string | null; company_activity: string | null
  company_address: string | null; city: string | null; zip_code: string | null
  description: string | null; partner_type: string; subscription: string
  status: string; is_verified: boolean
  average_rating: number; review_count: number; missions_completed: number
  certified_workers_count: number | null; accept_individuals: boolean
  avatar_url: string | null; logo_url: string | null
}

interface Props {
  partner: Partner
  plan: { label: string; color: string; bg: string }
  avatarColor: string
  initials: string
  partnerId: string
  typeLabel: string
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--gray-700)' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 14, outline: 'none', background: 'white' }

function Section({ title, children, onSave, saving }: { title: string; children: React.ReactNode; onSave?: () => void; saving?: boolean }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--gray-100)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h2>
        {onSave && (
          <button className="btn btn-red btn-sm" onClick={onSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {saving ? <Loader size={13} className="animate-spin" /> : null}
            Sauvegarder
          </button>
        )}
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  )
}

export default function ProfilPartenaireClient({ partner, plan, avatarColor, initials, partnerId, typeLabel }: Props) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Champs éditables
  const [firstName, setFirstName]       = useState(partner.first_name)
  const [lastName, setLastName]         = useState(partner.last_name)
  const [phone, setPhone]               = useState(partner.phone ?? '')
  const [description, setDescription]  = useState(partner.description ?? '')
  const [address, setAddress]           = useState(partner.company_address ?? '')
  const [city, setCity]                 = useState(partner.city ?? '')
  const [zip, setZip]                   = useState(partner.zip_code ?? '')
  const [workers, setWorkers]           = useState(partner.certified_workers_count ?? 0)
  const [acceptInd, setAcceptInd]       = useState(partner.accept_individuals)
  const [mediaUrl, setMediaUrl]         = useState(partner.logo_url || partner.avatar_url || '')
  const [mediaPreview, setMediaPreview] = useState(partner.logo_url || partner.avatar_url || '')

  const [savingPersonal, setSavingPersonal] = useState(false)
  const [savingPresent, setSavingPresent]   = useState(false)
  const [savingAddress, setSavingAddress]   = useState(false)
  const [savingMedia, setSavingMedia]       = useState(false)
  const [success, setSuccess]               = useState<string | null>(null)

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000) }

  async function save(data: Record<string, unknown>, setLoading: (v: boolean) => void, msg: string) {
    setLoading(true)
    const res = await fetch('/api/partner/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setLoading(false)
    if (res.ok) showSuccess(msg)
  }

  async function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return
    setSavingMedia(true)
    const ext  = file.name.split('.').pop() ?? 'jpg'
    // Détermine si c'est un logo (carré) ou photo : on utilise logo_url pour les pros
    const path = `${partner.id}/logo.${ext}`
    const { error } = await supabase.storage.from('user-media').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('user-media').getPublicUrl(path)
      setMediaPreview(publicUrl)
      await save({ logo_url: publicUrl }, () => {}, 'Photo mise à jour')
      showSuccess('Photo / logo mis à jour')
    }
    setSavingMedia(false)
    e.target.value = ''
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Notification succès */}
      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#15803D' }}>
          <CheckCircle size={16} /> {success}
        </motion.div>
      )}

      {/* Header profil */}
      <motion.div variants={fadeUp} style={{ background: 'var(--black)', borderRadius: 16, padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{ width: 80, height: 80, borderRadius: partner.logo_url ? 12 : '50%', background: avatarColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, cursor: 'pointer', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.2)', position: 'relative' }}
          >
            {mediaPreview
              ? <img src={mediaPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>{initials}</span>
            }
            {savingMedia && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader size={18} color="white" className="animate-spin" /></div>}
          </div>
          <div onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
            <Camera size={13} color="var(--black)" />
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleMediaChange} />
        </div>

        {/* Infos */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'white', margin: 0, fontWeight: 700 }}>{partner.company_name}</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: plan.bg, color: plan.color }}>{plan.label}</span>
            {partner.is_verified && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#D1FAE5', color: '#065F46' }}>✓ Vérifié</span>}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{typeLabel} · {partner.siret}</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { Icon: Star,      value: partner.average_rating > 0 ? partner.average_rating.toFixed(1) : '—', label: `${partner.review_count} avis` },
            { Icon: Briefcase, value: partner.missions_completed, label: 'missions' },
          ].map(({ Icon, value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <Icon size={16} color="rgba(255,255,255,0.4)" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Lien profil public */}
        <Link href={`/professionnels/${partner.id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', flexShrink: 0 }}>
          <ExternalLink size={14} /> Voir mon profil public
        </Link>
      </motion.div>

      {/* Informations personnelles */}
      <motion.div variants={fadeUp}>
        <Section title="Informations personnelles" onSave={() => save({ first_name: firstName, last_name: lastName, phone }, setSavingPersonal, 'Informations sauvegardées')} saving={savingPersonal}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>Prénom</label>
              <input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Nom</label>
              <input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={{ ...inputStyle, background: '#F9FAFB', color: 'var(--gray-500)' }} value={partner.email} disabled />
            </div>
            <div>
              <label style={lbl}>Téléphone</label>
              <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="06 00 00 00 00" />
            </div>
          </div>
        </Section>
      </motion.div>

      {/* Présentation */}
      <motion.div variants={fadeUp}>
        <Section
          title="Présentation de l'entreprise"
          onSave={() => save({ description, certified_workers_count: workers, accept_individuals: acceptInd }, setSavingPresent, 'Présentation sauvegardée')}
          saving={savingPresent}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={lbl}>Nom commercial</label>
              <input style={{ ...inputStyle, background: '#F9FAFB', color: 'var(--gray-500)' }} value={partner.company_name} disabled />
              <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Issu du SIRET — contactez le support pour modifier</p>
            </div>
            <div>
              <label style={lbl}>Activité (NAF)</label>
              <input style={{ ...inputStyle, background: '#F9FAFB', color: 'var(--gray-500)' }} value={partner.company_activity ?? ''} disabled />
            </div>
            <div>
              <label style={lbl}>Description visible sur votre profil public</label>
              <textarea
                style={{ ...inputStyle, minHeight: 110, resize: 'vertical', paddingTop: 12 }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Présentez votre activité, vos spécialités et votre zone d'intervention..."
              />
            </div>
            <div className="step-grid-2" style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={lbl}>Nb. de techniciens certifiés</label>
                <input type="number" min={0} style={inputStyle} value={workers} onChange={e => setWorkers(+e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}>
                <input type="checkbox" id="accept_ind" checked={acceptInd} onChange={e => setAcceptInd(e.target.checked)} style={{ accentColor: 'var(--red)', width: 16, height: 16 }} />
                <label htmlFor="accept_ind" style={{ fontSize: 13, cursor: 'pointer' }}>
                  <span style={{ fontWeight: 600 }}>Accepter les dossiers particuliers</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--gray-400)' }}>Si désactivé, les dossiers de particuliers ne vous sont pas envoyés</span>
                </label>
              </div>
            </div>
          </div>
        </Section>
      </motion.div>

      {/* Adresse du siège */}
      <motion.div variants={fadeUp}>
        <Section title="Adresse du siège" onSave={() => save({ company_address: address, city, zip_code: zip }, setSavingAddress, 'Adresse sauvegardée')} saving={savingAddress}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lbl}>Adresse</label>
              <input style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="Rue, numéro..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div>
                <label style={lbl}>Code postal</label>
                <input style={inputStyle} value={zip} onChange={e => setZip(e.target.value)} placeholder="75000" maxLength={5} />
              </div>
              <div>
                <label style={lbl}>Ville</label>
                <input style={inputStyle} value={city} onChange={e => setCity(e.target.value)} placeholder="Paris" />
              </div>
            </div>
          </div>
        </Section>
      </motion.div>

      {/* Abonnement */}
      <motion.div variants={fadeUp}>
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>Abonnement actuel</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: plan.bg, color: plan.color }}>{plan.label}</span>
                {partner.is_verified
                  ? <span style={{ fontSize: 12, color: '#059669' }}>✓ Compte validé</span>
                  : <span style={{ fontSize: 12, color: '#D97706' }}>⏳ En attente de validation</span>
                }
              </div>
            </div>
            <Link href="/tarifs" className="btn btn-outline btn-sm">Voir les offres</Link>
          </div>
        </div>
      </motion.div>

    </motion.div>
  )
}
