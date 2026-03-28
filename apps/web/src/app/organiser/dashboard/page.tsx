import type { Metadata } from 'next'
import { OrganiserDashboardContent } from '@/components/organiser/OrganiserDashboardContent'
import { OrganiserSidebar } from '@/components/organiser/OrganiserSidebar'

export const metadata: Metadata = {
  title: 'Organiser Dashboard',
  description: 'Manage your events, view ticket sales, and track payouts on BookIt.',
}

export default function OrganiserDashboardPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex">
      <OrganiserSidebar />
      <main className="flex-1 lg:ml-64 relative w-full overflow-x-hidden min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-800/10 to-transparent">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="p-6 md:p-10">
          <OrganiserDashboardContent />
        </div>
      </main>
    </div>
  )
}
