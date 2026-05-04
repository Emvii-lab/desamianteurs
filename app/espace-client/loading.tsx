import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingClient() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <Skeleton width={200} height={26} radius={6} style={{ marginBottom: 8 }} />
        <Skeleton width={300} height={14} radius={4} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: 'white', borderRadius: 8, border: '1px solid #E5E7EB', padding: '20px 24px' }}>
            <Skeleton width={90} height={11} radius={3} style={{ marginBottom: 10 }} />
            <Skeleton width={55} height={28} radius={4} style={{ marginBottom: 6 }} />
            <Skeleton width={70} height={11} radius={3} />
          </div>
        ))}
      </div>

      {[0, 1].map(i => (
        <div key={i} style={{ background: 'white', borderRadius: 12, border: '1px solid #F3F4F6', marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width={180} height={15} radius={4} />
            <Skeleton width={70} height={22} radius={11} />
          </div>
          {[1, 2, 3].map(j => (
            <div key={j} style={{ padding: '16px 24px', borderBottom: j < 3 ? '1px solid #F9FAFB' : 'none', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <Skeleton width={180} height={14} radius={4} style={{ marginBottom: 6 }} />
                <Skeleton width={120} height={11} radius={3} />
              </div>
              <Skeleton width={70} height={22} radius={11} />
              <Skeleton width={80} height={14} radius={4} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
