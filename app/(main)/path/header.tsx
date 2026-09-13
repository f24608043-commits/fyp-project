import { Flame, Heart, Star } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type HeaderProps = {
  title: string;
  streak?: number;
  xp?: number;
  hearts?: number;
};

export const Header = ({ title, streak = 0, xp = 0, hearts = 5 }: HeaderProps) => {
  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-primary-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/courses" prefetch>
          <Button size="sm" variant="ghost" className="rounded-xl">
            ← Back
          </Button>
        </Link>

        <h1 className="text-xl font-heading font-bold text-primary-900">{title}</h1>

        <div className="flex items-center gap-2">
          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-destructive-50 text-destructive-600 px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-heading font-bold">{streak}</span>
            </div>
          )}
          
          {/* XP */}
          {xp > 0 && (
            <div className="flex items-center gap-1 bg-accent-50 text-accent-700 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4" />
              <span className="text-sm font-heading font-bold">{xp}</span>
            </div>
          )}
          
          {/* Hearts */}
          <div className="flex items-center gap-1 bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-heading font-bold">{hearts}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
