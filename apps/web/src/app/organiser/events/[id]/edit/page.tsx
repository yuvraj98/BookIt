'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventEditForm } from '@/components/organiser/EventEditForm'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['organiser-event', eventId],
    queryFn: async () => {
      const { data } = await api.get<{ data: any }>(`/organisers/events/${eventId}`)
      return data.data
    },
    enabled: !!eventId,
  })

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 animate-pulse">
        <div className="w-24 h-6 skeleton rounded mb-8" />
        <div className="h-[600px] skeleton card" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="p-6 md:p-10 text-center">
        <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
        <p className="text-text-muted mb-4">You may not have permission to edit this event.</p>
        <button onClick={() => router.back()} className="btn-secondary">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <button 
        onClick={() => router.back()} 
        className="btn-ghost flex items-center gap-2 mb-6 text-sm hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Events
      </button>

      <EventEditForm initialData={event} />
    </div>
  )
}
