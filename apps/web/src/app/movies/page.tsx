import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MoviesContent } from '@/components/movies/MoviesContent'

export const metadata: Metadata = {
  title: 'Movies — Book Tickets',
  description: 'Browse now showing and upcoming movies. Book cinema tickets instantly for theatres in Pune and your city.',
}

export default function MoviesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-surface-900">
        <MoviesContent />
      </main>
      <Footer />
    </>
  )
}
