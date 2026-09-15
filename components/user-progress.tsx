import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { courses } from "@/db/schema";

type UserProgressProps = {
  activeCourse: typeof courses.$inferSelect;
  hearts: number;
  points: number;
};

export const UserProgress = ({
  activeCourse,
  hearts,
  points,
}: UserProgressProps) => {
  return (
    <div className="flex w-full items-center justify-between gap-x-2">
      <Link href="/courses" prefetch={false}>
        <Button variant="ghost" className="rounded-xl border-2 border-slate-200 hover:border-green-400 transition-all">
          <Image
            src={activeCourse.imageSrc}
            alt={activeCourse.title}
            className="rounded-lg border-2 border-slate-300"
            width={40}
            height={40}
          />
        </Button>
      </Link>

      <Button 
        variant="ghost" 
        className="text-orange-500 font-bold rounded-xl border-2 border-orange-200 hover:bg-orange-50 transition-all" 
        disabled
      >
        <span className="text-xl mr-2">⭐</span>
        {points}
      </Button>

      <Button 
        variant="ghost" 
        className="text-red-500 font-bold rounded-xl border-2 border-red-200 hover:bg-red-50 transition-all" 
        disabled
      >
        <span className="text-xl mr-2">❤️</span>
        {hearts}
      </Button>
    </div>
  );
};
