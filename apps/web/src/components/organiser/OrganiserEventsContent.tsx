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
  Plus,
  Calendar,
  MapPin,
  IndianRupee,
  Users,
  Send,
  Eye,
  Filter,
  Search,
  MoreVertical,
  Clock,
  ChevronRight,
  Ticket,
  TrendingUp,
} from 'lucide-react'

interface EventItem {
  id: string
  title: string
  category: string
  city: string
  venue_name: string
  starts_at: string
  status: 'draft' | 'pending_approval' | 'approved' | 'cancelled' | 'completed'
  min_price: number
  max_price: number
  total_capacity: number
  available_seats: number
  seat_sections: { id: string; label: string; total_seats: number; available_seats: number; price: number }[]
}

export function OrganiserEventsContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [filter, setFilter] = useState<'all' | 'draft' | 'pending_approval' | 'approved'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!authLoading && isAuthenticated && user?.role !== 'organiser' && user?.role !== 'admin') {
      router.push('/organiser/register')
    }
  }, [isAuthenticated, authLoading, router, user])

  const { data, isLoading } = useQuery({
    queryKey: ['organiserEvents', filter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' })
      if (filter !== 'all') params.append('status', filter)
      const { data } = await api.get<{ data: { items: EventItem[] } }>(`/organisers/events?${params.toString()}`)
      return data.data.items
    },
    enabled: !!user && (user.role === 'organiser' || user.role === 'admin'),
  })

  const submitMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/organisers/events/${id}/submit`)
      return res.data
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Event submitted for approval')
      queryClient.invalidateQueries({ queryKey: ['organiserEvents'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Submit failed'),
  })

  const handleSubmit = (id: string, title: string) => {
    if (confirm(`Submit "${title}" for approval? It will be reviewed by our team.`)) {
      submitMutation.mutate(id)
    }
  }

  const filteredEvents = data?.filter(e =>
    !search || e.title.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading || isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="h-9 w-48 skeleton rounded-lg" />
          <div className="h-10 w-36 skeleton rounded-xl" />
        </div>
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-1">My Events</h1>
          <p className="text-text-muted text-sm">Manage, edit, and track all your events.</p>
        </div>
        <Link href="/organiser/events/new" className="btn-primary shrink-0">
          <Plus size={18} />
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="card bg-surface-800/20 p-4 border border-white/5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-surface-900 rounded-lg p-1 border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['all', 'draft', 'pending_approval', 'approved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap flex-1 md:flex-none px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
                filter === f ? 'bg-brand-500 text-white shadow-glow' : 'text-text-muted hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full pl-9 py-2 bg-surface-900 border-white/10"
          />
        </div>
      </div>

      {/* Events List */}
      {filteredEvents && filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.starts_at)
            const isPast = eventDate < new Date()
            const soldCount = event.total_capacity - event.available_seats
            const soldPercent = event.total_capacity > 0 ? Math.round((soldCount / event.total_capacity) * 100) : 0

            return (
              <div
                key={event.id}
                className={`card p-6 hover:bg-surface-800/80 transition-all group ${isPast ? 'opacity-70' : ''}`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <StatusBadge status={event.status} />
                      <span className="badge bg-surface-700 text-text-muted border border-white/10 text-xs">
                        {event.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-brand-400 transition-colors truncate">
                      <Link href={`/events/${event.id}`}>{event.title}</Link>
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-brand-400" />
                        {eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-blue-400" />
                        {eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-purple-400" />
                        {event.venue_name}, {event.city}
                      </span>
                    </div>
                  </div>

                  {/* Right: Stats & Actions */}
                  <div className="flex flex-row lg:flex-col items-end justify-between gap-4 lg:min-w-[200px]">
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-xs text-text-subtle block uppercase tracking-wider font-bold">Tickets Sold</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-display font-bold text-white">{soldCount}</span>
                          <span className="text-text-muted text-sm">/{event.total_capacity}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-24 h-1.5 bg-surface-700 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              soldPercent > 80 ? 'bg-emerald-500' : soldPercent > 40 ? 'bg-brand-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${soldPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-text-subtle block uppercase tracking-wider font-bold">Price</span>
                        <div className="flex items-center text-white font-display font-bold text-lg">
                          <IndianRupee size={14} className="mr-0.5 text-text-muted" />
                          {event.min_price}
                          {event.max_price > event.min_price && (
                            <span className="text-text-muted text-sm font-normal ml-1">- ₹{event.max_price}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {event.status === 'draft' && (
                        <button
                          onClick={() => handleSubmit(event.id, event.title)}
                          disabled={submitMutation.isPending}
                          className="btn-primary py-2 px-4 text-sm"
                        >
                          <Send size={14} />
                          Submit
                        </button>
                      )}
                      {event.status === 'approved' && (
                        <Link href={`/events/${event.id}`} className="btn-secondary py-2 px-4 text-sm bg-surface-700">
                          <Eye size={14} />
                          View Live
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-16 text-center border-dashed border-border/50 bg-surface-800/20">
          <Calendar className="mx-auto text-text-subtle mb-4" size={48} />
          <h3 className="text-xl font-display font-bold mb-2">No events found</h3>
          <p className="text-text-muted mb-6 max-w-sm mx-auto">
            {filter !== 'all'
              ? `No events with "${filter.replace('_', ' ')}" status. Try a different filter.`
              : "You haven't created any events yet. Get started!"}
          </p>
          <Link href="/organiser/events/new" className="btn-primary inline-flex shadow-glow">
            <Plus size={18} />
            Create Your First Event
          </Link>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-surface-700 text-text-muted border-white/10',
    pending_approval: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }
  const display = status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <span className={`badge border text-xs font-bold uppercase tracking-wider ${styles[status] || styles.draft}`}>
      {display}
    </span>
  )
}
