'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  CircleUserRound,
  Mail,
  Phone,
  Coins,
  LogOut,
  Ticket,
  Crown,
  Settings,
  ChevronRight,
  Sparkles,
  MapPin,
  Shield,
  Calendar,
  Edit3,
  Check,
  X,
} from 'lucide-react'

export function ProfileContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, isLoading: authLoading, logout, fetchMe } = useAuthStore()
  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const res = await api.put('/auth/me', data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Profile updated!')
      setEditMode(false)
      fetchMe()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Update failed')
    },
  })

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.push('/')
  }

  const handleSave = () => {
    updateMutation.mutate({ name, email })
  }

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full skeleton" />
          <div className="space-y-3 flex-1">
            <div className="w-48 h-7 skeleton rounded" />
            <div className="w-32 h-5 skeleton rounded" />
          </div>
        </div>
        {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
      </div>
    )
  }

  if (!user) return null

  const roleLabel = user.role === 'admin' ? 'Administrator' : user.role === 'organiser' ? 'Event Organiser' : 'Explorer'
  const roleColor = user.role === 'admin' ? 'text-red-400' : user.role === 'organiser' ? 'text-purple-400' : 'text-brand-400'

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">

      {/* ─── Profile Header ────────────────────────────── */}
      <div className="card p-8 mb-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(255,61,37,0.3)]">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name || ''} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-3xl font-display font-bold text-white">
                  {(user.name || user.phone || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface-800 border-2 border-surface-900 flex items-center justify-center">
              <Crown size={14} className={roleColor} />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start mb-1">
              <h1 className="text-3xl font-display font-bold text-white">
                {user.name || 'BookIt User'}
              </h1>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="w-8 h-8 rounded-lg bg-surface-700 hover:bg-surface-600 flex items-center justify-center transition-colors">
                  <Edit3 size={14} className="text-text-muted" />
                </button>
              )}
            </div>
            
            <span className={`badge border text-xs font-bold uppercase tracking-wider ${
              user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              user.role === 'organiser' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
              'bg-brand-500/10 text-brand-400 border-brand-500/20'
            }`}>
              {roleLabel}
            </span>

            <div className="mt-4 flex items-center gap-2 justify-center sm:justify-start">
              <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                <Coins size={18} className="text-amber-400" />
                <div>
                  <span className="text-2xl font-display font-bold text-white">{user.loyalty_coins || 0}</span>
                  <span className="text-xs text-amber-400 ml-1.5 font-medium">coins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Edit Profile Form ─────────────────────────── */}
      {editMode && (
        <div className="card p-6 mb-6 animate-in fade-in slide-in-from-top-2 space-y-4">
          <h3 className="text-lg font-display font-bold flex items-center gap-2">
            <Settings size={18} className="text-brand-500" />
            Edit Profile
          </h3>
          
          <div>
            <label className="text-sm text-text-muted block mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input"
            />
          </div>

          <div>
            <label className="text-sm text-text-muted block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={updateMutation.isPending} className="btn-primary text-sm">
              <Check size={16} />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditMode(false)} className="btn-ghost text-sm">
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ─── Details Cards ─────────────────────────────── */}
      <div className="space-y-3 mb-8">
        <div className="card p-5 flex items-center gap-4 group hover:bg-surface-800/80 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
            <Phone size={18} className="text-text-muted group-hover:text-brand-400 transition-colors" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs text-text-subtle uppercase tracking-wider font-bold">Phone</h3>
            <p className="text-white font-medium">{user.phone}</p>
          </div>
          <Shield size={16} className="text-emerald-400" />
        </div>

        <div className="card p-5 flex items-center gap-4 group hover:bg-surface-800/80 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <Mail size={18} className="text-text-muted group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs text-text-subtle uppercase tracking-wider font-bold">Email</h3>
            <p className="text-white font-medium">{user.email || 'Not set'}</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 group hover:bg-surface-800/80 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
            <MapPin size={18} className="text-text-muted group-hover:text-purple-400 transition-colors" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs text-text-subtle uppercase tracking-wider font-bold">City</h3>
            <p className="text-white font-medium">{user.city || 'Pune'}</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 group hover:bg-surface-800/80 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <Calendar size={18} className="text-text-muted group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs text-text-subtle uppercase tracking-wider font-bold">Member Since</h3>
            <p className="text-white font-medium">
              {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Quick Links ───────────────────────────────── */}
      <h2 className="text-lg font-display font-bold mb-4 text-text-muted">Quick Links</h2>
      <div className="space-y-3 mb-8">
        <Link href="/profile/bookings" className="card p-5 flex items-center gap-4 group hover:bg-surface-800/80 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Ticket size={18} className="text-brand-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium group-hover:text-brand-400 transition-colors">My Bookings</h3>
            <p className="text-xs text-text-muted">View tickets and booking history</p>
          </div>
          <ChevronRight size={18} className="text-text-subtle group-hover:text-brand-400 transition-colors" />
        </Link>

        {user.role === 'organiser' && (
          <Link href="/organiser/dashboard" className="card p-5 flex items-center gap-4 group hover:bg-surface-800/80 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Crown size={18} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">Organiser Dashboard</h3>
              <p className="text-xs text-text-muted">Manage events and payouts</p>
            </div>
            <ChevronRight size={18} className="text-text-subtle group-hover:text-purple-400 transition-colors" />
          </Link>
        )}

        {user.role === 'admin' && (
          <Link href="/admin/dashboard" className="card p-5 flex items-center gap-4 group hover:bg-surface-800/80 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Shield size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium group-hover:text-red-400 transition-colors">Admin Dashboard</h3>
              <p className="text-xs text-text-muted">Platform control center</p>
            </div>
            <ChevronRight size={18} className="text-text-subtle group-hover:text-red-400 transition-colors" />
          </Link>
        )}

        {user.role === 'customer' && (
          <Link href="/organiser/register" className="card p-5 flex items-center gap-4 group hover:bg-surface-800/80 transition-colors cursor-pointer border-dashed">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Sparkles size={18} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium group-hover:text-amber-400 transition-colors">Become an Organiser</h3>
              <p className="text-xs text-text-muted">List events & earn on BookIt</p>
            </div>
            <ChevronRight size={18} className="text-text-subtle group-hover:text-amber-400 transition-colors" />
          </Link>
        )}
      </div>

      {/* ─── Sign Out ──────────────────────────────────── */}
      <button 
        onClick={handleLogout} 
        className="w-full card p-5 flex items-center gap-4 group hover:bg-red-500/5 hover:border-red-500/20 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <LogOut size={18} className="text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-red-400 font-medium">Sign Out</h3>
          <p className="text-xs text-text-muted">Log out of your account</p>
        </div>
      </button>
    </div>
  )
}
