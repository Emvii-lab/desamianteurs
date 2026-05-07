import { createServerSupabase } from '@/lib/supabase-server'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Certifications & documents requis | Désamianteurs.fr',
  description: 'Consultez les certifications obligatoires exigées pour chaque type de professionnel référencé sur Désamianteurs.fr.',
}

const TYPES = [
  {
    key: 'asbestos_remover',
    label: 'Désamianteur',
    subtitle: 'Retrait, confinement, mise en sécurité',
    color: '#C0392B',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    key: 'diagnostician',
    label: 'Diagnostiqueur',
    subtitle: 'Repérage, diagnostic avant travaux / vente / démolition',
    color: '#111111',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    key: 'sampler_lab',
    label: 'Préleveur / Laboratoire',
    subtitle: "Analyse d'air, de matériaux et stratégie d'échantillonnage",
    color: '#1A5276',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-5 5h14l-5-5V3" />
      </svg>
    ),
  },
  {
    key: 'project_manager',
    label: "Maître d'œuvre / AMO",
    subtitle: 'Conception, consultation, réalisation',
    color: '#6C3483',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
]

export default async function CertificationsPage() {
  const supabase = await createServerSupabase()

  const [docsRes, domainsRes] = await Promise.all([
    supabase
      .from('ref_document_types')
      .select('partner_type, label, description, is_required, sort_order')
      .order('sort_order'),
    supabase
      .from('ref_domains')
      .select('partner_type, label, category, sort_order')
      .order('sort_order'),
  ])

  const docs = docsRes.data ?? []
  const domains = domainsRes.data ?? []

  return (
    <div style={{ background: '#F3F4F6', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '56px 32px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: 'rgba(192,57,43,0.18)', color: 'var(--red)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Transparence
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 40px)', color: 'white', marginBottom: 12, fontWeight: 700 }}>
            Certifications &amp; documents requis
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, maxWidth: 620, lineHeight: 1.7, margin: 0 }}>
            Chaque professionnel référencé sur Désamianteurs.fr doit fournir et maintenir à jour les documents suivants, vérifiés par notre équipe avant toute activation du profil.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {TYPES.map(t => {
          const typeDocs = docs.filter(d => d.partner_type === t.key)
          const typeDomains = domains.filter(d => d.partner_type === t.key)
          const certDomains = typeDomains.filter(d => d.category === 'certification')
          const skillDomains = typeDomains.filter(d => d.category === 'domain')

          return (
            <div key={t.key} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {t.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t.label}</h2>
                  <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>{t.subtitle}</div>
                </div>
              </div>

              {/* Documents obligatoires */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
                {typeDocs.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>
                      <strong>{doc.label}</strong>
                      {doc.description && <span style={{ color: 'var(--gray-500)' }}> — {doc.description}</span>}
                    </span>
                  </div>
                ))}
              </div>

              {/* Certifications / Compétences */}
              {certDomains.length > 0 && (
                <div style={{ marginBottom: skillDomains.length > 0 ? 10 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                    Certifications acceptées
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {certDomains.map((d, i) => (
                      <span key={i} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', fontWeight: 500 }}>
                        {d.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Domaines / compétences */}
              {skillDomains.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8, marginTop: certDomains.length > 0 ? 12 : 0 }}>
                    Domaines d'intervention
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {skillDomains.map((d, i) => (
                      <span key={i} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#F3F4F6', color: '#374151', fontWeight: 500 }}>
                        {d.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Processus de vérification */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--gray-100)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Processus de vérification</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { n: '01', title: 'Inscription', desc: 'Dépôt du SIRET, des documents et des certifications. Délai : 7 jours.' },
              { n: '02', title: 'Validation', desc: 'Une association indépendante vérifie vos certifications. Frais de dossier : 80 €.' },
              { n: '03', title: 'Activation', desc: 'Profil en ligne, abonnement mensuel sans engagement, premiers leads sous 48h.' },
              { n: '04', title: 'Suivi', desc: 'Dashboard, alertes temps réel, score de réactivité pour optimiser votre classement.' },
            ].map((step, i, arr) => (
              <div key={step.n} style={{ padding: '20px 20px', borderRight: i < arr.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--gray-200)', lineHeight: 1, marginBottom: 8, letterSpacing: '-1px' }}>{step.n}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16, padding: '28px 32px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 16, maxWidth: 560, margin: '0 auto 16px' }}>
            Tous les documents sont vérifiés par notre équipe avant publication du profil. Les certifications expirées sont automatiquement signalées.
          </p>
          <Link href="/inscription?tab=partenaire" className="btn btn-red" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            S'inscrire en tant que partenaire
          </Link>
        </div>

      </div>

      <Footer />
    </div>
  )
}
