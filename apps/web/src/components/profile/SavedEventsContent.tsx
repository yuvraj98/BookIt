'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  Heart,
  Calendar,
  MapPin,
  IndianRupee,
  Trash2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'

interface WishlistItem {
  id: string
  created_at: string
  events: {
    id: string
    title: string
    category: string
    city: string
    venue_name: string
    starts_at: string
    poster_url: string | null
    min_price: number
    organisers: { business_name: string }
  }
}

export function SavedEventsContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await api.get<{ data: WishlistItem[] }>('/wishlist')
      return data.data
    },
    enabled: isAuthenticated,
  })

  const removeMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await api.delete(`/wishlist/${eventId}`)
    },
    onSuccess: () => {
      toast.success('Removed from wishlist')
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
    onError: () => toast.error('Failed to remove'),
  })

  if (authLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-9 w-48 skeleton rounded-lg" />
        {[1, 2, 3].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="btn-ghost text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Heart size={24} className="text-red-400" />
            Saved Events
          </h1>
          <p className="text-text-muted text-sm">{data?.length || 0} events saved</p>
        </div>
      </div>

      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.map((item) => {
            const event = item.events
            const eventDate = new Date(event.starts_at)
            const isPast = eventDate < new Date()

            return (
              <div key={item.id} className={`card overflow-hidden group ${isPast ? 'opacity-60' : ''}`}>
                <Link href={`/events/${event.id}` as any} className="block">
                  <div className="aspect-[16/9] relative overflow-hidden bg-surface-700">
                    {event.poster_url ? (
                      <Image
                        src={event.poster_url}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-brand-900/40">
                        <span className="font-display font-bold text-lg opacity-30 text-center px-4">{event.title}</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="badge-brand backdrop-blur-md bg-surface-900/80 capitalize text-xs">
                        {event.category}
                      </span>
                    </div>
                    {isPast && (
                      <div className="absolute top-3 right-3">
                        <span className="badge bg-red-500/80 text-white backdrop-blur-md text-xs">Ended</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-5">
                  <Link href={`/events/${event.id}` as any}>
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-brand-400 transition-colors">
                      {event.title}
                    </h3>
                  </Link>

                  <div className="space-y-1.5 mb-4 text-sm text-text-muted">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-brand-400" />
                      {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-blue-400" />
                      <span className="truncate">{event.venue_name}, {event.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-white font-display font-bold">
                      <IndianRupee size={14} className="mr-0.5 text-text-muted" />
                      {event.min_price}
                    </div>

                    <button
                      onClick={() => removeMutation.mutate(event.id)}
                      disabled={removeMutation.isPending}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all border border-red-500/20 hover:border-red-500"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-16 text-center border-dashed bg-surface-800/20">
          <Heart className="mx-auto text-text-subtle mb-4" size={48} />
          <h3 className="text-xl font-display font-bold mb-2">No saved events</h3>
          <p className="text-text-muted mb-6">Tap the heart icon on any event to save it here.</p>
          <Link href="/events" className="btn-primary inline-flex shadow-glow">
            <Sparkles size={16} />
            Browse Events
          </Link>
        </div>
      )}
    </div>
  )
}
