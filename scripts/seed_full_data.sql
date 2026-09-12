-- Comprehensive Seed Data for SocialLearn
-- Run this in Supabase SQL Editor after schema and RLS are set up
-- This seeds courses, units, lessons, challenges, badges, and tutor availability

-- ============================================
-- BADGES
-- ============================================
INSERT INTO badges (name, description, icon_url, criteria) VALUES
  ('First Step', 'Completed your first level!', '/mascot.svg', '{"type": "level_complete", "count": 1}'::jsonb),
  ('Streak Master', 'Maintained a 3-day streak!', '/mascot.svg', '{"type": "streak", "days": 3}'::jsonb),
  ('Quiz Champion', 'Scored 100% on 3 quizzes!', '/mascot.svg', '{"type": "perfect_quiz", "count": 3}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================
-- COURSES (Ensure Python Programming course exists)
-- ============================================
-- First, delete any existing Python Programming course to avoid duplicates
DELETE FROM courses WHERE title = 'Python Programming';

-- Insert Python Programming course
INSERT INTO courses (title, image_src, category) VALUES
  ('Python Programming', '/python.svg', 'Programming')
RETURNING id, title;

-- ============================================
-- UNITS FOR PYTHON COURSE
-- ============================================
-- Get the Python course ID and insert units
WITH python_course AS (
  SELECT id FROM courses WHERE title = 'Python Programming' LIMIT 1
)
INSERT INTO units (course_id, title, description, "order")
SELECT 
  python_course.id,
  'Unit 1: Python Fundamentals',
  'Learn syntax, variables, data types, and logic',
  1
FROM python_course
UNION ALL
SELECT 
  python_course.id,
  'Unit 2: Functions & Data Structures',
  'Master lists, dicts, functions, and loops',
  2
FROM python_course
RETURNING id, title, course_id;

-- ============================================
-- LESSONS FOR UNIT 1
-- ============================================
-- Get Unit 1 ID and insert lessons
WITH unit1 AS (
  SELECT id FROM units WHERE title = 'Unit 1: Python Fundamentals' LIMIT 1
)
INSERT INTO lessons (unit_id, title, "order", youtube_video_id)
SELECT 
  unit1.id,
  'Variables & Data Types',
  1,
  'kqtD5dpn9C8'
FROM unit1
UNION ALL
SELECT 
  unit1.id,
  'Numbers & Operations',
  2,
  '_uQrJ0TkZlc'
FROM unit1
UNION ALL
SELECT 
  unit1.id,
  'Strings & Print Formatting',
  3,
  'kqtD5dpn9C8'
FROM unit1
RETURNING id, title, unit_id;

-- ============================================
-- CHALLENGES FOR LESSON 1
-- ============================================
-- Get Lesson 1 ID and insert challenges
WITH lesson1 AS (
  SELECT id FROM lessons WHERE title = 'Variables & Data Types' LIMIT 1
)
INSERT INTO challenges (lesson_id, type, question, "order", generated_by)
SELECT
  lesson1.id,
  'SELECT'::type,
  'Which keyword is used to define a variable in Python?',
  1,
  'admin'::generated_by
FROM lesson1
UNION ALL
SELECT
  lesson1.id,
  'SELECT'::type,
  'What is the correct file extension for Python files?',
  2,
  'admin'::generated_by
FROM lesson1
UNION ALL
SELECT
  lesson1.id,
  'ASSIST'::type,
  'print(type(42)) output is <class ''int''>',
  3,
  'admin'::generated_by
FROM lesson1
RETURNING id, question, lesson_id;

-- ============================================
-- CHALLENGE OPTIONS
-- ============================================

-- Options for Challenge 1
WITH challenge1 AS (
  SELECT id FROM challenges WHERE question = 'Which keyword is used to define a variable in Python?' LIMIT 1
)
INSERT INTO challenge_options (challenge_id, text, correct)
SELECT 
  challenge1.id,
  'No keyword needed (just assignment x = 5)',
  true
FROM challenge1
UNION ALL
SELECT 
  challenge1.id,
  'var x = 5',
  false
FROM challenge1
UNION ALL
SELECT 
  challenge1.id,
  'let x = 5',
  false
FROM challenge1;

-- Options for Challenge 2
WITH challenge2 AS (
  SELECT id FROM challenges WHERE question = 'What is the correct file extension for Python files?' LIMIT 1
)
INSERT INTO challenge_options (challenge_id, text, correct)
SELECT 
  challenge2.id,
  '.py',
  true
FROM challenge2
UNION ALL
SELECT 
  challenge2.id,
  '.pt',
  false
FROM challenge2
UNION ALL
SELECT 
  challenge2.id,
  '.pyt',
  false
FROM challenge2;

-- Options for Challenge 3
WITH challenge3 AS (
  SELECT id FROM challenges WHERE question = 'print(type(42)) output is <class ''int''>' LIMIT 1
)
INSERT INTO challenge_options (challenge_id, text, correct)
SELECT 
  challenge3.id,
  'True',
  true
FROM challenge3
UNION ALL
SELECT 
  challenge3.id,
  'False',
  false
FROM challenge3;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify courses
SELECT 'Courses:' as section, id, title, category FROM courses;

-- Verify badges
SELECT 'Badges:' as section, id, name, description FROM badges;

-- Verify units
SELECT 'Units:' as section, id, title, course_id FROM units;

-- Verify lessons
SELECT 'Lessons:' as section, id, title, unit_id, youtube_video_id FROM lessons;

-- Verify challenges
SELECT 'Challenges:' as section, id, question, type, lesson_id FROM challenges;

-- Verify challenge options
SELECT 'Challenge Options:' as section, id, challenge_id, text, correct FROM challenge_options;

-- Verify test accounts
SELECT 'Test Accounts:' as section, user_id, user_name, role FROM user_progress WHERE user_name LIKE 'Test %';

-- Verify tutor availability
SELECT 'Tutor Availability:' as section, id, tutor_id, day_of_week, start_time, end_time FROM tutor_availability;
