'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { Tag, X, CheckCircle2, Loader2, IndianRupee } from 'lucide-react'

interface PromoResult {
  code: string
  description: string
  discount_type: 'flat' | 'percentage'
  discount_value: number
  discount_amount: number
  final_amount: number
}

interface Props {
  amount: number
  eventId?: string
  onApply: (discount: number, code: string) => void
  onRemove: () => void
  appliedCode: string | null
}

export function PromoCodeInput({ amount, eventId, onApply, onRemove, appliedCode }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PromoResult | null>(null)

  const validate = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post('/promo/validate', {
        code: code.trim().toUpperCase(),
        event_id: eventId,
        amount,
      })
      setResult(data.data)
      onApply(data.data.discount_amount, data.data.code)
      toast.success(`Promo applied! You save ₹${data.data.discount_amount}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid promo code')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const remove = () => {
    setCode('')
    setResult(null)
    onRemove()
  }

  if (appliedCode && result) {
    return (
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <div>
            <p className="text-sm font-bold text-emerald-400">{result.code}</p>
            <p className="text-xs text-text-muted">
              {result.discount_type === 'flat' ? `₹${result.discount_value} off` : `${result.discount_value}% off`}
              {' — '}You save ₹{result.discount_amount}
            </p>
          </div>
        </div>
        <button onClick={remove} className="btn-ghost p-1.5 rounded-lg text-text-muted hover:text-red-400">
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          maxLength={20}
          className="input pl-10 py-2.5 font-mono tracking-wider uppercase"
          onKeyDown={e => e.key === 'Enter' && validate()}
        />
      </div>
      <button onClick={validate} disabled={loading || !code.trim()} className="btn-secondary px-5 whitespace-nowrap">
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
      </button>
    </div>
  )
}
