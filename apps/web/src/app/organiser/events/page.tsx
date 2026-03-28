import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { OrganiserEventsContent } from '@/components/organiser/OrganiserEventsContent'

export const metadata: Metadata = {
  title: 'My Events — Organiser',
  description: 'View and manage all your events on BookIt.',
}

export default function OrganiserEventsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-20 bg-surface-900">
        <div className="section">
          <OrganiserEventsContent />
        </div>
      </main>
      <Footer />
    </>
  )
}
