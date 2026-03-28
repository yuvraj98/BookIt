'use client'

import { motion } from 'framer-motion'
import { Search, CreditCard, MessageCircle, QrCode } from 'lucide-react'

const STEPS = [
  {
    icon: Search,
    step: '01',
    title: 'Discover Events',
    desc: 'Browse 18 categories of events in your city. Filter by date, price, and type.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: CreditCard,
    step: '02',
    title: 'Book in Seconds',
    desc: 'Select your seats and pay instantly via UPI, credit/debit card, or net banking.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10 border-brand-500/20',
  },
  {
    icon: MessageCircle,
    step: '03',
    title: 'Get WhatsApp Ticket',
    desc: 'Receive your QR ticket directly on WhatsApp. No app download required.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: QrCode,
    step: '04',
    title: 'Scan & Enter',
    desc: 'Show your QR at the venue gate. Scanned in under 2 seconds. Enjoy the event!',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
]

export function HowItWorks() {
  return (
    <section className="section">
      {/* connector line */}
      <div className="relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">How BookIt Works</h2>
          <p className="text-[#a0a0a0] max-w-lg mx-auto">
            From discovery to entry — the entire experience in under 90 seconds.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-violet-500/30 via-brand-500/30 to-amber-500/30" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`w-20 h-20 rounded-2xl border ${step.bg} flex items-center justify-center mb-5 relative z-10`}>
                <step.icon className={`w-8 h-8 ${step.color}`} />
              </div>
              <span className={`text-xs font-bold ${step.color} mb-1 tracking-widest`}>
                STEP {step.step}
              </span>
              <h3 className="font-semibold text-white text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-[#606060] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
