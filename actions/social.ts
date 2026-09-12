"use server";

import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { friendships, userProgress } from "@/db/schema";
import { getUser } from "@/lib/supabase/server";

export const sendFriendRequest = async (targetUserId: string) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized.");
  if (user.id === targetUserId) throw new Error("Cannot friend yourself.");

  // Ownership check: User can only send requests as themselves
  // (already enforced by user.id check)

  const existing = await db.query.friendships.findFirst({
    where: or(
      and(eq(friendships.userIdA, user.id), eq(friendships.userIdB, targetUserId)),
      and(eq(friendships.userIdA, targetUserId), eq(friendships.userIdB, user.id))
    ),
  });

  if (existing) return { error: "Friendship already exists or is pending." };

  await db.insert(friendships).values({
    userIdA: user.id,
    userIdB: targetUserId,
    status: "pending",
  });

  revalidatePath("/profile");
  return { success: true };
};

export const acceptFriendRequest = async (friendshipId: number) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized.");

  await db
    .update(friendships)
    .set({ status: "accepted" })
    .where(and(eq(friendships.id, friendshipId), eq(friendships.userIdB, user.id)));

  revalidatePath("/profile");
  return { success: true };
};
