import { redirect } from "next/navigation";
import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries";
import { getUser } from "@/lib/supabase/server";
import { Quiz } from "./quiz";

const LessonPage = async () => {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const [lesson, userProgress, userSubscription] = await Promise.all([
    getLesson(),
    getUserProgress(),
    getUserSubscription(),
  ]);

  if (!lesson || !userProgress) return redirect("/learn");

  const initialPercentage =
    (lesson.challenges.filter((challenge) => challenge.completed).length /
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
      userSubscription={userSubscription}
    />
  );
};

export default LessonPage;
