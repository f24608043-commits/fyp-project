import db from "@/db/drizzle";
import { badges, userBadges, userProgress } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function checkAndAwardBadges(
  userId: string,
  eventType: "level_complete" | "streak" | "perfect_quiz",
  context: { count?: number; streak?: number; courseCategory?: string } = {}
) {
  try {
    const allBadges = await db.query.badges.findMany();
    const existingUserBadges = await db.query.userBadges.findMany({
      where: eq(userBadges.userId, userId),
    });
    const awardedBadgeIds = new Set(existingUserBadges.map((b) => b.badgeId));

    for (const badge of allBadges) {
      if (awardedBadgeIds.has(badge.id)) continue;

      const criteria = badge.criteria as { type?: string; count?: number; days?: number };
      if (!criteria || criteria.type !== eventType) continue;

      let eligible = false;
      if (eventType === "level_complete" && context.count && criteria.count && context.count >= criteria.count) {
        eligible = true;
      } else if (eventType === "streak" && context.streak && criteria.days && context.streak >= criteria.days) {
        eligible = true;
      } else if (eventType === "perfect_quiz" && context.count && criteria.count && context.count >= criteria.count) {
        eligible = true;
      }

      if (eligible) {
        await db.insert(userBadges).values({
          userId,
          badgeId: badge.id,
        });
      }
    }
  } catch (error) {
    console.error("Error in checkAndAwardBadges:", error);
  }
}
