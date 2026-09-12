import { redirect } from "next/navigation";
import { getBadges, getFriendships, getUserBadges, getUserProgress } from "@/db/queries";
import { getUser } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const [userProgress, allBadges, userBadgesList, friendshipsList] = await Promise.all([
    getUserProgress(),
    getBadges(),
    getUserBadges(user.id),
    getFriendships(),
  ]);

  return (
    <div className="mx-auto h-full max-w-4xl px-4 pb-12 pt-6">
      <ProfileClient
        userId={user.id}
        userEmail={user.email || ""}
        userProgress={userProgress}
        allBadges={allBadges}
        userBadges={userBadgesList}
        friendships={friendshipsList}
      />
    </div>
  );
}
