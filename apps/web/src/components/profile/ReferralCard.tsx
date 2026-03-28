'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Copy, Users, Gift, Sparkles, Share2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReferralData {
  code: string
  total_referrals: number
  coins_per_referral: number
  share_message: string
}

export function ReferralCard() {
  const { isAuthenticated } = useAuthStore()
  const [applying, setApplying] = useState(false)
  const [applyCode, setApplyCode] = useState('')

  const { data: referral, isLoading } = useQuery({
    queryKey: ['myReferral'],
    queryFn: async () => {
      const { data } = await api.get<{ data: ReferralData }>('/referrals/my-code')
      return data.data
    },
    enabled: isAuthenticated,
  })

  const copyCode = () => {
    if (referral) {
      navigator.clipboard.writeText(referral.code)
      toast.success('Referral code copied!')
    }
  }

  const shareCode = async () => {
    if (!referral) return
    if (navigator.share) {
      await navigator.share({ title: 'Join BookIt!', text: referral.share_message })
    } else {
      navigator.clipboard.writeText(referral.share_message)
      toast.success('Share message copied!')
    }
  }

  const applyReferral = async () => {
    if (!applyCode.trim()) return
    setApplying(true)
    try {
      const { data } = await api.post('/referrals/apply', { code: applyCode.trim() })
      toast.success(data.message)
      setApplyCode('')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid referral code')
    } finally {
      setApplying(false)
    }
  }

  if (isLoading) {
    return <div className="card p-6 animate-pulse"><div className="h-32 skeleton rounded-xl" /></div>
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600/20 via-purple-600/20 to-pink-600/20 p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Gift size={22} className="text-brand-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Refer & Earn</h3>
            <p className="text-xs text-text-muted">Earn {referral?.coins_per_referral || 50} coins per referral!</p>
          </div>
        </div>

        {referral && (
          <div className="bg-surface-900/60 rounded-xl p-4 flex items-center justify-between border border-white/5">
            <div>
              <p className="text-[10px] text-text-subtle uppercase tracking-wider font-bold mb-1">Your Code</p>
              <p className="text-2xl font-display font-bold text-brand-400 tracking-widest">{referral.code}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={copyCode} className="btn-ghost p-2.5 rounded-xl hover:bg-surface-700" title="Copy">
                <Copy size={18} />
              </button>
              <button onClick={shareCode} className="btn-primary p-2.5 rounded-xl shadow-glow" title="Share">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-muted">
            <Users size={16} />
            <span className="text-sm">Friends referred</span>
          </div>
          <span className="font-display font-bold text-xl text-white">{referral?.total_referrals || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-muted">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-sm">Coins earned</span>
          </div>
          <span className="font-display font-bold text-xl text-amber-400">
            {(referral?.total_referrals || 0) * (referral?.coins_per_referral || 50)}
          </span>
        </div>

        <div className="divider" />

        {/* Apply someone else's code */}
        <div>
          <p className="text-sm font-medium text-text-muted mb-2">Have a referral code?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={applyCode}
              onChange={e => setApplyCode(e.target.value.toUpperCase())}
              placeholder="Enter friend's code"
              className="input py-2 flex-1 font-mono tracking-wider uppercase"
            />
            <button onClick={applyReferral} disabled={applying} className="btn-secondary px-4">
              {applying ? '...' : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
