// ─── Test Constants ─────────────────────────────────────────────
export const BASE_URL = 'http://localhost:3000'
export const API_URL = 'http://localhost:4000/api/v1'

// ─── Test User Data ─────────────────────────────────────────────
export const TEST_USERS = {
  customer: {
    phone: '9876543210',
    name: 'Test Customer',
    role: 'customer' as const,
    loyalty_coins: 50,
  },
  organiser: {
    phone: '9876543211',
    name: 'Test Organiser',
    role: 'organiser' as const,
    loyalty_coins: 100,
  },
  admin: {
    phone: '9876543212',
    name: 'Test Admin',
    role: 'admin' as const,
    loyalty_coins: 0,
  },
}

// ─── Timeouts ───────────────────────────────────────────────────
export const TIMEOUTS = {
  animation: 500,
  debounce: 600,
  toastVisible: 3000,
  otpResend: 30_000,
  paymentProcessing: 3000,
}

// ─── Cities ─────────────────────────────────────────────────────
export const CITIES = ['Pune', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Delhi']

// ─── Event Categories ───────────────────────────────────────────
export const CATEGORIES = [
  'All', 'comedy', 'music', 'sports', 'workshop',
  'theatre', 'food', 'art', 'others',
]

// ─── Routes ─────────────────────────────────────────────────────
export const ROUTES = {
  home: '/',
  events: '/events',
  eventDetail: (id: string) => `/events/${id}`,
  login: '/login',
  profile: '/profile',
  bookings: '/profile/bookings',
  bookingDetail: (id: string) => `/profile/bookings/${id}`,
  bookingPay: (id: string) => `/profile/bookings/${id}/pay`,
  organiserRegister: '/organiser/register',
  organiserDashboard: '/organiser/dashboard',
  organiserEvents: '/organiser/events',
  organiserNewEvent: '/organiser/events/new',
  organiserAnalytics: '/organiser/analytics',
  adminDashboard: '/admin/dashboard',
  adminEvents: '/admin/events',
  adminOrganisers: '/admin/organisers',
  about: '/about',
  blog: '/blog',
  careers: '/careers',
  pricing: '/pricing',
  contact: '/contact',
  enterprise: '/enterprise',
  terms: '/terms',
  privacy: '/privacy',
  refunds: '/refunds',
}

// ─── Payment Methods ────────────────────────────────────────────
export const PAYMENT_METHODS = ['upi', 'card', 'netbanking'] as const

// ─── Test Event Data ────────────────────────────────────────────
export const TEST_EVENT = {
  title: 'Test Comedy Night',
  description: 'A hilarious evening of stand-up comedy featuring top comedians.',
  category: 'comedy',
  city: 'Pune',
  venue_name: 'Phoenix Marketcity',
  venue_address: 'Viman Nagar, Pune',
  price: 499,
}

// ─── Organiser Registration Data ────────────────────────────────
export const TEST_ORGANISER_REGISTRATION = {
  businessName: 'TestEvents Pvt Ltd',
  businessType: 'company',
  contactEmail: 'test@testevents.com',
  contactPhone: '9876543211',
  panNumber: 'ABCDE1234F',
  gstNumber: '27ABCDE1234F1ZK',
  bankAccountNumber: '1234567890123456',
  ifscCode: 'HDFC0001234',
  bankName: 'HDFC Bank',
}
