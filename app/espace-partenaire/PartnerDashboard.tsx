'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'
import Link from 'next/link'
import { StatGrid } from '@/components/ui/StatGrid'
import { DashboardCard } from '@/components/ui/DashboardCard'
import { DataTable } from '@/components/ui/DataTable'
import { Loader, AlertTriangle, Gift } from 'lucide-react'
// import { AlgoMatchingSection } from './components/AlgoMatchingSection'

type Stat = {
  demandes: number
  missions: number
  rating: number
  reviewCount: number
}

type Demande = {
  id: string
  title: string
  address: string
  type: string
  location: string
  published: string
}

type Avis = {
  id: string
  initials: string
  name: string
  detail: string
  rating: number
  text: string
  color: string
}

type Diagnostic = {
  rank: number
  total_eligible: number
  is_top_3: boolean
  main_reason: 'ok' | 'too_slow' | 'too_many_dossiers' | 'zone_inactive' | 'competition' | 'new_partner' | 'no_zones'
  dept_code: string
  reactivity_score: number
  non_selected_30d: number
  quotes_in_zone_30d: number
  gap_alert_level: 'none' | 'j5' | 'j7'
  reactivation_active: boolean
}


type PartnerDashboardProps = {
  isValid: boolean
  feePaid: boolean
  partnerId: string
  absenceStart: string | null
  absenceEnd: string | null
  demandes: Demande[]
  avis: Avis[]
  stats: Stat
  diagnostic?: Diagnostic
}

export default function PartnerDashboard({ isValid, feePaid, partnerId, absenceStart, absenceEnd, demandes, avis, stats, diagnostic }: PartnerDashboardProps) {
  const isAbsent = !!(absenceStart && absenceEnd &&
    new Date() >= new Date(absenceStart) &&
    new Date() <= new Date(absenceEnd)
  )
  const [paying, setPaying] = useState(false)

  async function handleFinalize() {
    setPaying(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, source: 'dashboard' }),
      })
      const { url, error } = await res.json()
      if (url) window.location.href = url
      else console.error('[finalize]', error)
    } finally {
      setPaying(false)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Bannière mode absence actif */}
      {isAbsent && (
        <motion.div variants={fadeUp} style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 12,
          padding: '14px 20px', marginBottom: 16,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1E40AF' }}>Mode absence activé — </span>
            <span style={{ fontSize: 13, color: '#1D4ED8' }}>
              Aucune demande ne vous sera envoyée jusqu'au{' '}
              <strong>{new Date(absenceEnd!).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>.
              Votre score de réactivité est conservé.
            </span>
          </div>
        </motion.div>
      )}

      {/* Bannière inscription incomplète */}
      {!feePaid && (
        <motion.div variants={fadeUp} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 12,
          padding: '16px 20px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>Inscription incomplète</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(192,57,43,0.1)', color: 'var(--red)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(192,57,43,0.2)' }}>
                  <Gift size={11} /> Offre lancement
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#B45309' }}>
                Finalisez votre dossier pour activer votre compte.{' '}
                <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>80 €</span>{' '}
                <strong style={{ color: '#92400E' }}>offerts</strong> en ce moment — code promo appliqué automatiquement.
              </div>
            </div>
          </div>
          <button
            className="btn btn-red btn-sm"
            onClick={handleFinalize}
            disabled={paying}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {paying ? <Loader size={14} className="animate-spin" /> : null}
            Finaliser mon inscription
          </button>
        </motion.div>
      )}

      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Espace Partenaire</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Gérez vos demandes et votre activité sur Désamianteurs.fr</p>
        </div>
        {isValid && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="badge-verified"
            style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}
          >
            Compte validé
          </motion.span>
        )}
      </motion.div>

      <StatGrid 
        stats={[
          { label: 'Demandes en attente', value: stats.demandes,    sub: 'à traiter' },
          { label: 'Missions complétées', value: stats.missions,    sub: 'au total' },
          { label: 'Note moyenne',        value: stats.rating > 0 ? stats.rating.toFixed(1).replace('.', ',') : '—', sub: `${stats.reviewCount} avis` },
          { label: 'Avis reçus',          value: stats.reviewCount, sub: 'au total' },
        ]}
      />

      {diagnostic && (
        <div className="partner-diag-grid" style={{ display: 'grid', gap: 24, marginBottom: 24 }}>
          <motion.div 
            whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
            className="card" 
            style={{ padding: 20, textAlign: 'center', borderBottom: '4px solid var(--red)' }}
          >
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Score Réactivité</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>{diagnostic.reactivity_score.toFixed(1)} / 24</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Sur les 20 derniers dossiers</div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
            className="card" 
            style={{ padding: 20, textAlign: 'center', borderBottom: '4px solid #111827' }}
          >
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Position Moyenne</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>#{diagnostic.rank}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>sur {diagnostic.total_eligible} pros (Dept {diagnostic.dept_code})</div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
            className="card" 
            style={{ padding: 20, textAlign: 'center', borderBottom: `4px solid ${diagnostic.non_selected_30d > 0 ? '#F59E0B' : '#059669'}` }}
          >
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Non Sélectionné</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#111827' }}>{diagnostic.non_selected_30d} fois</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>sur {diagnostic.quotes_in_zone_30d} opportunités (30j)</div>
          </motion.div>
        </div>
      )}

      {diagnostic && !diagnostic.is_top_3 && (
        <div style={{ 
          background: '#FFFBEB', 
          border: '1px solid #FEF3C7', 
          borderRadius: 12, 
          padding: '20px 24px', 
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 20
        }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: '50%', background: '#F59E0B', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            fontSize: 24, fontWeight: 800, flexShrink: 0
          }}>!</div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
              Cause principale de non-sélection : 
              <span style={{ color: '#B45309', marginLeft: 8, textTransform: 'uppercase' }}>
                {diagnostic.main_reason === 'new_partner' ? 'Bienvenue parmi nous !' :
                 diagnostic.main_reason === 'no_zones' ? 'Zones d\'intervention non définies' :
                 diagnostic.main_reason === 'too_slow' ? 'Vitesse de réponse insuffisante' :
                 diagnostic.main_reason === 'too_many_dossiers' ? 'Quota de dossiers atteint' :
                 diagnostic.main_reason === 'zone_inactive' ? 'Faible volume dans la zone' :
                 'Compétition élevée'}
              </span>
            </h4>
            <p style={{ fontSize: 13, color: '#B45309', margin: 0, opacity: 0.8 }}>
              {diagnostic.main_reason === 'new_partner' ? "Votre compte est prêt. Dès qu'un client fera une demande dans votre zone, vous recevrez une notification. Votre score se calculera après vos 3 premiers dossiers." :
               diagnostic.main_reason === 'no_zones' ? "Vous n'apparaissez pas encore dans les recherches car vos zones d'intervention ne sont pas configurées. Contactez le support pour les définir." :
               diagnostic.main_reason === 'too_slow' ? "Les autres pros répondent en moyenne 2x plus vite que vous. Améliorez votre score pour repasser dans le Top 3." :
               diagnostic.main_reason === 'too_many_dossiers' ? "Vous avez 5 dossiers en attente. Finalisez-en un pour débloquer de nouvelles attributions." :
               diagnostic.main_reason === 'zone_inactive' ? "Il y a eu peu de demandes dans le département " + (diagnostic.dept_code || 'non défini') + " ce mois-ci. Pensez à élargir votre zone." :
               "Vos scores sont bons, mais 3 confrères ont actuellement un léger avantage. Continuez vos efforts !"}
            </p>
          </div>
          {diagnostic.reactivation_active && (
            <div className="badge badge-red" style={{ padding: '8px 12px' }}>BOOST ACTIF</div>
          )}
        </div>
      )}



      <DashboardCard 
        title="Nouvelles demandes dans votre zone" 
        noPadding
        style={{ marginBottom: 24 }}
        badge={demandes.length > 0 && (
          <span className="badge badge-red">
            {demandes.length} nouvelle{demandes.length > 1 ? 's' : ''}
          </span>
        )}
      >
        <DataTable
          data={demandes}
          getRowKey={(d) => d.id}
          emptyMessage="Aucune nouvelle demande dans votre zone pour l'instant."
          columns={[
            {
              header: 'Demande',
              render: (d) => (
                <>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{d.title}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{d.address}</div>
                </>
              )
            },
            { header: 'Type', render: (d) => <div style={{ fontSize: 13, color: '#4B5563' }}>{d.type}</div> },
            { header: 'Localisation', render: (d) => <div style={{ fontSize: 13, color: '#4B5563' }}>{d.location}</div> },
            { header: 'Publiée', render: (d) => <div style={{ fontSize: 12, color: '#9CA3AF' }}>{d.published}</div> },
            {
              header: 'Action',
              render: () => (
                <Link href="/espace-partenaire/demandes" className="btn btn-red btn-sm">
                  Répondre
                </Link>
              )
            }
          ]}
        />
      </DashboardCard>

      {/* <AlgoMatchingSection /> */}

      <DashboardCard title="Avis récents">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {avis.length === 0 ? (
            <div style={{ color: '#6B7280', fontSize: 14 }}>Aucun avis reçu pour l'instant.</div>
          ) : avis.map(a => (
            <div 
              key={a.id} 
              className="card"
              style={{ padding: 16, border: '1px solid #F3F4F6' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{a.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{a.detail}</div>
                  </div>
                </div>
                <span style={{ color: '#F59E0B', fontSize: 14 }}>{'★'.repeat(a.rating)}{'☆'.repeat(5 - a.rating)}</span>
              </div>
              {a.text && <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, margin: 0 }}>"{a.text}"</p>}
            </div>
          ))}
        </div>
      </DashboardCard>
    </motion.div>
  )
}
