"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

type Unit = {
  id?: number;
  title: string;
  description: string;
  order: number;
};

type Lesson = {
  id?: number;
  title: string;
  order: number;
  youtubeVideoId?: string;
};

export default function AdminCourseEditorPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const courseId = Number(params.courseId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/sign-in");
      return;
    }

    // Load course
    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseData) {
      setCourse(courseData);
    }

    // Load units
    const { data: unitsData } = await supabase
      .from("units")
      .select("*")
      .eq("courseId", courseId)
      .order("order");

    if (unitsData) {
      setUnits(unitsData);

      // Load lessons for each unit
      const lessonsData: Record<number, Lesson[]> = {};
      for (const unit of unitsData) {
        const { data: unitLessons } = await supabase
          .from("lessons")
          .select("*")
          .eq("unitId", unit.id)
          .order("order");
        lessonsData[unit.id] = unitLessons || [];
      }
      setLessons(lessonsData);
    }

    setLoading(false);
  };

  const addUnit = () => {
    const newOrder = units.length + 1;
    setUnits([...units, { title: "", description: "", order: newOrder }]);
  };

  const removeUnit = (index: number) => {
    const newUnits = units.filter((_, i) => i !== index);
    setUnits(newUnits.map((u, i) => ({ ...u, order: i + 1 })));
  };

  const updateUnit = (index: number, field: keyof Unit, value: string | number) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };

  const addLesson = (unitIndex: number) => {
    const unitId = units[unitIndex].id || 0;
    const unitLessons = lessons[unitId] || [];
    const newOrder = unitLessons.length + 1;
    setLessons({
      ...lessons,
      [unitId]: [...unitLessons, { title: "", order: newOrder, youtubeVideoId: "" }],
    });
  };

  const removeLesson = (unitIndex: number, lessonIndex: number) => {
    const unitId = units[unitIndex].id || 0;
    const unitLessons = lessons[unitId] || [];
    const newLessons = unitLessons.filter((_, i) => i !== lessonIndex);
    setLessons({
      ...lessons,
      [unitId]: newLessons.map((l, i) => ({ ...l, order: i + 1 })),
    });
  };

  const updateLesson = (unitIndex: number, lessonIndex: number, field: keyof Lesson, value: string) => {
    const unitId = units[unitIndex].id || 0;
    const unitLessons = lessons[unitId] || [];
    const newLessons = [...unitLessons];
    newLessons[lessonIndex] = { ...newLessons[lessonIndex], [field]: value };
    setLessons({ ...lessons, [unitId]: newLessons });
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Update course
      await supabase
        .from("courses")
        .update({ title: course.title, category: course.category })
        .eq("id", courseId);

      // Delete existing units
      const { data: existingUnits } = await supabase
        .from("units")
        .select("id")
        .eq("courseId", courseId);
      
      if (existingUnits) {
        for (const unit of existingUnits) {
          await supabase.from("lessons").delete().eq("unitId", unit.id);
        }
        await supabase.from("units").delete().eq("courseId", courseId);
      }

      // Insert units and lessons
      for (const unit of units) {
        const { data: newUnit } = await supabase
          .from("units")
          .insert({
            courseId,
            title: unit.title,
            description: unit.description,
            order: unit.order,
          })
          .select()
          .single();

        if (newUnit && lessons[unit.id || 0]) {
          for (const lesson of lessons[unit.id || 0]) {
            await supabase.from("lessons").insert({
              unitId: newUnit.id,
              title: lesson.title,
              order: lesson.order,
              youtubeVideoId: lesson.youtubeVideoId,
            });
          }
        }
      }

      alert("Course saved successfully!");
      await loadCourseData();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-extrabold text-primary-900">
                Edit Course
              </h1>
              <p className="text-muted-foreground">Manage course structure and content</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} variant="secondary" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-heading font-bold text-primary-900 mb-4">Course Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">Title</label>
              <input
                type="text"
                value={course?.title || ""}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">Category</label>
              <input
                type="text"
                value={course?.category || ""}
                onChange={(e) => setCourse({ ...course, category: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Units */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-bold text-primary-900">Units</h2>
            <Button onClick={addUnit} variant="secondary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Unit
            </Button>
          </div>

          {units.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No units added yet.</p>
          ) : (
            <div className="space-y-6">
              {units.map((unit, unitIndex) => (
                <div key={unitIndex} className="border-2 border-slate-100 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={unit.title}
                        onChange={(e) => updateUnit(unitIndex, "title", e.target.value)}
                        placeholder="Unit Title"
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none font-bold"
                      />
                      <textarea
                        value={unit.description}
                        onChange={(e) => updateUnit(unitIndex, "description", e.target.value)}
                        placeholder="Unit Description"
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        rows={2}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeUnit(unitIndex)} className="text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Lessons */}
                  <div className="ml-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-muted-foreground">Lessons</span>
                      <Button size="sm" variant="ghost" onClick={() => addLesson(unitIndex)} className="flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        Add Lesson
                      </Button>
                    </div>
                    {(lessons[unit.id || 0] || []).map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(unitIndex, lessonIndex, "title", e.target.value)}
                          placeholder="Lesson Title"
                          className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
                        />
                        <input
                          type="text"
                          value={lesson.youtubeVideoId || ""}
                          onChange={(e) => updateLesson(unitIndex, lessonIndex, "youtubeVideoId", e.target.value)}
                          placeholder="YouTube ID"
                          className="w-32 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeLesson(unitIndex, lessonIndex)} className="text-red-500 h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
