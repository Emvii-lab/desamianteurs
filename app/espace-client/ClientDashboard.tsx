'use client'

import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, cardHover, tableRowHover } from '@/lib/animations'
import { 
  Inbox, TrendingUp, MessageSquare, Star, 
  Plus, MapPin, ChevronRight, LayoutDashboard,
  Calendar, Building2, User
} from 'lucide-react'
import Link from 'next/link'

type Stat = {
  demandes: number
  devisCount: number
  messages: number
  reviews: number
}

type Demande = {
  id: string
  title: string
  address: string
  type: string
  devis: number
  status: string
  statusColor: string
  statusText: string
}

type Devis = {
  id: string
  initials: string
  company: string
  city: string
  price: string
  rating: number
  color: string
}

type ClientDashboardProps = {
  prenom: string
  demandes: Demande[]
  devis: Devis[]
  stats: Stat
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

      {/* Stats */}
      <motion.div variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 40 }}>
        {[
          { label: 'Demandes',    value: stats.demandes,    sub: 'au total',    Icon: Inbox },
          { label: 'Devis reçus', value: stats.devisCount,  sub: 'à comparer',  Icon: TrendingUp },
          { label: 'Messages',    value: stats.messages,    sub: 'non lus',     Icon: MessageSquare },
          { label: 'Avis laissés',value: stats.reviews,     sub: 'au total',    Icon: Star },
        ].map((s) => (
          <motion.div 
            key={s.label} 
            variants={fadeUp}
            whileHover={cardHover}
            style={{ 
              background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0A0A0A' }}>{s.value}</div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.Icon size={14} color="#6B7280" />
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4, fontWeight: 500 }}>{s.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
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
        {/* Demandes récentes */}
        <motion.div variants={fadeUp} style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Mes demandes récentes</h3>
            <Link href="/espace-client/demandes" style={{ color: 'var(--red)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Voir tout</Link>
          </div>
          {demandes.length === 0 ? (
            <div style={{ padding: 24, color: '#6B7280', fontSize: 14 }}>Aucune demande pour l'instant.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                    <th style={thStyle}>Demande</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Devis</th>
                    <th style={thStyle}>Statut</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer}>
                  {demandes.map(d => (
                    <motion.tr 
                      key={d.id} 
                      variants={fadeUp}
                      className="table-row"
                      style={{ borderBottom: '1px solid #F3F4F6' }}
                    >
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{d.title}</div>
                        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{d.address}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 13, color: '#4B5563' }}>{d.type}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{d.devis} devis</div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ 
                          background: d.statusColor, color: d.statusText, 
                          padding: '4px 12px', borderRadius: 20, 
                          fontSize: 11, fontWeight: 700, textTransform: 'uppercase' 
                        }}>
                          {d.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Devis reçus */}
        <motion.div variants={fadeUp} style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Derniers devis reçus</h3>
            <Link href="/espace-client/devis" style={{ color: 'var(--red)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Comparer</Link>
          </div>
          <motion.div variants={staggerContainer} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {devis.length === 0 ? (
              <div style={{ color: '#6B7280', fontSize: 14 }}>Aucun devis reçu pour l'instant.</div>
            ) : devis.map(d => (
              <motion.div 
                key={d.id} 
                variants={fadeUp}
                whileHover={cardHover}
                style={{ border: '1px solid #F3F4F6', borderRadius: 12, padding: 16 }}
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
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#4B5563',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
  padding: '16px',
  verticalAlign: 'middle',
}
