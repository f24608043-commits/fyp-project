"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, Flame, GraduationCap, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Path", href: "/path", icon: Compass },
  { label: "Library", href: "/library", icon: BookOpen },
  { label: "Live Classes", href: "/live-classes", icon: GraduationCap },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Profile", href: "/profile", icon: User },
];

export const BottomNavigation = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t-2 border-slate-200 bg-white px-2 lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-xs font-bold transition-colors",
              isActive
                ? "text-green-600 font-extrabold"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
