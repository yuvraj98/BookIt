-- ============================================================
-- BookIt Platform — Movie Booking Schema
-- 005_movie_booking.sql
-- Run this in your Supabase SQL editor
-- ============================================================

-- ─── New ENUM Types ─────────────────────────────────────────
CREATE TYPE screen_type    AS ENUM ('2D','3D','IMAX','4DX','DOLBY_ATMOS');
CREATE TYPE seat_category  AS ENUM ('RECLINER','GOLD','SILVER','ECONOMY');
CREATE TYPE movie_status   AS ENUM ('now_showing','coming_soon','ended');
CREATE TYPE movie_lang     AS ENUM ('Hindi','English','Marathi','Tamil','Telugu','Kannada','Malayalam','Bengali');

-- ─── Movies ─────────────────────────────────────────────────
CREATE TABLE movies (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  genre             TEXT[] NOT NULL DEFAULT '{}',
  language          movie_lang NOT NULL DEFAULT 'English',
  duration_minutes  INTEGER NOT NULL CHECK (duration_minutes > 0),
  release_date      DATE NOT NULL,
  director          TEXT,
  cast_members      TEXT[] DEFAULT '{}',
  poster_url        TEXT,
  trailer_url       TEXT,
  imdb_rating       NUMERIC(3,1),
  cbfc_rating       TEXT DEFAULT 'UA',   -- U, A, UA, S
  status            movie_status NOT NULL DEFAULT 'coming_soon',
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  tags              TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movies_status ON movies(status);
CREATE INDEX idx_movies_featured ON movies(is_featured) WHERE is_featured = true;

-- ─── Theatres ───────────────────────────────────────────────
CREATE TABLE theatres (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  address          TEXT NOT NULL,
  city             TEXT NOT NULL DEFAULT 'Pune',
  lat              NUMERIC(10,7),
  lng              NUMERIC(10,7),
  amenities        TEXT[] DEFAULT '{}',   -- e.g. ['parking','food_court','wheelchair']
  parking          BOOLEAN DEFAULT true,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_theatres_city ON theatres(city) WHERE is_active = true;

-- ─── Screens ────────────────────────────────────────────────
CREATE TABLE screens (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theatre_id       UUID NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
  screen_number    INTEGER NOT NULL,
  screen_type      screen_type NOT NULL DEFAULT '2D',
  total_rows       INTEGER NOT NULL,
  total_cols       INTEGER NOT NULL,
  UNIQUE(theatre_id, screen_number)
);

-- ─── Screen Layout (seat template per screen) ────────────────
CREATE TABLE screen_seats (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  screen_id        UUID NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  row_label        TEXT NOT NULL,          -- A, B, C... or 1,2,3
  col_number       INTEGER NOT NULL,
  label            TEXT NOT NULL,          -- A1, A2, B1...
  category         seat_category NOT NULL DEFAULT 'SILVER',
  is_available     BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(screen_id, row_label, col_number)
);

CREATE INDEX idx_screen_seats_screen ON screen_seats(screen_id, category);

-- ─── Shows (a movie playing at a specific screen + time) ─────
CREATE TABLE shows (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id         UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  screen_id        UUID NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  show_date        DATE NOT NULL,
  show_time        TIME NOT NULL,
  language         movie_lang NOT NULL DEFAULT 'English',
  subtitle_lang    TEXT,
  -- Pricing per category
  price_recliner   INTEGER NOT NULL DEFAULT 600,
  price_gold       INTEGER NOT NULL DEFAULT 350,
  price_silver     INTEGER NOT NULL DEFAULT 250,
  price_economy    INTEGER NOT NULL DEFAULT 150,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shows_movie_date ON shows(movie_id, show_date);
CREATE INDEX idx_shows_screen ON shows(screen_id, show_date);

-- ─── Show Seats (instance of seats for each show) ────────────
-- Generated from screen_seats when a show is created
CREATE TABLE show_seats (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id          UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  screen_seat_id   UUID NOT NULL REFERENCES screen_seats(id) ON DELETE CASCADE,
  label            TEXT NOT NULL,
  row_label        TEXT NOT NULL,
  col_number       INTEGER NOT NULL,
  category         seat_category NOT NULL,
  price            INTEGER NOT NULL,
  status           seat_status NOT NULL DEFAULT 'available',
  locked_at        TIMESTAMPTZ,
  UNIQUE(show_id, screen_seat_id)
);

CREATE INDEX idx_show_seats_show_status ON show_seats(show_id, status);
CREATE INDEX idx_show_seats_show_cat ON show_seats(show_id, category, status);

-- ─── Movie Bookings ──────────────────────────────────────────
CREATE TABLE movie_bookings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  show_id          UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  seat_ids         UUID[] NOT NULL,
  amount           INTEGER NOT NULL,         -- base amount
  convenience_fee  INTEGER NOT NULL DEFAULT 0,
  total_amount     INTEGER NOT NULL,
  status           booking_status NOT NULL DEFAULT 'pending',
  qr_token         TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  expires_at       TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movie_bookings_user ON movie_bookings(user_id, created_at DESC);
CREATE INDEX idx_movie_bookings_show ON movie_bookings(show_id, status);

-- ─── RLS Policies ────────────────────────────────────────────
ALTER TABLE movies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE theatres        ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens         ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_seats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows           ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_seats      ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_bookings  ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "public_movies"       ON movies       FOR SELECT USING (true);
CREATE POLICY "public_theatres"     ON theatres     FOR SELECT USING (true);
CREATE POLICY "public_screens"      ON screens      FOR SELECT USING (true);
CREATE POLICY "public_screen_seats" ON screen_seats FOR SELECT USING (true);
CREATE POLICY "public_shows"        ON shows        FOR SELECT USING (true);
CREATE POLICY "public_show_seats"   ON show_seats   FOR SELECT USING (true);

-- User-level policies
CREATE POLICY "booking_owner" ON movie_bookings
  FOR ALL USING (auth.uid()::TEXT = user_id::TEXT);

-- Service role bypass (for API inserts)
CREATE POLICY "service_movie_bookings"  ON movie_bookings  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_show_seats"      ON show_seats      FOR ALL USING (true) WITH CHECK (true);

-- ─── Function: Lock show seats ────────────────────────────────
CREATE OR REPLACE FUNCTION lock_show_seats(
  p_show_id UUID,
  p_seat_ids UUID[]
)
RETURNS VOID AS $$
BEGIN
  UPDATE show_seats
  SET status = 'locked', locked_at = NOW()
  WHERE show_id = p_show_id
    AND id = ANY(p_seat_ids)
    AND status = 'available';
END;
$$ LANGUAGE plpgsql;

-- ─── Function: Confirm book show seats ───────────────────────
CREATE OR REPLACE FUNCTION confirm_show_seats(
  p_show_id UUID,
  p_seat_ids UUID[]
)
RETURNS VOID AS $$
BEGIN
  UPDATE show_seats
  SET status = 'booked'
  WHERE show_id = p_show_id
    AND id = ANY(p_seat_ids)
    AND status = 'locked';
END;
$$ LANGUAGE plpgsql;

-- ─── Function: Release expired locks ─────────────────────────
CREATE OR REPLACE FUNCTION release_expired_movie_locks()
RETURNS VOID AS $$
BEGIN
  UPDATE show_seats
  SET status = 'available', locked_at = NULL
  WHERE status = 'locked'
    AND locked_at < NOW() - INTERVAL '15 minutes';
END;
$$ LANGUAGE plpgsql;
