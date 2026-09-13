"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

type Step = "welcome" | "course" | "placement" | "goal" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>("welcome");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    // Fetch courses directly from Supabase client-side
    supabase.from("courses").select("*").then(({ data }) => {
      if (data) setCourses(data);
    });
  }, [supabase]);

  const handleNext = async () => {
    if (step === "welcome") {
      setStep("course");
    } else if (step === "course" && selectedCourseId) {
      setStep("placement");
    } else if (step === "placement") {
      setStep("goal");
    } else if (step === "goal" && selectedGoal) {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Create enrollment
          await supabase.from("enrollments").insert({
            userId: user.id,
            courseId: selectedCourseId,
          });
          
          // Set active course in userProgress
          await supabase.from("user_progress").upsert({
            userId: user.id,
            activeCourseId: selectedCourseId,
          });
          
          setStep("complete");
          setTimeout(() => {
            router.push("/path");
            router.refresh();
          }, 2000);
        }
      } catch (error) {
        console.error("Error completing onboarding:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step === "course") setStep("welcome");
    else if (step === "placement") setStep("course");
    else if (step === "goal") setStep("placement");
  };

  const canProceed = () => {
    if (step === "welcome") return true;
    if (step === "course") return selectedCourseId !== null;
    if (step === "placement") return true;
    if (step === "goal") return selectedGoal !== null;
    return false;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {["welcome", "course", "placement", "goal"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === s ? "bg-primary-500 text-white" : 
                ["welcome", "course", "placement", "goal"].indexOf(step) > i ? "bg-green-500 text-white" : 
                "bg-slate-200 text-slate-400"
              }`}>
                {["welcome", "course", "placement", "goal"].indexOf(step) > i ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-bold">{i + 1}</span>
                )}
              </div>
              {i < 3 && <div className={`w-16 h-1 mx-2 ${
                ["welcome", "course", "placement", "goal"].indexOf(step) > i ? "bg-green-500" : "bg-slate-200"
              }`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-8">
          {step === "welcome" && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-4xl">🎓</span>
              </div>
              <h1 className="text-3xl font-heading font-extrabold text-primary-900">
                Welcome to LEGO!
              </h1>
              <p className="text-lg text-muted-foreground font-body">
                Learn And Go — your personalized learning journey starts here. Let's set up your experience in just a few steps.
              </p>
            </div>
          )}

          {step === "course" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-primary-900">Choose Your Path</h2>
                <p className="text-muted-foreground">Select a course to begin your learning journey</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      selectedCourseId === course.id
                        ? "border-primary-500 bg-primary-50 shadow-lg"
                        : "border-slate-200 hover:border-primary-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl">
                        📚
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-primary-900">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "placement" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-primary-900">Your Experience Level</h2>
                <p className="text-muted-foreground">This helps us tailor the content to your needs</p>
              </div>
              <div className="space-y-3">
                {["Beginner - I'm new to this", "Intermediate - I have some experience", "Advanced - I'm quite experienced"].map((level) => (
                  <button
                    key={level}
                    className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-primary-300 hover:bg-slate-50 text-left transition-all"
                  >
                    <span className="font-medium text-primary-900">{level}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "goal" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-primary-900">Your Daily Goal</h2>
                <p className="text-muted-foreground">How much time can you dedicate each day?</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: "casual", label: "Casual - 5-10 minutes", icon: "☕" },
                  { id: "regular", label: "Regular - 15-30 minutes", icon: "🎯" },
                  { id: "intense", label: "Intense - 30+ minutes", icon: "🔥" },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                      selectedGoal === goal.id
                        ? "border-primary-500 bg-primary-50 shadow-lg"
                        : "border-slate-200 hover:border-primary-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="font-medium text-primary-900">{goal.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <Check className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-heading font-extrabold text-primary-900">
                You're All Set!
              </h1>
              <p className="text-lg text-muted-foreground font-body">
                Redirecting to your learning path...
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          {step !== "complete" && (
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === "welcome"}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                variant="secondary"
                className="flex items-center gap-2 px-8"
              >
                {loading ? "Setting up..." : step === "goal" ? "Complete" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
