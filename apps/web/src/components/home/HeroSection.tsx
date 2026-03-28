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
                href={`/events${query ? `?search=${encodeURIComponent(query)}` : ''}` as any}
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
              href={`/events?search=${encodeURIComponent(s)}` as any}
              className="text-sm text-[#a0a0a0] hover:text-brand-400 transition-colors duration-200 underline-offset-2 hover:underline"
            >
              {s}
            </Link>
          ))}
        </motion.div>

        {/* Floating event preview cards */}
        <motion.div
          className="w-full max-w-5xl mt-8 sm:mt-16 flex flex-col md:flex-row justify-center items-center md:items-stretch gap-6 px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {PREVIEW_CARDS.map((card, i) => (
            <motion.div
              key={i}
              className={`relative w-full sm:w-[280px] p-5 text-left rounded-3xl border border-white/10 bg-surface-800/40 backdrop-blur-xl shadow-2xl overflow-hidden group
                ${i === 1 ? 'md:-translate-y-8 z-10' : 'z-0'}
                ${i === 2 ? 'hidden lg:block' : ''}`}
              animate={{ y: i === 1 ? [-32, -40, -32] : [0, -8, 0] }}
              transition={{
                duration: 4,
                delay: i * 0.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Decorative gradient glow inside card */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 ${card.glowColor}`} />
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center text-2xl shadow-inner-glow`}>
                  {card.emoji}
                </div>
                <div className="flex flex-col items-end">
                  <span className="badge-brand backdrop-blur-md bg-surface-900/50 text-xs px-2.5 py-1 font-bold tracking-wide shadow-xl border-white/5">
                    {card.price}
                  </span>
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-lg font-display font-bold text-white leading-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#a0a0a0] transition-all duration-300">
                  {card.title}
                </h3>
                <p className="text-sm text-text-muted flex items-center gap-1.5 mb-4">
                  <Calendar size={14} className="opacity-70" />
                  <span className="truncate">{card.meta}</span>
                </p>
                
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />
                    {card.seats} seats left
                  </div>
                  <ArrowRight size={16} className="text-text-subtle group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </div>
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
    meta: 'Sat, 5 Apr · Blue Frog',
    price: '₹799',
    seats: '42',
    color: 'bg-gradient-to-br from-violet-500/30 to-purple-600/10 border border-violet-500/20',
    glowColor: 'bg-violet-500',
  },
  {
    emoji: '🎵',
    title: 'NH7 Weekender 2025',
    meta: 'Sun, 13 Apr · Mahalaxmi',
    price: '₹1,499',
    seats: '120',
    color: 'bg-gradient-to-br from-amber-500/30 to-orange-600/10 border border-amber-500/20',
    glowColor: 'bg-amber-500',
  },
  {
    emoji: '🏏',
    title: 'IPL Pune vs Mumbai',
    meta: 'Fri, 11 Apr · MCA Stadium',
    price: '₹499',
    seats: '8',
    color: 'bg-gradient-to-br from-brand-500/30 to-blue-600/10 border border-brand-500/20',
    glowColor: 'bg-brand-500',
  },
]
