import { redirect } from "next/navigation";
import { Calendar, Clock, Video, CheckCircle, XCircle, Clock as Pending, Filter } from "lucide-react";
import { getAuthUser } from "@/lib/auth-context";
import { getUserProgress } from "@/db/queries";
import db from "@/db/drizzle";
import { tutorSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CompleteSessionForm } from "./session-actions";

const TutorSessionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) => {
  const { status } = await searchParams;
  const auth = await getAuthUser();
  if (!auth?.user) return redirect("/sign-in");

  const userProgress = await getUserProgress();
  if (!userProgress || userProgress.role !== "tutor") {
    return redirect("/path");
  }

  // Get all sessions
  const sessions = await db.query.tutorSessions.findMany({
    where: eq(tutorSessions.tutorId, auth.user.id),
    with: {
      course: true,
    },
    orderBy: (tutorSessions, { desc }) => [desc(tutorSessions.scheduledAt)],
  });

  // Filter by status if provided
  const filteredSessions = status
    ? sessions.filter((s) => s.status === status)
    : sessions;

  const statusConfig = {
    requested: { icon: Pending, label: "Requested", color: "bg-yellow-100 text-yellow-700" },
    confirmed: { icon: Clock, label: "Confirmed", color: "bg-green-100 text-green-700" },
    completed: { icon: CheckCircle, label: "Completed", color: "bg-blue-100 text-blue-700" },
    cancelled: { icon: XCircle, label: "Cancelled", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-heading font-extrabold text-primary-900">
              Session History
            </h1>
            <p className="text-muted-foreground">
              View all your tutoring sessions
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/tutor/sessions"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                !status
                  ? "bg-primary-500 text-white"
                  : "bg-white border-2 border-slate-200 text-muted-foreground hover:border-primary-300"
              }`}
            >
              All
            </a>
            <a
              href="/tutor/sessions?status=requested"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                status === "requested"
                  ? "bg-yellow-500 text-white"
                  : "bg-white border-2 border-slate-200 text-muted-foreground hover:border-primary-300"
              }`}
            >
              Requested
            </a>
            <a
              href="/tutor/sessions?status=confirmed"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                status === "confirmed"
                  ? "bg-green-500 text-white"
                  : "bg-white border-2 border-slate-200 text-muted-foreground hover:border-primary-300"
              }`}
            >
              Confirmed
            </a>
            <a
              href="/tutor/sessions?status=completed"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                status === "completed"
                  ? "bg-blue-500 text-white"
                  : "bg-white border-2 border-slate-200 text-muted-foreground hover:border-primary-300"
              }`}
            >
              Completed
            </a>
            <a
              href="/tutor/sessions?status=cancelled"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                status === "cancelled"
                  ? "bg-red-500 text-white"
                  : "bg-white border-2 border-slate-200 text-muted-foreground hover:border-primary-300"
              }`}
            >
              Cancelled
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6">
          {filteredSessions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No sessions found.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const config = statusConfig[session.status as keyof typeof statusConfig];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-primary-200 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Video className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-primary-900">
                          {session.course?.title || "Session"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {new Date(session.scheduledAt).toLocaleString()}
                        </div>
                        {session.meetingLink && (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:underline"
                          >
                            Join Meeting
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 ${config.color} text-sm font-bold rounded-full flex items-center gap-2`}>
                        <StatusIcon className="w-4 h-4" />
                        {config.label}
                      </span>
                      {session.status === "confirmed" && (
                        <CompleteSessionForm sessionId={session.id} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorSessionsPage;
