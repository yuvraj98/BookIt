'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { Calendar, MapPin, UploadCloud, Info } from 'lucide-react'

const editEventSchema = z.object({
  title: z.string().min(3, 'Title is too short'),
  description: z.string().min(10, 'Description needs to be longer'),
  category: z.enum([
    'comedy', 'music', 'sports', 'workshop', 'festival', 'cinema',
    'theatre', 'food', 'art', 'fitness', 'tech', 'business',
    'kids', 'religious', 'travel', 'gaming', 'nightlife', 'others',
  ]),
  subcategory: z.string().optional(),
  city: z.string().min(2, 'City required'),
  venue_name: z.string().min(2, 'Venue name required'),
  venue_address: z.string().min(5, 'Full address required'),
  starts_at: z.string().min(1, 'Start date/time required'),
  ends_at: z.string().min(1, 'End date/time required'),
  poster_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  tags: z.string().optional(),
})

type EditEventFormValues = z.infer<typeof editEventSchema>

export function EventEditForm({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // format dates for datetime-local input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditEventFormValues>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: initialData.title,
      description: initialData.description,
      category: initialData.category,
      subcategory: initialData.subcategory || '',
      city: initialData.city,
      venue_name: initialData.venue_name,
      venue_address: initialData.venue_address,
      starts_at: formatDateForInput(initialData.starts_at),
      ends_at: formatDateForInput(initialData.ends_at),
      poster_url: initialData.poster_url || '',
      tags: initialData.tags ? initialData.tags.join(', ') : '',
    },
  })

  // Check if event is locked
  const isLocked = initialData.status === 'approved'

  const onSubmit = async (data: EditEventFormValues) => {
    if (isLocked) {
      toast.error('Cannot edit an approved event.')
      return
    }
    
    setIsSubmitting(true)
    try {
      const parsedTags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
      
      const payload = {
        ...data,
        tags: parsedTags,
        starts_at: new Date(data.starts_at).toISOString(),
        ends_at: new Date(data.ends_at).toISOString(),
      }

      await api.put(`/organisers/events/${initialData.id}`, payload)
      toast.success('Event updated successfully!')
      router.push('/organiser/events')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update event.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card p-6 md:p-10 animate-in">
      <div className="mb-8 border-b border-border pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Edit Event</h1>
          <p className="text-text-muted">Update details for {initialData.title}</p>
        </div>
        {isLocked && (
          <span className="badge bg-amber-500/10 text-amber-500 border-amber-500/30">
            Approved — Locked for Edits
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Info size={20} className="text-brand-500" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Event Title</label>
              <input {...register('title')} disabled={isLocked} className="input" />
              {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Category</label>
              <select {...register('category')} disabled={isLocked} className="input app-select">
                <option value="comedy">Comedy</option>
                <option value="music">Music</option>
                <option value="sports">Sports</option>
                <option value="workshop">Workshop</option>
                <option value="theatre">Theatre</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Description</label>
            <textarea
              {...register('description')}
              disabled={isLocked}
              rows={4}
              className="input resize-y"
            />
            {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Poster URL (Optional)</label>
            <div className="relative">
              <UploadCloud size={18} className="absolute left-4 top-3.5 text-text-subtle" />
              <input
                {...register('poster_url')}
                disabled={isLocked}
                className="input pl-11"
              />
            </div>
            {errors.poster_url && <p className="text-red-400 text-xs">{errors.poster_url.message}</p>}
          </div>
        </section>

        <div className="divider" />

        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Date & Venue
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Starts At</label>
              <input {...register('starts_at')} disabled={isLocked} type="datetime-local" className="input" />
              {errors.starts_at && <p className="text-red-400 text-xs">{errors.starts_at.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Ends At</label>
              <input {...register('ends_at')} disabled={isLocked} type="datetime-local" className="input" />
              {errors.ends_at && <p className="text-red-400 text-xs">{errors.ends_at.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Venue Name</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-3.5 text-text-subtle" />
                <input {...register('venue_name')} disabled={isLocked} className="input pl-11" />
              </div>
              {errors.venue_name && <p className="text-red-400 text-xs">{errors.venue_name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">City</label>
              <input {...register('city')} disabled={isLocked} className="input" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Full Address</label>
            <input {...register('venue_address')} disabled={isLocked} className="input" />
            {errors.venue_address && <p className="text-red-400 text-xs">{errors.venue_address.message}</p>}
          </div>
        </section>

        <div className="divider" />
        
        <div className="bg-surface-800/50 p-4 rounded-xl border border-white/5">
          <p className="text-sm text-text-muted">
            <span className="text-amber-400 font-bold mr-2">Note:</span>
            Seat sections cannot be modified after event creation to prevent conflicts with booked tickets.
          </p>
        </div>

        <div className="pt-6 flex gap-3">
          <button type="button" onClick={() => router.back()} className="btn-ghost" disabled={isSubmitting}>
            Cancel
          </button>
          {!isLocked && (
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
