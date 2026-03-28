'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Shield,
  User,
  Clock,
} from 'lucide-react'

interface AuditLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  details: any
  created_at: string
  users?: { name: string; phone: string }
}

const ACTION_STYLES: Record<string, string> = {
  'approve_organiser': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'reject_organiser': 'bg-red-500/10 text-red-400 border-red-500/20',
  'approve_event': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'reject_event': 'bg-red-500/10 text-red-400 border-red-500/20',
  'takedown_event': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export function AdminLogsContent() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['adminLogs', 'full'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { items: AuditLog[] } }>('/admin/logs?limit=100')
      return data.data.items
    },
  })

  const filteredLogs = data?.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false
    if (search && !(log.users?.name || '').toLowerCase().includes(search.toLowerCase())
        && !log.action.toLowerCase().includes(search.toLowerCase())
        && !log.target_id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const uniqueActions = [...new Set(data?.map(l => l.action) || [])]

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 animate-pulse space-y-6">
        <div className="h-9 w-48 skeleton rounded-lg" />
        <div className="h-12 skeleton rounded-xl" />
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
          <FileText size={28} className="text-brand-400" />
          Audit Logs
        </h1>
        <p className="text-text-muted">Full history of administrative actions on the platform.</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center bg-surface-800/20 border-white/5">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            placeholder="Search by admin name, action, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full pl-9 py-2 bg-surface-900 border-white/10"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="input py-2 w-full md:w-52 bg-surface-900 border-white/10 app-select"
        >
          <option value="all">All Actions</option>
          {uniqueActions.map(a => (
            <option key={a} value={a}>{a.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="w-full h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-red-500 opacity-30" />

        {filteredLogs && filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-800/40 text-xs text-text-muted uppercase tracking-wider font-bold">
                  <th className="p-4">Admin</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target ID</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-white">
                            {(log.users?.name || 'A').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{log.users?.name || 'Admin'}</p>
                          <p className="text-[10px] text-text-muted">{log.users?.phone || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`badge border text-[10px] font-bold uppercase tracking-wider ${
                        ACTION_STYLES[log.action] || 'bg-surface-700 text-text-muted border-white/10'
                      }`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-text-subtle bg-surface-700/50 px-2 py-1 rounded">
                        {log.target_id.slice(0, 12)}...
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center gap-1.5 justify-end text-text-muted text-xs">
                        <Clock size={11} />
                        <span>{new Date(log.created_at).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-text-muted">
            <Shield size={48} className="mx-auto opacity-20 mb-4" />
            <h3 className="text-lg font-display font-bold mb-2">No logs found</h3>
            <p className="text-sm">{search || actionFilter !== 'all' ? 'Try adjusting your filters.' : 'No admin actions recorded yet.'}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-text-subtle text-center mt-4">
        Showing {filteredLogs?.length || 0} of {data?.length || 0} total entries
      </p>
    </div>
  )
}
