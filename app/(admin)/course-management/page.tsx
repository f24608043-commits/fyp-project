import { redirect } from "next/navigation";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { getUserProgress } from "@/db/queries";
import { getCourses } from "@/db/queries";
import { Button } from "@/components/ui/button";

const AdminCoursesPage = async () => {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const userProgress = await getUserProgress();
  if (!userProgress || userProgress.role !== "admin") {
    return redirect("/path");
  }

  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-heading font-extrabold text-primary-900">
              Course Management
            </h1>
            <p className="text-muted-foreground">
              Manage all courses in the platform
            </p>
          </div>
          <Button variant="secondary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6">
          {courses.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No courses found. Create your first course to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border-2 border-slate-100 rounded-xl p-6 hover:border-primary-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-2xl">
                      📚
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-primary-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {course.category}
                  </p>
                  <a
                    href={`/admin/course-management/course/${course.id}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700"
                  >
                    <BookOpen className="w-4 h-4" />
                    Manage Lessons
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoursesPage;
