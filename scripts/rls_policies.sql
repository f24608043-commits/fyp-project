-- Phase 4: Row Level Security (RLS) Policies for SocialLearn
-- This file enables RLS and creates policies for role-based access control
-- Run this in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COURSES TABLE POLICIES
-- ============================================

-- All authenticated users can read courses
CREATE POLICY "Courses: Public read access" ON courses
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert courses
CREATE POLICY "Courses: Admin insert" ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can update courses
CREATE POLICY "Courses: Admin update" ON courses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can delete courses
CREATE POLICY "Courses: Admin delete" ON courses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- ============================================
-- UNITS TABLE POLICIES
-- ============================================

-- All authenticated users can read units
CREATE POLICY "Units: Public read access" ON units
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert units
CREATE POLICY "Units: Admin insert" ON units
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can update units
CREATE POLICY "Units: Admin update" ON units
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can delete units
CREATE POLICY "Units: Admin delete" ON units
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- ============================================
-- LESSONS TABLE POLICIES
-- ============================================

-- All authenticated users can read lessons
CREATE POLICY "Lessons: Public read access" ON lessons
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert lessons
CREATE POLICY "Lessons: Admin insert" ON lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can update lessons
CREATE POLICY "Lessons: Admin update" ON lessons
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can delete lessons
CREATE POLICY "Lessons: Admin delete" ON lessons
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- ============================================
-- CHALLENGES TABLE POLICIES
-- ============================================

-- All authenticated users can read challenges
CREATE POLICY "Challenges: Public read access" ON challenges
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert challenges
CREATE POLICY "Challenges: Admin insert" ON challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can update challenges
CREATE POLICY "Challenges: Admin update" ON challenges
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can delete challenges
CREATE POLICY "Challenges: Admin delete" ON challenges
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- ============================================
-- CHALLENGE OPTIONS TABLE POLICIES
-- ============================================

-- All authenticated users can read challenge options
CREATE POLICY "Challenge Options: Public read access" ON challenge_options
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert challenge options
CREATE POLICY "Challenge Options: Admin insert" ON challenge_options
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can update challenge options
CREATE POLICY "Challenge Options: Admin update" ON challenge_options
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can delete challenge options
CREATE POLICY "Challenge Options: Admin delete" ON challenge_options
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- ============================================
-- USER PROGRESS TABLE POLICIES
-- ============================================

-- Users can read their own progress
CREATE POLICY "User Progress: Read own" ON user_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Users can read all progress for leaderboard (public info only)
CREATE POLICY "User Progress: Public leaderboard read" ON user_progress
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own progress (on first enrollment)
CREATE POLICY "User Progress: Insert own" ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own progress
CREATE POLICY "User Progress: Update own" ON user_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Only admins can delete user progress
CREATE POLICY "User Progress: Admin delete" ON user_progress
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- ============================================
-- CHALLENGE PROGRESS TABLE POLICIES
-- ============================================

-- Users can read their own challenge progress
CREATE POLICY "Challenge Progress: Read own" ON challenge_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Users can insert their own challenge progress
CREATE POLICY "Challenge Progress: Insert own" ON challenge_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own challenge progress
CREATE POLICY "Challenge Progress: Update own" ON challenge_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- ============================================
-- USER SUBSCRIPTION TABLE POLICIES
-- ============================================

-- Users can read their own subscription
CREATE POLICY "User Subscription: Read own" ON user_subscription
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- System (via service role) can insert subscriptions
CREATE POLICY "User Subscription: Service insert" ON user_subscription
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- System (via service role) can update subscriptions
CREATE POLICY "User Subscription: Service update" ON user_subscription
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- BADGES TABLE POLICIES
-- ============================================

-- All authenticated users can read badges
CREATE POLICY "Badges: Public read access" ON badges
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert badges
CREATE POLICY "Badges: Admin insert" ON badges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can update badges
CREATE POLICY "Badges: Admin update" ON badges
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- Only admins can delete badges
CREATE POLICY "Badges: Admin delete" ON badges
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'admin'
    )
  );

-- ============================================
-- USER BADGES TABLE POLICIES
-- ============================================

-- Users can read their own badges
CREATE POLICY "User Badges: Read own" ON user_badges
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- System can insert user badges (awarded by backend)
CREATE POLICY "User Badges: Service insert" ON user_badges
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================
-- FRIENDSHIPS TABLE POLICIES
-- ============================================

-- Users can read friendships they're involved in
CREATE POLICY "Friendships: Read own" ON friendships
  FOR SELECT
  TO authenticated
  USING (user_id_a = auth.uid()::text OR user_id_b = auth.uid()::text);

-- Users can insert friendship requests
CREATE POLICY "Friendships: Insert own" ON friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id_a = auth.uid()::text);

-- Users can update friendships they're involved in (accept/reject)
CREATE POLICY "Friendships: Update own" ON friendships
  FOR UPDATE
  TO authenticated
  USING (user_id_a = auth.uid()::text OR user_id_b = auth.uid()::text)
  WITH CHECK (user_id_a = auth.uid()::text OR user_id_b = auth.uid()::text);

-- Users can delete friendships they're involved in
CREATE POLICY "Friendships: Delete own" ON friendships
  FOR DELETE
  TO authenticated
  USING (user_id_a = auth.uid()::text OR user_id_b = auth.uid()::text);

-- ============================================
-- FRIEND STREAKS TABLE POLICIES
-- ============================================

-- Users can read friend streaks for their friendships
CREATE POLICY "Friend Streaks: Read own friendships" ON friend_streaks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE friendships.id = friend_streaks.friendship_id
      AND (friendships.user_id_a = auth.uid()::text OR friendships.user_id_b = auth.uid()::text)
    )
  );

-- System can update friend streaks
CREATE POLICY "Friend Streaks: Service update" ON friend_streaks
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TUTOR AVAILABILITY TABLE POLICIES
-- ============================================

-- All authenticated users can read tutor availability
CREATE POLICY "Tutor Availability: Public read access" ON tutor_availability
  FOR SELECT
  TO authenticated
  USING (true);

-- Tutors can insert their own availability
CREATE POLICY "Tutor Availability: Insert own" ON tutor_availability
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tutor_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'tutor'
    )
  );

-- Tutors can update their own availability
CREATE POLICY "Tutor Availability: Update own" ON tutor_availability
  FOR UPDATE
  TO authenticated
  USING (tutor_id = auth.uid()::text)
  WITH CHECK (tutor_id = auth.uid()::text);

-- Tutors can delete their own availability
CREATE POLICY "Tutor Availability: Delete own" ON tutor_availability
  FOR DELETE
  TO authenticated
  USING (tutor_id = auth.uid()::text);

-- ============================================
-- TUTOR SESSIONS TABLE POLICIES
-- ============================================

-- Users can read sessions they're involved in (as tutor or learner)
CREATE POLICY "Tutor Sessions: Read own" ON tutor_sessions
  FOR SELECT
  TO authenticated
  USING (tutor_id = auth.uid()::text OR learner_id = auth.uid()::text);

-- Tutors can insert sessions (as tutor)
CREATE POLICY "Tutor Sessions: Tutor insert" ON tutor_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tutor_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'tutor'
    )
  );

-- Learners can insert session requests
CREATE POLICY "Tutor Sessions: Learner insert" ON tutor_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    learner_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM user_progress
      WHERE user_progress.user_id = auth.uid()::text
      AND user_progress.role = 'learner'
    )
  );

-- Tutors can update sessions they're tutoring
CREATE POLICY "Tutor Sessions: Tutor update" ON tutor_sessions
  FOR UPDATE
  TO authenticated
  USING (tutor_id = auth.uid()::text)
  WITH CHECK (tutor_id = auth.uid()::text);

-- Learners can cancel their own sessions
CREATE POLICY "Tutor Sessions: Learner cancel" ON tutor_sessions
  FOR UPDATE
  TO authenticated
  USING (learner_id = auth.uid()::text)
  WITH CHECK (learner_id = auth.uid()::text);

-- ============================================
-- LIBRARY VIEWS TABLE POLICIES
-- ============================================

-- Users can read their own library views
CREATE POLICY "Library Views: Read own" ON library_views
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Users can insert their own library views
CREATE POLICY "Library Views: Insert own" ON library_views
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- ============================================
-- AI INTERACTIONS TABLE POLICIES
-- ============================================

-- Users can read their own AI interactions
CREATE POLICY "AI Interactions: Read own" ON ai_interactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- System can insert AI interactions
CREATE POLICY "AI Interactions: Service insert" ON ai_interactions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================
-- ENROLLMENTS TABLE POLICIES
-- ============================================

-- Users can read their own enrollments
CREATE POLICY "Enrollments: Read own" ON enrollments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Users can insert their own enrollments
CREATE POLICY "Enrollments: Insert own" ON enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- Users can delete their own enrollments
CREATE POLICY "Enrollments: Delete own" ON enrollments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- ============================================
-- HELPER FUNCTION TO CHECK USER ROLE
-- ============================================

-- Create a function to check user role (useful for complex policies)
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
  SELECT role FROM user_progress WHERE user_progress.user_id = user_id::text;
$$ LANGUAGE sql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;
