import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Refund Policy — BookIt',
  description: 'BookIt refund and cancellation policy for event bookings.',
}

export default function RefundsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section max-w-3xl mx-auto prose prose-invert prose-headings:font-display prose-headings:text-white prose-p:text-text-muted prose-li:text-text-muted prose-a:text-brand-400 prose-strong:text-white">
          <h1 className="text-4xl font-display font-bold mb-8 text-white">Refund Policy</h1>
          <p className="text-sm text-text-subtle italic mb-8">Last updated: March 2026</p>

          <h2>1. Cancellation by Customer</h2>
          <ul>
            <li><strong>Before event date:</strong> Full refund minus convenience fees if cancelled 48+ hours before the event.</li>
            <li><strong>24–48 hours before:</strong> 50% refund of ticket price.</li>
            <li><strong>Less than 24 hours:</strong> No refund available.</li>
          </ul>

          <h2>2. Cancellation by Organiser</h2>
          <p>If an event is cancelled by the organiser, you will receive a <strong>full refund</strong> including convenience fees within 5–7 business days.</p>

          <h2>3. Event Rescheduling</h2>
          <p>If an event is rescheduled, your booking remains valid for the new date. If you cannot attend, you may request a refund up to 24 hours before the new date.</p>

          <h2>4. Refund Processing</h2>
          <ul>
            <li>Refunds are processed to the original payment method.</li>
            <li>UPI refunds: 1–3 business days</li>
            <li>Card refunds: 5–7 business days</li>
            <li>Net Banking: 5–10 business days</li>
          </ul>

          <h2>5. Non-Refundable Items</h2>
          <ul>
            <li>Convenience fees (except organiser-cancelled events)</li>
            <li>Loyalty coins already redeemed</li>
            <li>Free event registrations</li>
          </ul>

          <h2>6. Disputes</h2>
          <p>For refund disputes, contact <strong>support@bookit.in</strong> with your booking ID within 30 days of the event date.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
