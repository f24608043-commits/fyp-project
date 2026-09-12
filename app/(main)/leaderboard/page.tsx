import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { redirect } from "next/navigation";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getUserProgress, getTopTenUsers, getUserSubscription } from "@/db/queries";
import { getUser } from "@/lib/supabase/server";

const LeaderboardPage = async () => {
  const user = await getUser();
  if (!user) return redirect("/sign-in");

  const [userProgress, userSubscription, leaderboard] = await Promise.all([
    getUserProgress(),
    getUserSubscription(),
    getTopTenUsers(),
  ]);

  if (!userProgress || !userProgress.activeCourse) return redirect("/courses");

  const isPro = !!userSubscription?.isActive;

  const getRankIcon = (rank: number) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `#${rank + 1}`;
  };

  const getRankChange = (rank: number) => {
    // This would be calculated from historical data
    // For now, return random changes for demo
    const changes = [TrendingUp, TrendingDown, Minus];
    const randomChange = changes[Math.floor(Math.random() * changes.length)];
    return randomChange;
  };

  return (
    <div className="mx-auto h-full max-w-4xl px-4 pb-12 pt-6">
      <div className="mb-8 space-y-3 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full shadow-xl shadow-accent-200 mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-heading font-extrabold text-primary-900">Leaderboard</h1>
        <p className="text-lg text-muted-foreground font-body">
          See where you stand among other learners in the community.
        </p>
      </div>

      <div className="space-y-4">
        {leaderboard.map((item, i) => {
          const RankChangeIcon = getRankChange(i);
          const isCurrentUser = item.userId === userProgress.userId;
          
          return (
            <div
              key={item.userId}
              className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all hover:scale-[1.02] ${
                isCurrentUser
                  ? "bg-primary-500 border-primary-600 shadow-xl shadow-primary-200"
                  : i === 0
                  ? "bg-accent-50 border-accent-200 shadow-lg shadow-accent-100"
                  : i === 1
                  ? "bg-secondary-50 border-secondary-200 shadow-lg shadow-secondary-100"
                  : i === 2
                  ? "bg-success-50 border-success-200 shadow-lg shadow-success-100"
                  : "bg-white border-primary-100 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Rank */}
              <div className={`text-2xl font-heading font-bold w-12 text-center ${
                isCurrentUser ? "text-white" : "text-primary-900"
              }`}>
                {getRankIcon(i)}
              </div>

              {/* Avatar */}
              <Avatar className="h-14 w-14 border-4 border-white shadow-lg">
                <AvatarImage
                  src={item.userImageSrc}
                  className="object-cover"
                />
              </Avatar>

              {/* Name */}
              <div className="flex-1">
                <p className={`font-heading font-bold text-lg ${
                  isCurrentUser ? "text-white" : "text-primary-900"
                }`}>
                  {item.userName}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs font-normal opacity-80">(You)</span>
                  )}
                </p>
              </div>

              {/* XP */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-heading font-bold ${
                isCurrentUser
                  ? "bg-white/20 text-white"
                  : "bg-primary-100 text-primary-700"
              }`}>
                <Trophy className="w-4 h-4" />
                <span>{item.points} XP</span>
              </div>

              {/* Rank change indicator */}
              {!isCurrentUser && (
                <div className="text-muted-400">
                  <RankChangeIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary-300" />
          <p className="text-xl font-heading font-bold">No leaderboard data yet</p>
          <p className="text-base font-body">Complete lessons to earn XP and climb the ranks!</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
