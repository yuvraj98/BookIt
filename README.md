# 🎫 BookIt — Local Events Ticketing Platform

BookIt is India's local events ticketing platform. Discover upcoming events, book tickets with interactive seat selection, and manage everything from one dashboard.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)

## ✨ Features

### For Attendees
- 🔐 **OTP Login** — Phone-based authentication with JWT tokens
- 🔍 **Event Discovery** — Browse, search, and filter events by category, city, date
- 🪑 **Interactive Seat Selection** — Visual seat map with real-time availability
- 💳 **Payment Simulation** — UPI, Card, Net Banking checkout flow
- 🎟️ **QR Tickets** — Digital QR code tickets for event entry
- 🪙 **Loyalty Coins** — Earn coins on every booking, redeem for discounts
- ❌ **Cancel Bookings** — Self-service cancellation with refund policy
- 🔗 **Social Sharing** — Share events via WhatsApp, Twitter, or copy link
- ⏰ **Live Countdown** — Real-time countdown timer on event pages

### For Organisers
- 📝 **Event Creation** — Rich form with multiple seat sections and pricing
- 📊 **Dashboard** — Overview stats (events, bookings, revenue, payouts)
- 📈 **Revenue Analytics** — Per-event breakdown with commission and net payout
- 📤 **Submit for Approval** — Draft → Submit → Admin review workflow
- 👁️ **Event Management** — View, filter, and track all events

### For Admins
- 🛡️ **Admin Control Center** — Full audit log and platform stats
- ✅ **Event Moderation** — Approve, reject, or take down events
- 👥 **Organiser Verification** — Approve/reject organiser applications
- 🔒 **Role-based Access** — Customers, organisers, and admins

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS |
| **State** | Zustand (auth), TanStack React Query (data) |
| **Backend** | Express.js, TypeScript, Zod validation |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Custom JWT (access + refresh tokens) |
| **Styling** | Tailwind + custom design system (dark theme) |

## 📁 Project Structure

```
Book_It/
├── apps/
│   ├── api/                    # Express.js backend
│   │   └── src/
│   │       ├── routes/         # auth, events, bookings, organisers, admin
│   │       ├── middleware/     # auth, validation, error handling
│   │       └── lib/            # supabase client, logger
│   └── web/                    # Next.js 14 frontend
│       └── src/
│           ├── app/            # 18+ pages (file-based routing)
│           ├── components/     # UI components by domain
│           ├── stores/         # Zustand auth store
│           └── lib/            # API client (axios)
├── packages/
│   └── types/                  # Shared TypeScript types
└── package.json               # Monorepo root
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase project (for database)

### 1. Clone & Install
```bash
git clone https://github.com/yuvraj98/BookIt.git
cd BookIt
npm install
```

### 2. Environment Variables

**Backend** (`apps/api/.env`):
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend
cd apps/api && npm run dev

# Terminal 2: Frontend
cd apps/web && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Home — Hero, categories, featured events, how it works |
| `/events` | Explore — Search, filter, browse all events |
| `/events/[id]` | Event detail — Info, seat selection, booking |
| `/login` | OTP login |
| `/profile` | User profile, coins, quick links |
| `/profile/bookings` | Booking history |
| `/profile/bookings/[id]` | Digital QR ticket view |
| `/profile/bookings/[id]/pay` | Payment simulator |
| `/organiser/dashboard` | Organiser stats & recent events |
| `/organiser/events` | Manage organiser's events |
| `/organiser/events/new` | Create new event form |
| `/organiser/analytics` | Per-event revenue analytics |
| `/organiser/register` | Become an organiser |
| `/admin/dashboard` | Admin control center |
| `/admin/events` | Moderate events |
| `/admin/organisers` | Verify organisers |
| `/about`, `/blog`, `/careers` | Static pages |
| `/pricing`, `/contact`, `/enterprise` | Platform info |
| `/terms`, `/privacy`, `/refunds` | Legal pages |

## 🛠️ API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Send OTP |
| POST | `/api/auth/verify` | Verify OTP & get tokens |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile |
| POST | `/api/auth/refresh` | Refresh access token |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (search, filter, pagination) |
| GET | `/api/events/:id` | Get event detail with seat sections |
| GET | `/api/events/:id/seats` | Get individual seats for a section |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking (lock seats) |
| POST | `/api/bookings/:id/confirm` | Confirm payment |
| POST | `/api/bookings/:id/cancel` | Cancel booking |
| GET | `/api/bookings` | User's bookings |
| GET | `/api/bookings/:id` | Booking detail |

### Organisers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/organisers/register` | Register as organiser |
| GET | `/api/organisers/dashboard/stats` | Dashboard summary stats |
| GET | `/api/organisers/dashboard/analytics` | Per-event revenue analytics |
| POST | `/api/organisers/events` | Create event |
| POST | `/api/organisers/events/:id/submit` | Submit for approval |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform-wide statistics |
| POST | `/api/admin/events/:id/approve` | Approve event |
| POST | `/api/admin/events/:id/reject` | Reject event |
| POST | `/api/admin/events/:id/takedown` | Take down live event |
| POST | `/api/admin/organisers/:id/approve` | Verify organiser |
| POST | `/api/admin/organisers/:id/reject` | Reject organiser |

## 📜 License

This project is for educational and portfolio purposes.

---

Built with ❤️ by [Yuvraj](https://github.com/yuvraj98)
