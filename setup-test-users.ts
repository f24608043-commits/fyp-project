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

async function setupTestUsers() {
  console.log("=== SETTING UP TEST USERS ===\n");

  // Create admin user
  console.log("Creating admin user...");
  const adminEmail = "admin@gmail.com";
  const { data: adminAuth, error: adminError } = await supabase.auth.signUp({
    email: adminEmail,
    password: "admin@1221",
  });

  if (adminError && !adminError.message.includes("already registered")) {
    console.error("Failed to create admin:", adminError.message);
  } else {
    const adminId = adminAuth.user?.id;
    if (adminId) {
      await supabaseAdmin.from("user_progress").upsert({
        user_id: adminId,
        user_name: "Admin User",
        role: "admin",
        points: 0,
        hearts: 5,
      });
      console.log(`✅ Admin user created: ${adminEmail} / admin@1221`);
    }
  }

  // Create tutor user
  console.log("\nCreating tutor user...");
  const tutorEmail = "tutor@gmail.com";
  const { data: tutorAuth, error: tutorError } = await supabase.auth.signUp({
    email: tutorEmail,
    password: "tutor@1221",
  });

  if (tutorError && !tutorError.message.includes("already registered")) {
    console.error("Failed to create tutor:", tutorError.message);
  } else {
    const tutorId = tutorAuth.user?.id;
    if (tutorId) {
      await supabaseAdmin.from("user_progress").upsert({
        user_id: tutorId,
        user_name: "Tutor User",
        role: "tutor",
        points: 0,
        hearts: 5,
      });
      console.log(`✅ Tutor user created: ${tutorEmail} / tutor@1221`);
    }
  }

  // Verify all users
  console.log("\n=== ALL USERS IN DATABASE ===");
  const { data: users } = await supabaseAdmin
    .from("user_progress")
    .select("user_name, role");
  users?.forEach((u) => console.log(`  - ${u.user_name}: ${u.role}`));

  console.log("\n=== READY TO TEST ===");
  console.log("Admin: admin@gmail.com / admin@1221");
  console.log("Tutor: tutor@gmail.com / tutor@1221");
  console.log("Learner: learner@gmail.com / learner@1221");
}

setupTestUsers();
