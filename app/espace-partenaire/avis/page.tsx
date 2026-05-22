import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const metadata = { title: 'Mes avis | Désamianteurs.fr' }

function Stars({ n, max = 5 }: { n: number; max?: number }) {
  return (
    <span>
      <span style={{ color: '#F4B942' }}>{'★'.repeat(n)}</span>
      <span style={{ color: '#F4B942', opacity: 0.2 }}>{'★'.repeat(max - n)}</span>
    </span>
  )
}

export default async function AvisPartenairePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: partner } = await supabase
    .from('partners')
    .select('id, average_rating, review_count')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!partner) redirect('/espace-client')

  const { data: reviews } = await supabase
    .rpc('get_partner_reviews', { p_partner_id: partner.id, p_limit: 50 })

  const all = reviews ?? []
  const approved = all  // get_partner_reviews retourne déjà les approuvés

  // Distribution des notes
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: approved.filter((r: any) => Math.round(r.rating) === star).length,
  }))
  const total = approved.length

  return (
    <div className="dashboard-content">
      <div className="dash-header">
        <h1>Mes avis clients</h1>
        <p>Avis laissés par vos clients après prestation, modérés avant publication.</p>
      </div>

      {/* Stats globales */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 24 }}>

        {/* Note moyenne */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '24px 20px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--black)', lineHeight: 1 }}>
            {partner.average_rating > 0 ? Number(partner.average_rating).toFixed(1) : '—'}
          </div>
          <div style={{ margin: '8px 0 4px' }}>
            <Stars n={Math.round(partner.average_rating ?? 0)} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{partner.review_count} avis</div>
        </div>

        {/* Distribution */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
          {dist.map(({ star, count }) => (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--gray-500)', width: 16, textAlign: 'right' }}>{star}</span>
              <span style={{ color: '#F4B942', fontSize: 13 }}>★</span>
              <div style={{ flex: 1, height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#F4B942', borderRadius: 3, width: total > 0 ? `${(count / total) * 100}%` : '0%', transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--gray-400)', width: 20 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des avis */}
      <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--gray-100)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
            Avis publiés{total > 0 ? ` (${total})` : ''}
          </h2>
        </div>

        {total === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>★</div>
            Aucun avis pour l'instant. Vos clients pourront laisser un avis après prestation.
          </div>
        ) : (
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {approved.map((r: any) => {
              const stars = Math.round(r.rating ?? 0)
              return (
                <div key={r.id} style={{ border: '1px solid var(--gray-100)', borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)' }}>
                        {(r.author_name ?? 'C').charAt(0).toUpperCase()}
                      </div>
                      <strong style={{ fontSize: 14 }}>{r.author_name ?? 'Client'}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Stars n={stars} />
                      <strong style={{ fontSize: 13 }}>{r.rating}/5</strong>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                        {format(new Date(r.created_at), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.7, margin: 0 }}>
                      "{r.comment}"
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info modération */}
      <div style={{ marginTop: 16, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#92400E' }}>
        Les avis sont soumis à une modération avant publication. Un avis refusé n'apparaît pas sur votre profil public.
      </div>
    </div>
  )
}
