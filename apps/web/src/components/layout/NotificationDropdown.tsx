'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle2, Info, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Notification {
  id: string
  type: string
  payload: any
  sent_at: string
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Retrieve last check time to show new indicator
  const [lastCheck, setLastCheck] = useState<string | null>(null)
  
  useEffect(() => {
    setLastCheck(localStorage.getItem('bookit_last_notification_check'))
  }, [])

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // First, try to trigger the welcome message generation
      api.post('/notifications/welcome').catch(() => {})
      
      const { data } = await api.get<{ data: Notification[] }>('/notifications')
      return data.data
    },
    refetchInterval: 30000, // check every 30s
  })

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(!open)
    if (!open) {
      const now = new Date().toISOString()
      localStorage.setItem('bookit_last_notification_check', now)
      setLastCheck(now)
    }
  }

  // Determine if there are unread notifications
  const hasUnread = notifications && notifications.length > 0 && 
    (!lastCheck || new Date(notifications[0].sent_at) > new Date(lastCheck))

  const getIcon = (type: string) => {
    switch (type) {
      case 'welcome': return <Star size={16} className="text-amber-400" />
      case 'booking_confirmed': return <CheckCircle2 size={16} className="text-emerald-400" />
      default: return <Info size={16} className="text-brand-400" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="w-10 h-10 rounded-xl bg-surface-800 border border-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-700 transition-colors relative"
      >
        <Bell size={18} />
        {hasUnread && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-500 rounded-full border border-surface-800 shadow-glow" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 w-80 rounded-xl border border-white/10
                       backdrop-blur-xl bg-surface-800/95 shadow-2xl overflow-hidden py-1 z-50"
          >
            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {hasUnread && <span className="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">New</span>}
            </div>

            <div className="max-h-80 overflow-y-auto no-scrollbar">
              {notifications && notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => {
                    const isNew = !lastCheck || new Date(notif.sent_at) > new Date(lastCheck)
                    return (
                      <div key={notif.id} className={`p-4 hover:bg-white/5 transition-colors flex gap-3 ${isNew ? 'bg-brand-500/5' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-surface-900 border border-white/5 flex items-center justify-center shrink-0">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white mb-0.5">{notif.payload?.title || 'Notification'}</p>
                          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{notif.payload?.message || ''}</p>
                          <p className="text-[10px] text-text-subtle mt-1.5">
                            {new Date(notif.sent_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-text-muted">
                  <Bell size={24} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">You have no notifications right now.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
