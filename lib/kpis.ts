import { createServerSupabase } from './supabase-server'
import { TYPE_LABEL, AVATAR_COLORS } from './constants'
import { getInitials, colorFor } from './utils'

export type KpiData = {
  partners: number
  demandes: number
  rating: number
  departments: number
}

export type ProCard = {
  id: string
  initials: string
  color: string
  name: string
  city: string
  type: string
  rating: number
  reviews: number
}

const KPI_DEFAULTS: KpiData = { partners: 15, demandes: 8400, rating: 4.3, departments: 101 }

const PRO_DEFAULTS: ProCard[] = [
  { id: '1', initials: 'AA', color: '#1E3A5F', name: 'Atlantique Analyses',  city: '44000 Nantes',     type: 'Préleveur / Labo', rating: 4.8, reviews: 97 },
  { id: '2', initials: 'AD', color: '#C0392B', name: 'Alsace Désamiantage',  city: '67000 Strasbourg', type: 'Désamianteur',     rating: 4.6, reviews: 0  },
  { id: '3', initials: 'AP', color: '#7D3C98', name: 'Amiante Pro IDF',      city: '75002 Paris',      type: 'Désamianteur',     rating: 4.7, reviews: 23 },
]

export async function fetchKpis(): Promise<KpiData> {
  try {
    const supabase = await createServerSupabase()

    // Une seule fonction SQL au lieu de 4 requêtes séparées
    const { data, error } = await supabase.rpc('get_public_kpis')

    if (!error && data?.[0]) {
      const row = data[0]
      return {
        partners:    Number(row.partner_count)  || KPI_DEFAULTS.partners,
        demandes:    Number(row.demand_count)   || KPI_DEFAULTS.demandes,
        rating:      Number(row.avg_rating)     || KPI_DEFAULTS.rating,
        departments: Number(row.dept_count)     || KPI_DEFAULTS.departments,
      }
    }

    // Fallback si la fonction n'existe pas encore
    const [partnersRes, demandesRes, reviewsRes] = await Promise.all([
      supabase.from('partners').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('quotes').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('rating'),
    ])

    const avgRating = reviewsRes.data?.length
      ? reviewsRes.data.reduce((s, r) => s + (r.rating ?? 0), 0) / reviewsRes.data.length
      : null

    return {
      partners:    partnersRes.count  ?? KPI_DEFAULTS.partners,
      demandes:    demandesRes.count  ?? KPI_DEFAULTS.demandes,
      rating:      avgRating != null ? Math.round(avgRating * 10) / 10 : KPI_DEFAULTS.rating,
      departments: KPI_DEFAULTS.departments,
    }
  } catch {
    return KPI_DEFAULTS
  }
}

export async function fetchFeaturedPros(): Promise<ProCard[]> {
  try {
    const supabase = await createServerSupabase()

    const { data } = await supabase
      .from('partners')
      .select('id, company_name, city, partner_type, average_rating, review_count')
      .eq('status', 'active')
      .order('average_rating', { ascending: false })
      .limit(3)

    if (!data?.length) return PRO_DEFAULTS

    return data.map((p: any) => ({
      id:       String(p.id),
      name:     p.company_name ?? 'Professionnel',
      city:     p.city ?? '',
      type:     TYPE_LABEL[p.partner_type] ?? p.partner_type ?? '',
      rating:   typeof p.average_rating === 'number' ? Math.round(p.average_rating * 10) / 10 : 0,
      reviews:  p.review_count ?? 0,
      initials: getInitials(p.company_name ?? ''),
      color:    colorFor(String(p.id), AVATAR_COLORS),
    }))
  } catch {
    return PRO_DEFAULTS
  }
}
