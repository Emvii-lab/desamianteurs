import { createServerSupabase } from './supabase-server'

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

const TYPE_LABELS: Record<string, string> = {
  asbestos_remover:  'Désamianteur',
  diagnostician:     'Diagnostiqueur',
  sampler_lab:       'Préleveur / Labo',
  project_manager:   'MOE / AMO',
  legal_expert:      'Expert juridique',
}

const AVATAR_COLORS = ['#1E3A5F', '#C0392B', '#7D3C98', '#2E86AB', '#27AE60', '#E67E22', '#2C3E50']

function colorFor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
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

    const { count: partnersCount } = await supabase
      .from('public_partners')
      .select('*', { count: 'exact', head: true })

    const { count: demandesCount } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })

    const { data: ratingData } = await supabase
      .from('reviews')
      .select('rating')

    const avgRating = ratingData?.length
      ? ratingData.reduce((s, r) => s + (r.rating ?? 0), 0) / ratingData.length
      : null

    const { data: deptData } = await supabase
      .from('public_partners')
      .select('postal_code')

    const depts = deptData
      ? new Set(deptData.map((p: any) => String(p.postal_code ?? '').slice(0, 2)).filter(Boolean)).size
      : null

    return {
      partners:    partnersCount ?? KPI_DEFAULTS.partners,
      demandes:    demandesCount ?? KPI_DEFAULTS.demandes,
      rating:      avgRating != null ? Math.round(avgRating * 10) / 10 : KPI_DEFAULTS.rating,
      departments: depts ?? KPI_DEFAULTS.departments,
    }
  } catch {
    return KPI_DEFAULTS
  }
}

export async function fetchFeaturedPros(): Promise<ProCard[]> {
  try {
    const supabase = await createServerSupabase()

    const { data } = await supabase
      .from('public_partners')
      .select('id, company_name, city, partner_type, average_rating, reviews_count')
      .order('created_at', { ascending: false })
      .limit(3)

    if (!data?.length) return PRO_DEFAULTS

    return data.map((p: any) => ({
      id:       String(p.id),
      name:     p.company_name ?? 'Professionnel',
      city:     p.city ?? '',
      type:     TYPE_LABELS[p.partner_type] ?? p.partner_type ?? '',
      rating:   typeof p.average_rating === 'number' ? Math.round(p.average_rating * 10) / 10 : 0,
      reviews:  p.reviews_count ?? 0,
      initials: initials(p.company_name ?? ''),
      color:    colorFor(String(p.id)),
    }))
  } catch {
    return PRO_DEFAULTS
  }
}
