'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap, BarChart3, Smartphone, Clock } from 'lucide-react'

const ORGANISER_PERKS = [
  { icon: Zap,        label: 'List in 10 minutes',      desc: 'Self-serve form — no BD calls, no waiting' },
  { icon: BarChart3,  label: 'Real-time dashboard',     desc: 'Live sales, check-ins & revenue analytics'  },
  { icon: Smartphone, label: 'QR Gate Scanner',         desc: 'Free iOS + Android gate management app'     },
  { icon: Clock,      label: 'T+2 Payouts',             desc: 'Money in your bank within 48 hours'         },
]

export function OrganizerCTA() {
  return (
    <section className="section">
      <motion.div
        className="relative rounded-3xl overflow-hidden border border-white/10 p-10 md:p-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-surface-800 to-violet-500/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/8 rounded-full blur-[80px]" />
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left */}
          <div className="flex-1 text-center lg:text-left">
            <span className="badge-brand text-xs mb-5 inline-flex">For Organisers</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Start selling tickets
              <br />
              <span className="text-gradient">in 10 minutes</span>
            </h2>
            <p className="text-[#a0a0a0] text-lg leading-relaxed mb-8 max-w-lg">
              No BD calls. No paperwork. Just create your event, set ticket prices,
              and go live instantly. Your first 6 months are completely free.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/organiser/register" className="btn-primary text-base px-8 py-3.5">
                Start for Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/organiser" className="btn-secondary text-base px-8 py-3.5">
                Learn More
              </Link>
            </div>
          </div>

          {/* Right — perk cards */}
          <div className="flex-1 grid grid-cols-2 gap-3 w-full max-w-sm lg:max-w-none">
            {ORGANISER_PERKS.map((perk, i) => (
              <motion.div
                key={perk.label}
                className="card p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <perk.icon className="w-6 h-6 text-brand-400 mb-3" />
                <p className="text-sm font-semibold text-white mb-1">{perk.label}</p>
                <p className="text-xs text-[#606060] leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
