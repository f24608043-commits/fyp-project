import { redirect } from "next/navigation";
import { Users, BookOpen, Award, Calendar, TrendingUp } from "lucide-react";
import { getAuthUser } from "@/lib/auth-context";
import { getUserProgress } from "@/db/queries";
import db from "@/db/drizzle";
import { courses, badges, tutorSessions, userProgress } from "@/db/schema";

const AdminDashboardPage = async () => {
  const auth = await getAuthUser();
  if (!auth?.user) return redirect("/sign-in");

  const userProfile = await getUserProgress();
  if (!userProfile || userProfile.role !== "admin") {
    return redirect("/path");
  }

  // Fetch platform statistics in parallel
  const [
    totalUsers,
    totalCourses,
    totalBadges,
    totalSessions,
  ] = await Promise.all([
    db.query.userProgress.findMany(),
    db.query.courses.findMany(),
    db.query.badges.findMany(),
    db.query.tutorSessions.findMany(),
  ]);

  const totalLearners = totalUsers.filter(u => u.role === "learner").length;
  const totalTutors = totalUsers.filter(u => u.role === "tutor").length;
  const totalAdmins = totalUsers.filter(u => u.role === "admin").length;

  const completedSessions = totalSessions.filter(s => s.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-extrabold text-primary-900">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile.userName || "Admin"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-primary-900">{totalUsers.length}</p>
                <p className="text-xs text-muted-foreground">
                  {totalLearners} learners, {totalTutors} tutors
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold text-primary-900">{totalCourses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Badges</p>
                <p className="text-2xl font-bold text-primary-900">{totalBadges.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tutor Sessions</p>
                <p className="text-2xl font-bold text-primary-900">{totalSessions.length}</p>
                <p className="text-xs text-muted-foreground">
                  {completedSessions} completed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            href="/admin/users"
            className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:border-primary-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-primary-900">
                  User Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage users and roles
                </p>
              </div>
            </div>
          </a>

          <a
            href="/admin/course-management"
            className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:border-primary-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-primary-900">
                  Course Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage courses
                </p>
              </div>
            </div>
          </a>

          <a
            href="/admin/badges"
            className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:border-primary-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-primary-900">
                  Badge Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create achievement badges
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
