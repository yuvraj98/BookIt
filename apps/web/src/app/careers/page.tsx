import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { ArrowRight, Zap, Heart, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Careers — BookIt',
  description: 'Join the BookIt team and help shape the future of live events in India.',
}

const OPENINGS = [
  { title: 'Senior Frontend Engineer', team: 'Engineering', location: 'Pune / Remote', type: 'Full-time' },
  { title: 'Backend Engineer (Node.js)', team: 'Engineering', location: 'Pune', type: 'Full-time' },
  { title: 'Product Designer', team: 'Design', location: 'Remote', type: 'Full-time' },
  { title: 'Growth Marketing Manager', team: 'Marketing', location: 'Mumbai', type: 'Full-time' },
  { title: 'City Lead — Bengaluru', team: 'Operations', location: 'Bengaluru', type: 'Full-time' },
]

const PERKS = [
  { icon: <Zap size={20} className="text-amber-400" />, title: 'Fast-paced startup', description: 'Ship features weekly. Big impact from day one.' },
  { icon: <Heart size={20} className="text-rose-400" />, title: 'Free event access', description: 'Attend any event on BookIt, on us.' },
  { icon: <Globe size={20} className="text-blue-400" />, title: 'Remote-friendly', description: 'Work from anywhere in India. We trust you.' },
]

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-display font-bold mb-4">
              Build the Future of <span className="text-gradient">Live Events</span>
            </h1>
            <p className="text-text-muted text-lg max-w-xl mx-auto">
              We're a small, ambitious team building India's go-to events platform. Come build something extraordinary.
            </p>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {PERKS.map((perk, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-surface-700/50 flex items-center justify-center mx-auto mb-3">
                  {perk.icon}
                </div>
                <h3 className="font-display font-bold mb-1">{perk.title}</h3>
                <p className="text-sm text-text-muted">{perk.description}</p>
              </div>
            ))}
          </div>

          {/* Openings */}
          <h2 className="text-2xl font-display font-bold mb-6">Open Positions</h2>
          <div className="space-y-3 mb-12">
            {OPENINGS.map((job, i) => (
              <div key={i} className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:scale-[1.01] transition-transform">
                <div>
                  <h3 className="font-bold text-white text-lg">{job.title}</h3>
                  <p className="text-sm text-text-muted">{job.team} · {job.location} · {job.type}</p>
                </div>
                <Link href={"/contact" as any} className="btn-secondary text-sm shrink-0">
                  Apply <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-text-muted mb-4">Don't see your role? We're always looking for great people.</p>
            <Link href="mailto:careers@bookit.in" className="btn-primary shadow-glow">
              Send Open Application <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
