import { getUser } from "@/lib/supabase/server";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getIsAdmin = async () => {
  const user = await getUser();
  if (!user) return false;

  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, user.id),
  });

  return progress?.role === "admin";
};
