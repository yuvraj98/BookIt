import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { BookingTicketView } from '@/components/bookings/BookingTicketView'

export const metadata: Metadata = {
  title: 'View Ticket',
  description: 'View your booking ticket and entry QR code on BookIt.',
}

type Props = {
  params: { id: string }
}

export default function BookingDetailPage({ params }: Props) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section">
          <BookingTicketView bookingId={params.id} />
        </div>
      </main>
    </>
  )
}
