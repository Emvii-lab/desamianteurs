'use client'

import { useState } from 'react'
import { 
  Wrench, Layers, Tag, 
  Hash, Activity
} from 'lucide-react'
import { TYPE_LABEL } from '@/lib/constants'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, cardHover } from '@/lib/animations'

type Service = any
type Domain = any

type Props = {
  services: Service[]
  domains: Domain[]
}


export default function PrestationsClient({ services, domains }: Props) {
  const [activeTab, setActiveTab] = useState<'services' | 'domains'>('services')

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="admin-page-content"
    >
      <motion.div variants={fadeUp} className="admin-page-header">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0A0A0A', marginBottom: '4px' }}>Types de prestation</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Gérez les catégories de services et les domaines d'intervention.</p>
        </div>
        <div className="admin-pill-tabs" style={{ display: 'flex', gap: '8px', background: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('services')}
            style={{
              padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: activeTab === 'services' ? 'white' : 'transparent',
              color: activeTab === 'services' ? '#111827' : '#6B7280',
              boxShadow: activeTab === 'services' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} /> Prestations
            </div>
          </button>
          <button
            onClick={() => setActiveTab('domains')}
            style={{
              padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: activeTab === 'domains' ? 'white' : 'transparent',
              color: activeTab === 'domains' ? '#111827' : '#6B7280',
              boxShadow: activeTab === 'domains' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} /> Domaines
            </div>
          </button>
        </div>
      </motion.div>

      {activeTab === 'services' ? (
        <motion.div variants={staggerContainer} className="prestation-grid" style={{ display: 'grid', gap: '20px' }}>
          {services.map((s) => (
            <motion.div 
              key={s.id} 
              variants={fadeUp}
              whileHover={cardHover}
              style={cardStyle}
            >
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px', background: '#F0FDF4', color: '#059669',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Wrench size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{s.label}</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5', marginBottom: '16px' }}>
                    {s.description || 'Aucune description renseignée.'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#9CA3AF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Hash size={12} /> Ordre: {s.sort_order}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="prestation-grid" style={{ display: 'grid', gap: '20px' }}>
          {Object.entries(groupBy(domains, 'partner_type')).map(([type, items]: [any, any]) => (
            <motion.div key={type} variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '4px' }}>
                {TYPE_LABEL[type] || type}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((d: any) => (
                  <motion.div 
                    key={d.id} 
                    whileHover={{ x: 4, backgroundColor: '#F9FAFB' }}
                    style={{ ...cardStyle, padding: '12px 16px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Tag size={14} style={{ color: '#0284C7' }} />
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>{d.label}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#9CA3AF' }}>#{d.sort_order}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

function groupBy(arr: any[], key: string) {
  return arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item)
    return acc
  }, {})
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  padding: '24px',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--gray-200)',
  boxShadow: 'var(--shadow-sm)',
  transition: 'transform 0.2s, box-shadow 0.2s',
}
