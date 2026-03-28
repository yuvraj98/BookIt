import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'BookIt for Enterprise',
  description: 'Custom event ticketing solutions for large venues, festivals, and enterprise event management companies.',
}

const FEATURES = [
  'Custom commission rates & volume discounts',
  'Dedicated account manager',
  'White-label ticketing widget',
  'API access for custom integrations',
  'Advanced analytics & reporting',
  'Priority support with SLA',
  'Custom branding & event pages',
  'Multi-venue management',
]

export default function EnterprisePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section max-w-4xl mx-auto text-center">
          <span className="badge-brand inline-flex items-center gap-1.5 mb-6 text-sm px-4 py-1.5">
            <Sparkles size={14} /> Enterprise Solutions
          </span>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-[1.1]">
            Ticketing at <span className="text-gradient">Scale</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed mb-12">
            Purpose-built for large venues, festival organisers, and enterprise event management. 
            Get custom pricing, dedicated support, and powerful integrations.
          </p>

          <div className="card p-10 text-left max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-display font-bold mb-6 text-center">What You Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-text-muted">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <Link href={"/contact" as any} className="btn-primary text-lg px-8 py-4 shadow-glow">
            Contact Sales <ArrowRight size={18} />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
