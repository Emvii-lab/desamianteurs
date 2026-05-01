import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, cardHover } from '@/lib/animations'
import { LucideIcon } from 'lucide-react'

interface StatItem {
  label: string
  value: string | number
  sub?: string
  Icon?: LucideIcon
  highlight?: boolean
}

interface StatGridProps {
  stats: StatItem[]
  columns?: number
}

export function StatGrid({ stats, columns = 4 }: StatGridProps) {
  return (
    <motion.div 
      variants={staggerContainer} 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${columns}, 1fr)`, 
        gap: 16, 
        marginBottom: 32 
      }}
    >
      {stats.map((s, idx) => (
        <motion.div 
          key={idx} 
          variants={fadeUp}
          whileHover={cardHover}
          className="stat-card" 
          style={{ 
            border: s.highlight ? '1.5px solid var(--red)' : '1px solid var(--gray-200)',
            position: 'relative',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-number" style={{ color: s.highlight ? 'var(--red)' : undefined }}>
              {s.value}
            </div>
            {s.Icon && (
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: 8, 
                background: 'var(--gray-100)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <s.Icon size={14} color="var(--gray-500)" />
              </div>
            )}
          </div>
          <div>
            <div className="stat-label">{s.label}</div>
            {s.sub && (
              <div style={{ fontSize: 11, color: s.highlight ? 'var(--red)' : 'var(--gray-400)', marginTop: 2 }}>
                {s.sub}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
