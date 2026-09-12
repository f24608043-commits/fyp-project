# RLS Verification Guide

## Overview
This guide explains how to verify that Row Level Security (RLS) policies are working correctly for the SocialLearn platform.

## Prerequisites

1. **Run RLS Policies**: Execute `scripts/rls_policies.sql` in Supabase SQL Editor
2. **Create Test Accounts**: Execute `scripts/setup_test_accounts.sql` in Supabase SQL Editor
3. **Have Test User IDs**: Note the UUIDs of your test learner, tutor, and admin accounts

## Verification Steps

### Step 1: Verify RLS is Enabled

Run this query in Supabase SQL Editor:

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected Result**: All tables should show `rowsecurity = true`

### Step 2: Verify Policies Exist

```sql
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
```

**Expected Result**: Multiple policies for each table (courses, units, lessons, challenges, etc.)

### Step 3: Test as Learner

**Login as Learner** (use Supabase Auth or set `auth.uid()` context):

```sql
-- SET LOCAL ROLE to simulate learner (in Supabase SQL Editor, use "Set role" dropdown)
-- Or test via application by logging in as learner@test.com

-- Should PASS: Read own progress
SELECT * FROM user_progress WHERE user_id = 'LEARNER_UUID';

-- Should PASS: Read all courses (public read)
SELECT * FROM courses;

-- Should FAIL: Insert course (learner not admin)
INSERT INTO courses (title, image_src) VALUES ('Test', '/test.svg');

-- Should FAIL: Update another user's progress
UPDATE user_progress SET points = 999 WHERE user_id = 'OTHER_USER_UUID';

-- Should PASS: Update own progress
UPDATE user_progress SET points = 150 WHERE user_id = 'LEARNER_UUID';
```

### Step 4: Test as Tutor

**Login as Tutor**:

```sql
-- Should PASS: Read all courses
SELECT * FROM courses;

-- Should PASS: Insert own availability
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time)
VALUES ('TUTOR_UUID', 2, '10:00', '11:00');

-- Should FAIL: Insert course (tutor not admin)
INSERT INTO courses (title, image_src) VALUES ('Test', '/test.svg');

-- Should PASS: Update own availability
UPDATE tutor_availability SET start_time = '11:00' WHERE tutor_id = 'TUTOR_UUID';

-- Should FAIL: Update another tutor's availability
UPDATE tutor_availability SET start_time = '11:00' WHERE tutor_id = 'OTHER_TUTOR_UUID';
```

### Step 5: Test as Admin

**Login as Admin**:

```sql
-- Should PASS: Read all courses
SELECT * FROM courses;

-- Should PASS: Insert course
INSERT INTO courses (title, image_src, category) VALUES ('New Course', '/new.svg', 'programming');

-- Should PASS: Update course
UPDATE courses SET title = 'Updated Course' WHERE id = 1;

-- Should PASS: Delete course (be careful!)
-- DELETE FROM courses WHERE id = 1;

-- Should PASS: Read any user's progress
SELECT * FROM user_progress;
```

### Step 6: Test Cross-Role Access

```sql
-- As learner, try to read admin-only data
-- Should FAIL or return empty
SELECT * FROM user_progress WHERE role = 'admin';

-- As tutor, try to insert challenge
-- Should FAIL (only admins can insert challenges)
INSERT INTO challenges (lesson_id, type, question, order)
VALUES (1, 'SELECT', 'Test question', 1);
```

### Step 7: Test Friendships

```sql
-- As learner, create friendship request
INSERT INTO friendships (user_id_a, user_id_b, status)
VALUES ('LEARNER_UUID', 'TUTOR_UUID', 'pending');

-- As learner, read own friendships
SELECT * FROM friendships WHERE user_id_a = 'LEARNER_UUID' OR user_id_b = 'LEARNER_UUID';

-- As learner, try to read others' friendships
-- Should FAIL or return empty
SELECT * FROM friendships WHERE user_id_a = 'OTHER_USER_UUID';
```

### Step 8: Test Tutor Sessions

```sql
-- As learner, request session
INSERT INTO tutor_sessions (tutor_id, learner_id, course_id, scheduled_at, status)
VALUES ('TUTOR_UUID', 'LEARNER_UUID', 1, NOW() + INTERVAL '1 day', 'requested');

-- As tutor, accept session
UPDATE tutor_sessions SET status = 'confirmed' WHERE tutor_id = 'TUTOR_UUID';

-- As learner, cancel own session
UPDATE tutor_sessions SET status = 'cancelled' WHERE learner_id = 'LEARNER_UUID';

-- As learner, try to cancel another's session
-- Should FAIL
UPDATE tutor_sessions SET status = 'cancelled' WHERE learner_id = 'OTHER_LEARNER_UUID';
```

## Common Issues & Solutions

### Issue: "Permission denied" on all queries
**Cause**: RLS not enabled or policies not created
**Solution**: Run `scripts/rls_policies.sql` again

### Issue: Can't insert own user_progress
**Cause**: User doesn't exist in auth.users or user_id mismatch
**Solution**: Ensure user is created in Supabase Auth and UUID matches

### Issue: Admin can't perform admin operations
**Cause**: Admin role not set in user_progress table
**Solution**: Run `scripts/setup_test_accounts.sql` to set roles

### Issue: Tutor can't manage availability
**Cause**: Tutor role not set or user_id mismatch
**Solution**: Verify role = 'tutor' in user_progress and tutor_id matches

## Automated Verification Script

```sql
-- Run this to check if basic RLS is working
DO $$
DECLARE
  policy_count int;
BEGIN
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  
  IF policy_count > 0 THEN
    RAISE NOTICE '✓ RLS policies exist: % policies found', policy_count;
  ELSE
    RAISE NOTICE '✗ No RLS policies found. Run rls_policies.sql';
  END IF;
  
  -- Check if role column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' AND column_name = 'role'
  ) THEN
    RAISE NOTICE '✓ role column exists in user_progress';
  ELSE
    RAISE NOTICE '✗ role column missing. Run schema migration';
  END IF;
END $$;
```

## Next Steps After Verification

Once RLS is verified working:

1. **Remove test accounts** (optional): Delete test users from auth and user_progress
2. **Update admin creation flow**: Ensure new admins are created via secure method
3. **Document role assignment process**: How to promote users to tutor/admin
4. **Test in production**: Verify RLS works with real user sessions

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Policies exist for all tables
- [ ] Learners can only access their own data
- [ ] Tutors can manage their availability
- [ ] Admins have full CRUD access
- [ ] Public read access works for courses/units/lessons
- [ ] Friendships are isolated to involved users
- [ ] Tutor sessions are isolated to tutor/learner
- [ ] Service role can insert system data (subscriptions, badges)
- [ ] No policy allows arbitrary data access
