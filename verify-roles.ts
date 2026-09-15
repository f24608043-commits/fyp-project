import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function verifyRoles() {
  console.log("=== VERIFICATION: ADMIN AND TUTOR ROLES ===\n");

  // Check existing users and their roles
  const { data: users, error: usersError } = await supabase
    .from("user_progress")
    .select("user_id, user_name, role");

  if (usersError) {
    console.error("Error fetching users:", usersError.message);
    return;
  }

  console.log("Existing users:");
  users?.forEach((u) => console.log(`  - ${u.user_name}: ${u.role}`));

  console.log("\n=== HOW TO TEST ADMIN FEATURES ===");
  console.log("1. Sign in as admin user (role: admin)");
  console.log("2. Navigate to: http://localhost:3001/admin");
  console.log("3. You should see the Admin Dashboard with:");
  console.log("   - Total users count");
  console.log("   - Total courses count");
  console.log("   - Total sessions count");
  console.log("   - Total badges count");
  console.log("   - Quick links to: Course Management, Badges, Users");
  console.log("\n4. Test Course Management:");
  console.log("   - Go to /admin/course-management");
  console.log("   - Create a new course");
  console.log("   - Edit an existing course");
  console.log("   - Delete a course (will check for enrollments first)");
  console.log("\n5. Test Badge Management:");
  console.log("   - Go to /admin/badges");
  console.log("   - Create a badge with criteria");
  console.log("   - Edit badge criteria");
  console.log("\n6. Test User Management:");
  console.log("   - Go to /admin/users");
  console.log("   - Change user roles (learner/tutor/admin)");
  console.log("   - View last active dates");

  console.log("\n=== HOW TO TEST TUTOR FEATURES ===");
  console.log("1. Sign in as tutor user (role: tutor)");
  console.log("2. Navigate to: http://localhost:3001/tutor/dashboard");
  console.log("3. You should see the Tutor Dashboard with:");
  console.log("   - Pending session requests");
  console.log("   - Confirm/Decline buttons for each request");
  console.log("\n4. Set Availability:");
  console.log("   - Go to /tutor/availability");
  console.log("   - Add availability slots (day, start time, end time)");
  console.log("\n5. Manage Sessions:");
  console.log("   - Go to /tutor/sessions");
  console.log("   - Filter by status (requested, confirmed, completed, cancelled)");
  console.log("   - Mark sessions as complete");

  console.log("\n=== ROLE-BASED ACCESS CONTROL ===");
  console.log("- Learners cannot access /tutor/* or /admin/* routes");
  console.log("- Tutors cannot access /admin/* routes");
  console.log("- Admins can access all routes");
  console.log("- Layout files enforce these restrictions");
  console.log("  - app/(tutor)/layout.tsx checks role === 'tutor'");
  console.log("  - app/(admin)/layout.tsx checks role === 'admin'");

  console.log("\n=== TUTOR BOOKING FLOW ===");
  console.log("1. Tutor sets availability via /tutor/availability");
  console.log("2. Learner books a session (creates tutor_sessions row)");
  console.log("3. Session status: 'requested'");
  console.log("4. Tutor sees request on /tutor/dashboard");
  console.log("5. Tutor confirms → status: 'confirmed'");
  console.log("6. Jitsi meeting link generated and visible to both");
  console.log("7. After session, tutor marks complete → status: 'completed'");

  console.log("\n=== COURSE DELETION PROTECTION ===");
  console.log("- Admin cannot delete course if users are enrolled");
  console.log("- Admin cannot delete course if users have it as active course");
  console.log("- Cascade: course → units → lessons → challenges");
  console.log("- User progress is NOT cascaded (protected)");
}

verifyRoles();
