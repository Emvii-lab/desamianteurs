import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingPartner() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <Skeleton width={200} height={26} radius={6} style={{ marginBottom: 8 }} />
          <Skeleton width={320} height={14} radius={4} />
        </div>
        <Skeleton width={100} height={24} radius={12} />
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: 'white', borderRadius: 8, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
            <Skeleton width={100} height={11} radius={3} style={{ marginBottom: 10 }} />
            <Skeleton width={60} height={28} radius={4} style={{ marginBottom: 6 }} />
            <Skeleton width={80} height={11} radius={3} />
          </div>
        ))}
      </div>

      {/* Diagnostic cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: 'white', borderRadius: 8, border: '1px solid #E5E7EB', padding: 20 }}>
            <Skeleton width={80} height={10} radius={3} style={{ marginBottom: 12 }} />
            <Skeleton width={70} height={28} radius={4} style={{ marginBottom: 6 }} />
            <Skeleton width={140} height={10} radius={3} />
          </div>
        ))}
      </div>

      {/* Main cards */}
      {[340, 280].map((_, i) => (
        <div key={i} style={{ background: 'white', borderRadius: 12, border: '1px solid #F3F4F6', marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width={200} height={16} radius={4} />
            <Skeleton width={80} height={22} radius={11} />
          </div>
          <div style={{ padding: 24 }}>
            {[1, 2, 3, 4].map(j => (
              <div key={j} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: j < 4 ? '1px solid #F9FAFB' : 'none', alignItems: 'center' }}>
                <Skeleton width={140} height={14} radius={4} />
                <Skeleton width={80} height={14} radius={4} style={{ marginLeft: 'auto' }} />
                <Skeleton width={60} height={14} radius={4} />
                <Skeleton width={70} height={30} radius={6} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
