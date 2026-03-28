import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProfileContent } from '@/components/profile/ProfileContent'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your BookIt profile, view loyalty coins, and access your bookings.',
}

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section">
          <ProfileContent />
        </div>
      </main>
      <Footer />
    </>
  )
}
