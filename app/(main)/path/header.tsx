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
    <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b-2 border-green-100 shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/courses" prefetch={false}>
          <Button 
            size="sm" 
            variant="ghost" 
            className="rounded-xl font-bold text-green-600 hover:bg-green-50 border-2 border-transparent hover:border-green-200"
          >
            ← Back
          </Button>
        </Link>

        <h1 className="text-xl font-bold text-slate-800">{title}</h1>

        <div className="flex items-center gap-2">
          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border-2 border-orange-200 border-b-4">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-bold">{streak}</span>
            </div>
          )}
          
          {/* XP */}
          {xp > 0 && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border-2 border-blue-200 border-b-4">
              <Star className="w-4 h-4" />
              <span className="text-sm font-bold">{xp}</span>
            </div>
          )}
          
          {/* Hearts */}
          <div className="flex items-center gap-1 bg-red-50 text-red-500 px-3 py-1.5 rounded-full border-2 border-red-200 border-b-4">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-bold">{hearts}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
