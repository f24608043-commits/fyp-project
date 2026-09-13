import { redirect } from "next/navigation";
import { getLesson, getUserProgress } from "@/db/queries";
import { getUser } from "@/lib/supabase/server";
import { Quiz } from "./quiz";

const LessonPage = async () => {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const [lesson, userProgress] = await Promise.all([
    getLesson(),
    getUserProgress(),
  ]);

  if (!lesson || !userProgress) return redirect("/path");

  const initialPercentage =
    (lesson.challenges.filter((challenge: any) => challenge.completed).length /
      (lesson.challenges.length || 1)) *
    100;

  return (
    <Quiz
      initialLessonId={lesson.id}
      lessonTitle={lesson.title}
      youtubeVideoId={lesson.youtubeVideoId}
      initialLessonChallenges={lesson.challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={initialPercentage}
    />
  );
};

export default LessonPage;
