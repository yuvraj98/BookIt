import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EventDetail } from '@/components/events/EventDetail'
import { api } from '@/lib/api'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // In a real app we might fetch the actual data here for SEO
    return {
      title: `Event Details`,
      description: 'Book your tickets on BookIt.',
    }
  } catch {
    return { title: 'Event | BookIt' }
  }
}

export default function EventPage({ params }: Props) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <EventDetail eventId={params.id} />
      </main>
      <Footer />
    </>
  )
}
