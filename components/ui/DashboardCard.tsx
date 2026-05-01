import { motion } from 'framer-motion'
import { cardHover, fadeUp } from '@/lib/animations'

interface DashboardCardProps {
  children: React.ReactNode
  title?: string
  badge?: React.ReactNode
  noPadding?: boolean
  className?: string
  style?: React.CSSProperties
}

export function DashboardCard({ children, title, badge, noPadding, className, style }: DashboardCardProps) {
  return (
    <motion.div 
      variants={fadeUp}
      whileHover={cardHover}
      className={`card ${className || ''}`}
      style={{ padding: noPadding ? 0 : undefined, overflow: noPadding ? 'hidden' : undefined, ...style }}
    >
      {(title || badge) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 24px', 
          borderBottom: '1px solid var(--gray-100)' 
        }}>
          {title && <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>}
          {badge}
        </div>
      )}
      <div style={{ padding: noPadding ? 0 : '24px' }}>
        {children}
      </div>
    </motion.div>
  )
}
