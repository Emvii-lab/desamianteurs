import { createServerSupabase } from '@/lib/supabase-server'
import ProfessionalsClient from './ProfessionalsClient'
import { AVATAR_COLORS, TYPE_LABEL } from '@/lib/constants'

export const metadata = {
  title: 'Trouvez un professionnel certifié | Désamianteurs.fr',
  description: 'Annuaire des professionnels certifiés du désamiantage et du diagnostic.',
}

function colorFor(id: string) {
  let h = 0; for (const c of id) h = id.charCodeAt(id.indexOf(c)) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

export default async function ProfessionalsPage({ searchParams }: { searchParams: { type?: string, location?: string } }) {
  const supabase = await createServerSupabase()
  const { type, location } = await searchParams
  
  // Fetch ALL active partners to allow dynamic filtering on client side
  const { data } = await supabase
    .from('partners')
    .select('id, company_name, city, zip_code, company_address, description, partner_type, average_rating, review_count, average_response_hours, is_verified, lat, lng')
    .eq('status', 'active')
    .order('company_name', { ascending: true })

  const allPros = (data ?? []).map(p => ({
    id: p.id,
    name: p.company_name ?? 'Professionnel',
    city: [p.zip_code, p.city].filter(Boolean).join(' '),
    address: p.company_address ?? '',
    initials: initials(p.company_name ?? ''),
    color: colorFor(p.id),
    desc: p.description ?? '',
    rating: p.average_rating ?? 0,
    reviews: p.review_count ?? 0,
    response: p.average_response_hours ? `${p.average_response_hours}h` : '—',
    verified: p.is_verified ?? false,
    type: p.partner_type ?? '',
    typeLabel: TYPE_LABEL[p.partner_type ?? ''] ?? p.partner_type ?? '',
    lat: p.lat ?? 46.2276, // Default to center of France if missing
    lng: p.lng ?? 2.2137,
  }))

  return <ProfessionalsClient initialPros={allPros} initialType={type} initialLocation={location} />
}
