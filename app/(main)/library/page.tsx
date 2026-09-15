import { redirect } from "next/navigation";
import { getLibraryLessons } from "@/db/queries";
import { getUser } from "@/lib/supabase/server";
import { LibraryClient } from "./library-client";

export default async function LibraryPage() {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const lessons = await getLibraryLessons();

  return (
    <div className="mx-auto h-full max-w-6xl px-4 pb-12 pt-6">
      <div className="mb-8 space-y-3">
        <div className="text-5xl mb-2">📚</div>
        <h1 className="text-4xl font-extrabold text-slate-800">Video Library</h1>
        <p className="text-lg text-slate-500">
          Rewatch any lesson video ungated at your own pace. Exploring the library does not alter your path progress.
        </p>
      </div>

      <LibraryClient initialLessons={lessons} />
    </div>
  );
}
