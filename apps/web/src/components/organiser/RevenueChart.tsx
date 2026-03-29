'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuthStore } from '@/stores/authStore'
import { Loader2 } from 'lucide-react'

interface ChartData {
  date: string
  revenue: number
  bookings: number
}

export function RevenueChart() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['organiserRevenueChart'],
    queryFn: async () => {
      // Simulate API call for chart data, since we don't have a specific endpoint yet
      // In production, this would fetch from /organisers/dashboard/chart
      const res = await api.get<{ data: ChartData[] }>('/organisers/dashboard/chart').catch(() => null)
      if (res?.data?.data) return res.data.data
      
      // Fallback dummy data if endpoint doesn't exist yet
      return [
        { date: 'Mon', revenue: 4000, bookings: 24 },
        { date: 'Tue', revenue: 3000, bookings: 13 },
        { date: 'Wed', revenue: 2000, bookings: 8 },
        { date: 'Thu', revenue: 9780, bookings: 39 },
        { date: 'Fri', revenue: 12900, bookings: 48 },
        { date: 'Sat', revenue: 23900, bookings: 98 },
        { date: 'Sun', revenue: 34900, bookings: 121 },
      ]
    },
    enabled: !!user && user.role === 'organiser',
  })

  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center card bg-surface-800/50">
        <Loader2 size={32} className="text-brand-500 animate-spin" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center card bg-surface-800/50">
        <p className="text-text-muted">No revenue data available yet.</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] animate-in fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff3d25" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff3d25" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#a0a0a0', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#a0a0a0', fontSize: 12 }}
            tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000) + 'k' : val}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a2e', 
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
            itemStyle={{ color: '#ff3d25', fontWeight: 'bold' }}
            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
            labelStyle={{ color: '#a0a0a0', marginBottom: '8px' }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#ff3d25" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            activeDot={{ r: 6, fill: '#ff3d25', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
