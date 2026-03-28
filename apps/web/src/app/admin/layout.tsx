import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-950 flex selection:bg-brand-500/30">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 relative w-full overflow-x-hidden min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-800/10 to-transparent">
        {/* Abstract background blur for depth in admin dashboard */}
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        {children}
      </main>
    </div>
  )
}
