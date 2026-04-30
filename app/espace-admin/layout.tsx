import DashboardSidebar from '@/components/DashboardSidebar'

export default function EspaceAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar role="admin" userName="Mélanie VOYMANT" userInitials="MV" />
      <div className="dashboard-main">{children}</div>
    </div>
  )
}
