-- =========================================================
-- SocialLearn: Row Level Security (RLS) & Role-Based Policies
-- =========================================================

-- Helper function to fetch current authenticated user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS 
  SELECT COALESCE(
    (SELECT role FROM public.user_progress WHERE user_id = auth.uid()::text),
    'learner'
  );
;

-- 1. Enable RLS on all tables
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.challenge_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.friend_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.library_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enrollments ENABLE ROW LEVEL SECURITY;

-- 2. Public Content Policies (Courses, Units, Lessons, Challenges, Options, Badges)
-- Anyone authenticated can view content
DROP POLICY IF EXISTS "Public can view courses" ON public.courses;
CREATE POLICY "Public can view courses" ON public.courses
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Tutor and Admin can manage courses" ON public.courses;
CREATE POLICY "Tutor and Admin can manage courses" ON public.courses
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'tutor'))
  WITH CHECK (public.current_user_role() IN ('admin', 'tutor'));

DROP POLICY IF EXISTS "Public can view units" ON public.units;
CREATE POLICY "Public can view units" ON public.units
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Tutor and Admin can manage units" ON public.units;
CREATE POLICY "Tutor and Admin can manage units" ON public.units
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'tutor'))
  WITH CHECK (public.current_user_role() IN ('admin', 'tutor'));

DROP POLICY IF EXISTS "Public can view lessons" ON public.lessons;
CREATE POLICY "Public can view lessons" ON public.lessons
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Tutor and Admin can manage lessons" ON public.lessons;
CREATE POLICY "Tutor and Admin can manage lessons" ON public.lessons
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'tutor'))
  WITH CHECK (public.current_user_role() IN ('admin', 'tutor'));

DROP POLICY IF EXISTS "Public can view challenges" ON public.challenges;
CREATE POLICY "Public can view challenges" ON public.challenges
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Tutor and Admin can manage challenges" ON public.challenges;
CREATE POLICY "Tutor and Admin can manage challenges" ON public.challenges
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'tutor'))
  WITH CHECK (public.current_user_role() IN ('admin', 'tutor'));

DROP POLICY IF EXISTS "Public can view challenge_options" ON public.challenge_options;
CREATE POLICY "Public can view challenge_options" ON public.challenge_options
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Tutor and Admin can manage challenge_options" ON public.challenge_options;
CREATE POLICY "Tutor and Admin can manage challenge_options" ON public.challenge_options
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'tutor'))
  WITH CHECK (public.current_user_role() IN ('admin', 'tutor'));

DROP POLICY IF EXISTS "Public can view badges" ON public.badges;
CREATE POLICY "Public can view badges" ON public.badges
  FOR SELECT TO authenticated USING (true);

-- 3. User Progress & Challenge Progress Policies
DROP POLICY IF EXISTS "Users can view own progress and leaderboard" ON public.user_progress;
CREATE POLICY "Users can view own progress and leaderboard" ON public.user_progress
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id OR true); -- Leaderboard queries need public progress display

DROP POLICY IF EXISTS "Users can insert/update own progress" ON public.user_progress;
CREATE POLICY "Users can insert/update own progress" ON public.user_progress
  FOR ALL TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can manage own challenge progress" ON public.challenge_progress;
CREATE POLICY "Users can manage own challenge progress" ON public.challenge_progress
  FOR ALL TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- 4. Social, Library, Enrollments & AI Logging
DROP POLICY IF EXISTS "Users can manage own enrollments" ON public.enrollments;
CREATE POLICY "Users can manage own enrollments" ON public.enrollments
  FOR ALL TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can log library views" ON public.library_views;
CREATE POLICY "Users can log library views" ON public.library_views
  FOR ALL TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can log AI interactions" ON public.ai_interactions;
CREATE POLICY "Users can log AI interactions" ON public.ai_interactions
  FOR ALL TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id OR true);

DROP POLICY IF EXISTS "System can award user badges" ON public.user_badges;
CREATE POLICY "System can award user badges" ON public.user_badges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- 5. Friendships & Streaks
DROP POLICY IF EXISTS "Users can view own friendships" ON public.friendships;
CREATE POLICY "Users can view own friendships" ON public.friendships
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id_a OR auth.uid()::text = user_id_b);

DROP POLICY IF EXISTS "Users can create/update own friendships" ON public.friendships;
CREATE POLICY "Users can create/update own friendships" ON public.friendships
  FOR ALL TO authenticated
  USING (auth.uid()::text = user_id_a OR auth.uid()::text = user_id_b)
  WITH CHECK (auth.uid()::text = user_id_a OR auth.uid()::text = user_id_b);

DROP POLICY IF EXISTS "Users can view friend streaks" ON public.friend_streaks;
CREATE POLICY "Users can view friend streaks" ON public.friend_streaks
  FOR ALL TO authenticated
  USING (true);

-- 6. Tutors & Sessions
DROP POLICY IF EXISTS "Anyone can view tutor availability" ON public.tutor_availability;
CREATE POLICY "Anyone can view tutor availability" ON public.tutor_availability
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Tutors can manage own availability" ON public.tutor_availability;
CREATE POLICY "Tutors can manage own availability" ON public.tutor_availability
  FOR ALL TO authenticated
  USING (auth.uid()::text = tutor_id AND public.current_user_role() IN ('tutor', 'admin'))
  WITH CHECK (auth.uid()::text = tutor_id AND public.current_user_role() IN ('tutor', 'admin'));

DROP POLICY IF EXISTS "Users and tutors can view own sessions" ON public.tutor_sessions;
CREATE POLICY "Users and tutors can view own sessions" ON public.tutor_sessions
  FOR SELECT TO authenticated
  USING (auth.uid()::text = learner_id OR auth.uid()::text = tutor_id OR public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Learners can book sessions" ON public.tutor_sessions;
CREATE POLICY "Learners can book sessions" ON public.tutor_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = learner_id);

DROP POLICY IF EXISTS "Learners and tutors can update sessions" ON public.tutor_sessions;
CREATE POLICY "Learners and tutors can update sessions" ON public.tutor_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = learner_id OR auth.uid()::text = tutor_id OR public.current_user_role() = 'admin');
