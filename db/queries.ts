import { cache } from "react";
import { and, desc, eq, ilike, or } from "drizzle-orm";

import { getUser } from "@/lib/supabase/server";
import db from "./drizzle";
import {
  badges,
  challengeProgress,
  courses,
  enrollments,
  friendships,
  friendStreaks,
  lessons,
  libraryViews,
  tutorAvailability,
  tutorSessions,
  units,
  userBadges,
  userProgress,
} from "./schema";

const DAY_IN_MS = 86_400_000;

export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany();
  return data;
});

export const getUserProgress = cache(async () => {
  const user = await getUser();
  if (!user) return null;

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, user.id),
    with: {
      activeCourse: true,
    },
  });

  return data;
});

export const getUnits = cache(async () => {
  const user = await getUser();
  const currentProgress = await getUserProgress();

  if (!user || !currentProgress?.activeCourseId) return [];

  // Fetch units with lessons only - don't fetch challenges yet
  const data = await db.query.units.findMany({
    where: eq(units.courseId, currentProgress.activeCourseId),
    orderBy: (units, { asc }) => [asc(units.order)],
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        columns: {
          id: true,
          title: true,
          unitId: true,
          order: true,
          youtubeVideoId: true,
        },
      },
    },
  });

  // Fetch challenge progress separately for better performance
  const allChallengeProgress = await db.query.challengeProgress.findMany({
    where: eq(challengeProgress.userId, user.id),
  });

  const completedChallengeIds = new Set(
    allChallengeProgress
      .filter((cp) => cp.completed)
      .map((cp) => cp.challengeId)
  );

  // Fetch challenges for all lessons in one query
  const lessonIds = data.flatMap((unit) => unit.lessons.map((l) => l.id));
  const allChallenges = await db.query.challenges.findMany({
    where: (challenges, { inArray }) => inArray(challenges.lessonId, lessonIds),
    orderBy: (challenges, { asc }) => [asc(challenges.order)],
  });

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      const lessonChallenges = allChallenges.filter((c) => c.lessonId === lesson.id);
      const allCompleted = lessonChallenges.every((c) => completedChallengeIds.has(c.id));
      return { ...lesson, completed: allCompleted, challenges: lessonChallenges };
    });

    return { ...unit, lessons: lessonsWithCompletedStatus };
  });

  return normalizedData;
});

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      },
    },
  });

  return data;
});

export const getCourseProgress = cache(async () => {
  const user = await getUser();
  const currentProgress = await getUserProgress();

  if (!user || !currentProgress?.activeCourseId) return null;

  // Fetch units with lessons only
  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, currentProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        columns: {
          id: true,
          title: true,
          unitId: true,
          order: true,
        },
      },
    },
  });

  // Fetch challenge progress separately
  const allChallengeProgress = await db.query.challengeProgress.findMany({
    where: eq(challengeProgress.userId, user.id),
  });

  const completedChallengeIds = new Set(
    allChallengeProgress
      .filter((cp) => cp.completed)
      .map((cp) => cp.challengeId)
  );

  // Fetch challenges for all lessons
  const lessonIds = unitsInActiveCourse.flatMap((unit) => unit.lessons.map((l) => l.id));
  const allChallenges = await db.query.challenges.findMany({
    where: (challenges, { inArray }) => inArray(challenges.lessonId, lessonIds),
  });

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      const lessonChallenges = allChallenges.filter((c) => c.lessonId === lesson.id);
      return lessonChallenges.some((c) => !completedChallengeIds.has(c.id));
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const user = await getUser();
  if (!user) return null;

  const courseProgress = await getCourseProgress();
  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) return null;

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, user.id),
          },
        },
      },
    },
  });

  if (!data || !data.challenges) return null;

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed);

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();
  if (!courseProgress?.activeLessonId) return 0;

  const lesson = await getLesson(courseProgress.activeLessonId);
  if (!lesson) return 0;

  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed
  );

  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
  );

  return percentage;
});

export const getTopTenUsers = cache(async () => {
  const user = await getUser();
  if (!user) return [];

  const data = await db.query.userProgress.findMany({
    orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  });

  return data;
});

// Badges queries
export const getBadges = cache(async () => {
  return await db.query.badges.findMany();
});

export const getUserBadges = cache(async (userId?: string) => {
  const user = await getUser();
  const targetId = userId || user?.id;
  if (!targetId) return [];

  return await db.query.userBadges.findMany({
    where: eq(userBadges.userId, targetId),
    with: {
      badge: true,
    },
  });
});

// Social & Friends
export const getFriendships = cache(async () => {
  const user = await getUser();
  if (!user) return [];

  return await db.query.friendships.findMany({
    where: or(eq(friendships.userIdA, user.id), eq(friendships.userIdB, user.id)),
  });
});

// Library Lessons (Ungated)
export const getLibraryLessons = cache(async (query?: string, category?: string) => {
  const allLessons = await db.query.lessons.findMany({
    with: {
      unit: {
        with: {
          course: true,
        },
      },
    },
  });

  return allLessons.filter((lesson) => {
    const matchesCategory = !category || category === "all" || lesson.unit.course.category?.toLowerCase() === category.toLowerCase();
    const matchesQuery = !query || lesson.title.toLowerCase().includes(query.toLowerCase()) || lesson.unit.course.title.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });
});

// Tutor Queries
export const getTutors = cache(async () => {
  return await db.query.userProgress.findMany({
    where: eq(userProgress.role, "tutor"),
  });
});

export const getTutorAvailability = cache(async (tutorId: string) => {
  return await db.query.tutorAvailability.findMany({
    where: eq(tutorAvailability.tutorId, tutorId),
  });
});

export const getUserTutorSessions = cache(async () => {
  const user = await getUser();
  if (!user) return [];

  return await db.query.tutorSessions.findMany({
    where: or(eq(tutorSessions.learnerId, user.id), eq(tutorSessions.tutorId, user.id)),
    with: {
      course: true,
    },
    orderBy: (tutorSessions, { desc }) => [desc(tutorSessions.scheduledAt)],
  });
});
