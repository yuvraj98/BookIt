'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Menu,
  X,
  Shield,
  Ticket,
  LogOut,
  FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/organisers', icon: Users, label: 'Organisers' },
  { href: '/admin/events', icon: CalendarDays, label: 'Events' },
  { href: '/admin/logs', icon: FileText, label: 'Audit Logs' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      router.push('/')
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
        <span className="badge-brand bg-red-500/10 text-red-500 border-red-500/20 text-[10px] ml-1 px-1.5 py-0.5 uppercase shadow-none">Admin</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
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
              <Icon size={18} className={isActive ? 'text-brand-400' : 'text-text-subtle'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Profile / Logout */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center text-red-400">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none mb-1">Root Admin</p>
              <p className="text-[10px] uppercase tracking-wider text-text-subtle font-medium">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-text-muted hover:text-red-400 hover:bg-surface-800 rounded-lg transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-surface-800/80 backdrop-blur-md rounded-xl border border-white/10 shadow-xl text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40 transform transition-transform duration-300">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
