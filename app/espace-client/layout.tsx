import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function EspaceClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('clients')
    .select('first_name, last_name')
    .eq('user_id', user.id)
    .maybeSingle()

  const prenom = profile?.first_name || user.user_metadata?.prenom || ''
  const nom    = profile?.last_name  || user.user_metadata?.nom    || ''
  const full   = user.user_metadata?.full_name || ''
  const name   = prenom && nom ? `${prenom} ${nom}` : full || user.email?.split('@')[0] || 'Mon compte'
  const initials = prenom && nom
    ? `${prenom[0]}${nom[0]}`.toUpperCase()
    : name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="dashboard-layout">
      <DashboardSidebar role="client" userId={user.id} userName={name} userInitials={initials} />
      <div className="dashboard-main">{children}</div>
    </div>
  )
}
