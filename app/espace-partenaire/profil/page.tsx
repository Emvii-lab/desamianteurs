import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { TYPE_LABEL, AVATAR_COLORS } from '@/lib/constants'
import { colorFor, getInitials } from '@/lib/utils'
import ProfilPartenaireClient from './ProfilPartenaireClient'

export const metadata = { title: 'Mon profil partenaire | Désamianteurs.com' }

const PLAN_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  freemium:    { label: 'Freemium',    color: '#6B7280', bg: '#F3F4F6' },
  essentiel:   { label: 'Essentiel',   color: '#6B7280', bg: '#F3F4F6' },
  performance: { label: 'Performance', color: '#1D4ED8', bg: '#DBEAFE' },
  premium:     { label: 'Premium',     color: '#DC2626', bg: '#FEF2F2' },
  platinium:   { label: 'Platinium',   color: '#B45309', bg: '#FEF9C3' },
}

export default async function ProfilPartenairePage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: partner } = await supabase
    .from('partners')
    .select(`
      id, first_name, last_name, email, phone,
      company_name, siret, company_activity, company_address, city, zip_code,
      description, partner_type, subscription, status, is_verified,
      average_rating, review_count, missions_completed, certified_workers_count,
      accept_individuals, avatar_url, logo_url
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!partner) redirect('/espace-client')

  const plan    = PLAN_LABEL[partner.subscription ?? 'freemium'] ?? PLAN_LABEL.freemium
  const color   = colorFor(partner.id, AVATAR_COLORS)
  const initials = getInitials(partner.company_name ?? `${partner.first_name} ${partner.last_name}`)

  return (
    <div className="dashboard-content">
      <ProfilPartenaireClient
        partner={partner as any}
        plan={plan}
        avatarColor={color}
        initials={initials}
        partnerId={partner.id}
        typeLabel={TYPE_LABEL[partner.partner_type] ?? partner.partner_type}
      />
    </div>
  )
}
