"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, BookOpen, Layers } from "lucide-react";

type Course = {
  id?: number;
  title: string;
  imageSrc: string;
  category: string;
  unitCount?: number;
  lessonCount?: number;
};

export default function AdminCoursesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const { data: coursesData } = await supabase.from("courses").select("*");
    if (coursesData) {
      // Get unit and lesson counts for each course
      const coursesWithCounts = await Promise.all(
        coursesData.map(async (course) => {
          const { data: units } = await supabase
            .from("units")
            .select("id")
            .eq("courseId", course.id);
          
          let lessonCount = 0;
          if (units && units.length > 0) {
            const unitIds = units.map((u) => u.id);
            const { data: lessons } = await supabase
              .from("lessons")
              .select("id")
              .in("unitId", unitIds);
            lessonCount = lessons?.length || 0;
          }

          return {
            ...course,
            unitCount: units?.length || 0,
            lessonCount,
          };
        })
      );
      setCourses(coursesWithCounts);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingCourse) return;
    setSaving(true);

    try {
      if (editingCourse.id) {
        await supabase
          .from("courses")
          .update({
            title: editingCourse.title,
            imageSrc: editingCourse.imageSrc,
            category: editingCourse.category,
          })
          .eq("id", editingCourse.id);
      } else {
        await supabase.from("courses").insert({
          title: editingCourse.title,
          imageSrc: editingCourse.imageSrc,
          category: editingCourse.category,
        });
      }

      setEditingCourse(null);
      await loadCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Check for enrollments/progress before deletion
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id")
      .eq("courseId", id);

    const { data: progress } = await supabase
      .from("user_progress")
      .select("userId")
      .eq("activeCourseId", id);

    if (enrollments && enrollments.length > 0) {
      alert(`Cannot delete course: ${enrollments.length} user(s) are enrolled in this course. Please remove enrollments first.`);
      return;
    }

    if (progress && progress.length > 0) {
      alert(`Cannot delete course: ${progress.length} user(s) have this as their active course. Please change their active course first.`);
      return;
    }

    if (!confirm("Are you sure you want to delete this course? This will also delete all units, lessons, and challenges for this course.")) return;

    try {
      await supabase.from("courses").delete().eq("id", id);
      await loadCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
          <Button onClick={() => setEditingCourse({ title: "", imageSrc: "/mascot.svg", category: "programming" })} variant="secondary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        </div>

        {/* Edit Modal */}
        {editingCourse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-heading font-bold text-primary-900 mb-4">
                {editingCourse.id ? "Edit Course" : "New Course"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingCourse.category}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-600 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={editingCourse.imageSrc}
                    onChange={(e) => setEditingCourse({ ...editingCourse, imageSrc: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setEditingCourse(null)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} variant="secondary">
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}

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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCourse(course)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(course.id!)}>
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Layers className="w-4 h-4" />
                      {course.unitCount} units
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.lessonCount} lessons
                    </div>
                  </div>
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
}
