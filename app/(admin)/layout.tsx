import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth-context";
import { getUserProgress } from "@/db/queries";
import { AdminMobileNavigation, AdminDesktopSidebar } from "@/components/admin-navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();
  if (!auth?.user) return redirect("/sign-in");

  const userProgress = await getUserProgress();
  if (!userProgress || userProgress.role !== "admin") {
    return redirect("/path");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <AdminDesktopSidebar />
      <main className="md:ml-64 pb-20 md:pb-0">
        {children}
      </main>
      <AdminMobileNavigation />
    </div>
  );
}
