"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { challengeOptions, challenges, lessons, units, userProgress } from "@/db/schema";
import { generateQuizQuestions } from "@/lib/ai";
import { getUser } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

export const generateLessonQuiz = async (lessonId: number) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized.");

  // Role check: Only admins can generate AI quizzes
  const currentUserProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, user.id),
  });
  if (!currentUserProgress || currentUserProgress.role !== "admin") {
    throw new Error("Forbidden: Admin role required.");
  }

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      unit: {
        with: {
          course: true,
        },
      },
    },
  });

  if (!lesson) throw new Error("Lesson not found.");

  const generated = await generateQuizQuestions({
    userId: user.id,
    lessonTitle: lesson.title,
    courseCategory: lesson.unit.course.category || "General",
    description: lesson.unit.description,
  });

  // Delete old AI challenges for this lesson if re-generating
  const existingChallenges = await db.query.challenges.findMany({
    where: eq(challenges.lessonId, lessonId),
  });
  for (const ch of existingChallenges) {
    if (ch.generatedBy === "ai") {
      await db.delete(challenges).where(eq(challenges.id, ch.id));
    }
  }

  let orderIndex = existingChallenges.length + 1;

  for (const q of generated.questions) {
    const createdChallenge = await db
      .insert(challenges)
      .values({
        lessonId,
        type: q.type,
        question: q.question,
        order: orderIndex++,
        generatedBy: "ai",
      })
      .returning();

    for (const opt of q.options) {
      await db.insert(challengeOptions).values({
        challengeId: createdChallenge[0].id,
        text: opt.text,
        correct: opt.correct,
      });
    }
  }

  revalidatePath(`/lesson/${lessonId}`);
  revalidatePath("/path");
  return { success: true, count: generated.questions.length };
};
