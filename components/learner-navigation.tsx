"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Flame, BookOpen, Video, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/path", label: "Path", icon: Flame },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/live-classes", label: "Live", icon: Video },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export const LearnerMobileNavigation = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-muted shadow-lg z-40 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary-500" : "text-muted-foreground hover:text-primary-400"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "animate-pulse-glow")} />
              <span className="text-xs font-heading font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export const LearnerDesktopSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-muted h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-muted">
        <h1 className="text-2xl font-heading font-bold text-primary-600">
          LEGO
        </h1>
        <p className="text-sm text-muted-foreground font-body">Learn And Go</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-heading font-semibold",
                isActive
                  ? "bg-primary-500 text-white shadow-lg"
                  : "text-muted-foreground hover:bg-primary-50 hover:text-primary-600"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-muted">
        <p className="text-xs text-muted-foreground text-center font-body">
          © 2024 LEGO — Learn And Go
        </p>
      </div>
    </aside>
  );
};
