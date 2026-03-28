import Link from 'next/link'
import { Ticket, Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-surface-900">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-brand-500/6 rounded-full blur-[120px]" />
      </div>

      <div className="text-center max-w-md animate-in">
        {/* Animated 404 */}
        <div className="relative mb-8 inline-block">
          <span className="text-[120px] md:text-[160px] font-display font-bold text-brand-500/10 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center animate-float shadow-glow">
              <Ticket size={40} className="text-brand-500" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-text-muted text-lg mb-10 leading-relaxed">
          Looks like this event got cancelled! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary shadow-glow">
            <Home size={16} />
            Go Home
          </Link>
          <Link href="/events" className="btn-secondary">
            <Search size={16} />
            Browse Events
          </Link>
        </div>
      </div>
    </main>
  )
}
