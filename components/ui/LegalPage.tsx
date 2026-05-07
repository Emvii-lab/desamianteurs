import type { ReactNode } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface TocItem { label: string; id: string }

interface LegalPageProps {
  tag: string
  title: string
  meta: string
  toc: TocItem[]
  children: ReactNode
}

export default function LegalPage({ tag, title, meta, toc, children }: LegalPageProps) {
  return (
    <div style={{ background: '#F3F4F6', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '56px 32px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: 'rgba(192,57,43,0.18)', color: 'var(--red)', letterSpacing: '0.8px', textTransform: 'uppercase' as const }}>
            {tag}
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3vw, 36px)', color: 'white', marginBottom: 10, fontWeight: 700 }}>
            {title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>{meta}</p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px 80px', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Sommaire */}
        {toc.length > 0 && (
          <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '20px 24px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-400)', letterSpacing: '0.8px', textTransform: 'uppercase' as const, marginBottom: 12 }}>Sommaire</p>
            <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {toc.map((item, i) => (
                <li key={item.id} style={{ fontSize: 13 }}>
                  <a href={`#${item.id}`} style={{ color: 'var(--gray-600)', textDecoration: 'none' }}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}

        {children}
      </div>

      <Footer />
    </div>
  )
}

/* ── Sous-composants ── */

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div id={id} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '24px 28px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--black)', scrollMarginTop: 80 }}>{title}</h2>
      <div style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  )
}

export function InfoBox({ children, color = '#1E40AF', bg = '#EFF6FF', border = '#BFDBFE' }: { children: ReactNode; color?: string; bg?: string; border?: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '12px 16px', marginTop: 14, fontSize: 13, color, lineHeight: 1.6 }}>
      {children}
    </div>
  )
}

export function LegalTable({ headers, rows }: { headers: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--black)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: '10px 14px', color: 'white', fontWeight: 600, textAlign: 'left', fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid var(--gray-200)', background: ri % 2 === 0 ? 'white' : '#FAFAFA' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '10px 14px', verticalAlign: 'top' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ paddingLeft: 20, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}
