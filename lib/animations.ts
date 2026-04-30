import { Variants, TargetAndTransition } from 'framer-motion'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: 'easeOut' } 
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

export const cardHover: TargetAndTransition = {
  y: -2,
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  transition: { duration: 0.2 }
}

export const tableRowHover: TargetAndTransition = {
  backgroundColor: '#F9FAFB',
  transition: { duration: 0.1, ease: 'easeOut' }
}
