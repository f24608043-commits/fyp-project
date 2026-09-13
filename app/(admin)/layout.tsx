import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getUserProgress } from "@/db/queries";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const userProgress = await getUserProgress();
  if (!userProgress || userProgress.role !== "admin") {
    return redirect("/path");
  }

  return <>{children}</>;
}
