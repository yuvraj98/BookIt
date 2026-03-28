'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import {
  Ticket,
  TrendingUp,
  Users,
  Shield,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  IndianRupee,
  Globe,
} from 'lucide-react'

const FEATURES = [
  {
    icon: <Ticket size={28} className="text-brand-400" />,
    title: 'Easy Event Listing',
    description: 'Create events with dynamic seat maps, tiered pricing, and custom categories in minutes.',
  },
  {
    icon: <BarChart3 size={28} className="text-blue-400" />,
    title: 'Real-time Analytics',
    description: 'Track ticket sales, revenue, and attendee demographics from your organiser dashboard.',
  },
  {
    icon: <IndianRupee size={28} className="text-emerald-400" />,
    title: 'Fast Payouts',
    description: 'Get paid directly to your bank account. Transparent commission, no hidden fees.',
  },
  {
    icon: <Shield size={28} className="text-purple-400" />,
    title: 'Verified Trust',
    description: 'Admin-verified organiser badges build audience trust and boost ticket sales.',
  },
  {
    icon: <Users size={28} className="text-amber-400" />,
    title: 'Audience Reach',
    description: 'Get discovered by thousands of event-goers in your city through our platform.',
  },
  {
    icon: <Globe size={28} className="text-cyan-400" />,
    title: 'Multi-City Support',
    description: 'List events across Pune, Mumbai, Bengaluru, Hyderabad, Delhi and more.',
  },
]

const STEPS = [
  { number: '01', title: 'Register', description: 'Create your organiser profile in under 2 minutes' },
  { number: '02', title: 'Get Verified', description: 'Our team reviews and verifies your account within 24 hours' },
  { number: '03', title: 'Create Events', description: 'Set up events with custom seating, pricing, and details' },
  { number: '04', title: 'Earn', description: 'Sell tickets and receive payouts directly to your bank' },
]

export default function OrganiserLandingPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  // If already an organiser, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'organiser') {
      router.push('/organiser/dashboard')
    }
  }, [isLoading, isAuthenticated, user, router])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-900">
        {/* ─── Hero ─────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-brand-500/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/6 rounded-full blur-[100px]" />
          </div>

          <div className="section text-center max-w-4xl mx-auto py-0">
            <span className="badge-brand inline-flex items-center gap-1.5 mb-6 shadow-glow text-sm px-4 py-1.5">
              <Sparkles size={14} />
              Join 500+ Organisers on BookIt
            </span>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-[1.1]">
              Sell Tickets.{' '}
              <span className="text-gradient">Fill Venues.</span>
              <br />
              <span className="text-text-muted">Grow Your Events.</span>
            </h1>

            <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              List your events on India's fastest-growing ticketing platform. 
              Reach thousands of engaged event-goers with powerful tools built for modern organisers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href={isAuthenticated ? "/organiser/register" : "/login"} 
                className="btn-primary text-lg px-8 py-4 shadow-glow group"
              >
                Start Listing Events
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                No upfront costs
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                24hr verification
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Transparent 8% commission
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features ────────────────────────────────── */}
        <section id="features" className="section">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              Everything You Need to{' '}
              <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-text-muted text-lg max-w-xl mx-auto">
              From listing to payout — we handle the tech so you can focus on creating amazing events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="card p-8 group hover:scale-[1.02] transition-transform duration-300">
                <div className="w-14 h-14 rounded-2xl bg-surface-700/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ────────────────────────────── */}
        <section className="section bg-surface-800/20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              How It{' '}
              <span className="text-gradient">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-[2px] bg-gradient-to-r from-white/10 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4 text-brand-400 font-display text-xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-lg font-display font-bold mb-2">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ─────────────────────────────────────── */}
        <section className="section text-center">
          <div className="card p-12 md:p-16 relative overflow-hidden max-w-3xl mx-auto">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to Grow Your Events?
              </h2>
              <p className="text-text-muted text-lg mb-8 max-w-lg mx-auto">
                Join hundreds of organisers already selling on BookIt. Start in under 2 minutes.
              </p>
              <Link 
                href={isAuthenticated ? "/organiser/register" : "/login"} 
                className="btn-primary text-lg px-10 py-4 shadow-glow group"
              >
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
