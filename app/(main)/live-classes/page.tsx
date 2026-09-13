import { redirect } from "next/navigation";
import { getCourses, getTutors, getUserProgress, getUserTutorSessions } from "@/db/queries";
import { getUser } from "@/lib/supabase/server";
import { LiveClient } from "./live-client";

export default async function LiveClassesPage() {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const [userProgress, courses, tutors, sessions] = await Promise.all([
    getUserProgress(),
    getCourses(),
    getTutors(),
    getUserTutorSessions(),
  ]);

  return (
    <div className="mx-auto h-full max-w-6xl px-4 pb-12 pt-6">
      <div className="mb-8 space-y-3">
        <h1 className="text-4xl font-heading font-extrabold text-primary-900">Live 1-on-1 Classes</h1>
        <p className="text-lg text-muted-foreground font-body">
          Book personalized mentoring and practice sessions with expert tutors via embedded live video rooms.
        </p>
      </div>

      <LiveClient
        userId={user.id}
        userRole={userProgress?.role || "learner"}
        courses={courses}
        tutors={tutors}
        sessions={sessions}
      />
    </div>
  );
}
