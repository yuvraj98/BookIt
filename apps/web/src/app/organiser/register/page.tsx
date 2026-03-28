import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { OrganiserRegisterForm } from '@/components/organiser/OrganiserRegisterForm'

export const metadata: Metadata = {
  title: 'Become an Organiser',
  description:
    'Register as an organiser on BookIt. List your events, sell tickets, and manage your audience — all from one dashboard.',
}

export default function OrganiserRegisterPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        {/* Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-surface-900" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-brand-500/6 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="section">
          <div className="max-w-2xl mx-auto">
            <OrganiserRegisterForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
