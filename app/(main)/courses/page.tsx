import { redirect } from "next/navigation";
import { getCourses, getUserProgress } from "@/db/queries";
import { getUser } from "@/lib/supabase/server";
import { List } from "./list";

const CoursesPage = async () => {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const [courses, userProgress] = await Promise.all([
    getCourses(),
    getUserProgress(),
  ]);

  return (
    <div className="mx-auto h-full max-w-[912px] px-3">
      <h1 className="text-2xl font-bold text-neutral-700 mb-6">Courses & Skill Paths</h1>
      <List courses={courses} activeCourseId={userProgress?.activeCourseId} />
    </div>
  );
};

export default CoursesPage;
