"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

type Challenge = {
  id?: number;
  type: "SELECT" | "ASSIST";
  question: string;
  order: number;
  options: Array<{
    id?: number;
    text: string;
    correct: boolean;
  }>;
};

export default function AdminLessonEditorPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const lessonId = Number(params.lessonId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/sign-in");
      return;
    }

    // Load lesson
    const { data: lessonData } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (lessonData) {
      setLesson(lessonData);
    }

    // Load challenges with options
    const { data: challengesData } = await supabase
      .from("challenges")
      .select("*, challenge_options(*)")
      .eq("lessonId", lessonId)
      .order("order");

    if (challengesData) {
      setChallenges(
        challengesData.map((c: any) => ({
          id: c.id,
          type: c.type,
          question: c.question,
          order: c.order,
          options: c.challenge_options || [],
        }))
      );
    }

    setLoading(false);
  };

  const addChallenge = () => {
    const newOrder = challenges.length + 1;
    setChallenges([
      ...challenges,
      {
        type: "SELECT",
        question: "",
        order: newOrder,
        options: [
          { text: "", correct: false },
          { text: "", correct: true },
          { text: "", correct: false },
        ],
      },
    ]);
  };

  const removeChallenge = (index: number) => {
    const newChallenges = challenges.filter((_, i) => i !== index);
    setChallenges(newChallenges.map((c, i) => ({ ...c, order: i + 1 })));
  };

  const updateChallenge = (index: number, field: keyof Challenge, value: any) => {
    const newChallenges = [...challenges];
    newChallenges[index] = { ...newChallenges[index], [field]: value };
    setChallenges(newChallenges);
  };

  const addOption = (challengeIndex: number) => {
    const newChallenges = [...challenges];
    newChallenges[challengeIndex] = {
      ...newChallenges[challengeIndex],
      options: [...newChallenges[challengeIndex].options, { text: "", correct: false }],
    };
    setChallenges(newChallenges);
  };

  const removeOption = (challengeIndex: number, optionIndex: number) => {
    const newChallenges = [...challenges];
    newChallenges[challengeIndex] = {
      ...newChallenges[challengeIndex],
      options: newChallenges[challengeIndex].options.filter((_, i) => i !== optionIndex),
    };
    setChallenges(newChallenges);
  };

  const updateOption = (challengeIndex: number, optionIndex: number, field: "text" | "correct", value: any) => {
    const newChallenges = [...challenges];
    newChallenges[challengeIndex] = {
      ...newChallenges[challengeIndex],
      options: newChallenges[challengeIndex].options.map((opt, i) =>
        i === optionIndex ? { ...opt, [field]: value } : opt
      ),
    };
    setChallenges(newChallenges);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Update lesson
      await supabase
        .from("lessons")
        .update({ title: lesson.title, youtubeVideoId: lesson.youtubeVideoId })
        .eq("id", lessonId);

      // Delete existing challenges
      await supabase.from("challenges").delete().eq("lessonId", lessonId);

      // Insert challenges and options
      for (const challenge of challenges) {
        const { data: newChallenge } = await supabase
          .from("challenges")
          .insert({
            lessonId,
            type: challenge.type,
            question: challenge.question,
            order: challenge.order,
            generatedBy: "admin",
          })
          .select()
          .single();

        if (newChallenge) {
          for (const option of challenge.options) {
            await supabase.from("challenge_options").insert({
              challengeId: newChallenge.id,
              text: option.text,
              correct: option.correct,
            });
          }
        }
      }

      alert("Lesson saved successfully!");
      await loadLessonData();
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert("Failed to save lesson");
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
                Edit Lesson
              </h1>
              <p className="text-muted-foreground">Manage lesson content and quiz challenges</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} variant="secondary" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Lesson Details */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-heading font-bold text-primary-900 mb-4">Lesson Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">Title</label>
              <input
                type="text"
                value={lesson?.title || ""}
                onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1">YouTube Video ID</label>
              <input
                type="text"
                value={lesson?.youtubeVideoId || ""}
                onChange={(e) => setLesson({ ...lesson, youtubeVideoId: e.target.value })}
                placeholder="e.g., kqtD5dpn9C8"
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-bold text-primary-900">Quiz Challenges</h2>
            <Button onClick={addChallenge} variant="secondary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Challenge
            </Button>
          </div>

          {challenges.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No challenges added yet.</p>
          ) : (
            <div className="space-y-6">
              {challenges.map((challenge, challengeIndex) => (
                <div key={challengeIndex} className="border-2 border-slate-100 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-4">
                        <select
                          value={challenge.type}
                          onChange={(e) => updateChallenge(challengeIndex, "type", e.target.value)}
                          className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        >
                          <option value="SELECT">Multiple Choice</option>
                          <option value="ASSIST">Fill in the Blank</option>
                        </select>
                        <span className="text-sm text-muted-foreground self-center">Order: {challenge.order}</span>
                      </div>
                      <textarea
                        value={challenge.question}
                        onChange={(e) => updateChallenge(challengeIndex, "question", e.target.value)}
                        placeholder="Question text"
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-primary-500 focus:outline-none"
                        rows={2}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeChallenge(challengeIndex)} className="text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Options */}
                  <div className="ml-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-muted-foreground">Options</span>
                      <Button size="sm" variant="ghost" onClick={() => addOption(challengeIndex)} className="flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        Add Option
                      </Button>
                    </div>
                    {challenge.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          checked={option.correct}
                          onChange={(e) => updateOption(challengeIndex, optionIndex, "correct", e.target.checked)}
                          className="h-5 w-5"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(challengeIndex, optionIndex, "text", e.target.value)}
                          placeholder="Option text"
                          className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeOption(challengeIndex, optionIndex)} className="text-red-500 h-8 w-8">
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
