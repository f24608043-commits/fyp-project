import { redirect } from "next/navigation";
import { getLibraryLessons, getUserProgress } from "@/db/queries";
import { getUser } from "@/lib/supabase/server";
import { LibraryClient } from "./library-client";

export default async function LibraryPage() {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const userProgress = await getUserProgress();
  const lessons = await getLibraryLessons();

  return (
    <div className="mx-auto h-full max-w-6xl px-4 pb-12 pt-6">
      <div className="mb-8 space-y-3">
        <h1 className="text-4xl font-heading font-extrabold text-primary-900">Video Library</h1>
        <p className="text-lg text-muted-foreground font-body">
          Rewatch any lesson video ungated at your own pace. Exploring the library does not alter your path progress.
        </p>
      </div>

      <LibraryClient initialLessons={lessons} />
    </div>
  );
}
