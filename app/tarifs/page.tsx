import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Check } from 'lucide-react'
import { PLANS, COMPARISON, STEPS_PRICE } from '@/lib/constants'

export const metadata = {
  title: 'Tarifs et Formules | Désamianteurs.fr',
  description: 'Découvrez nos formules adaptées à chaque besoin : Standard, Premium, Élite et Platinium.',
}

export default function TarifsPage() {
  return (
    <div className="fade-in" style={{ background: '#FDFDFD' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'var(--black)', padding: '100px 32px 140px', textAlign: 'center', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: -150,
          right: -100,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none'
        }} />
        
        <div className="fade-in-up">
          <div className="badge badge-red-outline" style={{ marginBottom: 32, border: '1px solid rgba(192, 57, 43, 0.4)' }}>
            OFFRES PRO
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'white', fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 600, marginBottom: 24 }}>
            Des tarifs <span style={{ color: 'var(--red)' }}>simples</span> et <span style={{ color: 'var(--red)' }}>transparents</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 600, margin: '0 auto' }}>
            Engagement 3 mois · résiliable chaque mois ensuite.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '-60px auto 100px', padding: '0 32px', position: 'relative', zIndex: 10 }}>
        
        {/* Freemium Box */}
        <div className="fade-in-up" style={{ background: 'white', border: '1px solid var(--gray-100)', borderRadius: 8, padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 4, fontFamily: 'var(--font-body)', fontWeight: 700 }}>Freemium – Gratuit</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-400)', margin: 0 }}>1 affaire offerte pour tester la plateforme · Sans engagement · Profil visible</p>
          </div>
          <Link href="/inscription" className="btn btn-outline" style={{ textTransform: 'none', padding: '12px 32px' }}>
            Commencer gratuitement
          </Link>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 100, maxWidth: 1000, margin: '0 auto 100px' }}>
          {PLANS.map((plan, idx) => (
            <div key={plan.id} className="fade-in-up" style={{ 
              background: 'white',
              border: plan.highlight ? '2px solid var(--red)' : '1px solid var(--gray-100)',
              borderRadius: 8,
              padding: '40px 24px',
              textAlign: 'center',
              position: 'relative',
              animationDelay: `${idx * 0.1}s`,
              display: 'flex',
              flexDirection: 'column'
            }}>
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
                    {cat.items.map((item: any, ii) => (
                      <div key={ii} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                        <Check size={16} color={typeof item === 'object' && item.disabled ? 'var(--gray-300)' : 'var(--red)'} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: typeof item === 'object' && item.disabled ? 'var(--gray-300)' : 'var(--black)' }}>
                            {typeof item === 'object' ? item.text : item}
                            {typeof item === 'object' && item.success && (
                              <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 4, background: 'rgba(52, 211, 153, 0.1)', color: '#059669', fontSize: 10 }}>Temps réel</span>
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

              <Link href={plan.id === 'platinum' ? '/contact' : '/inscription'} className={`btn ${plan.ctaStyle}`} style={{ width: '100%', textTransform: 'none', marginTop: 20 }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <section style={{ marginBottom: 120 }}>
          <h2 style={{ fontSize: 24, textAlign: 'center', marginBottom: 48 }}>Comparatif rapide</h2>
          <div style={{ background: 'white', border: '1px solid var(--gray-100)', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--black)', color: 'white' }}>
                  <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: 13 }}>Formule</th>
                  <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: 13 }}>Zones</th>
                  <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: 13 }}>Demandes simultanées</th>
                  <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: 13 }}>Réception</th>
                  <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: 13 }}>Engagement</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--gray-100)', background: row.label === 'Premium' ? 'rgba(192, 57, 43, 0.02)' : 'transparent' }}>
                    <td style={{ padding: '20px 32px', fontSize: 14, fontWeight: 700, color: row.label === 'Premium' ? 'var(--red)' : 'var(--black)' }}>{row.label}</td>
                    <td style={{ padding: '20px 32px', fontSize: 14 }}>{row.zone}</td>
                    <td style={{ padding: '20px 32px', fontSize: 14 }}>
                      {row.leads}
                      {row.label === 'Premium' && <span style={{ marginLeft: 8, color: '#059669', background: 'rgba(52, 211, 153, 0.1)', padding: '2px 8px', borderRadius: 4, fontSize: 10 }}>Temps réel</span>}
                    </td>
                    <td style={{ padding: '20px 32px', fontSize: 14 }}>{row.reception}</td>
                    <td style={{ padding: '20px 32px', fontSize: 14 }}>{row.engagement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '16px 32px', fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic', textAlign: 'center' }}>
              Maximum 3 professionnels contactés par demande · Rotation automatique si non-réponse sous 48 h
            </div>
          </div>
        </section>

        {/* How it Works (Steps) */}
        <section style={{ marginBottom: 120 }}>
          <h2 style={{ fontSize: 28, marginBottom: 12 }}>Comment ça se passe ?</h2>
          <p style={{ color: 'var(--gray-400)', marginBottom: 48 }}>De l'inscription à l'activation de votre compte.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {STEPS_PRICE.map((step, i) => (
              <div key={i} className="fade-in-up" style={{ background: 'white', padding: '32px 24px', border: '1px solid var(--gray-50)', borderRadius: 8, animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gray-100)', marginBottom: 16 }}>{step.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 8, padding: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Check size={18} color="var(--red)" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>L'inscription et les demandes de devis sont 100 % gratuits pour les clients particuliers et maîtres d'ouvrage.</span>
        </div>

      </div>

      <Footer />
    </div>
  )
}
