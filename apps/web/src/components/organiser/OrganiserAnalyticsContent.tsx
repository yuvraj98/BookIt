'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  IndianRupee,
  TrendingUp,
  Ticket,
  Calendar,
  ArrowUpRight,
  ChevronLeft,
} from 'lucide-react'

interface EventAnalytic {
  id: string
  title: string
  status: string
  starts_at: string
  total_capacity: number
  tickets_sold: number
  total_bookings: number
  confirmed_bookings: number
  gross_revenue: number
  commission: number
  net_payout: number
}

export function OrganiserAnalyticsContent() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!authLoading && isAuthenticated && user?.role !== 'organiser') {
      router.push('/organiser/register')
    }
  }, [isAuthenticated, authLoading, router, user])

  const { data, isLoading } = useQuery({
    queryKey: ['organiserAnalytics'],
    queryFn: async () => {
      const { data } = await api.get<{ data: EventAnalytic[] }>('/organisers/dashboard/analytics')
      return data.data
    },
    enabled: !!user && user.role === 'organiser',
  })

  if (authLoading || isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-9 w-48 skeleton rounded-lg" />
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
        </div>
        {[1, 2, 3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
      </div>
    )
  }

  const totalRevenue = data?.reduce((sum, e) => sum + e.gross_revenue, 0) || 0
  const totalPayout = data?.reduce((sum, e) => sum + e.net_payout, 0) || 0
  const totalCommission = data?.reduce((sum, e) => sum + e.commission, 0) || 0
  const totalTickets = data?.reduce((sum, e) => sum + e.tickets_sold, 0) || 0

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="btn-ghost text-sm">
          <ChevronLeft size={16} /> Back
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold">Revenue Analytics</h1>
          <p className="text-text-muted text-sm">Per-event breakdown of bookings, revenue, and payouts.</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="card p-6 bg-gradient-to-br from-brand-900/30 to-surface-800/20 border-brand-500/20">
          <div className="text-xs text-text-subtle uppercase tracking-wider font-bold mb-2">Gross Revenue</div>
          <div className="text-3xl font-display font-bold text-white flex items-center">
            <IndianRupee size={24} className="text-brand-400 mr-1" />
            {totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="card p-6">
          <div className="text-xs text-text-subtle uppercase tracking-wider font-bold mb-2">Net Payout</div>
          <div className="text-3xl font-display font-bold text-emerald-400 flex items-center">
            <IndianRupee size={24} className="mr-1" />
            {totalPayout.toLocaleString()}
          </div>
        </div>
        <div className="card p-6">
          <div className="text-xs text-text-subtle uppercase tracking-wider font-bold mb-2">Platform Fee</div>
          <div className="text-3xl font-display font-bold text-amber-400 flex items-center">
            <IndianRupee size={24} className="mr-1" />
            {totalCommission.toLocaleString()}
          </div>
        </div>
        <div className="card p-6">
          <div className="text-xs text-text-subtle uppercase tracking-wider font-bold mb-2">Total Tickets</div>
          <div className="text-3xl font-display font-bold text-white flex items-center">
            <Ticket size={24} className="text-blue-400 mr-2" />
            {totalTickets}
          </div>
        </div>
      </div>

      {/* Per-event Table */}
      <div className="card overflow-hidden">
        <div className="w-full h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-emerald-500 opacity-30" />
        {data && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-800/40 text-xs text-text-muted uppercase tracking-wider font-bold">
                  <th className="p-4">Event</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Sold</th>
                  <th className="p-4 text-right">Revenue</th>
                  <th className="p-4 text-right">Fee (8%)</th>
                  <th className="p-4 text-right">Your Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {data.map((event) => {
                  const soldPercent = event.total_capacity > 0
                    ? Math.round((event.tickets_sold / event.total_capacity) * 100)
                    : 0

                  return (
                    <tr key={event.id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="p-4 max-w-[250px]">
                        <Link 
                          href={`/events/${event.id}` as any}
                          className="font-bold text-white text-sm hover:text-brand-400 transition-colors line-clamp-1"
                        >
                          {event.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                          <Calendar size={10} />
                          {new Date(event.starts_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`badge border text-[10px] font-bold uppercase ${
                          event.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          event.status === 'pending_approval' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-surface-700 text-text-muted border-white/10'
                        }`}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="text-sm font-bold text-white">{event.tickets_sold}/{event.total_capacity}</div>
                        <div className="w-16 h-1.5 bg-surface-700 rounded-full mt-1 mx-auto overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${soldPercent > 80 ? 'bg-emerald-500' : soldPercent > 40 ? 'bg-brand-500' : 'bg-amber-500'}`}
                            style={{ width: `${soldPercent}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-bold text-white flex items-center justify-end">
                          <IndianRupee size={12} className="mr-0.5 text-text-muted" />
                          {event.gross_revenue.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm text-amber-400">
                          -{event.commission.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-bold text-emerald-400 flex items-center justify-end">
                          <IndianRupee size={12} className="mr-0.5" />
                          {event.net_payout.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-text-muted">
            <BarChart3 size={48} className="mx-auto opacity-20 mb-4" />
            <h3 className="text-lg font-display font-bold mb-2">No analytics yet</h3>
            <p className="text-sm">Create events and get bookings to see revenue analytics here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
