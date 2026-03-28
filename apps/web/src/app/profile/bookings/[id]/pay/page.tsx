import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { PaymentSimulator } from '@/components/bookings/PaymentSimulator'

export const metadata: Metadata = {
  title: 'Complete Payment',
  description: 'Complete your ticket payment on BookIt.',
}

type Props = {
  params: { id: string }
}

export default function PaymentPage({ params }: Props) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section">
          <PaymentSimulator bookingId={params.id} />
        </div>
      </main>
    </>
  )
}
