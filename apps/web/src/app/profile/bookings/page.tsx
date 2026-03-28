import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UserBookings } from '@/components/profile/UserBookings'

export const metadata: Metadata = {
  title: 'My Bookings',
  description: 'View and manage your tickets on BookIt.',
}

export default function BookingsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section max-w-4xl mx-auto">
          <UserBookings />
        </div>
      </main>
      <Footer />
    </>
  )
}
