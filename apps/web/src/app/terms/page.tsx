import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service — BookIt',
  description: 'Read the BookIt terms of service governing your use of our platform.',
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section max-w-3xl mx-auto prose prose-invert prose-headings:font-display prose-headings:text-white prose-p:text-text-muted prose-li:text-text-muted prose-a:text-brand-400 prose-strong:text-white">
          <h1 className="text-4xl font-display font-bold mb-8 text-white">Terms of Service</h1>
          <p className="text-sm text-text-subtle italic mb-8">Last updated: March 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using BookIt (&quot;Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>

          <h2>2. User Accounts</h2>
          <p>You must provide a valid mobile number to create an account. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account.</p>

          <h2>3. Booking & Payments</h2>
          <ul>
            <li>All ticket bookings are subject to availability.</li>
            <li>Prices displayed include applicable convenience fees.</li>
            <li>Payments are processed securely through our payment partners.</li>
            <li>Confirmed bookings generate a digital QR ticket for event entry.</li>
          </ul>

          <h2>4. Cancellations & Refunds</h2>
          <p>Cancellation and refund policies vary by event. Please refer to the specific event page and our <a href="/refunds">Refund Policy</a> for details.</p>

          <h2>5. Organiser Responsibilities</h2>
          <p>Organisers are responsible for the accuracy of event information, venue safety, and fulfilling the promised event experience. BookIt acts as a ticketing intermediary and is not liable for event cancellations by organisers.</p>

          <h2>6. Prohibited Conduct</h2>
          <ul>
            <li>Reselling tickets at inflated prices (scalping)</li>
            <li>Using automated tools to purchase tickets in bulk</li>
            <li>Providing false information or impersonating others</li>
            <li>Attempting to circumvent platform security</li>
          </ul>

          <h2>7. Intellectual Property</h2>
          <p>All content on BookIt, including logos, designs, and software, is the property of BookIt Platform Pvt. Ltd. and protected under applicable intellectual property laws.</p>

          <h2>8. Limitation of Liability</h2>
          <p>BookIt shall not be liable for any indirect, incidental, or consequential damages arising from platform use. Our total liability is limited to the amount paid for the relevant booking.</p>

          <h2>9. Contact</h2>
          <p>For questions regarding these terms, email us at <strong>legal@bookit.in</strong>.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
