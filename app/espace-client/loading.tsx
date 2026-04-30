import React from 'react'

export default function LoadingClient() {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <div className="skeleton" style={{ width: '200px', height: '28px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '300px', height: '16px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
        ))}
      </div>

      <div className="skeleton" style={{ height: '500px', borderRadius: '16px' }} />
    </div>
  )
}
