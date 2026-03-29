import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MovieDetail } from '@/components/movies/MovieDetail'

export const metadata: Metadata = {
  title: 'Movie Detail | BookIt',
  description: 'View showtimes and book cinema tickets for this movie.',
}

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-surface-900">
        <MovieDetail movieId={params.id} />
      </main>
      <Footer />
    </>
  )
}
