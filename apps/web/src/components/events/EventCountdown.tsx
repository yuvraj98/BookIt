'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface Props {
  startsAt: string
  className?: string
}

export function EventCountdown({ startsAt, className = '' }: Props) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const target = new Date(startsAt).getTime()
      const diff = target - now

      if (diff <= 0) {
        setIsLive(true)
        return
      }

      setRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startsAt])

  if (isLive) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-bold text-red-400">LIVE NOW</span>
      </div>
    )
  }

  const units = [
    { label: 'D', value: remaining.days },
    { label: 'H', value: remaining.hours },
    { label: 'M', value: remaining.minutes },
    { label: 'S', value: remaining.seconds },
  ]

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Clock size={14} className="text-brand-400" />
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center">
          <div className="bg-surface-800 border border-white/5 rounded-lg px-2 py-1 min-w-[2.2rem] text-center">
            <span className="text-sm font-mono font-bold text-white">{String(u.value).padStart(2, '0')}</span>
            <span className="text-[9px] text-text-subtle ml-0.5">{u.label}</span>
          </div>
          {i < units.length - 1 && <span className="text-text-subtle mx-0.5 text-xs">:</span>}
        </div>
      ))}
    </div>
  )
}
