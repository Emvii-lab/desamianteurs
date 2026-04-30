'use client'

import { useEffect, useState } from 'react'
import DashboardSidebar from '@/components/DashboardSidebar'
import { createClient } from '@/lib/supabase'

export default function EspaceClientLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState('Mon compte')
  const [userInitials, setUserInitials] = useState('U')
  const [userId, setUserId] = useState<string | undefined>()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user
      if (!user) return
      setUserId(user.id)
      const prenom = user.user_metadata?.prenom ?? ''
      const nom    = user.user_metadata?.nom ?? ''
      const full   = user.user_metadata?.full_name ?? ''
      const name   = prenom && nom ? `${prenom} ${nom}` : full || user.email?.split('@')[0] || 'Mon compte'
      const initials = prenom && nom
        ? `${prenom[0]}${nom[0]}`.toUpperCase()
        : name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
      setUserName(name)
      setUserInitials(initials)
    })
  }, [])

  return (
    <div className="dashboard-layout">
      <DashboardSidebar role="client" userId={userId} userName={userName} userInitials={userInitials} />
      <div className="dashboard-main">{children}</div>
    </div>
  )
}
