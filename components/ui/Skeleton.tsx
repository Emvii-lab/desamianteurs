import React from 'react'

type Props = {
  width?: number | string
  height?: number | string
  radius?: number
  style?: React.CSSProperties
}

export function Skeleton({ width, height = 16, radius = 8, style }: Props) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

export function SkeletonCard({ height = 100 }: { height?: number }) {
  return <Skeleton height={height} radius={12} style={{ width: '100%' }} />
}

export function SkeletonText({ width = '60%', lines = 1 }: { width?: string | number; lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? '40%' : width}
          height={14}
          radius={6}
        />
      ))}
    </div>
  )
}
