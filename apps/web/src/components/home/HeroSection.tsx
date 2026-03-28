'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, MapPin, Calendar, ArrowRight, Sparkles } from 'lucide-react'

const QUICK_SEARCHES = [
  'Comedy in Pune', 'Music Festivals', 'Workshops', 'Sports Events',
]

export function HeroSection() {
  const [query, setQuery] = useState('')

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[900px] h-[600px] rounded-full
                        bg-brand-500/8 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-violet-500/5 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-500/5 blur-[100px]" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="section relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="badge-brand text-xs px-4 py-1.5 mb-8 inline-flex">
            <Sparkles className="w-3.5 h-3.5" />
            Now live in Pune — 200+ events listed
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] mb-6 max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Discover every event
          <br />
          <span className="text-gradient">happening near you</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg sm:text-xl text-[#a0a0a0] max-w-2xl mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Comedy nights, music festivals, workshops, sports — book tickets in seconds
          with UPI. WhatsApp QR ticket sent instantly. No app download needed.
        </motion.p>

        {/* Search bar */}
        <motion.div
          className="w-full max-w-2xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative flex items-center">
            <div className="absolute inset-0 rounded-2xl bg-brand-500/10 blur-xl pointer-events-none" />
            <div className="relative flex w-full rounded-2xl border border-white/10 bg-surface-800/80 backdrop-blur-md overflow-hidden shadow-card-hover">
              <div className="flex items-center px-4 text-[#606060]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search events, venues, artists..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 py-4 bg-transparent text-white placeholder-[#606060] focus:outline-none text-base"
              />
              <div className="flex items-center gap-1 px-3 border-l border-white/[0.08] text-[#606060]">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span className="text-sm font-medium text-white">Pune</span>
              </div>
              <Link
                href={`/events${query ? `?search=${encodeURIComponent(query)}` : ''}`}
                className="m-2 btn-primary text-sm px-5 py-2.5 rounded-xl"
              >
                Search
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick searches */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="text-sm text-[#606060]">Popular:</span>
          {QUICK_SEARCHES.map((s) => (
            <Link
              key={s}
              href={`/events?search=${encodeURIComponent(s)}`}
              className="text-sm text-[#a0a0a0] hover:text-brand-400 transition-colors duration-200 underline-offset-2 hover:underline"
            >
              {s}
            </Link>
          ))}
        </motion.div>

        {/* Floating event preview cards */}
        <motion.div
          className="relative w-full max-w-4xl h-48 sm:h-64"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {PREVIEW_CARDS.map((card, i) => (
            <motion.div
              key={i}
              className="absolute card p-4 text-left w-56 sm:w-64"
              style={card.style}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                delay: i * 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center text-xl mb-3`}>
                {card.emoji}
              </div>
              <p className="text-sm font-semibold text-white leading-tight mb-1">{card.title}</p>
              <p className="text-xs text-[#606060]">{card.meta}</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="badge-brand text-[10px] px-2 py-0.5">{card.price}</span>
                <span className="text-[10px] text-[#606060]">{card.seats} seats left</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

const PREVIEW_CARDS = [
  {
    emoji: '🎭',
    title: 'Abhishek Upmanyu LIVE',
    meta: 'Sat, 5 Apr · Blue Frog, Pune',
    price: '₹799',
    seats: '42',
    color: 'bg-violet-500/20',
    style: { left: '0%', top: '10%' },
  },
  {
    emoji: '🎵',
    title: 'NH7 Weekender 2025',
    meta: 'Sun, 13 Apr · Mahalaxmi Lawns',
    price: '₹1,499',
    seats: '120',
    color: 'bg-amber-500/20',
    style: { left: '50%', transform: 'translateX(-50%)', top: '0%' },
  },
  {
    emoji: '🏏',
    title: 'IPL Pune vs Mumbai',
    meta: 'Fri, 11 Apr · MCA Stadium',
    price: '₹499',
    seats: '8',
    color: 'bg-brand-500/20',
    style: { right: '0%', top: '10%' },
  },
]
