import React from 'react'

export default function LoadingAdmin() {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton" style={{ width: '240px', height: '28px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '400px', height: '16px' }} />
      </div>

      {/* Stats Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
        <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
      </div>

    </div>
  )
}
