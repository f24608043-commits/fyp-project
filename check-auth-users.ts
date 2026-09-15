import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : supabase;

async function checkAuthUsers() {
  console.log("=== CHECKING AUTH USERS ===\n");

  // Try to list users via admin client (requires service role)
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error("Error listing auth users (may need service role):", error.message);
      console.log("\nTrying alternative method...\n");
    } else {
      console.log("Auth users:");
      users?.forEach((u) => {
        console.log(`  Email: ${u.email}`);
        console.log(`  ID: ${u.id}`);
        console.log(`  Created at: ${u.created_at}`);
        console.log();
      });
    }
  } catch (e) {
    console.log("Cannot list auth users without service role permissions");
  }

  // Check user_progress table
  console.log("=== USER PROGRESS TABLE ===");
  const { data: progressUsers } = await supabaseAdmin
    .from("user_progress")
    .select("user_id, user_name, role");

  progressUsers?.forEach((u) => {
    console.log(`  ${u.user_name} (${u.role}): ${u.user_id}`);
  });

  console.log("\n=== RECOMMENDATION ===");
  console.log("To test admin/tutor features, you need to:");
  console.log("1. Sign in with an existing user");
  console.log("2. Change their role via the admin users page");
  console.log("3. Or create new users with specific roles");
  console.log("\nCurrent test users:");
  console.log("- learner@gmail.com / learner@1221 (role: learner)");
  console.log("- tutor@gmail.com / tutor@1221 (role: tutor)");
  console.log("\nTo change a user's role:");
  console.log("1. Sign in as admin (if you have admin access)");
  console.log("2. Go to /admin/users");
  console.log("3. Change the role of any user");
}

checkAuthUsers();
