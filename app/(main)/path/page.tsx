import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import {
  getCourseProgress,
  getLessonPercentage,
  getUnits,
  getUserProgress,
} from "@/db/queries";
import { getAuthUser } from "@/lib/auth-context";

import { Header } from "./header";
import { Unit } from "./unit";

const LearnPage = async () => {
  const auth = await getAuthUser();
  if (!auth?.user) return redirect("/sign-in");

  const [
    userProgress,
    units,
    courseProgress,
    lessonPercentage,
  ] = await Promise.all([
    getUserProgress(),
    getUnits(),
    getCourseProgress(),
    getLessonPercentage(),
  ]);

  if (!courseProgress || !userProgress || !userProgress.activeCourse)
    return redirect("/courses");

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
        />
        <Quests points={userProgress.points} />
      </StickyWrapper>
      <FeedWrapper>
        <Header 
          title={userProgress.activeCourse.title} 
          streak={userProgress.currentStreak || 0}
          xp={userProgress.xp || 0}
          hearts={userProgress.hearts}
        />
        {units.map((unit) => (
          <div key={unit.id} className="mb-10">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              lessons={unit.lessons}
              activeLesson={courseProgress.activeLesson}
              activeLessonPercentage={lessonPercentage}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
