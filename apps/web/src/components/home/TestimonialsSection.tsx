'use client'

import { Star, Quote } from 'lucide-react'
import { useState, useEffect } from 'react'

const TESTIMONIALS = [
  {
    name: 'Aditi Sharma',
    role: 'Comedy Regular',
    city: 'Pune',
    text: 'BookIt made finding comedy shows so easy! I go to at least two shows a month now. The seat selection is amazing.',
    stars: 5,
    gradient: 'from-brand-500/20 to-purple-600/20',
  },
  {
    name: 'Rohan Deshmukh',
    role: 'Event Organiser',
    city: 'Mumbai',
    text: 'As an organiser, the dashboard is incredibly powerful. I can track sales in real-time and the payout system is transparent.',
    stars: 5,
    gradient: 'from-blue-500/20 to-cyan-600/20',
  },
  {
    name: 'Priya Menon',
    role: 'Music Enthusiast',
    city: 'Bengaluru',
    text: 'I discovered my favorite indie bands through BookIt. The QR tickets are super convenient - no more paper hassle!',
    stars: 5,
    gradient: 'from-emerald-500/20 to-teal-600/20',
  },
  {
    name: 'Vikram Joshi',
    role: 'Workshop Host',
    city: 'Hyderabad',
    text: 'Listed my photography workshop and sold out in 3 days. The approval process was smooth and the team is very responsive.',
    stars: 4,
    gradient: 'from-amber-500/20 to-orange-600/20',
  },
]

export function TestimonialsSection() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-24 bg-surface-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="section text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Loved by <span className="text-gradient">Thousands</span>
        </h2>
        <p className="text-text-muted mb-16 max-w-lg mx-auto">
          See what our community says about their BookIt experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className={`card p-6 text-left transition-all duration-500 cursor-pointer ${
                i === active
                  ? 'border-brand-500/30 scale-[1.02] shadow-glow bg-gradient-to-br ' + t.gradient
                  : 'hover:scale-[1.01]'
              }`}
              onClick={() => setActive(i)}
            >
              <Quote size={20} className="text-brand-500/40 mb-3" />

              <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-4">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className={j < t.stars ? 'text-amber-400 fill-amber-400' : 'text-surface-700'}
                  />
                ))}
              </div>

              <div>
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-text-muted">
                  {t.role} &middot; {t.city}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === active ? 'bg-brand-500 w-6' : 'bg-surface-700 hover:bg-surface-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
