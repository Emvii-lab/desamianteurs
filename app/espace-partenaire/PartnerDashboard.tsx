'use client'

import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, cardHover, tableRowHover } from '@/lib/animations'
import Link from 'next/link'

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
            style={{ 
              background: '#D1FAE5', color: '#059669', padding: '4px 12px', 
              borderRadius: '20px', fontSize: '12px', fontWeight: 700 
            }}
          >
            Compte validé
          </motion.span>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Demandes en attente', value: stats.demandes,    sub: 'à traiter' },
          { label: 'Missions complétées', value: stats.missions,    sub: 'au total' },
          { label: 'Note moyenne',        value: stats.rating > 0 ? stats.rating.toFixed(1).replace('.', ',') : '—', sub: `${stats.reviewCount} avis` },
          { label: 'Avis reçus',          value: stats.reviewCount, sub: 'au total' },
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
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0A0A0A' }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{s.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Nouvelles demandes */}
      <motion.div variants={fadeUp} style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Nouvelles demandes dans votre zone</span>
          {demandes.length > 0 && (
            <span style={{ background: 'var(--red)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
              {demandes.length} nouvelle{demandes.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {demandes.length === 0 ? (
          <div style={{ padding: 24, color: '#6B7280', fontSize: 14 }}>Aucune nouvelle demande dans votre zone pour l'instant.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                  <th style={thStyle}>Demande</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Localisation</th>
                  <th style={thStyle}>Publiée</th>
                  <th style={thStyle}>Action</th>
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
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{d.title}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{d.address}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: 13, color: '#4B5563' }}>{d.type}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: 13, color: '#4B5563' }}>{d.location}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{d.published}</div>
                    </td>
                    <td style={tdStyle}>
                      <Link href="/espace-partenaire/demandes" style={{ 
                        background: 'var(--red)', color: 'white', padding: '6px 12px', 
                        borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                        textDecoration: 'none', display: 'inline-block'
                      }}>
                        Répondre
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Avis récents */}
      <motion.div variants={fadeUp} style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Avis récents</span>
        </div>
        <motion.div variants={staggerContainer} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {avis.length === 0 ? (
            <div style={{ color: '#6B7280', fontSize: 14 }}>Aucun avis reçu pour l'instant.</div>
          ) : avis.map(a => (
            <motion.div 
              key={a.id} 
              variants={fadeUp}
              whileHover={cardHover}
              style={{ border: '1px solid #F3F4F6', borderRadius: 8, padding: 16 }}
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
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
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
