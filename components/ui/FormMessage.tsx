import { CheckCircle2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface FormMessageProps {
  type: 'success' | 'error'
  text: string
}

export function FormMessage({ type, text }: FormMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500,
        background: type === 'success' ? '#D1FAE5' : '#FEE2E2',
        color:      type === 'success' ? '#065F46'  : '#991B1B',
        border: `1px solid ${type === 'success' ? '#A7F3D0' : '#FECACA'}`,
        marginBottom: 16,
      }}
    >
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {text}
    </motion.div>
  )
}
