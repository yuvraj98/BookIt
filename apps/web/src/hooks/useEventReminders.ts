import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  status: string
  events: {
    title: string
    starts_at: string
    venue_name: string
  }
}

export function useEventReminders() {
  const { isAuthenticated } = useAuthStore()

  const { data: bookings } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { items: Booking[] } }>('/bookings/mine?limit=50')
      return data.data.items
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (!bookings) return

    const now = new Date()
    bookings.forEach(booking => {
      if (booking.status !== 'confirmed') return

      const eventDate = new Date(booking.events.starts_at)
      const diffMs = eventDate.getTime() - now.getTime()
      const diffHrs = diffMs / (1000 * 60 * 60)

      // Reminder 1: Event starts in exactly less than 2 hours but more than 0.
      // E.g., if it's within 2 hours, we notify once.
      // To ensure we only notify once per session, we use sessionStorage.
      if (diffHrs > 0 && diffHrs <= 2) {
        const key = `reminded_${booking.id}`
        if (!sessionStorage.getItem(key)) {
          toast.success(`Reminder: ${booking.events.title} starts in less than 2 hours at ${booking.events.venue_name}!`, {
            icon: '⏰',
            duration: 8000,
          })
          sessionStorage.setItem(key, 'true')
        }
      }
    })
  }, [bookings])
}
