'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Menu, X, MapPin, ChevronDown } from 'lucide-react'

const CITIES = ['Pune', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Delhi']

const NAV_LINKS = [
  { label: 'Events', href: '/events' },
  { label: 'Comedy', href: '/events?category=comedy' },
  { label: 'Music', href: '/events?category=music' },
  { label: 'Sports', href: '/events?category=sports' },
  { label: 'List Event', href: '/organiser', highlight: true },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState('Pune')
  const [cityOpen, setCityOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/[0.08] backdrop-blur-xl bg-surface-900/80'
            : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow">
                <Ticket className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-bold text-white">BookIt</span>
            </Link>

            {/* City selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setCityOpen(!cityOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5
                           hover:bg-white/10 transition-all duration-200 text-sm text-[#a0a0a0] hover:text-white"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                {selectedCity}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {cityOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 w-40 rounded-xl border border-white/10
                               backdrop-blur-xl bg-surface-800/95 shadow-card-hover overflow-hidden"
                  >
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => { setSelectedCity(city); setCityOpen(false) }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5
                                    ${city === selectedCity ? 'text-brand-400 font-medium' : 'text-[#a0a0a0]'}`}
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.highlight ? (
                  <Link key={link.href} href={link.href} className="btn-primary text-sm py-2 px-4 ml-2">
                    {link.label}
                  </Link>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="btn-ghost text-sm"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Auth */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                Get Started
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/[0.08] backdrop-blur-xl bg-surface-900/95"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors
                      ${link.highlight
                        ? 'bg-brand-500 text-white text-center mt-3'
                        : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-white/[0.08] flex gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center text-sm py-2.5">
                    Sign in
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
