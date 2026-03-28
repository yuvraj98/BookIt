'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const CATEGORIES = [
  { emoji: '🎭', label: 'Comedy',     href: '/events?category=comedy',    count: 48,  color: 'hover:border-violet-500/40 hover:bg-violet-500/5' },
  { emoji: '🎵', label: 'Music',      href: '/events?category=music',     count: 62,  color: 'hover:border-amber-500/40 hover:bg-amber-500/5' },
  { emoji: '🏋️', label: 'Fitness',    href: '/events?category=fitness',   count: 34,  color: 'hover:border-emerald-500/40 hover:bg-emerald-500/5' },
  { emoji: '🎨', label: 'Art',        href: '/events?category=art',       count: 27,  color: 'hover:border-pink-500/40 hover:bg-pink-500/5' },
  { emoji: '🍕', label: 'Food',       href: '/events?category=food',      count: 31,  color: 'hover:border-orange-500/40 hover:bg-orange-500/5' },
  { emoji: '🏏', label: 'Sports',     href: '/events?category=sports',    count: 19,  color: 'hover:border-cyan-500/40 hover:bg-cyan-500/5' },
  { emoji: '💻', label: 'Tech',       href: '/events?category=tech',      count: 22,  color: 'hover:border-blue-500/40 hover:bg-blue-500/5' },
  { emoji: '🎪', label: 'Festival',   href: '/events?category=festival',  count: 14,  color: 'hover:border-brand-500/40 hover:bg-brand-500/5' },
  { emoji: '🎬', label: 'Cinema',     href: '/events?category=cinema',    count: 55,  color: 'hover:border-rose-500/40 hover:bg-rose-500/5' },
  { emoji: '📚', label: 'Workshop',   href: '/events?category=workshop',  count: 41,  color: 'hover:border-teal-500/40 hover:bg-teal-500/5' },
  { emoji: '🎭', label: 'Theatre',    href: '/events?category=theatre',   count: 16,  color: 'hover:border-purple-500/40 hover:bg-purple-500/5' },
  { emoji: '✨', label: 'Others',     href: '/events',                    count: 88,  color: 'hover:border-white/20 hover:bg-white/5' },
]

export function CategoriesSection() {
  return (
    <section className="section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
          Browse by Category
        </h2>
        <p className="text-[#a0a0a0]">18 categories, 360+ subcategories — something for everyone</p>
      </motion.div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <Link
              href={cat.href}
              className={`card p-4 flex flex-col items-center justify-center gap-2 text-center
                          cursor-pointer border border-white/[0.08] transition-all duration-300 ${cat.color}
                          hover:shadow-card-hover hover:-translate-y-0.5 group`}
            >
              <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">
                {cat.emoji}
              </span>
              <span className="text-xs sm:text-sm font-medium text-white leading-tight">
                {cat.label}
              </span>
              <span className="text-[10px] text-[#606060]">{cat.count} events</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
