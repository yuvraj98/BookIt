-- ============================================================
-- BookIt Platform — Initial Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUM Types ─────────────────────────────────────────────
CREATE TYPE user_role      AS ENUM ('customer', 'organiser', 'admin');
CREATE TYPE event_category AS ENUM (
  'comedy','music','sports','workshop','festival','cinema',
  'theatre','food','art','fitness','tech','business',
  'kids','religious','travel','gaming','nightlife','others'
);
CREATE TYPE event_status   AS ENUM ('draft','pending_approval','approved','cancelled','completed');
CREATE TYPE seat_status    AS ENUM ('available','locked','booked');
CREATE TYPE booking_status AS ENUM ('pending','confirmed','cancelled','refunded');
CREATE TYPE payment_status AS ENUM ('pending','captured','failed','refunded');

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           TEXT UNIQUE NOT NULL,
  name            TEXT,
  email           TEXT,
  city            TEXT DEFAULT 'Pune',
  avatar_url      TEXT,
  role            user_role NOT NULL DEFAULT 'customer',
  loyalty_coins   INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_coins >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Organisers ──────────────────────────────────────────────
CREATE TABLE organisers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name    TEXT NOT NULL,
  gstin            TEXT,
  bank_account     TEXT,
  bank_ifsc        TEXT,
  verified         BOOLEAN NOT NULL DEFAULT false,
  commission_rate  NUMERIC(4,2) NOT NULL DEFAULT 8.00,
  kyc_doc_url      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─── Events ──────────────────────────────────────────────────
CREATE TABLE events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organiser_id     UUID NOT NULL REFERENCES organisers(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  category         event_category NOT NULL,
  subcategory      TEXT,
  city             TEXT NOT NULL DEFAULT 'Pune',
  venue_name       TEXT NOT NULL,
  venue_address    TEXT NOT NULL,
  venue_lat        NUMERIC(10,7),
  venue_lng        NUMERIC(10,7),
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ NOT NULL,
  poster_url       TEXT,
  status           event_status NOT NULL DEFAULT 'draft',
  total_capacity   INTEGER NOT NULL CHECK (total_capacity > 0),
  available_seats  INTEGER NOT NULL,
  min_price        INTEGER NOT NULL DEFAULT 0,
  max_price        INTEGER NOT NULL DEFAULT 0,
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  tags             TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ends_after_starts CHECK (ends_at > starts_at),
  CONSTRAINT seats_lte_capacity CHECK (available_seats <= total_capacity)
);

CREATE INDEX idx_events_city_category ON events(city, category) WHERE status = 'approved';
CREATE INDEX idx_events_starts_at ON events(starts_at) WHERE status = 'approved';
CREATE INDEX idx_events_organiser ON events(organiser_id);

-- ─── Seat Sections ───────────────────────────────────────────
CREATE TABLE seat_sections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label           TEXT NOT NULL,
  total_seats     INTEGER NOT NULL CHECK (total_seats > 0),
  available_seats INTEGER NOT NULL,
  price           INTEGER NOT NULL CHECK (price >= 0),
  row_count       INTEGER NOT NULL DEFAULT 1,
  col_count       INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT section_avail_lte_total CHECK (available_seats <= total_seats)
);

-- ─── Seats ────────────────────────────────────────────────────
CREATE TABLE seats (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES seat_sections(id) ON DELETE CASCADE,
  row_number  INTEGER NOT NULL,
  col_number  INTEGER NOT NULL,
  label       TEXT NOT NULL,
  status      seat_status NOT NULL DEFAULT 'available',
  UNIQUE(section_id, row_number, col_number)
);

CREATE INDEX idx_seats_section_status ON seats(section_id, status);

-- ─── Bookings ────────────────────────────────────────────────
CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id),
  event_id          UUID NOT NULL REFERENCES events(id),
  seat_ids          UUID[] NOT NULL DEFAULT '{}',
  amount            INTEGER NOT NULL,
  convenience_fee   INTEGER NOT NULL DEFAULT 0,
  total_amount      INTEGER NOT NULL,
  status            booking_status NOT NULL DEFAULT 'pending',
  qr_token          TEXT UNIQUE,
  payment_id        TEXT,
  razorpay_order_id TEXT,
  expires_at        TIMESTAMPTZ,
  confirmed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_event ON bookings(event_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ─── Payments ────────────────────────────────────────────────
CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id            UUID NOT NULL REFERENCES bookings(id),
  razorpay_payment_id   TEXT,
  razorpay_order_id     TEXT NOT NULL,
  amount                INTEGER NOT NULL,
  fee                   INTEGER NOT NULL DEFAULT 0,
  organiser_payout      INTEGER NOT NULL DEFAULT 0,
  status                payment_status NOT NULL DEFAULT 'pending',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Reviews ─────────────────────────────────────────────────
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  event_id        UUID NOT NULL REFERENCES events(id),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  sentiment_score NUMERIC(3,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- ─── Notifications log ───────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id),
  type        TEXT NOT NULL,
  channel     TEXT NOT NULL CHECK (channel IN ('whatsapp','email','push')),
  payload     JSONB NOT NULL DEFAULT '{}',
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Admin logs ──────────────────────────────────────────────
CREATE TABLE admin_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES users(id),
  action      TEXT NOT NULL,
  target_id   UUID,
  target_type TEXT,
  reason      TEXT,
  meta        JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── updated_at trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at  BEFORE UPDATE ON users  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews     ENABLE ROW LEVEL SECURITY;

-- Users: can only read/update their own row
CREATE POLICY users_self ON users
  USING (auth.uid() = id);

-- Organisers: can only manage their own record
CREATE POLICY organisers_self ON organisers
  USING (user_id = auth.uid());

-- Events: approved events are public; organiser manages own
CREATE POLICY events_public  ON events FOR SELECT USING (status = 'approved');
CREATE POLICY events_own     ON events USING (
  organiser_id IN (SELECT id FROM organisers WHERE user_id = auth.uid())
);

-- Bookings: users see only their own
CREATE POLICY bookings_self ON bookings USING (user_id = auth.uid());

SELECT 'BookIt schema installed successfully ✅' AS status;
