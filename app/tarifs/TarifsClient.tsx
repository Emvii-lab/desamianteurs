'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { PLANS, COMPARISON, STEPS_PRICE } from '@/lib/constants'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as any, delay },
})

export default function TarifsClient() {
  return (
    <div style={{ background: '#FDFDFD' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'var(--black)', padding: '100px 32px 140px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Cercles animés */}
        <motion.div
          animate={{ y: [0, -14, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: -160, right: -120, width: 380, height: 380, borderRadius: '50%', background: 'rgba(192,57,43,0.20)', pointerEvents: 'none' }}
        />
        <motion.div
          animate={{ y: [0, 10, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          style={{ position: 'absolute', top: -160, left: -140, width: 300, height: 300, borderRadius: '50%', background: 'rgba(192,57,43,0.11)', pointerEvents: 'none' }}
        />

        <motion.div {...fadeUp(0)}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: 'rgba(192,57,43,0.18)', color: 'var(--red)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Offres Pro
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif, "DM Serif Display", Georgia, serif)', color: 'white', fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 700, marginBottom: 24 }}>
            Des tarifs <span style={{ color: 'var(--red)' }}>simples</span> et <span style={{ color: 'var(--red)' }}>transparents</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 600, margin: '0 auto' }}>
            Engagement 3 mois · résiliable chaque mois ensuite.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: 1200, margin: '-60px auto 100px', padding: '0 32px', position: 'relative', zIndex: 10 }}>

        {/* Freemium */}
        <motion.div {...fadeUp(0.1)} style={{ background: 'white', border: '1px solid var(--gray-100)', borderRadius: 10, padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 4, fontWeight: 700 }}>Freemium – Gratuit</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-400)', margin: 0 }}>1 affaire offerte pour tester la plateforme · Sans engagement · Profil visible</p>
          </div>
          <Link href="/inscription" className="btn btn-outline" style={{ textTransform: 'none', padding: '12px 32px', flexShrink: 0 }}>
            Commencer gratuitement
          </Link>
        </motion.div>

        {/* Pricing cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 24, 
          marginBottom: 100, 
          maxWidth: 1000, 
          margin: '0 auto 100px' 
        }}>
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              {...fadeUp(idx * 0.12)}
              style={{
                background: 'white',
                border: plan.highlight ? '2px solid var(--red)' : '1px solid var(--gray-100)',
                borderRadius: 12,
                padding: '40px 24px',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: plan.highlight ? '0 8px 32px rgba(192,57,43,0.12)' : '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              {plan.tag && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--red)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 20px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                  {plan.tag}
                </div>
              )}
              <div style={{ marginBottom: 32 }}>
                <div className="badge" style={{ background: 'var(--gray-50)', color: plan.highlight ? 'var(--red)' : 'var(--gray-400)', fontSize: 10, fontWeight: 800, marginBottom: 20 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontSize: plan.price === 'Sur devis' ? 24 : 48, fontWeight: 800 }}>{plan.price === 'Sur devis' ? plan.price : `€${plan.price}`}</span>
                  <span style={{ fontSize: 14, color: 'var(--gray-400)' }}>{plan.period}</span>
                </div>
              </div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                {plan.features.map((cat, ci) => (
                  <div key={ci} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-400)', letterSpacing: 0.5, marginBottom: 16 }}>{cat.category}</div>
                    {cat.items.map((item: any, ii: number) => (
                      <div key={ii} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                        <Check size={16} color={typeof item === 'object' && item.disabled ? 'var(--gray-300)' : 'var(--red)'} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: typeof item === 'object' && item.disabled ? 'var(--gray-300)' : 'var(--black)' }}>
                            {typeof item === 'object' ? item.text : item}
                            {typeof item === 'object' && item.success && (
                              <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 4, background: 'rgba(52,211,153,0.1)', color: '#059669', fontSize: 10 }}>{item.badge_text || 'Inclus'}</span>
                            )}
                          </div>
                          {typeof item === 'object' && item.badge && (
                            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>{item.badge}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <Link
                href={`/inscription?tab=partenaire&plan=${plan.id}`}
                className={`btn ${plan.ctaStyle}`}
                style={{ width: '100%', textTransform: 'none', marginTop: 20 }}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <section style={{ marginBottom: 120 }}>
          <motion.h2 {...fadeUp()} style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 48, color: 'var(--black)' }}>Comparatif rapide</motion.h2>
          <motion.div {...fadeUp(0.1)}>
          <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 800, background: 'white', border: '1px solid var(--gray-100)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--black)', color: 'white' }}>
                  {['Formule', 'Zones', 'Demandes simultanées', 'Réception', 'Engagement'].map(h => (
                    <th key={h} style={{ padding: '20px 32px', textAlign: 'left', fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.35 }}
                    style={{ borderBottom: '1px solid var(--gray-100)', background: row.label === 'Premium' ? 'rgba(192,57,43,0.02)' : 'transparent' }}
                  >
                    <td style={{ padding: '20px 32px', fontSize: 14, fontWeight: 700, color: row.label === 'Premium' ? 'var(--red)' : 'var(--black)' }}>{row.label}</td>
                    <td style={{ padding: '20px 32px', fontSize: 14 }}>{row.zone}</td>
                    <td style={{ padding: '20px 32px', fontSize: 14 }}>
                      {row.leads}
                      {row.label === 'Premium' && <span style={{ marginLeft: 8, color: '#059669', background: 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 10 }}>Temps réel</span>}
                    </td>
                    <td style={{ padding: '20px 32px', fontSize: 14 }}>{row.reception}</td>
                    <td style={{ padding: '20px 32px', fontSize: 14 }}>{row.engagement}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '16px 32px', fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic', textAlign: 'center' }}>
              Maximum 3 professionnels contactés par demande · Rotation automatique si non-réponse sous 48 h
            </div>
          </div>
          </div>
          </motion.div>
        </section>

        {/* Steps */}
        <section style={{ marginBottom: 120 }}>
          <motion.div {...fadeUp()}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, marginBottom: 8, color: 'var(--black)' }}>Comment ça se passe ?</h2>
            <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 40 }}>De l'inscription à l'activation de votre compte.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            {STEPS_PRICE.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] as any, delay: i * 0.08 }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.09)', transition: { duration: 0.2 } }}
                style={{
                  background: 'white',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 12,
                  padding: '24px 20px',
                  cursor: 'default',
                }}
              >
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--gray-200)', lineHeight: 1, marginBottom: 12, letterSpacing: '-1px', fontFamily: 'var(--font-sans)' }}>
                  {step.n}
                </div>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(192,57,43,0.07)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-sans)', color: 'var(--black)' }}>{step.title}</h3>
                <p style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.55, margin: 0 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA footer */}
        <motion.div {...fadeUp(0.1)} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 8, padding: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Check size={18} color="var(--red)" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>L'inscription et les demandes de devis sont 100 % gratuits pour les clients particuliers et maîtres d'ouvrage.</span>
        </motion.div>

      </div>

      <Footer />
    </div>
  )
}
