# Testing Instructions

## 1. Google OAuth Provider Configuration

To fix the "provider is not enabled" error, you need to configure Google OAuth in Supabase Dashboard:

### Steps:
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers** → **Google**
3. Click **Enable** (toggle must be ON)
4. Configure the following:
   - **Client ID**: Get from Google Cloud Console (OAuth 2.0 Client ID)
   - **Client Secret**: Get from Google Cloud Console
5. Add redirect URLs:
   - Development: `http://localhost:3001/auth/callback`
   - Production: `https://your-domain.com/auth/callback`
6. Click **Save**

### Google Cloud Console Setup (if needed):
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Create **OAuth 2.0 Client ID**
5. Add authorized redirect URIs from Supabase
6. Copy Client ID and Client Secret to Supabase

---

## 2. Role-Based Redirects Test

### Test with Three Different Accounts:

**Learner Account:**
1. Sign out if currently signed in
2. Go to `/sign-in`
3. Sign in with learner credentials
4. **Expected:** Redirect to `/path`
5. **Expected:** See learner navigation (Path, Library, Live, Leaderboard, Profile)

**Tutor Account:**
1. Sign out
2. Go to `/sign-in`
3. Sign in with tutor credentials
4. **Expected:** Redirect to `/tutor/dashboard`
5. **Expected:** See tutor navigation (Dashboard, Sessions, Availability, Learners, Profile)
6. **Expected:** See tutor dashboard with pending session requests

**Admin Account:**
1. Sign out
2. Go to `/sign-in`
3. Sign in with admin credentials
4. **Expected:** Redirect to `/admin/admin-home`
5. **Expected:** See admin navigation (Dashboard, Users, Courses, Badges, Sessions, Analytics, Settings)
6. **Expected:** See admin dashboard with platform statistics

### If Redirects Don't Work:
Check the `user_progress` table in Supabase:
- Verify `role` field is correctly set for each account
- Learner: `role = 'learner'`
- Tutor: `role = 'tutor'`
- Admin: `role = 'admin'`

---

## 3. Google Sign-In Flow Test

### Steps:
1. Ensure Google OAuth is configured (see section 1)
2. Go to `/sign-in`
3. Click "Continue with Google"
4. Sign in with a **NEW** Google account (not already in system)
5. After OAuth redirect:
   - **Expected:** Redirect to `/onboarding`
   - **Expected:** See onboarding flow to select a course
6. Complete onboarding
7. **Expected:** Redirect to `/path`
8. Check Supabase `user_progress` table:
   - **Expected:** New row created with `role = 'learner'`
   - **Expected:** `userId` matches the Google auth user ID

---

## 4. Forgot-Password Flow Test

### Steps:
1. Go to `/sign-in`
2. Click "Forgot password?"
3. Enter a real test account's email
4. Click "Send reset link"
5. **Expected:** Success message "Password reset email sent"
6. Check Supabase Dashboard:
   - Go to **Authentication** → **Logs**
   - Look for email delivery log
   - Or check your email inbox for reset link
7. Click the reset link from email
8. Enter new password and confirm
9. Click "Reset password"
10. **Expected:** Success message "Password reset successfully"
11. Try signing in with new password
12. **Expected:** Sign in successful

---

## 5. Tutor/Admin Interface Investigation

### If you see learner interface as tutor/admin:

**Check 1: Verify Role in Database**
```sql
SELECT id, userId, userName, role FROM user_progress;
```
- Ensure tutor account has `role = 'tutor'`
- Ensure admin account has `role = 'admin'`

**Check 2: Direct URL Access**
- Try accessing `/tutor/dashboard` directly
- Try accessing `/admin/admin-home` directly
- If redirected to `/path`, role check is failing

**Check 3: Sign-In Redirect**
- Sign in with tutor account → what URL?
- Sign in with admin account → what URL?

**Check 4: Navigation Components**
- If you see learner navigation (Path, Library, etc.) on tutor/admin pages, the navigation component may not be loading correctly

---

## 6. Admin Pages Verification

### Test Admin Pages Work:

**Course Management:**
1. Go to `/admin/course-management`
2. **Expected:** See list of courses
3. Try creating a new course
4. **Expected:** Course created successfully

**Badge Management:**
1. Go to `/admin/badges`
2. **Expected:** See list of badges
3. Try creating a new badge
4. **Expected:** Badge created successfully

**User Management:**
1. Go to `/admin/users`
2. **Expected:** See list of users with roles
3. Try changing a user's role
4. **Expected:** Role updated successfully

---

## Report Results

After testing, please report back with:
1. ✅/❌ Google OAuth configuration status
2. ✅/❌ Role-based redirect results for each role
3. ✅/❌ Google sign-in flow results
4. ✅/❌ Forgot-password flow results
5. ✅/❌ Tutor/admin interface status (what you see)
6. ✅/❌ Admin pages functionality
