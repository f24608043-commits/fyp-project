-- Phase 4: Test Accounts Setup for RLS Verification
-- This script creates test accounts with different roles (learner, tutor, admin)
-- Run this in Supabase SQL Editor AFTER running rls_policies.sql
-- 
-- IMPORTANT: Replace the placeholder UUIDs below with actual Supabase user IDs
-- You can get user IDs from the Supabase Dashboard > Authentication > Users
-- Or by creating users via Supabase Auth and copying their IDs

-- ============================================
-- TEST ACCOUNT UUIDS (REPLACE WITH ACTUAL IDs)
-- ============================================

-- Learner test account (learner@gmail.com)
DO $$
DECLARE
  learner_user_id text := 'c8b4efbb-cab3-462b-92b2-f262127344f6';
BEGIN
  INSERT INTO user_progress (user_id, user_name, role, active_course_id, hearts, points, xp)
  VALUES (
    learner_user_id,
    'Test Learner',
    'learner',
    1, -- Assuming course ID 1 exists
    5,
    100,
    100
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'learner',
    user_name = 'Test Learner';

  RAISE NOTICE 'Learner account created/updated with ID: %', learner_user_id;
END $$;

-- Tutor test account (tutor@gmail.com)
DO $$
DECLARE
  tutor_user_id text := '0447429d-d5ce-4356-aff2-23a769234623';
BEGIN
  INSERT INTO user_progress (user_id, user_name, role, active_course_id, hearts, points, xp)
  VALUES (
    tutor_user_id,
    'Test Tutor',
    'tutor',
    1, -- Assuming course ID 1 exists
    5,
    500,
    500
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'tutor',
    user_name = 'Test Tutor';

  RAISE NOTICE 'Tutor account created/updated with ID: %', tutor_user_id;
END $$;

-- Admin test account (junaidkhan@gmail.com)
DO $$
DECLARE
  admin_user_id text := '6c528f5a-d757-4095-9032-b94d6e91d320';
BEGIN
  INSERT INTO user_progress (user_id, user_name, role, active_course_id, hearts, points, xp)
  VALUES (
    admin_user_id,
    'Test Admin',
    'admin',
    1, -- Assuming course ID 1 exists
    999,
    1000,
    1000
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    user_name = 'Test Admin';

  RAISE NOTICE 'Admin account created/updated with ID: %', admin_user_id;
END $$;

-- ============================================
-- ADD TUTOR AVAILABILITY FOR TEST TUTOR
-- ============================================

DO $$
DECLARE
  tutor_user_id text := '0447429d-d5ce-4356-aff2-23a769234623'; 
BEGIN
  INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time)
  VALUES
    (tutor_user_id, 1, '10:00', '11:00'), -- Monday
    (tutor_user_id, 3, '14:00', '15:00'), -- Wednesday
    (tutor_user_id, 5, '16:00', '17:00')  -- Friday
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Tutor availability added for tutor ID: %', tutor_user_id;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify roles were set correctly
SELECT user_id, user_name, role, points, xp 
FROM user_progress 
WHERE user_name LIKE 'Test %'
ORDER BY role;

-- Verify tutor availability
SELECT * FROM tutor_availability 
WHERE tutor_id = '0447429d-d5ce-4356-aff2-23a769234623'; 

-- ============================================
-- INSTRUCTIONS FOR USE
-- ============================================

/*
STEPS TO USE THIS SCRIPT:

1. Create test users in Supabase Dashboard:
   - Go to Supabase Dashboard > Authentication > Users
   - Create 3 users (learner@test.com, tutor@test.com, admin@test.com)
   - Copy each user's UUID from the dashboard

2. Replace placeholders in this script:
   - Replace 'LEARNER_USER_ID_PLACEHOLDER' with learner's UUID
   - Replace 'TUTOR_USER_ID_PLACEHOLDER' with tutor's UUID
   - Replace 'ADMIN_USER_ID_PLACEHOLDER' with admin's UUID

3. Run this script in Supabase SQL Editor

4. Verify the accounts were created:
   SELECT * FROM user_progress WHERE user_name LIKE 'Test %';

5. Test RLS policies by logging in as each user and running queries:
   - As learner: Should only read/write their own data
   - As tutor: Should read public data + manage their availability
   - As admin: Should have full CRUD access to all tables
*/
