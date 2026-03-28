// ============================================================
// BookIt — Shared Type Definitions
// ============================================================

// ─── Auth ────────────────────────────────────────────────────
export interface User {
  id: string
  phone: string
  name: string | null
  email: string | null
  city: string | null
  avatar_url: string | null
  role: 'customer' | 'organiser' | 'admin'
  loyalty_coins: number
  created_at: string
  updated_at: string
}

export interface OTPRequest {
  phone: string
}

export interface OTPVerifyRequest {
  phone: string
  otp: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  user: User
}

// ─── Organiser ───────────────────────────────────────────────
export interface Organiser {
  id: string
  user_id: string
  business_name: string
  gstin: string | null
  bank_account: string | null
  bank_ifsc: string | null
  verified: boolean
  commission_rate: number
  created_at: string
}

// ─── Event ───────────────────────────────────────────────────
export type EventCategory =
  | 'comedy'
  | 'music'
  | 'sports'
  | 'workshop'
  | 'festival'
  | 'cinema'
  | 'theatre'
  | 'food'
  | 'art'
  | 'fitness'
  | 'tech'
  | 'business'
  | 'kids'
  | 'religious'
  | 'travel'
  | 'gaming'
  | 'nightlife'
  | 'others'

export type EventStatus = 'draft' | 'pending_approval' | 'approved' | 'cancelled' | 'completed'

export interface Event {
  id: string
  organiser_id: string
  title: string
  description: string
  category: EventCategory
  subcategory: string | null
  city: string
  venue_name: string
  venue_address: string
  venue_lat: number | null
  venue_lng: number | null
  starts_at: string
  ends_at: string
  poster_url: string | null
  status: EventStatus
  total_capacity: number
  available_seats: number
  min_price: number
  max_price: number
  is_featured: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export interface SeatSection {
  id: string
  event_id: string
  label: string
  total_seats: number
  available_seats: number
  price: number
  row_count: number
  col_count: number
}

export type SeatStatus = 'available' | 'locked' | 'booked'

export interface Seat {
  id: string
  section_id: string
  row: number
  col: number
  label: string
  status: SeatStatus
}

// ─── Booking ─────────────────────────────────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded'

export interface Booking {
  id: string
  user_id: string
  event_id: string
  seat_ids: string[]
  amount: number
  convenience_fee: number
  total_amount: number
  status: BookingStatus
  qr_token: string | null
  payment_id: string | null
  razorpay_order_id: string | null
  expires_at: string | null
  confirmed_at: string | null
  created_at: string
}

// ─── Payment ─────────────────────────────────────────────────
export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded'

export interface Payment {
  id: string
  booking_id: string
  razorpay_payment_id: string | null
  razorpay_order_id: string
  amount: number
  fee: number
  organiser_payout: number
  status: PaymentStatus
  created_at: string
}

// ─── API Helpers ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// ─── Query Params ────────────────────────────────────────────
export interface EventFilters {
  city?: string
  category?: EventCategory
  date_from?: string
  date_to?: string
  price_min?: number
  price_max?: number
  search?: string
  page?: number
  limit?: number
}
