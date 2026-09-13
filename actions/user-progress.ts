"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { MAX_HEARTS, POINTS_TO_REFILL } from "@/constants";
import db from "@/db/drizzle";
import {
  getCourseById,
  getUserProgress,
} from "@/db/queries";
import { challengeProgress, challenges, enrollments, userProgress } from "@/db/schema";
import { getUser } from "@/lib/supabase/server";

export const upsertUserProgress = async (courseId: number) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized.");

  const course = await getCourseById(courseId);
  if (!course) throw new Error("Course not found.");

  const existingUserProgress = await getUserProgress();

  if (existingUserProgress) {
    await db
      .update(userProgress)
      .set({
        activeCourseId: courseId,
        userName: user.user_metadata?.full_name || user.email?.split("@")[0] || "Learner",
        userImageSrc: user.user_metadata?.avatar_url || "/mascot.svg",
      })
      .where(eq(userProgress.userId, user.id));

    // Also record multi-course enrollment
    const existingEnrollment = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, user.id), eq(enrollments.courseId, courseId)),
    });
    if (!existingEnrollment) {
      await db.insert(enrollments).values({
        userId: user.id,
        courseId,
      });
    }

    revalidatePath("/courses");
    revalidatePath("/path");
    redirect("/path");
  }

  await db.insert(userProgress).values({
    userId: user.id,
    activeCourseId: courseId,
    userName: user.user_metadata?.full_name || user.email?.split("@")[0] || "Learner",
    userImageSrc: user.user_metadata?.avatar_url || "/mascot.svg",
    role: "learner",
  });

  await db.insert(enrollments).values({
    userId: user.id,
    courseId,
  });

  revalidatePath("/courses");
  revalidatePath("/path");
  redirect("/path");
};

export const updateProfile = async ({
  userName,
  avatarUrl,
}: {
  userName?: string;
  avatarUrl?: string;
}) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized.");

  const updateData: { userName?: string; userImageSrc?: string; avatarUrl?: string } = {};
  if (userName) updateData.userName = userName;
  if (avatarUrl) {
    updateData.userImageSrc = avatarUrl;
    updateData.avatarUrl = avatarUrl;
  }

  await db
    .update(userProgress)
    .set(updateData)
    .where(eq(userProgress.userId, user.id));

  revalidatePath("/profile");
};

export const reduceHearts = async (challengeId: number) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized.");

  const currentUserProgress = await getUserProgress();

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
  if (isPractice) return { error: "practice" };
  if (!currentUserProgress) throw new Error("User progress not found.");
  if (currentUserProgress.hearts === 0) return { error: "hearts" };

  await db
    .update(userProgress)
    .set({
      hearts: Math.max(currentUserProgress.hearts - 1, 0),
    })
    .where(eq(userProgress.userId, user.id));

  revalidatePath("/path");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};

export const refillHearts = async () => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized.");

  const currentUserProgress = await getUserProgress();
  if (!currentUserProgress) throw new Error("User progress not found.");
  if (currentUserProgress.hearts === MAX_HEARTS)
    throw new Error("Hearts are already full.");
  if (currentUserProgress.points < POINTS_TO_REFILL)
    throw new Error("Not enough points.");

  await db
    .update(userProgress)
    .set({
      hearts: MAX_HEARTS,
      points: currentUserProgress.points - POINTS_TO_REFILL,
    })
    .where(eq(userProgress.userId, user.id));

  revalidatePath("/path");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};
