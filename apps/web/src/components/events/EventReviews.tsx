'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Star, ThumbsUp, MessageSquare, Image as ImageIcon, Send, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReviewUser {
  name: string | null
  avatar_url: string | null
}

interface Review {
  id: string
  rating: number
  comment: string | null
  photos: string[]
  sentiment: string
  helpful_votes: number
  created_at: string
  user: ReviewUser | null
}

interface ReviewStats {
  total: number
  average: string
  distributions: Record<number, number>
}

export function EventReviews({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', photos: [] as string[] })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', eventId],
    queryFn: async () => {
      const res = await api.get<{ data: { reviews: Review[], stats: ReviewStats } }>(`/reviews/${eventId}`)
      return res.data.data
    }
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/reviews', { ...newReview, event_id: eventId })
      return res.data
    },
    onSuccess: () => {
      toast.success('Review posted successfully!')
      setNewReview({ rating: 5, comment: '', photos: [] })
      queryClient.invalidateQueries({ queryKey: ['reviews', eventId] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to post review')
    }
  })

  const helpfulMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/reviews/${id}/helpful`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', eventId] })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return toast.error('Please login to write a review')
    setIsSubmitting(true)
    submitMutation.mutate(undefined, {
      onSettled: () => setIsSubmitting(false)
    })
  }

  if (isLoading) {
    return (
      <div className="section space-y-4 animate-pulse">
        <div className="h-40 skeleton rounded-2xl w-full" />
        <div className="h-32 skeleton rounded-2xl w-full" />
        <div className="h-32 skeleton rounded-2xl w-full" />
      </div>
    )
  }

  const { reviews, stats } = data || { reviews: [], stats: { total: 0, average: '0', distributions: { 5:0, 4:0, 3:0, 2:0, 1:0 } } }

  return (
    <div className="mt-12 w-full animate-in fade-in max-w-5xl mx-auto">
      <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-2">
        <MessageSquare className="text-brand-500" />
        Guest Reviews
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Stats Column */}
        <div className="card p-6 border-white/[0.05] h-min">
          <div className="text-center mb-6">
            <div className="text-5xl font-display font-bold text-white mb-2">{stats.average}</div>
            <div className="flex justify-center gap-1 text-amber-400 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={20} fill={star <= Number(stats.average) ? 'currentColor' : 'none'} className={star > Number(stats.average) ? 'text-surface-600' : ''} />
              ))}
            </div>
            <p className="text-text-muted text-sm capitalize">Based on {stats.total} reviews</p>
          </div>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats.distributions[star] || 0
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-4 font-medium text-text-subtle text-right">{star}</span>
                  <Star size={12} className="text-text-muted" />
                  <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-8 text-xs text-text-muted text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reviews List & Form */}
        <div className="lg:col-span-2 space-y-6">
          {user && (
            <form onSubmit={handleSubmit} className="card p-6 border-brand-500/20 bg-surface-800/80">
              <h3 className="font-bold mb-4 flex items-center gap-2">Write a Review</h3>
              
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star size={24} className={newReview.rating >= star ? 'text-amber-400' : 'text-surface-600'} fill={newReview.rating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>

              <textarea
                className="input w-full min-h-[100px] mb-4 text-sm"
                placeholder="Share your experience..."
                required
                value={newReview.comment}
                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
              />

              <div className="flex justify-between items-center">
                <button type="button" className="btn-ghost text-xs hidden sm:flex">
                  <ImageIcon size={14} /> Add Photos
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary text-sm ml-auto">
                  <Send size={14} />
                  {isSubmitting ? 'Posting...' : 'Post Review'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="card p-6 border-white/[0.02] hover:bg-surface-800/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center overflow-hidden shrink-0">
                      {review.user?.avatar_url ? (
                        <img src={review.user.avatar_url} alt="User" />
                      ) : (
                        <User size={18} className="text-text-muted" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{review.user?.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-text-subtle">
                        {new Date(review.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? 'text-amber-400' : 'text-surface-700'} fill={i < review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-text-muted text-sm leading-relaxed mb-4">{review.comment}</p>
                )}

                {review.photos && review.photos.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {review.photos.map((photo, j) => (
                      <img key={j} src={photo} className="h-16 w-16 rounded-xl object-cover shrink-0 border border-white/5" alt="Review shot" />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs">
                   <button 
                     onClick={() => helpfulMutation.mutate(review.id)}
                     className="flex items-center gap-1.5 text-text-subtle hover:text-brand-400 transition-colors"
                   >
                     <ThumbsUp size={14} /> Helpful ({review.helpful_votes})
                   </button>
                   
                   {review.sentiment === 'positive' && (
                     <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">Positive</span>
                   )}
                   {review.sentiment === 'negative' && (
                     <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">Negative</span>
                   )}
                </div>
              </div>
            ))}

            {reviews.length === 0 && !user && (
              <div className="text-center py-12 card border border-dashed border-border bg-transparent">
                <MessageSquare size={32} className="mx-auto text-surface-600 mb-4" />
                <p className="text-text-muted">No reviews yet for this event.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
