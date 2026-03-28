-- ─── Promo / Coupon Codes ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  description     TEXT,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('flat','percentage')),
  discount_value  INTEGER NOT NULL CHECK (discount_value > 0),
  max_uses        INTEGER DEFAULT NULL,
  used_count      INTEGER NOT NULL DEFAULT 0,
  min_order       INTEGER NOT NULL DEFAULT 0,
  max_discount    INTEGER DEFAULT NULL,
  event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
  organiser_id    UUID REFERENCES organisers(id) ON DELETE CASCADE,
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until     TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_code ON promo_codes(code) WHERE is_active = true;

-- ─── Referral System ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id     UUID NOT NULL REFERENCES users(id),
  referred_id     UUID NOT NULL REFERENCES users(id),
  referral_code   TEXT NOT NULL,
  coins_awarded   INTEGER NOT NULL DEFAULT 50,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','expired')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Add referral_code to users if not exists
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ─── Review enhancements ─────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
  ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_votes INTEGER DEFAULT 0;
  ALTER TABLE reviews ADD COLUMN IF NOT EXISTS sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive','neutral','negative'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

SELECT 'Feature migrations applied ✅' AS status;
