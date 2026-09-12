import { redirect } from "next/navigation";

import { getUser } from "@/lib/supabase/server";
import { MobileNavigation, DesktopSidebar } from "@/components/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <DesktopSidebar />
      <main className="md:ml-64 pb-20 md:pb-0">
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
}
