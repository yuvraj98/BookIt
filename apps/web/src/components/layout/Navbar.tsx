'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Menu, X, MapPin, ChevronDown, CircleUserRound, LogOut, Crown, Shield, Coins, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const CITIES = ['Pune', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Delhi']

const NAV_LINKS = [
  { label: 'Events', href: '/events' },
  { label: 'Comedy', href: '/events?category=comedy' },
  { label: 'Music', href: '/events?category=music' },
  { label: 'Sports', href: '/events?category=sports' },
  { label: 'List Event', href: '/organiser/register', highlight: true },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState('Pune')
  const [cityOpen, setCityOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    setMobileOpen(false)
  }

  // Dynamic nav links based on auth state
  const navLinks = NAV_LINKS.map(link => {
    if (link.label === 'List Event' && isAuthenticated && user?.role === 'organiser') {
      return { ...link, href: '/organiser/dashboard', label: 'Dashboard' }
    }
    return link
  })

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
              {navLinks.map((link) =>
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

            {/* Auth / Profile */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5
                               hover:bg-white/10 transition-all duration-200 group"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
                      <span className="text-xs font-bold text-white">
                        {(user.name || user.phone || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white max-w-[100px] truncate">
                      {user.name || 'User'}
                    </span>
                    {user.loyalty_coins > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                        <Coins size={10} />
                        {user.loyalty_coins}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 right-0 w-56 rounded-xl border border-white/10
                                   backdrop-blur-xl bg-surface-800/95 shadow-card-hover overflow-hidden py-1"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                          <p className="text-sm font-bold text-white truncate">{user.name || 'BookIt User'}</p>
                          <p className="text-xs text-text-muted truncate">{user.phone}</p>
                        </div>

                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#a0a0a0] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <CircleUserRound size={16} />
                          My Profile
                        </Link>

                        <Link
                          href="/profile/bookings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#a0a0a0] hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Ticket size={16} />
                          My Bookings
                        </Link>

                        {user.role === 'organiser' && (
                          <Link
                            href="/organiser/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/5 transition-colors"
                          >
                            <Crown size={16} />
                            Organiser Dashboard
                          </Link>
                        )}

                        {user.role === 'admin' && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                          >
                            <Shield size={16} />
                            Admin Panel
                          </Link>
                        )}

                        <div className="border-t border-white/[0.06] mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors w-full text-left"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
                  <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                    Get Started
                  </Link>
                </>
              )}
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
                {navLinks.map((link) => (
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

                <div className="pt-3 border-t border-white/[0.08]">
                  {isAuthenticated && user ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
                          <span className="text-sm font-bold text-white">
                            {(user.name || user.phone || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user.name || 'BookIt User'}</p>
                          <p className="text-xs text-text-muted">{user.phone}</p>
                        </div>
                        {user.loyalty_coins > 0 && (
                          <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                            <Coins size={12} />
                            {user.loyalty_coins}
                          </span>
                        )}
                      </div>
                      <Link href="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm text-[#a0a0a0] hover:text-white hover:bg-white/5 rounded-lg">
                        My Profile
                      </Link>
                      <Link href="/profile/bookings" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm text-[#a0a0a0] hover:text-white hover:bg-white/5 rounded-lg">
                        My Bookings
                      </Link>
                      {user.role === 'organiser' && (
                        <Link href="/organiser/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm text-purple-400 hover:bg-purple-500/5 rounded-lg">
                          Organiser Dashboard
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 rounded-lg">
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 rounded-lg mt-2"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center text-sm py-2.5">
                        Sign in
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
