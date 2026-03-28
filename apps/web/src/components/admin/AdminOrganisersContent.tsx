'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { CheckCircle, XCircle, Search, Filter, Store, Banknote, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface Organiser {
  id: string
  business_name: string
  contact_person: string
  gstin: string | null
  address: string
  commission_rate: number
  verified: boolean
  created_at: string
  rejected_at: string | null
  rejection_reason: string | null
  users: {
    name: string
    phone: string
    email: string
    avatar_url: string | null
  }
}

export function AdminOrganisersContent() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useState(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search) }, 500)
    return () => clearTimeout(handler)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrganisers', filter, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ status: filter, limit: '50' })
      if (debouncedSearch) params.append('search', debouncedSearch)
      const res = await api.get<{ data: { items: Organiser[] } }>(`/admin/organisers?${params.toString()}`)
      return res.data.data.items
    },
  })

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async ({ id, rate }: { id: string; rate: number }) => {
      const res = await api.post(`/admin/organisers/${id}/approve`, { commission_rate: rate })
      return res.data
    },
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: ['adminOrganisers'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Approval failed'),
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.post(`/admin/organisers/${id}/reject`, { reason })
      return res.data
    },
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: ['adminOrganisers'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Rejection failed'),
  })

  const handleApprove = (id: string, currentRate: number) => {
    const rateStr = prompt('What commission rate percentage should be set? (e.g. 5, 8, 10)', currentRate.toString())
    if (rateStr === null) return
    const rate = Number(rateStr)
    if (isNaN(rate) || rate < 0 || rate > 50) return toast.error('Invalid commission rate')
    approveMutation.mutate({ id, rate: rate / 100 }) // API takes decimal
  }

  const handleReject = (id: string) => {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    if (reason.length < 5) return toast.error('Reason too short')
    rejectMutation.mutate({ id, reason })
  }

  return (
    <div className="p-6 md:p-10 animate-in fade-in">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Organiser Approvals</h1>
          <p className="text-text-muted">Review, verify, and monitor event creators.</p>
        </div>
      </div>

      {/* ─── Filters & Search ──────────────────────────────────── */}
      <div className="card bg-surface-800/20 p-4 border border-white/5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-surface-900 rounded-lg p-1 border border-white/5 w-full md:w-auto">
          {(['pending', 'verified', 'rejected', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${
                filter === f ? 'bg-brand-500 text-white shadow-glow' : 'text-text-muted hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search by business name or GST..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full pl-9 py-2 bg-surface-900 border-white/10"
          />
        </div>
      </div>

      {/* ─── Table ────────────────────────────────────────────────── */}
      <div className="card overflow-hidden border-white/5 shadow-2xl relative">
        <div className="w-full h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-amber-500 opacity-20" />
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
          </div>
        ) : data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-800/40 text-xs text-text-muted uppercase tracking-wider font-bold">
                  <th className="p-4">Business / Organiser</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">GST / Rate</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {data.map((org) => {
                  const isPending = !org.verified && !org.rejected_at
                  return (
                    <tr key={org.id} className="hover:bg-surface-800/20 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-700 to-surface-800 border border-white/10 flex items-center justify-center shrink-0">
                          <Store size={18} className="text-brand-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-[15px]">{org.business_name}</p>
                          <p className="text-xs text-text-muted">{org.contact_person}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-white">{org.users.phone}</p>
                        <p className="text-xs text-text-muted">{org.users.email}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-medium opacity-80">{org.gstin || 'No GST'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 w-max px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Banknote size={12} />
                          {org.commission_rate * 100}% Cut
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`badge border text-[10px] md:text-xs shadow-none ${
                          org.verified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          org.rejected_at ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse-glow hover:animate-none'
                        }`}>
                          {org.verified ? 'Verified' : org.rejected_at ? 'Rejected' : 'Pending Rev.'}
                        </span>
                        {org.rejection_reason && (
                          <div className="mt-2 group relative inline-flex items-center ml-2 cursor-help text-red-400">
                            <HelpCircle size={14} />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 text-xs bg-surface-900 border border-red-500/30 text-red-100 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                              {org.rejection_reason}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(org.id, org.commission_rate * 100)}
                                disabled={approveMutation.isPending}
                                className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 shadow-none hover:shadow-glow flex items-center justify-center transition-all"
                                title="Approve Organiser"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(org.id)}
                                disabled={rejectMutation.isPending}
                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 flex items-center justify-center transition-colors"
                                title="Reject Organiser"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {!isPending && org.verified && (
                             <button
                               onClick={() => handleReject(org.id)}
                               className="text-[10px] uppercase font-bold text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10"
                             >
                               Revoke
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
            <p>No organisers found for "{filter}" status.</p>
          </div>
        )}
      </div>
    </div>
  )
}
