'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Plus,
  Menu,
  X,
  Ticket,
  LogOut,
  Crown,
  Home,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/organiser/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/organiser/events', icon: Calendar, label: 'My Events' },
  { href: '/organiser/events/new', icon: Plus, label: 'Create Event' },
  { href: '/organiser/analytics', icon: BarChart3, label: 'Analytics' },
]

export function OrganiserSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!isLoading && isAuthenticated && user?.role !== 'organiser' && user?.role !== 'admin') {
      router.push('/organiser/register')
    }
  }, [isLoading, isAuthenticated, user, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-surface-900 border-r border-border backdrop-blur-3xl p-6">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 mb-12 cursor-pointer group">
        <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
          <Ticket className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-display text-xl font-bold tracking-tight text-white group-hover:text-brand-400 transition-colors">
          BookIt
        </span>
        <span className="badge-brand bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] ml-1 px-1.5 py-0.5 uppercase shadow-none">
          Organiser
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/organiser/events/new' && pathname.startsWith(item.href + '/'))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href as any}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? 'bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20 shadow-glow'
                  : 'text-text-muted hover:bg-surface-800 hover:text-white border border-transparent'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-border pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-surface-800 rounded-xl transition-colors"
        >
          <Home size={16} />
          Back to Home
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-colors w-full text-left"
        >
          <LogOut size={16} />
          Sign Out
        </button>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 mt-2 bg-surface-800/50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-brand-600 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">
                {(user.name || user.phone || 'O').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user.name || 'Organiser'}</p>
              <p className="text-[10px] text-text-muted truncate">{user.phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl bg-surface-800 border border-white/10 flex items-center justify-center text-white hover:bg-surface-700 transition-colors shadow-lg"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl animate-in slide-in-from-left-4">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center text-white hover:bg-surface-600 transition-colors z-10"
            >
              <X size={16} />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
