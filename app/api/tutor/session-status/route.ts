import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getUser } from "@/lib/supabase/server";
import db from "@/db/drizzle";
import { tutorSessions, userProgress } from "@/db/schema";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const sessionId = Number(formData.get("sessionId"));
  const status = formData.get("status") as "confirmed" | "completed" | "cancelled";

  if (!sessionId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Role check: Only tutors can update session status
  const currentUserProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, user.id),
  });

  if (!currentUserProgress || currentUserProgress.role !== "tutor") {
    return NextResponse.json({ error: "Forbidden: Only tutors can update session status" }, { status: 403 });
  }

  // Ownership check: Tutor can only update their own sessions
  const session = await db.query.tutorSessions.findFirst({
    where: eq(tutorSessions.id, sessionId),
  });

  if (!session || session.tutorId !== user.id) {
    return NextResponse.json({ error: "Forbidden: You can only update your own sessions" }, { status: 403 });
  }

  // Update session status
  await db
    .update(tutorSessions)
    .set({ status })
    .where(and(eq(tutorSessions.id, sessionId), eq(tutorSessions.tutorId, user.id)));

  return NextResponse.json({ success: true });
}
