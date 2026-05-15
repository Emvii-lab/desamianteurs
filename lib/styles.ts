import type { CSSProperties } from 'react'

// ─── Typographie ─────────────────────────────────────────────────────────────
export const FONT_SANS  = 'var(--font-sans, DM Sans, sans-serif)'
export const FONT_SERIF = 'var(--font-serif, "DM Serif Display", Georgia, serif)'

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function avatarStyle(size: number, bg = '#0A0A0A'): CSSProperties {
  return {
    width: size, height: size, borderRadius: 8,
    background: bg, color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size < 36 ? 11 : 13, fontWeight: 700,
    fontFamily: FONT_SANS, flexShrink: 0,
  }
}

// ─── Cards ───────────────────────────────────────────────────────────────────
export const CARD: CSSProperties = {
  background: 'white', borderRadius: 8,
  border: '1px solid #E5E7EB', padding: '16px 20px',
}

export const CARD_HOVER: CSSProperties = {
  ...CARD, cursor: 'pointer',
  transition: 'box-shadow 0.2s, transform 0.2s',
}

// ─── Badge rouge ─────────────────────────────────────────────────────────────
export const BADGE_RED: CSSProperties = {
  display: 'inline-block',
  background: 'rgba(192,57,43,0.08)', color: 'var(--red)',
  padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
}

// ─── Bouton rouge inline (pour les cas sans className) ───────────────────────
export const BTN_RED_INLINE: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--red)', color: 'white',
  border: '1.5px solid var(--red)', borderRadius: 8,
  fontSize: 13, fontWeight: 700, fontFamily: FONT_SANS,
  cursor: 'pointer', textDecoration: 'none',
  transition: 'all 0.2s ease',
}

// ─── Input standard ──────────────────────────────────────────────────────────
export const INPUT: CSSProperties = {
  width: '100%', padding: '11px 14px',
  border: '1px solid #E5E7EB', borderRadius: 6,
  fontFamily: FONT_SANS, fontSize: 14, color: '#111',
  background: 'white', outline: 'none',
  transition: 'border-color 0.15s',
}

// ─── Label de formulaire ─────────────────────────────────────────────────────
export const LABEL: CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#374151', marginBottom: 6, fontFamily: FONT_SANS,
}

// ─── Séparateur section ──────────────────────────────────────────────────────
export const DIVIDER: CSSProperties = {
  borderTop: '1px solid #F3F4F6', margin: '24px 0',
}
