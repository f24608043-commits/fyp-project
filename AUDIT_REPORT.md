# LEGO — Full Technical Audit Report

**Date:** September 15, 2026  
**Audit Phase:** PHASE 0 - Full Technical Audit  
**Status:** IN PROGRESS

---

## EXECUTIVE SUMMARY

**Overall Assessment:** The application has a solid foundation with proper route groups, database schema, and role-based access control. However, there are **CRITICAL** issues affecting performance, authentication flow, and role separation that must be addressed before proceeding with feature enhancements.

---

## 🔴 CRITICAL / MAJOR ISSUES

### 1. DUPLICATE AUTHENTICATION QUERIES (PERFORMANCE)

**Problem:** Multiple sequential database requests for user authentication and role data across layouts and queries.

**Root Cause:**
- `getUser()` is called independently in:
  - `lib/supabase/server.ts` (exported function)
  - `getUserProgress()` (line 30)
  - `getUnits()` (line 44)
  - `getCourseProgress()` (line 117)
  - `getLesson()` (line 170)
  - `getTopTenUsers()` (line 226)
  - `getUserBadges()` (line 249)
  - `getFriendships()` (line 263)
  - `getUserTutorSessions()` (line 304)
- Each query function calls `getUser()` independently, causing repeated Supabase auth checks
- Layouts also call `getUser()` separately

**Impact:**
- Sign-in flow is slow due to sequential auth → profile → role → data requests
- Dashboard navigation experiences unnecessary delays
- Increased database load
- Poor user experience

**Affected Routes:**
- `/path` - calls getUser, getUserProgress, getUnits, getCourseProgress, getLessonPercentage (5 getUser calls)
- `/tutor/dashboard` - calls getUser, getUserProgress (2 getUser calls)
- `/admin/*` - calls getUser, getUserProgress (2 getUser calls)

**Recommended Solution:**
Create a consolidated server-side auth context that fetches user + profile + role in a single cached call, then pass to query functions as needed.

**Status:** MAJOR BLOCKER

---

### 2. NO ROLE-BASED REDIRECT AFTER SIGN-IN

**Problem:** All authenticated users are redirected to `/path` regardless of their role.

**Evidence:**
```typescript
// app/(auth)/sign-in/page.tsx line 40
router.push("/path");
```

**Root Cause:**
- Sign-in page hardcodes redirect to `/path`
- No role detection before redirect
- Tutors and admins see learner dashboard initially

**Impact:**
- Tutors see learner interface first, then must navigate manually
- Admins see learner interface first, then must navigate manually
- Confusing UX - users don't know their role is recognized
- Role-based access control works but UX is poor

**Recommended Solution:**
```typescript
// After sign-in, detect role and redirect accordingly:
// learner → /path
// tutor → /tutor/dashboard
// admin → /admin/dashboard
```

**Status:** MAJOR BLOCKER

---

### 3. ALL ROLES SHARE SAME NAVIGATION (UX PROBLEM)

**Problem:** Learner, tutor, and admin all see identical navigation items.

**Evidence:**
```typescript
// components/navigation.tsx lines 8-14
const navItems = [
  { href: "/path", label: "Path", icon: Flame },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/live-classes", label: "Live", icon: Video },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];
```

**Root Cause:**
- Navigation component is shared across all route groups
- No role-based conditional rendering
- (tutor) and (admin) layouts don't have their own navigation

**Impact:**
- Tutors see "Path, Library, Live, Leaderboard, Profile" - not tutor-specific
- Admins see same learner navigation - not admin-specific
- No visual distinction between roles
- Violates requirement for "genuinely different role experiences"

**Recommended Solution:**
Create role-specific navigation components:
- `components/learner-navigation.tsx`
- `components/tutor-navigation.tsx`
- `components/admin-navigation.tsx`

**Status:** MAJOR BLOCKER

---

### 4. NO GOOGLE OAUTH IMPLEMENTATION

**Problem:** Google sign-up/login is not implemented.

**Evidence:**
- No Google OAuth configuration found
- No Google sign-in button in sign-in page
- No Google sign-up option in sign-up page
- No Supabase Auth provider configuration for Google

**Root Cause:**
- Feature not implemented

**Impact:**
- Users cannot sign up with Google
- Missing requested feature
- Reduces sign-up conversion

**Recommended Solution:**
Implement Supabase Google OAuth:
1. Configure Google provider in Supabase dashboard
2. Add Google sign-in button to sign-in page
3. Add Google sign-up option to sign-up page
4. Handle new vs existing Google users

**Status:** MAJOR BLOCKER

---

### 5. NO FORGOT-PASSWORD PAGE

**Problem:** Password reset functionality is missing.

**Evidence:**
- No `/forgot-password` route found
- No forgot-password link in sign-in page
- No password reset flow implemented

**Root Cause:**
- Feature not implemented

**Impact:**
- Users cannot reset passwords
- Security/usability issue
- Missing requested feature

**Recommended Solution:**
Implement Supabase password reset:
1. Create `/forgot-password` page
2. Add forgot-password link to sign-in page
3. Implement email sending via Supabase
4. Create password reset confirmation page

**Status:** MAJOR BLOCKER

---

### 6. ADMIN DASHBOARD PAGE MISSING

**Problem:** No admin dashboard page exists.

**Evidence:**
- `app/(admin)/page.tsx` was deleted (due to route conflict)
- No root page in (admin) route group
- Admins accessing `/admin` get 404

**Root Cause:**
- Deleted to fix route conflict with (marketing)/page.tsx
- Not recreated in correct location

**Impact:**
- Admins cannot access admin dashboard
- No centralized admin overview
- Poor admin UX

**Recommended Solution:**
Recreate admin dashboard at `app/(admin)/dashboard/page.tsx` (not root) or fix route conflict properly.

**Status:** MAJOR BLOCKER

---

### 7. SIGN-UP DOES NOT CREATE USER PROFILE AUTOMATICALLY

**Problem:** Sign-up creates Supabase Auth user but does not create user_progress record.

**Evidence:**
```typescript
// app/(auth)/sign-up/page.tsx lines 24-32
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
    },
  },
});
// No user_progress creation here
```

**Root Cause:**
- user_progress creation only happens in onboarding
- If user skips onboarding or fails, no profile exists

**Impact:**
- Users may have auth account but no profile
- getUserProgress() returns null
- Application breaks for users without profile
- Race condition possible

**Recommended Solution:**
Create user_progress record immediately after sign-up with default values:
- role: 'learner'
- userName: from full_name
- Default hearts, points, streaks

**Status:** MAJOR BLOCKER

---

### 8. ONBOARDING DOES NOT SET DEFAULT ROLE

**Problem:** Onboarding does not explicitly set role to 'learner'.

**Evidence:**
```typescript
// app/(auth)/onboarding/page.tsx lines 46-49
await supabase.from("user_progress").upsert({
  userId: user.id,
  activeCourseId: selectedCourseId,
});
// No role field set
```

**Root Cause:**
- Assumes default role in database schema
- Not explicitly set in code

**Impact:**
- Relies on database default
- If database default changes, breaks
- Not explicit about role assignment

**Recommended Solution:**
Explicitly set role: 'learner' in onboarding upsert.

**Status:** MEDIUM

---

## 🟠 MEDIUM ISSUES

### 9. ARTIFICIAL DELAY IN SIGN-IN

**Problem:** 500ms setTimeout after successful sign-in.

**Evidence:**
```typescript
// app/(auth)/sign-in/page.tsx line 39
await new Promise(resolve => setTimeout(resolve, 500));
```

**Root Cause:**
- Added to "wait for auth state to be set"
- Unnecessary with proper auth handling

**Impact:**
- Slower sign-in experience
- Poor UX

**Recommended Solution:**
Remove artificial delay. Use proper auth state management.

**Status:** MEDIUM

---

### 10. N+1 QUERY IN TUTOR DASHBOARD

**Problem:** Fetching learner names sequentially for each pending request.

**Evidence:**
```typescript
// app/(tutor)/dashboard/page.tsx lines 32-42
const pendingRequestsWithLearners = await Promise.all(
  pendingRequests.map(async (session) => {
    const learner = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, session.learnerId),
    });
    return { ...session, learnerName: learner?.userName || "Unknown" };
  })
);
```

**Root Cause:**
- Each session triggers a separate database query
- Not using JOIN or IN clause

**Impact:**
- Slower dashboard load with many pending requests
- Unnecessary database load

**Recommended Solution:**
Use JOIN or fetch all learners in one query with IN clause.

**Status:** MEDIUM

---

### 11. NO LOADING STATES FOR PROTECTED ROUTES

**Problem:** No loading.tsx files in route groups.

**Evidence:**
- No loading.tsx in (main)
- No loading.tsx in (tutor)
- No loading.tsx in (admin)

**Root Cause:**
- Not implemented

**Impact:**
- Poor UX during data fetching
- No feedback to user

**Recommended Solution:**
Add loading.tsx with skeletons for each route group.

**Status:** MEDIUM

---

### 12. CONSOLE.LOG IN PRODUCTION CODE

**Problem:** Debug console.log statements in production code.

**Evidence:**
```typescript
// app/(auth)/sign-in/page.tsx lines 23, 30, 37
console.log("Attempting sign in with:", email);
console.log("Sign in result:", { data, error });
console.log("Sign in successful, redirecting to /path");
```

**Root Cause:**
- Left in from debugging

**Impact:**
- Exposes sensitive information in browser console
- Clutters console
- Poor practice

**Recommended Solution:**
Remove all console.log statements from production code.

**Status:** SMALL (but fix immediately)

---

## 🟢 SMALL ISSUES (FIX IMMEDIATELY)

### 13. CONSOLE.LOG STATEMENTS

**Files with console.log:**
- `app/(auth)/sign-in/page.tsx` (3 instances)
- `app/(auth)/onboarding/page.tsx` (1 instance)

**Action:** Remove all console.log statements.

**Status:** FIX IMMEDIATELY

---

### 14. INCONSISTENT ROUTE NAMING

**Problem:** Some routes use hyphen, some use underscore.

**Evidence:**
- `/live-classes` vs `user_progress` table
- Inconsistent naming conventions

**Action:** Standardize to kebab-case for routes.

**Status:** FIX IMMEDIATELY

---

## PERFORMANCE ISSUES

### Current Performance Baseline

**Estimated Load Times (based on architecture analysis):**
- Landing page: ~500ms (static, fast)
- Auth page: ~200ms (static, fast)
- Sign-in: ~700ms (500ms artificial delay + auth)
- Post-login redirect: ~500ms (artificial delay)
- Learner dashboard: ~1-2s (multiple sequential queries)
- Tutor dashboard: ~1-2s (multiple sequential queries)
- Admin dashboard: N/A (page missing)

**Performance Bottlenecks:**
1. Duplicate getUser() calls across queries
2. Sequential auth checks in layouts
3. Artificial delays
4. N+1 queries in tutor dashboard
5. No parallel data fetching where possible

---

## AUTHENTICATION ISSUES

### Current State:
- ✅ Email/password sign-in works
- ✅ Email/password sign-up works
- ✅ Onboarding flow works
- ❌ No Google OAuth
- ❌ No forgot-password
- ❌ No automatic profile creation on sign-up
- ❌ No role-based redirect after sign-in
- ❌ All roles redirect to /path

---

## ROLE SEPARATION ISSUES

### Current State:
- ✅ Route groups exist: (main), (tutor), (admin)
- ✅ Layouts check roles
- ✅ Server-side role enforcement works
- ❌ All roles share same navigation
- ❌ No role-specific redirects
- ❌ No visual distinction between roles
- ❌ Admin dashboard missing

---

## SECURITY ISSUES

### Current State:
- ✅ Supabase RLS configured
- ✅ Server-side auth checks in layouts
- ✅ Service role key not exposed to browser
- ⚠️ Console logs expose auth data
- ⚠️ No rate limiting on auth
- ⚠️ No email verification required

---

## DATABASE ISSUES

### Current State:
- ✅ Schema is well-structured
- ✅ Relations properly defined
- ✅ Cascade rules configured
- ⚠️ No indexes on frequently queried columns (user_id, role, active_course_id)
- ⚠️ N+1 queries in some places
- ⚠️ getLibraryLessons fetches ALL lessons then filters client-side

---

## UI/UX ISSUES

### Current State:
- ✅ Design system consistent
- ✅ Responsive design
- ❌ All roles see same interface
- ❌ No loading states
- ❌ No error boundaries
- ❌ No empty states for missing data

---

## MISSING FEATURES

### Requested but Not Implemented:
1. Google OAuth sign-up/login
2. Forgot-password flow
3. Role-based redirects
4. Role-specific navigation
5. Admin dashboard
6. Tutor-specific navigation
7. Admin-specific navigation

---

## DEPENDENCIES

### Current Dependencies:
- Next.js 16.3.4 ✅
- React 19.2.8 ✅
- Supabase 2.49.1 ✅
- Drizzle 0.45.2 ✅
- Unnecessary: `react-admin` (5.15.1) - not used in current implementation
- Unnecessary: `ra-data-simple-rest` (5.15.3) - not used in current implementation

**Action:** Consider removing unused dependencies to reduce bundle size.

---

## ARCHITECTURE STRENGTHS

1. ✅ Proper route group structure
2. ✅ Server components where appropriate
3. ✅ React cache() for query memoization
4. ✅ Drizzle ORM with proper relations
5. ✅ Supabase SSR integration
6. ✅ Type-safe database queries
7. ✅ Proper cascade rules in schema

---

## NEXT STEPS (PHASE 1)

### Priority Order:
1. **Fix duplicate authentication queries** (create consolidated auth context)
2. **Implement role-based redirects** after sign-in
3. **Create role-specific navigation components**
4. **Implement Google OAuth**
5. **Implement forgot-password flow**
6. **Fix sign-up to create profile automatically**
7. **Recreate admin dashboard**
8. **Remove console.log statements**
9. **Add loading states**
10. **Optimize database queries**

---

## FILES REQUIRING IMMEDIATE CHANGES

### Critical:
1. `lib/supabase/server.ts` - consolidate auth
2. `db/queries.ts` - remove duplicate getUser calls
3. `app/(auth)/sign-in/page.tsx` - role-based redirect, remove console.log
4. `app/(auth)/sign-up/page.tsx` - create profile, add Google OAuth
5. `components/navigation.tsx` - split into role-specific components
6. `app/(main)/layout.tsx` - use consolidated auth
7. `app/(tutor)/layout.tsx` - use consolidated auth, add tutor nav
8. `app/(admin)/layout.tsx` - use consolidated auth, add admin nav

### Medium:
9. `app/(tutor)/dashboard/page.tsx` - fix N+1 query
10. `app/(auth)/onboarding/page.tsx` - set role explicitly, remove console.log

---

## AUDIT STATUS

**Phase 0:** 80% Complete  
**Remaining:** Performance baseline measurement, browser console inspection, network request analysis

---

**Next Action:** Proceed to PHASE 1 - Fix Critical Performance Problems
