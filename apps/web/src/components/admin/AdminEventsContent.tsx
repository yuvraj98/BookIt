'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { CheckCircle, XCircle, Search, Filter, CalendarDays, MapPin, IndianRupee, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface EventItem {
  id: string
  title: string
  category: string
  city: string
  venue_name: string
  starts_at: string
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  min_price: number
  total_capacity: number
  organisers: { business_name: string }
}

export function AdminEventsContent() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'pending_approval' | 'approved' | 'rejected' | 'all'>('pending_approval')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    setSearchTimeout(setTimeout(() => { setDebouncedSearch(value) }, 500))
  }

  const { data, isLoading } = useQuery({
    queryKey: ['adminEvents', filter, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' })
      if (filter !== 'all') params.append('status', filter)
      if (debouncedSearch) params.append('search', debouncedSearch)
      
      const res = await api.get<{ data: { items: EventItem[] } }>(`/admin/events?${params.toString()}`)
      return res.data.data.items
    },
  })

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/events/${id}/approve`)
      return res.data
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Event approved successfully')
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Approval failed'),
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.post(`/admin/events/${id}/reject`, { reason })
      return res.data
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Event rejected')
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Rejection failed'),
  })

  const handleApprove = (id: string, title: string) => {
    if (confirm(`Are you sure you want to approve "${title}"? It will go live immediately.`)) {
      approveMutation.mutate(id)
    }
  }

  const handleReject = (id: string) => {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    if (reason.length < 5) return toast.error('Reason too short')
    rejectMutation.mutate({ id, reason })
  }

  const takedownMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.post(`/admin/events/${id}/takedown`, { reason })
      return res.data
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Event taken down')
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Takedown failed'),
  })

  const handleTakedown = (id: string, title: string) => {
    const reason = prompt(`Reason for taking down "${title}":`)
    if (!reason) return
    if (reason.length < 5) return toast.error('Reason must be at least 5 characters')
    takedownMutation.mutate({ id, reason })
  }

  return (
    <div className="p-6 md:p-10 animate-in fade-in">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Event Moderation</h1>
          <p className="text-text-muted">Review, verify and ensure quality of platform listings.</p>
        </div>
      </div>

      <div className="card bg-surface-800/20 p-4 border border-white/5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-surface-900 rounded-lg p-1 border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar mask-gradient-right">
          {(['pending_approval', 'approved', 'rejected', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap flex-1 md:flex-none px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${
                filter === f ? 'bg-brand-500 text-white shadow-glow' : 'text-text-muted hover:text-white'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input w-full pl-9 py-2 bg-surface-900 border-white/10"
          />
        </div>
      </div>

      <div className="card overflow-hidden border-white/5 shadow-2xl relative">
        <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-brand-500 to-purple-500 opacity-20" />
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
          </div>
        ) : data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-800/40 text-xs text-text-muted uppercase tracking-wider font-bold">
                  <th className="p-4">Event Details</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Status & Reach</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {data.map((evt) => {
                  const isPending = evt.status === 'pending_approval'
                  return (
                    <tr key={evt.id} className="hover:bg-surface-800/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surface-700 to-surface-800 border border-white/10 flex items-center justify-center shrink-0">
                            <CalendarDays size={20} className="text-brand-400" />
                          </div>
                          <div>
                            <Link href={`/events/${evt.id}`} className="font-bold text-white text-[15px] hover:text-brand-400 hover:underline underline-offset-2 decoration-brand-400/{30} transition-colors line-clamp-1">{evt.title}</Link>
                            <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold opacity-70 flex items-center gap-1.5"><Store size={10} /> {evt.organisers?.business_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-white">{new Date(evt.starts_at).toLocaleDateString()}</p>
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5"><MapPin size={10} /> {evt.city}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-start gap-2">
                          <span className={`badge border text-[10px] md:text-xs shadow-none ${
                            evt.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            evt.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            evt.status === 'pending_approval' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse-glow hover:animate-none' :
                            'bg-surface-700 text-text-muted border-white/10'
                          }`}>
                            {evt.status.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-text-muted bg-surface-800 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                            {evt.total_capacity} tickets <IndianRupee size={10} /> {evt.min_price} avg
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(evt.id, evt.title)}
                                disabled={approveMutation.isPending}
                                className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 shadow-none hover:shadow-glow flex items-center justify-center transition-all"
                                title="Approve Event"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(evt.id)}
                                disabled={rejectMutation.isPending}
                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 flex items-center justify-center transition-colors"
                                title="Reject Event"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {!isPending && evt.status === 'approved' && (
                             <button
                               onClick={() => handleTakedown(evt.id, evt.title)}
                               disabled={takedownMutation.isPending}
                               className="text-[10px] uppercase font-bold text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
                             >
                               Take Down
                             </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-text-muted flex flex-col items-center">
            <Filter size={32} className="opacity-20 mb-4" />
            <p>No events found for "{filter.replace('_', ' ')}" status.</p>
          </div>
        )}
      </div>
    </div>
  )
}
