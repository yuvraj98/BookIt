'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Calendar, MapPin, UploadCloud, Info, IndianRupee, Ticket } from 'lucide-react'

const seatSectionSchema = z.object({
  label: z.string().min(1, 'Label required (e.g., VIP, General)'),
  total_seats: z.coerce.number().min(1, 'Must have at least 1 seat'),
  price: z.coerce.number().min(0, 'Price must be >= 0'),
  row_count: z.coerce.number().min(1).default(1),
  col_count: z.coerce.number().min(1).default(1),
})

const eventFormSchema = z.object({
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
  tags: z.string().optional(), // Will be split by comma
  seat_sections: z.array(seatSectionSchema).min(1, 'Add at least one seating section'),
})

type EventFormValues = z.infer<typeof eventFormSchema>

export function EventCreationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      category: 'comedy',
      city: 'Pune',
      seat_sections: [{ label: 'General Admission', total_seats: 100, price: 499, row_count: 10, col_count: 10 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: 'seat_sections',
    control,
  })

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true)
    try {
      // Parse tags
      const parsedTags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
      
      const payload = {
        ...data,
        tags: parsedTags,
        starts_at: new Date(data.starts_at).toISOString(),
        ends_at: new Date(data.ends_at).toISOString(),
      }

      const res = await api.post('/organisers/events', payload)
      toast.success(res.data.message || 'Event created successfully!')
      router.push('/organiser/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card p-6 md:p-10 animate-in">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-display font-bold mb-2">Create New Event</h1>
        <p className="text-text-muted">Fill in the details to list your new experience.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ─── Basic Info ───────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Info size={20} className="text-brand-500" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Event Title</label>
              <input {...register('title')} className="input" placeholder="E.g., Pune Comedy Festival" />
              {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Category</label>
              <select {...register('category')} className="input app-select">
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
              rows={4}
              className="input resize-y"
              placeholder="Tell your audience what to expect..."
            />
            {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Poster URL (Optional)</label>
            <div className="relative">
              <UploadCloud size={18} className="absolute left-4 top-3.5 text-text-subtle" />
              <input
                {...register('poster_url')}
                className="input pl-11"
                placeholder="https://example.com/poster.jpg"
              />
            </div>
            {errors.poster_url && <p className="text-red-400 text-xs">{errors.poster_url.message}</p>}
          </div>
        </section>

        <div className="divider" />

        {/* ─── Date & Location ────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Date & Venue
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Starts At</label>
              <input {...register('starts_at')} type="datetime-local" className="input" />
              {errors.starts_at && <p className="text-red-400 text-xs">{errors.starts_at.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Ends At</label>
              <input {...register('ends_at')} type="datetime-local" className="input" />
              {errors.ends_at && <p className="text-red-400 text-xs">{errors.ends_at.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Venue Name</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-3.5 text-text-subtle" />
                <input {...register('venue_name')} className="input pl-11" placeholder="Phoenix Mall" />
              </div>
              {errors.venue_name && <p className="text-red-400 text-xs">{errors.venue_name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">City</label>
              <input {...register('city')} className="input" placeholder="Pune" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">Full Address</label>
            <input {...register('venue_address')} className="input" placeholder="Viman Nagar, Pune" />
            {errors.venue_address && <p className="text-red-400 text-xs">{errors.venue_address.message}</p>}
          </div>
        </section>

        <div className="divider" />

        {/* ─── Seat Sections ─────────────────────── */}
        <section className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Ticket size={20} className="text-emerald-500" />
              Seating & Tickets
            </h2>
            <button
              type="button"
              className="btn-ghost flex items-center text-brand-400 hover:text-brand-300"
              onClick={() => append({ label: '', total_seats: 50, price: 0, row_count: 5, col_count: 10 })}
            >
              <Plus size={16} /> Add Section
            </button>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-5 border border-border/50 bg-surface-800 rounded-xl relative group">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 text-text-subtle hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                
                <h3 className="font-semibold mb-3">Section {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-text-subtle">Section Name</label>
                    <input
                      {...register(`seat_sections.${index}.label`)}
                      className="input py-2"
                      placeholder="e.g. VIP, Economy"
                    />
                    {errors.seat_sections?.[index]?.label && <p className="text-red-400 text-xs">{errors.seat_sections[index].label.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-text-subtle">Total Seats</label>
                    <input
                      type="number"
                      {...register(`seat_sections.${index}.total_seats`)}
                      className="input py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-text-subtle">Price per Ticket</label>
                    <div className="relative">
                      <IndianRupee size={16} className="absolute left-3 top-3 text-text-subtle" />
                      <input
                        type="number"
                        {...register(`seat_sections.${index}.price`)}
                        className="input pl-9 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 bg-surface-900/50 p-3 rounded-lg border border-border/30">
                  <div className="space-y-2">
                    <label className="text-xs text-text-subtle">Rows (Seat Matrix generation)</label>
                    <input
                      type="number"
                      {...register(`seat_sections.${index}.row_count`)}
                      className="input py-2"
                    />
                    <p className="text-[10px] text-text-muted mt-1">Multiplied by cols to = total seats ideally</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-text-subtle">Columns</label>
                    <input
                      type="number"
                      {...register(`seat_sections.${index}.col_count`)}
                      className="input py-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.seat_sections?.root && (
            <p className="text-red-400 text-sm">{errors.seat_sections.root.message}</p>
          )}
        </section>

        <div className="pt-6">
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Creating Event...
              </span>
            ) : (
              'Create Event (Draft)'
            )}
          </button>
          <p className="text-center text-sm text-text-muted mt-4">
            You'll be able to review this before submitting for admin approval.
          </p>
        </div>
      </form>
    </div>
  )
}
