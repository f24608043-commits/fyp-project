import { redirect } from "next/navigation";
import { Calendar, Clock, Users, Video, Check, CheckCircle, XCircle, Pending } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getUserProgress } from "@/db/queries";
import db from "@/db/drizzle";
import { tutorSessions, userProgress } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { ConfirmSessionForm, DeclineSessionForm } from "./session-actions";

const TutorDashboardPage = async () => {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const userProgress = await getUserProgress();
  if (!userProgress || userProgress.role !== "tutor") {
    return redirect("/path");
  }

  // Get pending requests (status = 'requested')
  const pendingRequests = await db.query.tutorSessions.findMany({
    where: and(
      eq(tutorSessions.tutorId, user.id),
      eq(tutorSessions.status, "requested")
    ),
    with: {
      course: true,
    },
    orderBy: (tutorSessions, { asc }) => [asc(tutorSessions.scheduledAt)],
  });

  // Fetch learner names for pending requests
  const pendingRequestsWithLearners = await Promise.all(
    pendingRequests.map(async (session) => {
      const learner = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, session.learnerId),
      });
      return {
        ...session,
        learnerName: learner?.userName || "Unknown",
      };
    })
  );

  // Get upcoming confirmed sessions
  const upcomingSessions = await db.query.tutorSessions.findMany({
    where: and(
      eq(tutorSessions.tutorId, user.id),
      eq(tutorSessions.status, "confirmed"),
      gte(tutorSessions.scheduledAt, new Date())
    ),
    with: {
      course: true,
    },
    orderBy: (tutorSessions, { asc }) => [asc(tutorSessions.scheduledAt)],
    limit: 5,
  });

  // Get total sessions count
  const totalSessions = await db.query.tutorSessions.findMany({
    where: eq(tutorSessions.tutorId, user.id),
  });

  const completedSessions = totalSessions.filter(
    (s) => s.status === "completed"
  ).length;

  const requestedCount = totalSessions.filter(
    (s) => s.status === "requested"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-extrabold text-primary-900">
            Tutor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {userProgress.userName || "Tutor"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold text-primary-900">{totalSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-primary-900">{completedSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-primary-900">{upcomingSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Pending className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-primary-900">{requestedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequestsWithLearners.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 mb-8">
            <h2 className="text-xl font-heading font-bold text-primary-900 mb-4">
              Pending Session Requests
            </h2>
            <div className="space-y-4">
              {pendingRequestsWithLearners.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border-2 border-yellow-100 bg-yellow-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Pending className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-primary-900">
                        {session.course?.title || "Session"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Learner: {session.learnerName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {new Date(session.scheduledAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <DeclineSessionForm sessionId={session.id} />
                    <ConfirmSessionForm sessionId={session.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-xl font-heading font-bold text-primary-900 mb-4">
            Upcoming Sessions
          </h2>
          {upcomingSessions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No upcoming sessions scheduled.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
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
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/tutor/availability"
            className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:border-primary-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-primary-900">
                  Manage Availability
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set your available time slots
                </p>
              </div>
            </div>
          </a>

          <a
            href="/tutor/sessions"
            className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:border-primary-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-primary-900">
                  Session History
                </h3>
                <p className="text-sm text-muted-foreground">
                  View past and upcoming sessions
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboardPage;
