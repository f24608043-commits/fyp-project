"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { X, Sparkles, Trophy, Flame, Star } from "lucide-react";
import { MascotHappy } from "@/components/mascot";
import { Button } from "@/components/ui/button";

type CelebrationType = "badge" | "level_up" | "streak" | "lesson_complete";

interface CelebrationModalProps {
  type: CelebrationType;
  title: string;
  message: string;
  xpGained?: number;
  badgeName?: string;
  streakCount?: number;
  level?: number;
  onClose: () => void;
}

export const CelebrationModal = ({
  type,
  title,
  message,
  xpGained = 0,
  badgeName,
  streakCount,
  level,
  onClose,
}: CelebrationModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getIcon = () => {
    switch (type) {
      case "badge":
        return <Trophy className="w-16 h-16 text-accent-500" />;
      case "level_up":
        return <Star className="w-16 h-16 text-accent-500" />;
      case "streak":
        return <Flame className="w-16 h-16 text-destructive-500" />;
      case "lesson_complete":
        return <Sparkles className="w-16 h-16 text-success-500" />;
    }
  };

  const getSecondaryInfo = () => {
    if (xpGained > 0) {
      return (
        <div className="flex items-center gap-2 bg-success-50 text-success-700 px-4 py-2 rounded-full font-bold">
          <Sparkles className="w-5 h-5" />
          <span>+{xpGained} XP</span>
        </div>
      );
    }
    if (streakCount) {
      return (
        <div className="flex items-center gap-2 bg-destructive-50 text-destructive-700 px-4 py-2 rounded-full font-bold">
          <Flame className="w-5 h-5" />
          <span>{streakCount} Day Streak!</span>
        </div>
      );
    }
    if (level) {
      return (
        <div className="flex items-center gap-2 bg-accent-50 text-accent-700 px-4 py-2 rounded-full font-bold">
          <Star className="w-5 h-5" />
          <span>Level {level}</span>
        </div>
      );
    }
    if (badgeName) {
      return (
        <div className="flex items-center gap-2 bg-accent-50 text-accent-700 px-4 py-2 rounded-full font-bold">
          <Trophy className="w-5 h-5" />
          <span>{badgeName}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {mounted && (
        <Confetti
          recycle={false}
          numberOfPieces={300}
          tweenDuration={10000}
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}
      
      <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-bounce-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="animate-pulse-glow">{getIcon()}</div>

          {/* Mascot */}
          <MascotHappy size={120} className="animate-bounce" />

          {/* Title */}
          <h2 className="text-3xl font-heading font-bold text-primary-900">
            {title}
          </h2>

          {/* Message */}
          <p className="text-lg text-muted-foreground font-body">
            {message}
          </p>

          {/* Secondary info (XP, streak, etc.) */}
          {getSecondaryInfo()}

          {/* Continue button */}
          <Button
            size="lg"
            onClick={onClose}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-heading font-bold text-lg py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Awesome! Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};
