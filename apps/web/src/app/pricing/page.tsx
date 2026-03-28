import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { CheckCircle2, IndianRupee, ArrowRight, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing — BookIt',
  description: 'Transparent pricing for organisers. No upfront costs, no hidden fees.',
}

const PLANS = [
  {
    name: 'Free Events',
    price: 'Free',
    description: 'For community meetups and free registrations',
    features: [
      'Unlimited free event listings',
      'Basic analytics dashboard',
      'QR-based entry management',
      'Email support',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Standard',
    price: '8%',
    priceNote: 'per ticket sold',
    description: 'For professional organisers and paid events',
    features: [
      'Unlimited paid event listings',
      'Dynamic seat map builder',
      'Real-time sales analytics',
      'Loyalty rewards integration',
      'Priority support',
      'Automated payouts',
      'Customizable event pages',
    ],
    cta: 'Get Started',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large venues and event management companies',
    features: [
      'Everything in Standard',
      'Reduced commission rates',
      'Dedicated account manager',
      'API access',
      'White-label options',
      'Custom integrations',
      'Volume discounts',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 bg-surface-900">
        <div className="section max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-brand inline-flex items-center gap-1.5 mb-6 text-sm px-4 py-1.5">
              <Sparkles size={14} /> Simple Pricing
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              No Upfront Costs. <span className="text-gradient">No Hidden Fees.</span>
            </h1>
            <p className="text-text-muted text-lg max-w-xl mx-auto">
              Only pay when you sell. Our commission covers payment processing, platform hosting, and support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {PLANS.map((plan, i) => (
              <div key={i} className={`card p-8 flex flex-col ${
                plan.highlight 
                  ? 'border-brand-500/30 bg-gradient-to-b from-brand-900/20 to-surface-800/20 relative overflow-hidden' 
                  : ''
              }`}>
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-brand-400" />
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-display font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    {plan.price === 'Free' || plan.price === 'Custom' ? (
                      <span className="text-4xl font-display font-bold text-white">{plan.price}</span>
                    ) : (
                      <>
                        <span className="text-4xl font-display font-bold text-brand-400">{plan.price}</span>
                        <span className="text-text-muted text-sm">{plan.priceNote}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-text-muted">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-text-muted">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link 
                  href={plan.price === 'Custom' ? '/contact' : '/organiser'}
                  className={plan.highlight ? 'btn-primary w-full justify-center shadow-glow' : 'btn-secondary w-full justify-center'}
                >
                  {plan.cta} <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>

          <div className="card p-8 text-center bg-surface-800/30">
            <h3 className="text-lg font-display font-bold mb-2">What's included in the 8% commission?</h3>
            <p className="text-text-muted text-sm max-w-2xl mx-auto">
              Payment gateway charges (2.9%), platform hosting & CDN, customer support, fraud protection, 
              analytics dashboard, marketing tools, and automated payouts — all bundled into one transparent rate.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
