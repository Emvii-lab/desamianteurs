import DashboardSidebar from '@/components/DashboardSidebar'

export default function EspacePartenaireLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar role="partenaire" userName="Durand Traitement" userInitials="DT" />
      <div className="dashboard-main">{children}</div>
    </div>
  )
}
