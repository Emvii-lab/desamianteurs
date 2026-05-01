'use client'

import Link from 'next/link'

type Props = {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: React.CSSProperties
  width?: string | number
}

/* ── Bouton rouge ──────────────────────────────────── */
export function BtnRed({ href, children, onClick, type = 'button', disabled, size = 'md', className = '', style, width }: Props) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''
  const s: React.CSSProperties = {
    width: width ?? undefined,
    ...style,
  }

  if (href) return (
    <Link href={href} className={`btn btn-red ${sizeClass} ${className}`} style={s}>
      {children}
    </Link>
  )
  
  return (
    <button 
      type={type} 
      className={`btn btn-red ${sizeClass} ${className}`} 
      onClick={onClick} 
      disabled={disabled}
      style={s}
    >
      {children}
    </button>
  )
}

/* ── Bouton outline ────────────────────────────────── */
export function BtnOutline({ href, children, onClick, type = 'button', disabled, size = 'md', className = '', style, width }: Props) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''
  const s: React.CSSProperties = {
    width: width ?? undefined,
    ...style,
  }

  if (href) return (
    <Link href={href} className={`btn btn-outline ${sizeClass} ${className}`} style={s}>
      {children}
    </Link>
  )
  
  return (
    <button 
      type={type} 
      className={`btn btn-outline ${sizeClass} ${className}`} 
      onClick={onClick} 
      disabled={disabled}
      style={s}
    >
      {children}
    </button>
  )
}

/* ── Bouton ghost ──────────────────────────────────── */
export function BtnGhost({ href, children, onClick, type = 'button', disabled, size = 'md', className = '', style, width }: Props) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''
  const s: React.CSSProperties = {
    width: width ?? undefined,
    ...style,
  }

  if (href) return (
    <Link href={href} className={`btn btn-ghost ${sizeClass} ${className}`} style={s}>
      {children}
    </Link>
  )
  
  return (
    <button 
      type={type} 
      className={`btn btn-ghost ${sizeClass} ${className}`} 
      onClick={onClick} 
      disabled={disabled}
      style={s}
    >
      {children}
    </button>
  )
}
