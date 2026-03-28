-- ============================================================
-- BookIt Platform — Sprint 3 Schema Additions
-- Run this in Supabase SQL editor AFTER 002_sprint2_organiser.sql
-- ============================================================

-- RPC to safely decrement available_seats on a seat_section
CREATE OR REPLACE FUNCTION decrement_available_seats(p_section_id UUID, p_count INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE seat_sections
  SET available_seats = GREATEST(available_seats - p_count, 0)
  WHERE id = p_section_id;

  -- Also update the parent event's available_seats
  UPDATE events
  SET available_seats = GREATEST(available_seats - p_count, 0)
  WHERE id = (SELECT event_id FROM seat_sections WHERE id = p_section_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to safely increment available_seats (for cancellation)
CREATE OR REPLACE FUNCTION increment_available_seats(p_section_id UUID, p_count INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE seat_sections
  SET available_seats = LEAST(available_seats + p_count, total_seats)
  WHERE id = p_section_id;

  UPDATE events
  SET available_seats = LEAST(available_seats + p_count, total_capacity)
  WHERE id = (SELECT event_id FROM seat_sections WHERE id = p_section_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to increment loyalty coins
CREATE OR REPLACE FUNCTION increment_loyalty_coins(p_user_id UUID, p_coins INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET loyalty_coins = loyalty_coins + p_coins
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin event approval/rejection to admin routes
-- Allow admins to approve events
CREATE OR REPLACE FUNCTION approve_event(p_event_id UUID, p_admin_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events SET status = 'approved' WHERE id = p_event_id AND status = 'pending_approval';
  INSERT INTO admin_logs (admin_id, action, target_id, target_type, reason)
  VALUES (p_admin_id, 'event_approved', p_event_id, 'event', 'Approved');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Sprint 3 schema applied ✅' AS status;
