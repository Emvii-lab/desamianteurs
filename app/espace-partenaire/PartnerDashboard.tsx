'use client'

import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'
import Link from 'next/link'
import { StatGrid } from '@/components/ui/StatGrid'
import { DashboardCard } from '@/components/ui/DashboardCard'
import { DataTable } from '@/components/ui/DataTable'

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

type PartnerDashboardProps = {
  isValid: boolean
  demandes: Demande[]
  avis: Avis[]
  stats: Stat
}

export default function PartnerDashboard({ isValid, demandes, avis, stats }: PartnerDashboardProps) {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
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
