"use server";

import db from "@/db/drizzle";
import { libraryViews } from "@/db/schema";
import { getUser } from "@/lib/supabase/server";

export const trackLibraryView = async (lessonId: number) => {
  const user = await getUser();
  if (!user) return;

  try {
    await db.insert(libraryViews).values({
      userId: user.id,
      lessonId,
    });
  } catch (error) {
    console.error("Failed to track library view:", error);
  }
};
