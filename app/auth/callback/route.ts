import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if user has a profile, create one if not
      const { data: profile } = await supabase
        .from("user_progress")
        .select("role")
        .eq("userId", data.user.id)
        .single();

      if (!profile) {
        // Create profile for new Google user
        const fullName = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User";
        await supabase.from("user_progress").insert({
          userId: data.user.id,
          userName: fullName,
          role: "learner",
          fullName: fullName,
        });
      }

      // Redirect based on role
      const role = profile?.role || "learner";
      const redirectPath = role === "tutor" ? "/tutor/dashboard" 
                        : role === "admin" ? "/admin/admin-home" 
                        : "/onboarding";
      
      return redirect(redirectPath);
    }
  }

  // Return the user to an error page with instructions
  return redirect("/sign-in?error=auth_failed");
}
