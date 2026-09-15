import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QUESTS } from "@/constants";

type QuestsProps = { points: number };

export const Quests = ({ points }: QuestsProps) => {
  return (
    <div className="space-y-4 rounded-2xl border-2 border-slate-200 border-b-4 bg-white p-4 shadow-md">
      <div className="flex w-full items-center justify-between space-y-2">
        <h3 className="text-lg font-bold text-slate-800">🎯 Quests</h3>

        <Link href="/quests" prefetch={false}>
          <Button 
            size="sm" 
            variant="ghost"
            className="rounded-xl font-bold text-green-600 hover:bg-green-50 border-2 border-transparent hover:border-green-200"
          >
            View all
          </Button>
        </Link>
      </div>

      <ul className="w-full space-y-4">
        {QUESTS.map((quest) => {
          const progress = (points / quest.value) * 100;

          return (
            <div
              className="flex w-full items-center gap-x-3 pb-4 border-b border-slate-100 last:border-0"
              key={quest.title}
            >
              <div className="text-4xl">⭐</div>

              <div className="flex w-full flex-col gap-y-2">
                <p className="text-sm font-bold text-slate-700">
                  {quest.title}
                </p>

                <Progress value={progress} className="h-3 bg-slate-100" />
              </div>
            </div>
          );
        })}
      </ul>
    </div>
  );
};
