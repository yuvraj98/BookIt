'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  Users,
  Store,
  CalendarCheck,
  IndianRupee,
  ShieldAlert,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
  total_users: number
  total_organisers: number
  pending_organisers: number
  total_events: number
  approved_events: number
  total_gmv: number
  platform_revenue: number
}

export function AdminDashboardContent() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await api.get<{ data: AdminStats }>('/admin/stats')
      return data.data
    },
  })

  // We are fetching logs just for the recent activity feed
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['adminLogs'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { items: any[] } }>('/admin/logs?limit=5')
      return data.data.items
    },
  })

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 animate-pulse">
        <div className="h-8 w-64 skeleton rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 skeleton card rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight mb-2">Control Center</h1>
          <p className="text-text-muted">Monitor platform health, revenue, and pending approvals.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/organisers?status=pending" className="btn-secondary bg-surface-800 border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30">
            <ShieldAlert size={18} />
            {stats?.pending_organisers || 0} Pending Organisers
          </Link>
        </div>
      </div>

      {/* ─── Metric Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        
        {/* Revenue Card (Special) */}
        <div className="card col-span-1 lg:col-span-2 p-6 flex flex-col justify-between bg-gradient-to-br from-brand-900/40 to-surface-800/20 border-brand-500/20 relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/20 transition-all duration-700" />
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30 shadow-inner-glow">
              <IndianRupee className="text-brand-400" size={24} />
            </div>
            <span className="badge-brand bg-emerald-500/20 text-emerald-400 border-emerald-500/30 uppercase text-[10px] shadow-glow flex items-center gap-1">
              <TrendingUp size={12} />
              +12% this week
            </span>
          </div>
          <div>
            <h3 className="text-text-muted text-sm font-medium uppercase tracking-wider mb-2">Platform Revenue (8%)</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight">
                ₹{stats?.platform_revenue.toLocaleString()}
              </span>
              <span className="text-text-subtle text-sm">/ ₹{stats?.total_gmv.toLocaleString()} GMV</span>
            </div>
          </div>
        </div>

        <StatCard 
          icon={<Store className="text-amber-400" size={20} />}
          label="Total Organisers"
          value={stats?.total_organisers || 0}
          subtext={`${stats?.pending_organisers} pending verification`}
        />

        <StatCard 
          icon={<CalendarCheck className="text-blue-400" size={20} />}
          label="Active Events"
          value={stats?.approved_events || 0}
          subtext={`Out of ${stats?.total_events} total drafted`}
        />

        <StatCard 
          icon={<Users className="text-purple-400" size={20} />}
          label="Registered Users"
          value={stats?.total_users || 0}
          subtext="Total unique registrations"
        />

      </div>

      {/* ─── Recent Admin Logs ──────────────────────────────────── */}
      <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
        <ShieldAlert size={20} className="text-brand-500" />
        Recent Audit Logs
      </h2>
      
      <div className="card overflow-hidden">
        {logsLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-10 skeleton rounded-lg" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-surface-800/30 text-xs uppercase tracking-wider text-text-muted">
                  <th className="px-6 py-4 font-bold">Admin</th>
                  <th className="px-6 py-4 font-bold">Action</th>
                  <th className="px-6 py-4 font-bold">Target ID</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {logsData?.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px] font-bold">
                        {log.users?.name?.charAt(0) || 'A'}
                      </div>
                      {log.users?.name || 'Admin'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge border-white/10 bg-surface-700/50 text-text-muted text-xs shadow-none">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-subtle font-mono text-xs truncate max-w-[150px]">
                      {log.target_id}
                    </td>
                    <td className="px-6 py-4 text-text-subtle text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logsData?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                      No recent admin activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode, label: string, value: string | number, subtext: string }) {
  return (
    <div className="card p-6 flex flex-col justify-between group bg-surface-800/40 hover:bg-surface-800/80 transition-colors border-white/5 hover:border-white/10">
      <div className="flex items-start justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-surface-700/50 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-text-subtle text-xs font-bold uppercase tracking-wider mb-1 mt-auto">{label}</h3>
        <p className="text-3xl font-display font-bold tracking-tight text-white mb-1 group-hover:text-brand-400 transition-colors">{value}</p>
        <p className="text-xs text-text-muted">{subtext}</p>
      </div>
    </div>
  )
}
