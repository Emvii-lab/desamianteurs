'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ShieldCheck, MapPin, FileText, Inbox, CheckCircle, Star, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import PromoBar from '@/components/PromoBar'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { BtnRed, BtnOutline } from '@/components/ui/Btn'
import { useIsMobile } from '@/lib/hooks/useIsMobile'
import type { KpiData, ProCard } from '@/lib/kpis'

const STEPS = [
  { n: '01', Icon: FileText, title: 'Décrivez votre besoin', desc: "Renseignez le type de prestation, l'adresse et ajoutez des photos de votre chantier." },
  { n: '02', Icon: Inbox, title: 'Recevez des devis', desc: 'Les professionnels certifiés de votre zone reçoivent votre demande et vous envoient des devis gratuits.' },
  { n: '03', Icon: CheckCircle, title: 'Choisissez votre pro', desc: 'Comparez les devis, consultez les avis clients et choisissez le professionnel qui vous convient.' },
  { n: '04', Icon: Star, title: 'Évaluez la prestation', desc: 'Après les travaux, laissez un avis pour aider la communauté et valoriser les bons professionnels.' },
]

const TESTIMONIALS = [
  { name: 'Marie D.', city: 'Lyon (69)', rating: 5, service: 'Diagnostic amiante', text: 'Devis reçu en moins de 24h. Le professionnel était ponctuel et très rigoureux. Je recommande sans hésiter.' },
  { name: 'Thomas R.', city: 'Paris (75)', rating: 5, service: 'Désamiantage SS4', text: 'Rapide, efficace et transparent sur les tarifs. Mon appartement est maintenant aux normes. Merci !' },
  { name: 'Sophie M.', city: 'Bordeaux (33)', rating: 5, service: 'MOE Amiante', text: "J'ai pu comparer 3 devis et choisir sereinement. Une expérience vraiment simple et rassurante." },
  { name: 'Jean-Pierre L.', city: 'Marseille (13)', rating: 4, service: 'Prélèvement matériaux', text: "Bon professionnel, délais tenus. La plateforme m'a beaucoup simplifié la recherche dans ma région." },
  { name: 'Claire B.', city: 'Nantes (44)', rating: 5, service: 'Diagnostic plomb', text: "Je cherchais depuis des semaines. En 2 jours j'avais rendez-vous avec un diagnostiqueur disponible. Incroyable !" },
  { name: 'Marc F.', city: 'Toulouse (31)', rating: 5, service: 'Désamiantage SS4', text: "Professionnel sérieux, travail soigné. Les avis clients m'ont aidé à faire le bon choix en toute confiance." },
  { name: 'Isabelle V.', city: 'Strasbourg (67)', rating: 5, service: 'Expert juridique', text: "Besoin urgent après un litige. J'ai trouvé un expert en 1h chrono. Service vraiment remarquable !" },
  { name: 'Luc P.', city: 'Lille (59)', rating: 4, service: 'MOE Amiante', text: 'Très satisfait de la mise en relation. Le pro a parfaitement géré mon chantier de rénovation.' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function StatCounter({ raw, suffix, decimal }: { raw: number; suffix: string; decimal?: boolean }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const isMobile = useIsMobile()

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
    : Math.floor(count).toLocaleString('fr-FR').replace(/,/g, ' ')

  return (
    <div ref={ref} style={{ fontSize: isMobile ? 32 : 42, fontWeight: 800, color: '#111', lineHeight: 1, marginBottom: 10, letterSpacing: '-1px' }}>
      {formatted}<span style={{ color: 'var(--red)' }}>{suffix}</span>
    </div>
  )
}

type SearchBarProps = {
  searchType: string
  setSearchType: (v: string) => void
  searchLocation: string
  setSearchLocation: (v: string) => void
  onSearch: () => void
  isMobile: boolean
}

function SearchBar({ searchType, setSearchType, searchLocation, setSearchLocation, onSearch, isMobile }: SearchBarProps) {
  const [hover, setHover] = useState(false)
  return (
    <div style={{
      maxWidth: 900, margin: '0 auto',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'stretch',
      boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
      borderRadius: isMobile ? 8 : 0,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        flex: 1,
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRight: isMobile ? '1px solid #E5E7EB' : 'none',
        borderRadius: isMobile ? '8px 8px 0 0' : '8px 0 0 8px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'relative',
          flex: isMobile ? 'none' : '0 0 230px',
          borderRight: isMobile ? 'none' : '1px solid #E5E7EB',
          borderBottom: isMobile ? '1px solid #E5E7EB' : 'none',
        }}>
          <select
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
            style={{ width: '100%', height: isMobile ? 48 : '100%', padding: '14px 36px 14px 16px', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-sans), DM Sans, sans-serif', fontSize: 14, color: '#6B7280', cursor: 'pointer', appearance: 'none' as const }}
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
          onKeyDown={e => e.key === 'Enter' && onSearch()}
          style={{ flex: 1, padding: '14px 16px', height: isMobile ? 48 : 'auto', border: 'none', outline: 'none', fontFamily: 'var(--font-sans), DM Sans, sans-serif', fontSize: 14, color: '#111', background: 'transparent' }}
        />
      </div>
      <button
        onClick={onSearch}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: hover ? 'var(--red-hover)' : 'var(--red)',
          color: 'white', outline: 'none',
          padding: isMobile ? '14px 32px' : '0 32px',
          fontSize: 13, fontWeight: 600,
          fontFamily: 'var(--font-sans), DM Sans, sans-serif',
          cursor: 'pointer', alignSelf: 'stretch',
          width: isMobile ? '100%' : 'auto',
          borderRadius: isMobile ? '0 0 8px 8px' : '0 8px 8px 0',
          whiteSpace: 'nowrap',
          border: '1px solid var(--red)',
          boxShadow: hover ? '0 4px 20px rgba(192,57,43,0.4)' : 'none',
          transition: 'all 0.15s',
        }}
      >
        Rechercher
      </button>
    </div>
  )
}

export default function HomeClient({ kpis, pros }: { kpis: KpiData; pros: ProCard[] }) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [searchType, setSearchType] = useState('')
  const [searchLocation, setSearchLocation] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  function handleSearch() {
    const params = new URLSearchParams()
    if (searchType) params.set('type', searchType)
    if (searchLocation) params.set('location', searchLocation)
    router.push(`/professionnels?${params.toString()}`)
  }

  const px = isMobile ? '20px' : '40px'

  return (
    <div style={{ fontFamily: 'var(--font-sans), DM Sans, sans-serif', color: '#111' }}>
      {/* Header fixed */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100 }}>
        <PromoBar />
        <Navbar />
      </div>

      {/* ── ÉCRAN 1 : Hero ── */}
      <div style={{ position: 'relative' }}>
        <section style={{
          background: '#111111',
          color: 'white',
          minHeight: isMobile ? '100svh' : '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMobile ? 'flex-start' : 'center',
          padding: isMobile ? '160px 20px 60px' : '140px 40px 160px',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}>
          {/* Orbes décoratifs */}
          <motion.div
            animate={{ y: [0, -18, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', bottom: -180, left: -180, width: isMobile ? 280 : 480, height: isMobile ? 280 : 480, borderRadius: '50%', background: 'rgba(192,57,43,0.22)', pointerEvents: 'none' }}
          />
          <motion.div
            animate={{ y: [0, 14, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            style={{ position: 'absolute', top: -120, right: -120, width: isMobile ? 220 : 380, height: isMobile ? 220 : 380, borderRadius: '50%', background: 'rgba(192,57,43,0.22)', pointerEvents: 'none' }}
          />

          <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', width: '100%' }}>
            <motion.div initial="hidden" animate="visible" variants={stagger} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(192,57,43,0.18)', color: 'var(--red)', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.7px', marginBottom: 28 }}>
                <ShieldCheck size={12} strokeWidth={2.5} />
                PROFESSIONNELS VÉRIFIÉS
              </motion.div>

              <motion.h1 variants={fadeUp} style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', fontSize: 'clamp(32px, 5vw, 64px)', color: 'white', lineHeight: 1.1, marginBottom: 24, fontWeight: 700 }}>
                Trouvez votre professionnel<br />
                <span style={{ color: 'var(--red)' }}>certifié amiante & plomb</span><br />
                en quelques clics.
              </motion.h1>

              <motion.p variants={fadeUp} style={{ fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.58)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
                Mettez en relation particuliers, entreprises et professionnels
                certifiés du secteur de l'amiante. Devis gratuits, pros vérifiés.
              </motion.p>

              <motion.div variants={fadeUp} style={{ marginBottom: 40, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 12, width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? 340 : 'none' }}>
                <BtnRed href="/formulaire" size="lg" style={{ letterSpacing: '0.6px', padding: isMobile ? '14px 28px' : '16px 40px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                  DÉPOSER UNE DEMANDE
                </BtnRed>
                <Link href="/professionnels" className="btn btn-ghost-dark btn-lg" style={{ padding: isMobile ? '14px 28px' : '16px 36px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                  Explorer les professionnels →
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* DÉCOUVRIR — masqué sur mobile */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
              className="decouvrir-hero"
              style={{ position: 'absolute', right: 50, color: 'white', opacity: 0.9, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 30 }}
              onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '1.5px', opacity: 0.8 }}>DÉCOUVRIR</span>
              <ChevronDown size={28} strokeWidth={2.5} />
            </motion.div>
          )}
        </section>

        {/* Barre de recherche flottante — desktop uniquement (CSS) */}
        <motion.div
          className="hero-search-floating"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
          style={{ position: 'absolute', bottom: 40, left: 0, right: 0, padding: '0 40px', zIndex: 10 }}
        >
          <SearchBar
            searchType={searchType} setSearchType={setSearchType}
            searchLocation={searchLocation} setSearchLocation={setSearchLocation}
            onSearch={handleSearch} isMobile={false}
          />
        </motion.div>
      </div>

      {/* Barre de recherche mobile — section propre sous le hero (CSS) */}
      <div className="hero-search-section" style={{ background: '#F9FAFB', padding: '20px 16px', borderBottom: '1px solid #E5E7EB' }}>
        <SearchBar
          searchType={searchType} setSearchType={setSearchType}
          searchLocation={searchLocation} setSearchLocation={setSearchLocation}
          onSearch={handleSearch} isMobile={true}
        />
      </div>

      {/* ── ÉCRAN 2 : Stats & Logos ── */}
      <section id="stats" style={{
        background: '#F9FAFB',
        minHeight: isMobile ? 'auto' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        scrollMarginTop: 0,
      }}>
        {/* Stats */}
        <div style={{ background: 'white', width: '100%', flex: isMobile ? undefined : 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: isMobile ? 60 : 100, paddingBottom: isMobile ? 32 : 40 }}>
          <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: `0 ${px}`, position: 'relative' }}>
            <motion.div
              initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', marginBottom: 40 }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(192,57,43,0.07)', color: 'var(--red)', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', marginBottom: 16 }}>
                <ShieldCheck size={13} strokeWidth={2.5} />
                LA RÉFÉRENCE DU SECTEUR
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', fontSize: 'clamp(24px, 4.5vw, 52px)', fontWeight: 700, color: '#111', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                La plateforme qui connecte<br />
                <span style={{ color: 'var(--red)' }}>les meilleurs professionnels</span>
              </h2>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 0 }}>
              {[
                { raw: kpis.partners, suffix: '+', label: 'Professionnels certifiés', sub: 'dans toute la France' },
                { raw: kpis.demandes, suffix: '+', label: 'Demandes traitées', sub: 'chaque année' },
                { raw: kpis.departments, suffix: '', label: 'Départements couverts', sub: 'sur 101 en France' },
                { raw: kpis.rating, suffix: '/5', label: 'Note moyenne', sub: 'par les clients vérifiés', decimal: true },
              ].map((k, i, arr) => (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  style={{
                    padding: isMobile ? '20px 12px' : '24px 20px',
                    borderRight: isMobile
                      ? (i % 2 === 0 ? '1px solid #F3F4F6' : 'none')
                      : (i < arr.length - 1 ? '1px solid #F3F4F6' : 'none'),
                    borderBottom: isMobile && i < 2 ? '1px solid #F3F4F6' : 'none',
                    textAlign: 'center',
                  }}
                >
                  <StatCounter raw={k.raw} suffix={k.suffix} decimal={k.decimal} />
                  <div style={{ fontSize: isMobile ? 13 : 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>{k.label}</div>
                  <div style={{ fontSize: isMobile ? 11 : 13, color: '#9CA3AF', maxWidth: 180, margin: '0 auto' }}>{k.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Logos partenaires */}
        <div style={{ background: '#F9FAFB', borderTop: '1px solid #F3F4F6', width: '100%', padding: isMobile ? '32px 0' : '50px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: `0 ${px}`, width: '100%' }}>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} style={{ textAlign: 'center', marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#9CA3AF', letterSpacing: '2.5px', textTransform: 'uppercase' as const, marginBottom: 0 }}>
                Ils nous font confiance
              </p>
            </motion.div>

            <motion.div
              variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 16 : 32, flexWrap: 'wrap' as const }}
            >
              {[
                { id: 'amiatech', svg: <svg width="110" height="32" viewBox="0 0 110 32"><rect x="0" y="8" width="16" height="16" rx="3" fill="#374151"/><rect x="4" y="12" width="8" height="8" rx="1" fill="#F9FAFB"/><text x="22" y="21" fontFamily="DM Sans, sans-serif" fontWeight="800" fontSize="14" fill="#374151">AMIA<tspan fontWeight="400">TECH</tspan></text></svg> },
                { id: 'diagpro', svg: <svg width="100" height="32" viewBox="0 0 100 32"><circle cx="14" cy="16" r="10" fill="none" stroke="#374151" strokeWidth="2.5"/><circle cx="14" cy="16" r="4" fill="#374151"/><text x="30" y="21" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="14" fill="#374151">Diag<tspan fontWeight="900">Pro</tspan></text></svg> },
                { id: 'batiscan', svg: <svg width="108" height="32" viewBox="0 0 108 32"><polygon points="14,4 26,28 2,28" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinejoin="round"/><line x1="14" y1="14" x2="14" y2="22" stroke="#374151" strokeWidth="2"/><text x="32" y="21" fontFamily="DM Sans, sans-serif" fontWeight="800" fontSize="13" fill="#374151">BÂTI<tspan fontWeight="400">SCAN</tspan></text></svg> },
                { id: 'ecodiag', svg: <svg width="102" height="32" viewBox="0 0 102 32"><path d="M14 6 C6 6 2 12 2 16 C2 22 8 28 14 26 C20 28 26 22 26 16 C26 12 22 6 14 6Z" fill="none" stroke="#374151" strokeWidth="2"/><path d="M14 10 C14 10 8 16 14 22 C20 16 14 10 14 10Z" fill="#374151"/><text x="32" y="21" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="14" fill="#374151">Eco<tspan fontWeight="900">Diag</tspan></text></svg> },
                { id: 'labanalyz', svg: <svg width="120" height="32" viewBox="0 0 120 32"><rect x="2" y="4" width="24" height="24" rx="4" fill="none" stroke="#374151" strokeWidth="2"/><line x1="8" y1="12" x2="20" y2="12" stroke="#374151" strokeWidth="2"/><line x1="8" y1="17" x2="16" y2="17" stroke="#374151" strokeWidth="2"/><line x1="8" y1="22" x2="18" y2="22" stroke="#374151" strokeWidth="2"/><text x="32" y="21" fontFamily="DM Sans, sans-serif" fontWeight="800" fontSize="13" fill="#374151">LAB<tspan fontWeight="400">ANALYZ</tspan></text></svg> },
                { id: 'safeconform', svg: <svg width="132" height="32" viewBox="0 0 132 32"><path d="M14 4 L26 9 L26 18 C26 23 20 28 14 30 C8 28 2 23 2 18 L2 9 Z" fill="none" stroke="#374151" strokeWidth="2" strokeLinejoin="round"/><path d="M8 16 L12 20 L20 12" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><text x="32" y="21" fontFamily="DM Sans, sans-serif" fontWeight="800" fontSize="12" fill="#374151">SAFE<tspan fontWeight="400">CONFORM</tspan></text></svg> },
              ].map((logo) => (
                <motion.div key={logo.id} variants={fadeUp} whileHover={{ opacity: 0.8, scale: 1.05 }} style={{ opacity: 0.4, cursor: 'default' }}>
                  {logo.svg}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

      </section>

      {/* ── Témoignages ── */}
      <section style={{ background: '#FAFAFA', padding: isMobile ? '56px 0' : '88px 0', overflow: 'hidden', borderTop: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-100)' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48, padding: `0 ${px}` }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(192,57,43,0.07)', color: 'var(--red)', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', marginBottom: 16 }}>
            <Star size={13} strokeWidth={2.5} />
            CE QUE DISENT NOS CLIENTS
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', fontSize: isMobile ? 26 : 40, fontWeight: 700, color: '#111', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            Ils ont fait confiance<br />
            <span style={{ color: 'var(--red)' }}>à notre plateforme</span>
          </h2>
        </motion.div>

        <div className="testimonials-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: isMobile ? 40 : 100, background: 'linear-gradient(to right, #FAFAFA, transparent)', zIndex: 10, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: isMobile ? 40 : 100, background: 'linear-gradient(to left, #FAFAFA, transparent)', zIndex: 10, pointerEvents: 'none' }} />
          <div className="testimonials-track" style={{ gap: isMobile ? 12 : 20, paddingLeft: isMobile ? 16 : 32, paddingBottom: 8 }}>
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: isMobile ? '20px' : '28px', width: isMobile ? 260 : 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} width="13" height="13" viewBox="0 0 24 24" fill={j < t.rating ? '#F59E0B' : '#E5E7EB'} xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, flex: 1, margin: 0, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {t.name.split(' ').map((w: string) => w[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{t.city} · {t.service}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÉCRAN 3 : Fonctionnement & Professionnels ── */}
      <section id="comment-ca-fonctionne" style={{
        background: 'white',
        minHeight: isMobile ? 'auto' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        scrollMarginTop: 110,
      }}>
        {/* Étapes */}
        <div style={{ width: '100%', padding: isMobile ? `40px ${px} 24px` : `72px ${px} 40px` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}>
              <h2 style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', fontSize: isMobile ? 26 : 32, fontWeight: 700, marginBottom: 8, color: '#111' }}>Comment ça fonctionne ?</h2>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 32 }}>Simple, rapide et sécurisé en 4 étapes.</p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 16 }}>
              {STEPS.map(({ n, Icon, title, desc }) => (
                <motion.div key={n} variants={fadeUp} whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.08)', transition: { duration: 0.2 } }} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: isMobile ? '20px 16px' : '28px 24px', cursor: 'default' }}>
                  <div style={{ fontSize: isMobile ? 36 : 48, fontWeight: 800, color: '#F3F4F6', lineHeight: 1, marginBottom: isMobile ? 12 : 20, letterSpacing: '-1px' }}>{n}</div>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(192,57,43,0.07)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? 12 : 16 }}>
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, marginBottom: isMobile ? 6 : 8, color: '#111' }}>{title}</h3>
                  <p style={{ fontSize: isMobile ? 12 : 13, color: '#6B7280', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Professionnels à la une */}
        <div style={{ width: '100%', padding: isMobile ? `24px ${px} 56px` : `40px ${px} 72px` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}>
              <h2 style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', fontSize: isMobile ? 26 : 32, fontWeight: 700, marginBottom: 8, color: '#111' }}>Professionnels à la une</h2>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Découvrez des pros vérifiés près de chez vous.</p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 10 : 16, marginBottom: 40 }}>
              {pros.map((pro: ProCard) => (
                <Link key={pro.id} href={`/professionnels/${pro.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <motion.div variants={fadeUp} whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.09)', transition: { duration: 0.2 } }} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', padding: '16px 20px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: pro.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{pro.initials}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#111', marginBottom: 1 }}>{pro.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6B7280' }}><MapPin size={10} strokeWidth={2} />{pro.city}</div>
                      </div>
                    </div>
                    <span style={{ display: 'inline-block', background: 'rgba(192,57,43,0.08)', color: 'var(--red)', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, marginBottom: 8 }}>{pro.type}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#F59E0B', fontSize: 12, letterSpacing: 1 }}>{'★'.repeat(Math.round(pro.rating))}{'☆'.repeat(5 - Math.round(pro.rating))}</span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{pro.rating}</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>({pro.reviews} avis)</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.4 }} style={{ textAlign: 'center' }}>
              <BtnOutline href="/professionnels">Voir tous les professionnels →</BtnOutline>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section CTA finale ── */}
      <section style={{ background: '#111', color: 'white', padding: isMobile ? '64px 20px' : '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -120, right: -120, width: 360, height: 360, borderRadius: '50%', background: 'rgba(192,57,43,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -80, left: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(192,57,43,0.10)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(192,57,43,0.18)', color: 'var(--red)', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', marginBottom: 24 }}>
            <ShieldCheck size={13} strokeWidth={2.5} />
            GRATUIT & SANS ENGAGEMENT
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', fontSize: isMobile ? 28 : 48, fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: 24, letterSpacing: '-0.5px' }}>
            Prêt à trouver votre<br />
            <span style={{ color: 'var(--red)' }}>professionnel certifié ?</span>
          </h2>
          <p style={{ fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 36 }}>
            Déposez votre demande en 3 minutes.<br />Recevez jusqu'à 5 devis gratuits.
          </p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 12, width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? 340 : 'none', margin: '0 auto' }}>
            <BtnRed href="/formulaire" size="lg" style={{ padding: isMobile ? '14px 28px' : '16px 40px', letterSpacing: '0.6px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
              DÉPOSER UNE DEMANDE
            </BtnRed>
            <Link href="/professionnels" className="btn btn-ghost-dark btn-lg" style={{ padding: isMobile ? '14px 28px' : '16px 36px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
              Explorer les professionnels →
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
