import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MoviePaymentPage } from '@/components/movies/MoviePaymentPage'

export const metadata: Metadata = {
  title: 'Complete Payment | BookIt',
  description: 'Confirm and complete your movie ticket booking.',
}

export default function MovieBookingConfirmPage({ params }: { params: { bookingId: string } }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-surface-900">
        <MoviePaymentPage bookingId={params.bookingId} />
      </main>
      <Footer />
    </>
  )
}
