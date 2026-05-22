import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function EspacePartenaireLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: partner } = await supabase
    .from('partners')
    .select('first_name, last_name, company_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!partner) redirect('/espace-client')

  const name = partner.first_name && partner.last_name
    ? `${partner.first_name} ${partner.last_name}`
    : partner.company_name || user.email?.split('@')[0] || 'Partenaire'
  const initials = partner.first_name && partner.last_name
    ? `${partner.first_name[0]}${partner.last_name[0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase()

  return (
    <div className="dashboard-layout">
      <DashboardSidebar role="partenaire" userId={user.id} userName={name} userInitials={initials} />
      <div className="dashboard-main">{children}</div>
    </div>
  )
}
