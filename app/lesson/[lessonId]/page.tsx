import { redirect } from "next/navigation";
import { getLesson, getUserProgress } from "@/db/queries";
import { getUser } from "@/lib/supabase/server";
import { Quiz } from "../quiz";

type LessonIdPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

const LessonIdPage = async ({ params }: LessonIdPageProps) => {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const { lessonId } = await params;

  const [lesson, userProgress] = await Promise.all([
    getLesson(Number(lessonId)),
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

export default LessonIdPage;
