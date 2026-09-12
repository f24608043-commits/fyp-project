"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { tutorAvailability, tutorSessions, userProgress as userProgressTable } from "@/db/schema";
import { getUser } from "@/lib/supabase/server";

export const bookTutorSession = async ({
  tutorId,
  courseId,
  scheduledAt,
}: {
  tutorId: string;
  courseId: number;
  scheduledAt: string;
}) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized.");

  // Role check: Only learners can book sessions
  const currentUserProgress = await db.query.userProgressTable.findFirst({
    where: eq(userProgressTable.userId, user.id),
  });
  if (!currentUserProgress || currentUserProgress.role !== "learner") {
    throw new Error("Forbidden: Only learners can book sessions.");
  }

  // Verify tutor exists and has tutor role
  const tutorProgress = await db.query.userProgressTable.findFirst({
    where: eq(userProgressTable.userId, tutorId),
  });
  if (!tutorProgress || tutorProgress.role !== "tutor") {
    throw new Error("Invalid tutor.");
  }

  const roomName = `SocialLearn-${user.id.slice(0, 6)}-${Date.now()}`;
  const meetingLink = `https://meet.jit.si/${roomName}`;

  const session = await db
    .insert(tutorSessions)
    .values({
      tutorId,
      learnerId: user.id,
      courseId,
      scheduledAt: new Date(scheduledAt),
      status: "requested",
      meetingLink,
    })
    .returning();

  revalidatePath("/live");
  return { success: true, session: session[0] };
};

export const updateTutorSessionStatus = async ({
  sessionId,
  status,
}: {
  sessionId: number;
  status: "confirmed" | "completed" | "cancelled";
}) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized.");

  // Role check: Only tutors can update session status
  const currentUserProgress = await db.query.userProgressTable.findFirst({
    where: eq(userProgressTable.userId, user.id),
  });
  if (!currentUserProgress || currentUserProgress.role !== "tutor") {
    throw new Error("Forbidden: Only tutors can update session status.");
  }

  // Ownership check: Tutor can only update their own sessions
  const session = await db.query.tutorSessions.findFirst({
    where: eq(tutorSessions.id, sessionId),
  });
  if (!session || session.tutorId !== user.id) {
    throw new Error("Forbidden: You can only update your own sessions.");
  }

  await db
    .update(tutorSessions)
    .set({ status })
    .where(and(eq(tutorSessions.id, sessionId), eq(tutorSessions.tutorId, user.id)));

  revalidatePath("/live");
  return { success: true };
};

export const setTutorAvailability = async ({
  dayOfWeek,
  startTime,
  endTime,
}: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized.");

  // Role check: Only tutors can set availability
  const currentUserProgress = await db.query.userProgressTable.findFirst({
    where: eq(userProgressTable.userId, user.id),
  });
  if (!currentUserProgress || currentUserProgress.role !== "tutor") {
    throw new Error("Forbidden: Only tutors can set availability.");
  }

  await db.insert(tutorAvailability).values({
    tutorId: user.id,
    dayOfWeek,
    startTime,
    endTime,
  });

  revalidatePath("/live");
  return { success: true };
};
