import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import {
  Ticket,
  Users,
  Globe,
  Zap,
  Shield,
  Heart,
  Target,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About BookIt',
  description: 'Learn about BookIt — India\'s fastest-growing local events ticketing platform.',
}

const STATS = [
  { value: '500+', label: 'Organisers' },
  { value: '10K+', label: 'Events Hosted' },
  { value: '2M+', label: 'Tickets Sold' },
  { value: '15+', label: 'Cities' },
]

const VALUES = [
  { icon: <Zap size={24} className="text-amber-400" />, title: 'Speed', description: 'Book tickets in under 30 seconds with our streamlined checkout flow.' },
  { icon: <Shield size={24} className="text-emerald-400" />, title: 'Trust', description: 'Every organiser is verified. Every payment is secure. Every ticket is guaranteed.' },
  { icon: <Heart size={24} className="text-rose-400" />, title: 'Community', description: 'We connect people with experiences that matter — from comedy nights to wellness retreats.' },
  { icon: <Target size={24} className="text-blue-400" />, title: 'Local First', description: 'Built for Indian cities. We understand the pulse of Pune, Mumbai, Bengaluru, and beyond.' },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-20">
            <span className="badge-brand inline-flex items-center gap-1.5 mb-6 text-sm px-4 py-1.5">
              <Globe size={14} /> Our Story
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-[1.1]">
              Connecting People to <span className="text-gradient">Unforgettable Moments</span>
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
              BookIt is India's local events ticketing platform. We make it effortless to discover, 
              book, and attend live events — from comedy shows to music festivals to tech meetups.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {STATS.map((stat, i) => (
              <div key={i} className="card p-6 text-center">
                <p className="text-3xl font-display font-bold text-brand-400 mb-1">{stat.value}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              What Drives <span className="text-gradient">Us</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VALUES.map((v, i) => (
                <div key={i} className="card p-8 flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-surface-700/50 flex items-center justify-center shrink-0">
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold mb-1">{v.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-display font-bold mb-4">Ready to experience it?</h2>
            <div className="flex gap-4 justify-center">
              <Link href="/events" className="btn-primary">
                Browse Events <ArrowRight size={16} />
              </Link>
              <Link href="/organiser" className="btn-secondary">
                List Your Event
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
