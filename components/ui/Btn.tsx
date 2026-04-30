'use client'

import { useState } from 'react'
import Link from 'next/link'

type Props = {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  style?: React.CSSProperties
  width?: string | number
}

/* ── Bouton rouge ──────────────────────────────────── */
export function BtnRed({ href, children, onClick, type = 'button', disabled, size = 'md', style, width }: Props) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  const pad = size === 'sm' ? '7px 16px' : size === 'lg' ? '16px 36px' : '12px 24px'
  const fs  = size === 'sm' ? 13 : size === 'lg' ? 15 : 14

  const s: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: pad, borderRadius: 6, fontSize: fs, fontWeight: 700,
    fontFamily: 'var(--font-sans), DM Sans, sans-serif',
    background:   active ? 'var(--red-hover)' : hover ? 'var(--red-hover)' : 'var(--red)',
    color:        'white',
    boxShadow:    hover && !active ? '0 4px 18px rgba(226,29,18,0.2)' : 'none',
    transform:    active ? 'scale(0.97)' : hover ? 'translateY(-1px)' : 'none',
    transition:   'background 0.15s, box-shadow 0.15s, transform 0.12s',
    textDecoration: 'none', border: 'none', outline: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    width: width ?? undefined,
    letterSpacing: '0.3px',
    ...style,
  }

  const ev = {
    onMouseEnter: () => !disabled && setHover(true),
    onMouseLeave: () => { setHover(false); setActive(false) },
    onMouseDown:  () => !disabled && setActive(true),
    onMouseUp:    () => setActive(false),
  }

  if (href) return <Link href={href} style={s} {...ev}>{children}</Link>
  return <button type={type} style={s} onClick={onClick} disabled={disabled} {...ev}>{children}</button>
}

/* ── Bouton outline ────────────────────────────────── */
export function BtnOutline({ href, children, onClick, type = 'button', disabled, size = 'md', style, width }: Props) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  const pad = size === 'sm' ? '6px 15px' : size === 'lg' ? '15px 35px' : '11px 23px'
  const fs  = size === 'sm' ? 13 : size === 'lg' ? 15 : 14

  const s: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: pad, borderRadius: 6, fontSize: fs, fontWeight: 600,
    fontFamily: 'var(--font-sans), DM Sans, sans-serif',
    background:  hover ? '#F3F4F6' : 'white',
    color:       '#111111',
    border:      `1.5px solid ${hover ? '#111111' : '#E5E7EB'}`,
    transform:   active ? 'scale(0.97)' : 'none',
    transition:  'border-color 0.15s, background 0.15s, transform 0.12s',
    textDecoration: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    width: width ?? undefined,
    ...style,
  }

  const ev = {
    onMouseEnter: () => !disabled && setHover(true),
    onMouseLeave: () => { setHover(false); setActive(false) },
    onMouseDown:  () => !disabled && setActive(true),
    onMouseUp:    () => setActive(false),
  }

  if (href) return <Link href={href} style={s} {...ev}>{children}</Link>
  return <button type={type} style={s} onClick={onClick} disabled={disabled} {...ev}>{children}</button>
}

/* ── Bouton ghost ──────────────────────────────────── */
export function BtnGhost({ href, children, onClick, type = 'button', disabled, size = 'md', style, width }: Props) {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  const pad = size === 'sm' ? '6px 15px' : size === 'lg' ? '15px 35px' : '11px 23px'
  const fs  = size === 'sm' ? 13 : size === 'lg' ? 15 : 14

  const s: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: pad, borderRadius: 6, fontSize: fs, fontWeight: 500,
    fontFamily: 'var(--font-sans), DM Sans, sans-serif',
    background:  hover ? '#F3F4F6' : 'transparent',
    color:       hover ? '#111111' : '#4B5563',
    border:      `1.5px solid ${hover ? '#D1D5DB' : 'transparent'}`,
    transform:   active ? 'scale(0.97)' : 'none',
    transition:  'border-color 0.15s, background 0.15s, color 0.15s, transform 0.12s',
    textDecoration: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    width: width ?? undefined,
    ...style,
  }

  const ev = {
    onMouseEnter: () => !disabled && setHover(true),
    onMouseLeave: () => { setHover(false); setActive(false) },
    onMouseDown:  () => !disabled && setActive(true),
    onMouseUp:    () => setActive(false),
  }

  if (href) return <Link href={href} style={s} {...ev}>{children}</Link>
  return <button type={type} style={s} onClick={onClick} disabled={disabled} {...ev}>{children}</button>
}
