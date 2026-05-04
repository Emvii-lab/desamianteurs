'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ShieldCheck, MapPin, FileText, Inbox, CheckCircle, Star, ChevronDown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PromoBar from '@/components/PromoBar'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { BtnRed, BtnOutline } from '@/components/ui/Btn'
import type { KpiData, ProCard } from '@/lib/kpis'

const STEPS = [
  { n: '01', Icon: FileText, title: 'Décrivez votre besoin', desc: "Renseignez le type de prestation, l'adresse et ajoutez des photos de votre chantier." },
  { n: '02', Icon: Inbox, title: 'Recevez des devis', desc: 'Les professionnels certifiés de votre zone reçoivent votre demande et vous envoient des devis gratuits.' },
  { n: '03', Icon: CheckCircle, title: 'Choisissez votre pro', desc: 'Comparez les devis, consultez les avis clients et choisissez le professionnel qui vous convient.' },
  { n: '04', Icon: Star, title: 'Évaluez la prestation', desc: 'Après les travaux, laissez un avis pour aider la communauté et valoriser les bons professionnels.' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function Counter({ raw, suffix, decimal }: { raw: number; suffix: string; decimal?: boolean }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!inView) return
    const steps = 50
    const step = raw / steps
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + step, raw)
      setCount(current)
      if (current >= raw) clearInterval(timer)
    }, 1400 / steps)
    return () => clearInterval(timer)
  }, [inView, raw])

  const formatted = decimal
    ? count.toFixed(1).replace('.', ',')
    : Math.floor(count).toLocaleString('fr-FR').replace(/,/g, ' ')

  return (
    <div ref={ref} style={{ fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1 }}>
      {formatted}{suffix}
    </div>
  )
}

function SearchBtn({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--red-hover)' : 'var(--red)',
        color: 'white', border: 'none', outline: 'none',
        padding: '0 32px', fontSize: 13, fontWeight: 600,
        fontFamily: 'var(--font-sans), DM Sans, sans-serif',
        cursor: 'pointer', alignSelf: 'stretch',
        borderRadius: '0 5px 5px 0', whiteSpace: 'nowrap',
        boxShadow: hover ? '0 4px 18px rgba(192,57,43,0.38)' : 'none',
        transition: 'background 0.15s, box-shadow 0.15s',
      }}
    >
      Rechercher
    </button>
  )
}

export default function HomeClient({ kpis, pros }: { kpis: KpiData; pros: ProCard[] }) {
  const router = useRouter()
  const [searchType, setSearchType] = useState('')
  const [searchLocation, setSearchLocation] = useState('')

  function handleSearch() {
    const params = new URLSearchParams()
    if (searchType) params.set('type', searchType)
    if (searchLocation) params.set('location', searchLocation)
    router.push(`/professionnels?${params.toString()}`)
  }

  const KPIS = [
    { raw: kpis.partners, label: 'Professionnels certifiés', suffix: '+' },
    { raw: kpis.demandes, label: 'Demandes traitées', suffix: '' },
    { raw: kpis.rating, label: 'Note moyenne', suffix: '', decimal: true },
    { raw: kpis.departments, label: 'Départements couverts', suffix: '' },
  ]

  return (
    <div style={{ fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: '#111' }}>
      {/* Header sticky — PromoBar + Navbar collent ensemble en haut au scroll */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1100 }}>
        <PromoBar />
        <Navbar />
      </div>

      <div style={{ position: 'relative' }}>
        <section style={{ background: '#111111', color: 'white', padding: '72px 40px 56px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <motion.div
            animate={{ y: [0, -18, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', bottom: -180, left: -180, width: 480, height: 480, borderRadius: '50%', background: 'rgba(192,57,43,0.22)', pointerEvents: 'none' }}
          />
          <motion.div
            animate={{ y: [0, 14, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            style={{ position: 'absolute', top: -120, right: -120, width: 380, height: 380, borderRadius: '50%', background: 'rgba(192,57,43,0.22)', pointerEvents: 'none' }}
          />

          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
            <motion.div initial="hidden" animate="visible" variants={stagger} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(192,57,43,0.18)', color: 'var(--red)', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.7px', marginBottom: 28 }}>
                <ShieldCheck size={12} strokeWidth={2.5} />
                PROFESSIONNELS VÉRIFIÉS
              </motion.div>

              <motion.h1 variants={fadeUp} style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', fontSize: 'clamp(36px, 5vw, 56px)', color: 'white', lineHeight: 1.15, marginBottom: 20, fontWeight: 700 }}>
                Trouvez votre professionnel<br />
                <span style={{ color: 'var(--red)' }}>certifié amiante & plomb</span><br />
                en quelques clics.
              </motion.h1>

              <motion.p variants={fadeUp} style={{ fontSize: 15, color: 'rgba(255,255,255,0.58)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
                Mettez en relation particuliers, entreprises et professionnels
                certifiés du secteur de l'amiante. Devis gratuits, pros vérifiés.
              </motion.p>

              <motion.div variants={fadeUp}>
                <BtnRed href="/formulaire" size="lg" style={{ letterSpacing: '0.6px' }}>
                  DÉPOSER UNE DEMANDE
                </BtnRed>
              </motion.div>
            </motion.div>

            {/* KPIs — données Supabase */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginTop: 52, paddingTop: 36, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {KPIS.map((k, i) => (
                <div key={k.label} style={{ padding: '0 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <Counter raw={k.raw} suffix={k.suffix} decimal={k.decimal} />
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{k.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Barre de recherche */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
          style={{ position: 'absolute', bottom: -26, left: 0, right: 0, padding: '0 40px', zIndex: 10 }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', borderRadius: 6, background: 'white', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.22)' }}>
            <div style={{ position: 'relative', flex: '0 0 230px', borderRight: '1px solid #E5E7EB' }}>
              <select
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                style={{ width: '100%', height: '100%', padding: '14px 36px 14px 16px', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-sans), DM Sans, sans-serif', fontSize: 14, color: '#6B7280', cursor: 'pointer', appearance: 'none' as const, borderRadius: '5px 0 0 5px' }}
              >
                <option value="">Type de prestation</option>
                <option value="diagnostician">Diagnostic amiante / plomb</option>
                <option value="project_manager">MOE Amiante / Plomb</option>
                <option value="asbestos_remover">Désamiantage / Intervention SS4</option>
                <option value="sampler_lab">Prélèvement (air / matériaux)</option>
                <option value="legal_expert">Expert juridique</option>
                <option value="specialized_lawyer">Avocat spécialisé</option>
              </select>
              <ChevronDown size={14} color="#9CA3AF" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
            <input
              type="text"
              placeholder="Ville ou code postal..."
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1, padding: '14px 16px', border: 'none', outline: 'none', fontFamily: 'var(--font-sans), DM Sans, sans-serif', fontSize: 14, color: '#111', background: 'transparent' }}
            />
            <SearchBtn onClick={handleSearch} />
          </div>
        </motion.div>
      </div>

      {/* Comment ça fonctionne */}
      <section id="comment-ca-fonctionne" style={{ background: '#F5F5F5', padding: '52px 40px 64px', scrollMarginTop: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontFamily: 'var(--font-sans), DM Sans, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Comment ça fonctionne ?</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 40 }}>Simple, rapide et sécurisé en 3 étapes.</p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {STEPS.map(({ n, Icon, title, desc }) => (
              <motion.div key={n} variants={fadeUp} whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.10)', transition: { duration: 0.2 } }} style={{ background: 'white', borderRadius: 8, border: '1px solid #E5E7EB', padding: '28px 24px', cursor: 'default' }}>
                <div style={{ fontFamily: 'var(--font-sans), DM Sans, sans-serif', fontSize: 52, fontWeight: 700, color: '#E5E7EB', lineHeight: 1, marginBottom: 14 }}>{n}</div>
                <div style={{ width: 34, height: 34, borderRadius: 6, background: 'rgba(192,57,43,0.07)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={16} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-sans), DM Sans, sans-serif', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Professionnels à la une */}
      <section style={{ background: 'white', padding: '64px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}>
            <h2 style={{ fontFamily: 'var(--font-sans), DM Sans, sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Professionnels à la une</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 40 }}>Découvrez des pros vérifiés près de chez vous.</p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }}>
            {pros.map((pro: ProCard) => (
              <motion.div key={pro.name} variants={fadeUp} whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.09)', transition: { duration: 0.2 } }} style={{ background: 'white', borderRadius: 8, border: '1px solid #E5E7EB', padding: '20px 24px', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 8, background: pro.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{pro.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 3 }}>{pro.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B7280' }}><MapPin size={11} strokeWidth={2} />{pro.city}</div>
                  </div>
                </div>
                <span style={{ display: 'inline-block', background: 'rgba(192,57,43,0.08)', color: 'var(--red)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, marginBottom: 12 }}>{pro.type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#F59E0B', fontSize: 13, letterSpacing: 1 }}>{'★'.repeat(Math.round(pro.rating))}{'☆'.repeat(5 - Math.round(pro.rating))}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{pro.rating}</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>({pro.reviews} avis)</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.4 }} style={{ textAlign: 'center' }}>
            <BtnOutline href="/professionnels">Voir tous les professionnels →</BtnOutline>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
