"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Compass, GraduationCap, LogOut, ShieldAlert, ShoppingBag, Trophy, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className }: SidebarProps) => {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col border-r-2 border-slate-200 px-4 lg:fixed lg:w-[256px] bg-white",
        className
      )}
    >
      <Link href="/path" prefetch>
        <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
          <Image src="/mascot.svg" alt="Mascot" height={40} width={40} />
          <h1 className="text-2xl font-extrabold tracking-wide text-green-600">
            LEGO
          </h1>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-y-2">
        <SidebarItem label="Path" href="/path" iconSrc="/learn.svg" />
        <SidebarItem label="Library" href="/library" iconSrc="/quests.svg" />
        <SidebarItem label="Live Classes" href="/live-classes" iconSrc="/leaderboard.svg" />
        <SidebarItem label="Leaderboard" href="/leaderboard" iconSrc="/leaderboard.svg" />
        <SidebarItem label="Profile" href="/profile" iconSrc="/mascot.svg" />
      </div>

      <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-x-3 px-4 py-2.5 rounded-xl text-sm font-bold text-neutral-500 hover:text-red-500 hover:bg-slate-50 transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
