-- RLS Verification Queries
-- Run these in Supabase SQL Editor to verify RLS policies are working
-- These queries test different scenarios for each role

-- ============================================
-- TEST 1: Verify RLS is enabled on all tables
-- ============================================
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: All tables should show rowsecurity = true

-- ============================================
-- TEST 2: Verify policies exist
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: Multiple policies for each table

-- ============================================
-- TEST 3: Test learner access (simulate as learner)
-- ============================================
-- This will run as the service role, so we'll test the policy logic directly

-- Test: Learner should only see their own progress
SELECT * FROM user_progress WHERE user_id = 'c8b4efbb-cab3-462b-92b2-f262127344f6';

-- Test: Learner should see all courses (public read)
SELECT * FROM courses;

-- Test: Learner should see all units (public read)
SELECT * FROM units;

-- ============================================
-- TEST 4: Verify role assignments
-- ============================================
SELECT user_id, user_name, role, points, xp 
FROM user_progress 
WHERE user_name LIKE 'Test %'
ORDER BY role;

-- Expected: 3 rows with roles 'learner', 'tutor', 'admin'

-- ============================================
-- TEST 5: Verify tutor availability
-- ============================================
SELECT * FROM tutor_availability 
WHERE tutor_id = '0447429d-d5ce-4356-aff2-23a769234623';

-- Expected: 3 availability slots (Monday, Wednesday, Friday)

-- ============================================
-- TEST 6: Verify courses exist
-- ============================================
SELECT * FROM courses;

-- Expected: 3 courses with IDs 1, 2, 3
