'use client'

import { motion } from 'framer-motion'
import { Users, Ticket, Building2, Star } from 'lucide-react'

const STATS = [
  { icon: Ticket,    value: '50,000+',  label: 'Tickets Sold',     color: 'text-brand-400' },
  { icon: Building2, value: '200+',     label: 'Events Listed',    color: 'text-violet-400' },
  { icon: Users,     value: '10,000+',  label: 'Happy Customers',  color: 'text-amber-400' },
  { icon: Star,      value: '4.8 ★',    label: 'Average Rating',   color: 'text-emerald-400' },
]

export function StatsSection() {
  return (
    <section className="relative -mt-8 z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              className="card p-6 text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`} />
              <p className="text-2xl font-bold text-white font-display mb-1">{stat.value}</p>
              <p className="text-sm text-[#606060]">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
