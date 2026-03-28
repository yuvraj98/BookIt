import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SavedEventsContent } from '@/components/profile/SavedEventsContent'

export const metadata: Metadata = {
  title: 'Saved Events',
  description: 'Your saved and wishlisted events on BookIt.',
}

export default function SavedEventsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section">
          <SavedEventsContent />
        </div>
      </main>
      <Footer />
    </>
  )
}
