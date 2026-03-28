import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — BookIt',
  description: 'Learn how BookIt collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section max-w-3xl mx-auto prose prose-invert prose-headings:font-display prose-headings:text-white prose-p:text-text-muted prose-li:text-text-muted prose-a:text-brand-400 prose-strong:text-white">
          <h1 className="text-4xl font-display font-bold mb-8 text-white">Privacy Policy</h1>
          <p className="text-sm text-text-subtle italic mb-8">Last updated: March 2026</p>

          <h2>1. Information We Collect</h2>
          <ul>
            <li><strong>Account Data:</strong> Phone number, name, email (optional), and city.</li>
            <li><strong>Booking Data:</strong> Event preferences, booking history, and payment information.</li>
            <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, and interaction patterns.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To facilitate bookings and deliver digital tickets</li>
            <li>To send booking confirmations and event reminders</li>
            <li>To personalize event recommendations</li>
            <li>To prevent fraud and ensure platform security</li>
            <li>To improve our services based on usage analytics</li>
          </ul>

          <h2>3. Data Sharing</h2>
          <p>We do not sell your personal information. We share data only with:</p>
          <ul>
            <li>Event organisers (limited to booking-related information)</li>
            <li>Payment processors (for secure transaction handling)</li>
            <li>Law enforcement (when legally required)</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>We use industry-standard encryption (AES-256, TLS 1.3) to protect your data. Payment information is never stored on our servers.</p>

          <h2>5. Your Rights</h2>
          <p>You can request access to, correction of, or deletion of your personal data by contacting us at <strong>privacy@bookit.in</strong>.</p>

          <h2>6. Cookies</h2>
          <p>We use essential cookies for authentication and analytics cookies to improve user experience. You can manage cookie preferences in your browser settings.</p>

          <h2>7. Contact</h2>
          <p>For privacy concerns, contact our Data Protection Officer at <strong>privacy@bookit.in</strong>.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
