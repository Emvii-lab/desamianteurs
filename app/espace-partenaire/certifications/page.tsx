import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { TYPE_LABEL } from '@/lib/constants'

export const metadata = { title: 'Mes certifications | Désamianteurs.fr' }

export default async function CertificationsPartenairePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: partner } = await supabase
    .from('partners')
    .select('id, partner_type, is_verified')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!partner) redirect('/espace-client')

  const [domainsRes, refDomainsRes] = await Promise.all([
    supabase
      .from('partner_domains')
      .select('domain_id, ref_domains(id, code, label, category, sort_order)')
      .eq('partner_id', partner.id),
    supabase
      .from('ref_domains')
      .select('id, code, label, category, sort_order')
      .eq('partner_type', partner.partner_type)
      .order('category')
      .order('sort_order'),
  ])

  const myDomainIds = new Set((domainsRes.data ?? []).map(d => d.domain_id))
  const allDomains  = refDomainsRes.data ?? []
  const certifs     = allDomains.filter(d => d.category === 'certification')
  const domains     = allDomains.filter(d => d.category === 'domain')

  const typeLabel = TYPE_LABEL[partner.partner_type] ?? partner.partner_type

  return (
    <div className="dashboard-content">
      <div className="dash-header">
        <h1>Mes certifications</h1>
        <p>Certifications et domaines d'intervention associés à votre profil <strong>{typeLabel}</strong>.</p>
      </div>

      {/* Info */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p style={{ fontSize: 13, color: '#1E40AF', margin: 0, lineHeight: 1.6 }}>
          Ces certifications ont été déclarées lors de votre inscription et vérifiées par notre équipe.
          Pour modifier vos certifications, <a href="mailto:contact@desamianteurs.fr?subject=Modification certifications" style={{ color: 'var(--red)', fontWeight: 600 }}>contactez le support</a>.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Certifications */}
        {certifs.length > 0 && (
          <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--gray-100)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Certifications professionnelles</h2>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {certifs.map(d => {
                const active = myDomainIds.has(d.id)
                return (
                  <div key={d.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    borderRadius: 8,
                    background: active ? '#F0FDF4' : '#FAFAFA',
                    border: `1px solid ${active ? '#BBF7D0' : 'var(--gray-200)'}`,
                    opacity: active ? 1 : 0.55,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#16A34A' : '#9CA3AF'} strokeWidth="2.5" style={{ flexShrink: 0 }}>
                      {active
                        ? <polyline points="20 6 9 17 4 12"/>
                        : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                      }
                    </svg>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#15803D' : 'var(--gray-500)' }}>{d.label}</div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                      background: active ? '#D1FAE5' : '#F3F4F6',
                      color: active ? '#065F46' : 'var(--gray-400)',
                    }}>
                      {active ? 'Déclaré' : 'Non déclaré'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Domaines */}
        {domains.length > 0 && (
          <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--gray-100)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Domaines d'intervention</h2>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {domains.map(d => {
                const active = myDomainIds.has(d.id)
                return (
                  <span key={d.id} style={{
                    padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    background: active ? '#F0FDF4' : '#F3F4F6',
                    color: active ? '#15803D' : 'var(--gray-400)',
                    border: `1px solid ${active ? '#BBF7D0' : 'var(--gray-200)'}`,
                  }}>
                    {d.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA page certifications publiques */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: 0 }}>
            Consultez les certifications requises pour votre type de profil sur la page publique.
          </p>
          <Link href="/certifications" target="_blank" className="btn btn-outline btn-sm">
            Voir les certifications requises
          </Link>
        </div>

      </div>
    </div>
  )
}
