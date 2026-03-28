import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { OrganiserDashboardContent } from '@/components/organiser/OrganiserDashboardContent'

export const metadata: Metadata = {
  title: 'Organiser Dashboard',
  description: 'Manage your events, view ticket sales, and track payouts on BookIt.',
}

export default function OrganiserDashboardPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-20 bg-surface-900">
        <OrganiserDashboardContent />
      </main>
    </>
  )
}
