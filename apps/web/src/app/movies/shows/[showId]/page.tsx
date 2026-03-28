import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ShowSeats } from '@/components/movies/ShowSeats'

export const metadata: Metadata = {
  title: 'Select Seats | BookIt',
  description: 'Choose your seats and book cinema tickets.',
}

export default function ShowSeatsPage({ params }: { params: { showId: string } }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-surface-900">
        <ShowSeats showId={params.showId} />
      </main>
      <Footer />
    </>
  )
}
