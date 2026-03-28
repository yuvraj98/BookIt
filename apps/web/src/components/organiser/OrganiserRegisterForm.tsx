'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import {
  Building2,
  CreditCard,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Upload,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

// ─── Steps ─────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Business Info', icon: Building2 },
  { id: 2, label: 'Bank Details', icon: CreditCard },
  { id: 3, label: 'KYC Upload', icon: FileText },
]

// ─── Schemas ────────────────────────────────────────────────
const businessSchema = z.object({
  business_name: z.string().min(2, 'Business name is required').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  city: z.string().min(2, 'City is required'),
  address: z.string().max(500).optional().or(z.literal('')),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit number')
    .optional()
    .or(z.literal('')),
})

const bankSchema = z.object({
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN')
    .optional()
    .or(z.literal('')),
  bank_account: z.string().min(8, 'Enter a valid account number').max(20).optional().or(z.literal('')),
  bank_ifsc: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC (format: ABCD0123456)')
    .optional()
    .or(z.literal('')),
})

type BusinessForm = z.infer<typeof businessSchema>
type BankForm = z.infer<typeof bankSchema>

// ─── Component ──────────────────────────────────────────────
export function OrganiserRegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [businessData, setBusinessData] = useState<BusinessForm | null>(null)

  const businessForm = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
    defaultValues: { city: 'Pune' },
  })

  const bankForm = useForm<BankForm>({
    resolver: zodResolver(bankSchema),
  })

  // Step 1 → Step 2
  const onBusinessSubmit = (data: BusinessForm) => {
    setBusinessData(data)
    setStep(2)
  }

  // Step 2 → Step 3 (and register)
  const onBankSubmit = async (bankData: BankForm) => {
    if (!businessData) return

    setLoading(true)
    try {
      const payload = { ...businessData, ...bankData }
      await api.post('/organisers/register', payload)
      toast.success('Registration submitted! 🎉')
      setStep(3)
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="badge-brand text-xs mb-4 inline-flex px-4 py-1.5">
          <Building2 className="w-3.5 h-3.5" />
          For Organisers
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
          Register as an Organiser
        </h1>
        <p className="text-[#a0a0a0]">
          Start listing events on BookIt. It&apos;s free for the first 6 months.
        </p>
      </motion.div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                step === s.id
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                  : step > s.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/5 text-[#606060] border border-white/10'
              }`}
            >
              {step > s.id ? (
                <Check className="w-4 h-4" />
              ) : (
                <s.icon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.id}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-px transition-colors ${
                  step > s.id ? 'bg-emerald-500/40' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <motion.div className="card p-8 sm:p-10">
        <AnimatePresence mode="wait">
          {/* ─── Step 1: Business Info ────────────────────── */}
          {step === 1 && (
            <motion.form
              key="business"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              onSubmit={businessForm.handleSubmit(onBusinessSubmit)}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Business Information</h2>
                <p className="text-sm text-[#606060]">
                  Tell us about your organisation or business.
                </p>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">
                  Business / Organisation Name *
                </label>
                <input
                  {...businessForm.register('business_name')}
                  className="input"
                  placeholder="e.g. Pune Comedy Club"
                />
                {businessForm.formState.errors.business_name && (
                  <p className="text-xs text-brand-400 mt-1">
                    {businessForm.formState.errors.business_name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">
                  Description
                </label>
                <textarea
                  {...businessForm.register('description')}
                  className="input min-h-[100px] resize-y"
                  placeholder="Tell us about your events and audience..."
                  rows={4}
                />
              </div>

              {/* City + Phone */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">City *</label>
                  <select {...businessForm.register('city')} className="input">
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">
                    Contact Number
                  </label>
                  <input
                    {...businessForm.register('phone')}
                    className="input"
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {businessForm.formState.errors.phone && (
                    <p className="text-xs text-brand-400 mt-1">
                      {businessForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">Address</label>
                <input
                  {...businessForm.register('address')}
                  className="input"
                  placeholder="Office or venue address"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">
                  Website / Instagram
                </label>
                <input
                  {...businessForm.register('website')}
                  className="input"
                  placeholder="https://yoursite.com"
                />
                {businessForm.formState.errors.website && (
                  <p className="text-xs text-brand-400 mt-1">
                    {businessForm.formState.errors.website.message}
                  </p>
                )}
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-3.5">
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}

          {/* ─── Step 2: Bank Details ─────────────────────── */}
          {step === 2 && (
            <motion.form
              key="bank"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              onSubmit={bankForm.handleSubmit(onBankSubmit)}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Bank & Tax Details</h2>
                <p className="text-sm text-[#606060]">
                  For payouts after your events. You can add these later too.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/70 leading-relaxed">
                  Bank details and GSTIN are optional now. You can add them before creating
                  your first event. We need these for payouts after ticket sales.
                </p>
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">
                  GSTIN (optional)
                </label>
                <input
                  {...bankForm.register('gstin')}
                  className="input uppercase"
                  placeholder="27AABCU9603R1ZM"
                  maxLength={15}
                />
                {bankForm.formState.errors.gstin && (
                  <p className="text-xs text-brand-400 mt-1">
                    {bankForm.formState.errors.gstin.message}
                  </p>
                )}
              </div>

              {/* Bank Account */}
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">
                  Bank Account Number (optional)
                </label>
                <input
                  {...bankForm.register('bank_account')}
                  className="input"
                  placeholder="Enter your bank account number"
                  type="text"
                />
                {bankForm.formState.errors.bank_account && (
                  <p className="text-xs text-brand-400 mt-1">
                    {bankForm.formState.errors.bank_account.message}
                  </p>
                )}
              </div>

              {/* IFSC */}
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">
                  IFSC Code (optional)
                </label>
                <input
                  {...bankForm.register('bank_ifsc')}
                  className="input uppercase"
                  placeholder="HDFC0001234"
                  maxLength={11}
                />
                {bankForm.formState.errors.bank_ifsc && (
                  <p className="text-xs text-brand-400 mt-1">
                    {bankForm.formState.errors.bank_ifsc.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1 justify-center py-3.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 justify-center py-3.5"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* ─── Step 3: Success / KYC Upload ─────────────── */}
          {step === 3 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Application Submitted! 🎉</h2>
              <p className="text-[#a0a0a0] mb-8 max-w-md mx-auto">
                Your organiser application is under review. We&apos;ll verify your details
                and notify you via WhatsApp within 24 hours.
              </p>

              {/* KYC Upload */}
              <div className="card p-6 text-left mb-6 max-w-sm mx-auto">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Speed up verification — upload KYC
                </h3>
                <p className="text-xs text-[#606060] mb-4">
                  Upload your Aadhaar, PAN, or business registration to get verified faster.
                </p>
                <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-brand-500/30 bg-white/[0.02] cursor-pointer transition-colors">
                  <Upload className="w-8 h-8 text-[#606060]" />
                  <span className="text-sm text-[#a0a0a0]">Click to upload document</span>
                  <span className="text-xs text-[#606060]">PDF, JPG, PNG — Max 5MB</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={() => toast.success('Document uploaded!')}
                  />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/organiser/dashboard')}
                  className="btn-primary px-8 py-3 inline-flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="btn-secondary px-8 py-3"
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
