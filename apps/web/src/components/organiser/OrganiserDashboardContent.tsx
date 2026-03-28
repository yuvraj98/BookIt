'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { BarChart3, Calendar, Plus, Ticket, IndianRupee, Clock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { RevenueChart } from './RevenueChart'

interface DashboardStats {
  verified: boolean
  total_events: number
  total_bookings: number
  total_revenue: number
  pending_payout: number
}

interface EventItem {
  id: string
  title: string
  status: 'draft' | 'pending_approval' | 'approved' | 'cancelled' | 'completed'
  available_seats: number
  total_capacity: number
  starts_at: string
}

export function OrganiserDashboardContent() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!authLoading && isAuthenticated && user?.role !== 'organiser') {
      router.push('/organiser/register')
    }
  }, [isAuthenticated, authLoading, router, user])

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['organiserStats'],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardStats }>('/organisers/dashboard/stats')
      return data.data
    },
    enabled: !!user && user.role === 'organiser',
  })

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['organiserEvents'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { items: EventItem[] } }>('/organisers/events?limit=5')
      return data.data.items
    },
    enabled: !!user && user.role === 'organiser',
  })

  if (authLoading || statsLoading) {
    return (
      <div className="section animate-pulse">
        <div className="h-8 w-64 skeleton mb-8 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 h-32 skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (!statsData) return null

  return (
    <div className="section animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Organiser Dashboard</h1>
          <p className="text-text-muted">
            {statsData.verified
              ? 'Manage your events and track performance.'
              : 'Your account is under review. You can create drafts meanwhile.'}
          </p>
        </div>
        <Link href="/organiser/events/new" className="btn-primary">
          <Plus size={18} />
          Create Event
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<Calendar className="text-blue-400" size={24} />}
          label="Total Events"
          value={statsData.total_events}
        />
        <StatCard
          icon={<Ticket className="text-emerald-400" size={24} />}
          label="Total Bookings"
          value={statsData.total_bookings}
        />
        <StatCard
          icon={<IndianRupee className="text-amber-400" size={24} />}
          label="Total Revenue"
          value={`₹${statsData.total_revenue.toLocaleString()}`}
        />
        <StatCard
          icon={<BarChart3 className="text-purple-400" size={24} />}
          label="Pending Payout"
          value={`₹${statsData.pending_payout.toLocaleString()}`}
        />
      </div>

      {/* Analytics Link & Chart */}
      <div className="mb-12">
        <Link href={"/organiser/analytics" as any} className="card p-5 mb-6 flex items-center justify-between group hover:bg-surface-800/80 transition-colors cursor-pointer border-brand-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <BarChart3 size={18} className="text-brand-400" />
            </div>
            <div>
              <h3 className="text-white font-medium group-hover:text-brand-400 transition-colors">Revenue Analytics</h3>
              <p className="text-xs text-text-muted">Per-event revenue, commissions, and payout breakdown</p>
            </div>
          </div>
          <div className="text-brand-400 group-hover:translate-x-1 transition-transform">
            <BarChart3 size={20} />
          </div>
        </Link>
        
        <div className="card p-6">
          <h2 className="text-lg font-display font-bold mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-purple-400" />
            Revenue Overview (Past 7 Days)
          </h2>
          <RevenueChart />
        </div>
      </div>

      {/* Recent Events */}
      <div className="card p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Clock size={20} className="text-brand-500" />
            Recent Events
          </h2>
          <Link href={"/organiser/events" as any} className="text-sm text-brand-400 hover:text-brand-300 font-medium">
            View All
          </Link>
        </div>

        {eventsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : eventsData && eventsData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-sm">
                  <th className="pb-3 font-medium">Event</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Sold</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {eventsData.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-border/50 hover:bg-surface-800 transition-colors"
                  >
                    <td className="py-4 font-medium max-w-[200px] truncate pr-4">
                      {event.title}
                    </td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="py-4 text-text-muted pr-4">
                      {new Date(event.starts_at).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      {event.total_capacity - event.available_seats} / {event.total_capacity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-text-muted mb-4">You haven't created any events yet.</p>
            <Link href="/organiser/events/new" className="btn-secondary">
              Create Your First Event
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="card p-6 flex flex-col justify-between group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-surface-700/50 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-text-muted text-sm font-medium mb-1">{label}</h3>
        <p className="text-3xl font-display font-bold tracking-tight">{value}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-surface-700 text-text-muted',
    pending_approval: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    approved: 'badge-success',
    cancelled: 'bg-red-500/15 text-red-400 border border-red-500/20',
    completed: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  }
  const display = status.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <span className={`badge ${styles[status]}`}>
      {display}
    </span>
  )
}
