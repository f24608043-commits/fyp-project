"use client";

import { Check, Crown, Star, Lock } from "lucide-react";
import Link from "next/link";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "react-circular-progressbar/dist/styles.css";

type LessonButtonProps = {
  id: number;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
};

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
}: LessonButtonProps) => {
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;

  if (cycleIndex <= 2) indentationLevel = cycleIndex;
  else if (cycleIndex <= 4) indentationLevel = 4 - cycleIndex;
  else if (cycleIndex <= 6) indentationLevel = 4 - cycleIndex;
  else indentationLevel = cycleIndex - 8;

  const rightPosition = indentationLevel * 40;

  const isFirst = index === 0;
  const isLast = index === totalCount;
  const isCompleted = !current && !locked;

  const Icon = isCompleted ? Check : isLast ? Crown : Star;

  const href = isCompleted ? `/lesson/${id}` : "/lesson";

  return (
    <Link
      href={href}
      prefetch={false}
      aria-disabled={locked}
      style={{ pointerEvents: locked ? "none" : "auto" }}
    >
      <div
        className="relative"
        style={{
          right: `${rightPosition}px`,
          marginTop: isFirst && !isCompleted ? 60 : 24,
        }}
      >
        {current ? (
          <div className="relative h-[120px] w-[120px]">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 animate-bounce rounded-2xl border-2 border-green-500 bg-white px-4 py-2 font-bold uppercase tracking-wide text-green-600 shadow-lg border-b-4">
              Start
              <div
                className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent border-t-green-500"
                aria-hidden
              />
            </div>
            <CircularProgressbarWithChildren
              value={Number.isNaN(percentage) ? 0 : percentage}
              styles={{
                path: {
                  stroke: "#22C55E",
                  strokeWidth: 8,
                },
                trail: {
                  stroke: "#E8F5E9",
                  strokeWidth: 8,
                },
              }}
            >
              <Button
                size="rounded"
                className="h-[80px] w-[80px] rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-xl shadow-green-200 border-4 border-white border-b-6"
              >
                <Icon className="h-10 w-10" />
              </Button>
            </CircularProgressbarWithChildren>
          </div>
        ) : (
          <Button
            size="rounded"
            className={cn(
              "h-[80px] w-[80px] rounded-full shadow-lg transition-all hover:scale-105 border-4 border-b-6",
              locked
                ? "bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300"
                : isCompleted
                ? "bg-green-500 text-white shadow-green-200 border-green-600"
                : "bg-white text-green-600 border-green-200"
            )}
          >
            {locked ? (
              <Lock className="h-10 w-10" />
            ) : (
              <Icon
                className={cn(
                  "h-10 w-10",
                  isCompleted && "fill-white stroke-white"
                )}
              />
            )}
          </Button>
        )}
      </div>
    </Link>
  );
};
