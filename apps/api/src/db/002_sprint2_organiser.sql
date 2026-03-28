-- ============================================================
-- BookIt Platform — Sprint 2 Schema Additions
-- Run this in Supabase SQL editor AFTER 001_initial_schema.sql
-- ============================================================

-- Add extra columns to organisers for richer profile + admin flow
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Pune';
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS kyc_doc_type TEXT DEFAULT 'aadhaar';
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id);
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE organisers ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_organisers_verified ON organisers(verified);
CREATE INDEX IF NOT EXISTS idx_organisers_created ON organisers(created_at DESC);

-- File uploads tracking table
CREATE TABLE IF NOT EXISTS file_uploads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id),
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  file_size   INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  public_url  TEXT NOT NULL,
  purpose     TEXT NOT NULL CHECK (purpose IN ('kyc', 'event_poster', 'avatar', 'organiser_logo')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for file_uploads
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY uploads_self ON file_uploads USING (user_id = auth.uid());

-- Create Supabase Storage bucket (run manually in Supabase dashboard or via CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('bookit-uploads', 'bookit-uploads', true);

SELECT 'Sprint 2 schema applied ✅' AS status;
