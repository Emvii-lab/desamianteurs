import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function EspaceAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('admins')
    .select('first_name, last_name')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/espace-client')

  const userName = `${profile.first_name} ${profile.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Admin'
  const initials = `${profile.first_name[0]}${profile.last_name?.[0] || ''}`.toUpperCase()

  return (
    <div className="dashboard-layout">
      <DashboardSidebar role="admin" userId={user.id} userName={userName} userInitials={initials} />
      <div className="dashboard-main">{children}</div>
    </div>
  )
}
