import { redirect } from "next/navigation";

import { getAuthUser } from "@/lib/auth-context";
import { LearnerMobileNavigation, LearnerDesktopSidebar } from "@/components/learner-navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();
  if (!auth?.user) return redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <LearnerDesktopSidebar />
      <main className="md:ml-64 pb-20 md:pb-0">
        {children}
      </main>
      <LearnerMobileNavigation />
    </div>
  );
}
