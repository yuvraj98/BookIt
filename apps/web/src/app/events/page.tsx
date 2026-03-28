import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ExploreEvents } from '@/components/events/ExploreEvents'

export const metadata: Metadata = {
  title: 'Explore Events',
  description: 'Find the best comedy shows, music festivals, and sports events in your city.',
}

export default function EventsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section">
          {/* We'll pass search params to handle initial state, but handle filtering on the client */}
          <ExploreEvents initialCategory={searchParams.category as string} />
        </div>
      </main>
      <Footer />
    </>
  )
}
