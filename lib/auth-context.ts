import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Consolidated auth context - fetches user + profile + role in a single cached call
 * This eliminates duplicate getUser() calls across the application
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Fetch user progress in parallel with auth check
  const [progress] = await Promise.all([
    db.query.userProgress.findFirst({
      where: eq(userProgress.userId, user.id),
    }),
  ]);

  return {
    user,
    progress,
  };
});

/**
 * Get just the user (for backward compatibility)
 */
export const getUser = cache(async () => {
  const auth = await getAuthUser();
  return auth?.user || null;
});

/**
 * Get just the user progress (for backward compatibility)
 */
export const getUserProgress = cache(async () => {
  const auth = await getAuthUser();
  return auth?.progress || null;
});
