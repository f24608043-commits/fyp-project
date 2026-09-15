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

async function checkUsers() {
  console.log("=== CHECKING EXISTING USERS ===\n");

  const { data: users, error } = await supabaseAdmin
    .from("user_progress")
    .select("user_id, user_name, role");

  if (error) {
    console.error("Error:", error.message);
    return;
  }

  console.log("Users in database:");
  users?.forEach((u) => {
    console.log(`  ID: ${u.user_id}`);
    console.log(`  Name: ${u.user_name}`);
    console.log(`  Role: ${u.role}`);
    console.log();
  });

  // Check if we have an admin user
  const adminUser = users?.find((u) => u.role === "admin");
  if (adminUser) {
    console.log(`✅ Admin user exists: ${adminUser.user_name} (${adminUser.user_id})`);
  } else {
    console.log("❌ No admin user found in database");
  }

  // Check if we have a tutor user
  const tutorUser = users?.find((u) => u.role === "tutor");
  if (tutorUser) {
    console.log(`✅ Tutor user exists: ${tutorUser.user_name} (${tutorUser.user_id})`);
  } else {
    console.log("❌ No tutor user found in database");
  }

  // Check if we have a learner user
  const learnerUser = users?.find((u) => u.role === "learner");
  if (learnerUser) {
    console.log(`✅ Learner user exists: ${learnerUser.user_name} (${learnerUser.user_id})`);
  } else {
    console.log("❌ No learner user found in database");
  }
}

checkUsers();
