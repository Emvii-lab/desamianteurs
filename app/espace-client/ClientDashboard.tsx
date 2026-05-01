'use client'

import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'
import { 
  Inbox, TrendingUp, MessageSquare, Star, 
  Plus, MapPin, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { StatGrid } from '@/components/ui/StatGrid'
import { DashboardCard } from '@/components/ui/DashboardCard'
import { DataTable } from '@/components/ui/DataTable'
import type { ClientStats, ClientDemande, ClientDevis } from '@/lib/types'

interface ClientDashboardProps {
  prenom: string
  demandes: ClientDemande[]
  devis: ClientDevis[]
  stats: ClientStats
}

export default function ClientDashboard({ prenom, demandes, devis, stats }: ClientDashboardProps) {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0A0A0A', marginBottom: 4 }}>Bonjour, {prenom}</h1>
        <p style={{ fontSize: 15, color: '#6B7280' }}>Voici un résumé de votre activité sur Désamianteurs.fr</p>
      </motion.div>

      <StatGrid 
        stats={[
          { label: 'Demandes',    value: stats.demandes,    sub: 'au total',    Icon: Inbox },
          { label: 'Devis reçus', value: stats.devisCount,  sub: 'à comparer',  Icon: TrendingUp },
          { label: 'Messages',    value: stats.messages,    sub: 'non lus',     Icon: MessageSquare },
          { label: 'Avis laissés',value: stats.reviews,     sub: 'au total',    Icon: Star },
        ]}
      />

      <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
        <Link href="/formulaire" className="btn btn-red" style={{ 
          display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', 
          background: 'var(--red)', color: 'white', borderRadius: '12px', fontWeight: 700,
          textDecoration: 'none', transition: 'all 0.2s'
        }}>
          <Plus size={18} strokeWidth={3} /> Nouvelle demande de devis
        </Link>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        <DashboardCard 
          title="Mes demandes récentes" 
          noPadding
          badge={<Link href="/espace-client/demandes" style={{ color: 'var(--red)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Voir tout</Link>}
        >
          <DataTable
            data={demandes}
            getRowKey={(d) => d.id}
            emptyMessage="Aucune demande pour l'instant."
            columns={[
              {
                header: 'Demande',
                render: (d) => (
                  <>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{d.title}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{d.address}</div>
                  </>
                )
              },
              { header: 'Type', render: (d) => <div style={{ fontSize: 13, color: '#4B5563' }}>{d.type}</div> },
              { header: 'Devis', render: (d) => <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{d.devis} devis</div> },
              {
                header: 'Statut',
                render: (d) => (
                  <span style={{ 
                    background: d.statusColor, color: d.statusText, 
                    padding: '4px 12px', borderRadius: 20, 
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase' 
                  }}>
                    {d.status}
                  </span>
                )
              }
            ]}
          />
        </DashboardCard>

        <DashboardCard 
          title="Derniers devis reçus"
          badge={<Link href="/espace-client/devis" style={{ color: 'var(--red)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Comparer</Link>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {devis.length === 0 ? (
              <div style={{ color: '#6B7280', fontSize: 14 }}>Aucun devis reçu pour l'instant.</div>
            ) : devis.map(d => (
              <div 
                key={d.id} 
                className="card"
                style={{ padding: 16, border: '1px solid #F3F4F6' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: d.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{d.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{d.company}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9CA3AF' }}>
                      <MapPin size={10} /> {d.city}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{d.price}</div>
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={10} fill={star <= d.rating ? '#FBBF24' : 'none'} color={star <= d.rating ? '#FBBF24' : '#E5E7EB'} />
                      ))}
                    </div>
                  </div>
                </div>
                <Link href="/espace-client/devis" style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, 
                  fontSize: 13, color: 'var(--red)', fontWeight: 700, textDecoration: 'none' 
                }}>
                  Voir le détail <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </motion.div>
  )
}
