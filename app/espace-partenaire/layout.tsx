import DashboardSidebar from '@/components/DashboardSidebar'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function EspacePartenaireLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const prenom = user?.user_metadata?.prenom ?? ''
  const nom    = user?.user_metadata?.nom ?? ''
  const name   = prenom && nom ? `${prenom} ${nom}` : user?.user_metadata?.company_name || user?.email?.split('@')[0] || 'Partenaire'
  const initials = prenom && nom
    ? `${prenom[0]}${nom[0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase()

  return (
    <div className="dashboard-layout">
      <DashboardSidebar 
        role="partenaire" 
        userId={user?.id}
        userName={name} 
        userInitials={initials} 
      />
      <div className="dashboard-main">{children}</div>
    </div>
  )
}
