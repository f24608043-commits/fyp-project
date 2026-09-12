-- Seed initial course data
-- Run this in Supabase SQL Editor before setup_test_accounts.sql

INSERT INTO courses (title, image_src, category) VALUES
  ('Programming Fundamentals', '/courses/programming.svg', 'programming'),
  ('Web Development', '/courses/web-dev.svg', 'programming'),
  ('Data Science', '/courses/data-science.svg', 'programming')
ON CONFLICT DO NOTHING;

-- Verify the courses were inserted
SELECT * FROM courses;
