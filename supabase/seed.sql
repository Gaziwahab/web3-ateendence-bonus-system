-- ==============================================================================
-- ATTENDANCE-LINKED INCENTIVE PROGRAM - SAMPLE SEED DATA
-- ==============================================================================
-- Note: In production Supabase, users are created via Supabase Auth (or the Register page).
-- This script provides sample records for profiles, subjects, attendance, and rewards
-- using dummy UUIDs for immediate demonstration.

-- Ensure reward rules exist
INSERT INTO public.reward_rules (minimum_percentage, maximum_percentage, reward_points)
VALUES 
    (0.00, 74.99, 0),
    (75.00, 89.99, 20),
    (90.00, 100.00, 50)
ON CONFLICT DO NOTHING;

-- To insert dummy profiles directly without auth.users (for local/SQL testing with bypass):
-- In Supabase dashboard SQL editor, you can test queries against the schema.
