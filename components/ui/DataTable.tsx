import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'

interface Column<T> {
  header: string
  render: (item: T) => React.ReactNode
  style?: React.CSSProperties
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
  getRowKey: (item: T) => string | number
}

export function DataTable<T>({ data, columns, emptyMessage = "Aucune donnée disponible", getRowKey }: DataTableProps<T>) {
  if (data.length === 0) {
    return <div style={{ padding: 24, color: 'var(--gray-400)', fontSize: 14 }}>{emptyMessage}</div>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ background: 'var(--gray-50)' }}>
            {columns.map((col, idx) => (
              <th key={idx} style={thStyle}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <motion.tbody variants={staggerContainer}>
          {data.map((item) => (
            <motion.tr 
              key={getRowKey(item)} 
              variants={fadeUp}
              className="table-row"
              style={{ transition: 'none' }}
            >
              {columns.map((col, idx) => (
                <td key={idx} style={{ ...tdStyle, ...col.style }}>
                  {col.render(item)}
                </td>
              ))}
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 16px',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--gray-500)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid var(--gray-100)'
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
  fontSize: '13px',
  color: 'var(--gray-600)',
  borderBottom: '1px solid var(--gray-50)'
}
