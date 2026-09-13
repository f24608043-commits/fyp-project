"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { MAX_HEARTS } from "@/constants";
import db from "@/db/drizzle";
import { getUserProgress } from "@/db/queries";
import {
  challengeProgress,
  challenges,
  friendships,
  friendStreaks,
  lessons,
  userProgress,
} from "@/db/schema";
import { getUser } from "@/lib/supabase/server";
import { checkAndAwardBadges } from "@/lib/badges";

export const upsertChallengeProgress = async (challengeId: number) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized.");

  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) throw new Error("User progress not found.");

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) throw new Error("Challenge not found.");
  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, user.id),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });

  const isPractice = !!existingChallengeProgress;

  if (currentUserProgress.hearts === 0 && !isPractice) {
    return { error: "hearts" };
  }

  // Calculate Streak
  const now = new Date();
  const lastActive = currentUserProgress.lastActiveDate
    ? new Date(currentUserProgress.lastActiveDate)
    : null;

  let newCurrentStreak = currentUserProgress.currentStreak || 0;
  if (!lastActive) {
    newCurrentStreak = 1;
  } else {
    const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      newCurrentStreak += 1;
    } else if (diffDays > 1) {
      newCurrentStreak = 1;
    }
  }
  const newLongestStreak = Math.max(newCurrentStreak, currentUserProgress.longestStreak || 0);

  if (isPractice) {
    await db
      .update(challengeProgress)
      .set({ completed: true })
      .where(eq(challengeProgress.id, existingChallengeProgress.id));

    await db
      .update(userProgress)
      .set({
        hearts: Math.min(currentUserProgress.hearts + 1, MAX_HEARTS),
        points: currentUserProgress.points + 10,
        xp: (currentUserProgress.xp || 0) + 10,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: now,
      })
      .where(eq(userProgress.userId, user.id));
  } else {
    await db.insert(challengeProgress).values({
      challengeId,
      userId: user.id,
      completed: true,
    });

    await db
      .update(userProgress)
      .set({
        points: currentUserProgress.points + 10,
        xp: (currentUserProgress.xp || 0) + 10,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: now,
      })
      .where(eq(userProgress.userId, user.id));
  }

  // Check Badges & Friend Streaks
  await checkAndAwardBadges(user.id, "level_complete", { count: 1 });
  await checkAndAwardBadges(user.id, "streak", { streak: newCurrentStreak });

  // Unlock next lesson by order_index (server-side validation)
  const allLessonChallenges = await db.query.challenges.findMany({
    where: eq(challenges.lessonId, lessonId),
  });
  const allCompleted = await db.query.challengeProgress.findMany({
    where: and(
      eq(challengeProgress.userId, user.id),
      eq(challengeProgress.completed, true)
    ),
  });
  const completedLessonChallenges = allCompleted.filter(
    (cp) => allLessonChallenges.some((c) => c.id === cp.challengeId)
  );

  if (completedLessonChallenges.length === allLessonChallenges.length && allLessonChallenges.length > 0) {
    // Lesson fully completed - unlock next lesson logic can be added later
    // when activeLessonId field is added to userProgress schema
  }

  // Update Friend Streaks if active on same day
  try {
    const userFriends = await db.query.friendships.findMany({
      where: and(
        eq(friendships.status, "accepted"),
        and(eq(friendships.userIdA, user.id))
      ),
    });
    for (const f of userFriends) {
      const friendProgress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, f.userIdB),
      });
      if (friendProgress?.lastActiveDate) {
        const friendDiff = Math.floor((now.getTime() - new Date(friendProgress.lastActiveDate).getTime()) / (1000 * 3600 * 24));
        if (friendDiff === 0) {
          const streakRow = await db.query.friendStreaks.findFirst({
            where: eq(friendStreaks.friendshipId, f.id),
          });
          if (streakRow) {
            await db
              .update(friendStreaks)
              .set({
                currentStreak: streakRow.currentStreak + 1,
                lastJointActivityDate: now,
              })
              .where(eq(friendStreaks.id, streakRow.id));
          } else {
            await db.insert(friendStreaks).values({
              friendshipId: f.id,
              currentStreak: 1,
              lastJointActivityDate: now,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Error updating friend streaks:", err);
  }

  revalidatePath("/path");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath("/profile");
  revalidatePath(`/lesson/${lessonId}`);
};
