import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode, CSSProperties } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createServerSupabase } from '@/lib/supabase-server'
import { getInitials, colorFor } from '@/lib/utils'
import { AVATAR_COLORS, TYPE_LABEL } from '@/lib/constants'

const PLAN_BADGE: Record<string, { label: string; bg: string; color: string } | null> = {
  freemium:    null,
  essentiel:   { label: 'Essentiel',   bg: '#F3F4F6', color: '#6B7280' },
  performance: { label: 'Performance', bg: '#DBEAFE', color: '#1D4ED8' },
  premium:     { label: 'Premium',     bg: '#FEF2F2', color: '#DC2626' },
  platinium:   { label: 'Platinium',   bg: '#FEF9C3', color: '#B45309' },
}

interface Props { params: Promise<{ id: string }> }

const BASE_URL = 'https://www.desamianteurs.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('partners')
    .select('company_name, description, city, logo_url, avatar_url')
    .eq('id', id)
    .maybeSingle()

  const title = data ? data.company_name : 'Profil professionnel'
  const description = data?.description?.slice(0, 155) ?? 'Professionnel certifié sur Désamianteurs.com'
  const image = data?.logo_url ?? data?.avatar_url ?? `${BASE_URL}/icons/icon-512.png`
  const url = `${BASE_URL}/professionnels/${id}`

  return {
    title,
    description,
    openGraph: {
      type: 'profile',
      url,
      title: `${title} | Désamianteurs.com`,
      description,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: 'summary',
      title: `${title} | Désamianteurs.com`,
      description,
      images: [image],
    },
  }
}

export default async function ProfilProPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const [partnerRes, domainsRes, documentsRes, reviewsRes, zoneRes] = await Promise.all([
    supabase
      .from('partners')
      .select('id, company_name, description, city, zip_code, partner_type, average_rating, review_count, average_response_hours, certified_workers_count, missions_completed, is_verified, subscription, created_at, siret, company_activity, logo_url, avatar_url')
      .eq('id', id)
      .eq('status', 'active')
      .maybeSingle(),

    supabase
      .from('partner_domains')
      .select('ref_domains(id, code, label, category)')
      .eq('partner_id', id),

    supabase
      .from('partner_documents')
      .select('ref_document_types(code, label), status, verified_at')
      .eq('partner_id', id)
      .in('status', ['verified', 'pending']),

    supabase.rpc('get_partner_reviews', { p_partner_id: id, p_limit: 6 }),

    supabase.rpc('get_partner_zone', { p_partner_id: id }),
  ])

  if (!partnerRes.data) notFound()

  const p         = partnerRes.data
  const domains   = (domainsRes.data ?? []).map(d => d.ref_domains as any).filter(Boolean)
  // Tous les domaines apparaissent comme badges (domain + certification)
  const badges    = domains
  // Seules les certifications alimentent aussi le bloc "documents vérifiés"
  const certItems = domains.filter((d: any) => d.category === 'certification')
  const documents = (documentsRes.data ?? []).map(d => ({
    ...(d.ref_document_types as any),
    status:      d.status,
    verified_at: d.verified_at,
  }))
  const reviews  = reviewsRes.data ?? []
  const zoneLabel = (zoneRes.data as any)?.[0]?.zone_label ?? '—'

  const planBadge   = p.subscription ? PLAN_BADGE[p.subscription] : null
  const avatarColor = colorFor(p.id, AVATAR_COLORS)
  const initials    = getInitials(p.company_name ?? '')
  const mediaUrl    = p.logo_url || p.avatar_url
  const createdYear = new Date(p.created_at).getFullYear()

  const hasDocsSection = certItems.length > 0 || documents.length > 0 || !!p.siret

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: p.company_name,
    description: p.description ?? undefined,
    url: `${BASE_URL}/professionnels/${p.id}`,
    image: p.logo_url ?? p.avatar_url ?? undefined,
    address: p.city ? {
      '@type': 'PostalAddress',
      addressLocality: p.city,
      postalCode: p.zip_code ?? undefined,
      addressCountry: 'FR',
    } : undefined,
    aggregateRating: p.review_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: p.average_rating,
      reviewCount: p.review_count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  }

  return (
    <div style={{ background: '#F3F4F6', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* ── Hero fond noir ── */}
      <div style={{ background: 'var(--black)' }}>
        <div className="pro-detail-hero" style={{ maxWidth: 960, margin: '0 auto' }}>
          <Link
            href="/professionnels"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 28 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Retour aux résultats
          </Link>

          <div className="pro-detail-hero-info" style={{ paddingBottom: 36 }}>
            {/* Avatar / Logo */}
            <div style={{
              width: 80, height: 80, flexShrink: 0,
              borderRadius: p.logo_url ? 12 : '50%',
              background: avatarColor, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800,
              border: '3px solid rgba(255,255,255,0.18)',
              overflow: 'hidden',
            }}>
              {mediaUrl
                ? <img src={mediaUrl} alt={p.company_name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'var(--font-sans)' }}>{initials}</span>
              }
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'white', margin: 0, fontWeight: 700 }}>
                  {p.company_name}
                </h1>
                {planBadge && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: planBadge.bg, color: planBadge.color }}>
                    {planBadge.label}
                  </span>
                )}
                {p.is_verified && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#D1FAE5', color: '#065F46' }}>
                    ✓ Vérifié
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                {(p.city || p.zip_code) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IconPin /> {[p.zip_code, p.city].filter(Boolean).join(' ')}
                  </span>
                )}
                {!!p.average_response_hours && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IconClock /> Répond en moy. {p.average_response_hours}h
                  </span>
                )}
                {(p.average_rating ?? 0) > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Stars n={Math.round(p.average_rating ?? 0)} color="#F4B942" />
                    <strong style={{ color: 'white' }}>{Number(p.average_rating).toFixed(1)}</strong>
                    <span>({p.review_count} avis)</span>
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                  {TYPE_LABEL[p.partner_type] ?? p.partner_type}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="pro-detail-content" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="pro-detail-grid" style={{ display: 'grid', gap: 24, alignItems: 'start' }}>

          {/* COLONNE PRINCIPALE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Présentation */}
            {p.description && (
              <Card>
                <h2 style={h2}>Présentation</h2>
                <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.75, margin: 0 }}>{p.description}</p>
              </Card>
            )}


            {/* Certifications & Documents */}
            {hasDocsSection && (
              <Card>
                <h2 style={h2}>Certifications &amp; Documents vérifiés</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Certifications issues des domaines */}
                  {certItems.length > 0 && (
                    <DocRow
                      label={certItems.map((d: any) => d.label).join(' · ')}
                      sub="Certifications vérifiées par la plateforme"
                      verified
                    />
                  )}

                  {/* Documents uploadés */}
                  {documents.map((doc: any, i: number) => (
                    <DocRow
                      key={i}
                      label={doc.label ?? '—'}
                      sub={doc.verified_at ? `Vérifié le ${new Date(doc.verified_at).toLocaleDateString('fr-FR')}` : undefined}
                      verified={doc.status === 'verified'}
                    />
                  ))}

                  {/* SIRET */}
                  {p.siret && (
                    <DocRow
                      label="Kbis / SIRET"
                      sub={`SIRET ${p.siret} · Vérifié`}
                      verified
                    />
                  )}
                </div>
              </Card>
            )}

            {/* Avis clients */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ ...h2, margin: 0 }}>Avis clients ({p.review_count ?? 0})</h2>
                {(p.average_rating ?? 0) > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15 }}>
                    <Stars n={Math.round(p.average_rating ?? 0)} color="#F4B942" />
                    <strong style={{ color: 'var(--black)' }}>{Number(p.average_rating).toFixed(1)}</strong>
                  </span>
                )}
              </div>

              {reviews.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--gray-400)', margin: 0 }}>Aucun avis pour l'instant.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reviews.map((r: any) => {
                    const stars = Math.round(r.rating ?? 0)
                    return (
                      <div key={r.id} style={{ border: '1px solid var(--gray-200)', borderRadius: 8, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <strong style={{ fontSize: 13 }}>{r.author_name ?? 'Client'}</strong>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                            <Stars n={stars} color="#F4B942" dimmed />
                            <strong style={{ color: 'var(--black)', fontSize: 13 }}>{r.rating}/5</strong>
                          </span>
                        </div>
                        {r.comment && (
                          <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, margin: '0 0 8px' }}>
                            "{r.comment}"
                          </p>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                          {new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* CTA devis */}
            <div style={{ background: 'white', border: '2px solid var(--red)', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--red)', marginBottom: 8, margin: '0 0 8px' }}>Demander un devis gratuit</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, margin: '0 0 16px' }}>
                Décrivez votre besoin et recevez une réponse de {(p.company_name ?? '').split(' ')[0]} sous 48h.
              </p>
              <Link href="/formulaire" className="btn btn-red" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                Demander un devis
              </Link>
            </div>

            {/* Informations */}
            <Card>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Informations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
                <InfoRow icon={<IconPin />} label="Zone d'intervention" value={zoneLabel} />
                {!!p.certified_workers_count && (
                  <InfoRow
                    icon={<IconUsers />}
                    label="Moyens humains"
                    value={`${p.certified_workers_count} technicien${p.certified_workers_count > 1 ? 's' : ''} certifié${p.certified_workers_count > 1 ? 's' : ''}`}
                  />
                )}
                <InfoRow icon={<IconCal />} label="Membre depuis" value={String(createdYear)} />
                {(p.missions_completed ?? 0) > 0 && (
                  <InfoRow
                    icon={<IconCheck />}
                    label="Missions réalisées"
                    value={`${p.missions_completed} chantier${(p.missions_completed ?? 0) > 1 ? 's' : ''} terminé${(p.missions_completed ?? 0) > 1 ? 's' : ''}`}
                  />
                )}
                {p.company_activity && (
                  <InfoRow icon={<IconBrief />} label="Activité principale" value={p.company_activity} />
                )}
              </div>
            </Card>

            {/* Signalement */}
            <div style={{ background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)', marginBottom: 6 }}>Un doute sur ce professionnel ?</div>
              <div style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 12 }}>
                Notre équipe vérifie toutes les certifications. Contactez-nous pour toute question.
              </div>
              <a
                href={`mailto:contact@desamianteurs.com?subject=Signalement%20profil%20${encodeURIComponent(p.company_name ?? '')}`}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'center', display: 'flex', fontSize: 12 }}
              >
                Signaler un problème
              </a>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

/* ── Shared styles ── */
const h2: CSSProperties = { fontSize: 16, fontWeight: 700, marginBottom: 16 }

/* ── Sub-components ── */
function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {children}
    </div>
  )
}

function Stars({ n, color, dimmed }: { n: number; color: string; dimmed?: boolean }) {
  return (
    <>
      <span style={{ color }}>{Array.from({ length: n }, (_, i) => <span key={i}>★</span>)}</span>
      {dimmed && <span style={{ color, opacity: 0.2 }}>{Array.from({ length: 5 - n }, (_, i) => <span key={i}>★</span>)}</span>}
    </>
  )
}

function DocRow({ label, sub, verified }: { label: string; sub?: string; verified: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
      background: verified ? '#F0FDF4' : '#FAFAFA',
      borderRadius: 8,
      border: `1px solid ${verified ? '#BBF7D0' : 'var(--gray-200)'}`,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={verified ? '#16A34A' : '#9CA3AF'} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: verified ? '#15803D' : 'var(--gray-600)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ color: 'var(--gray-400)', flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ color: 'var(--gray-500)', marginTop: 2, fontSize: 12 }}>{value}</div>
      </div>
    </div>
  )
}

/* ── Inline SVG icons ── */
function IconPin()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function IconClock() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function IconUsers() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function IconCal()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function IconCheck() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> }
function IconBrief() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> }
