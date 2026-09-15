import { BookOpen } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type UnitBannerProps = {
  title: string;
  description: string;
};

export const UnitBanner = ({ title, description }: UnitBannerProps) => {
  return (
    <div className="flex w-full items-center justify-between rounded-3xl bg-gradient-to-r from-green-500 to-green-600 p-6 text-white shadow-lg shadow-green-200 border-b-4 border-green-700">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg opacity-90">{description}</p>
      </div>

      <div className="hidden sm:block">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 border-2 border-white/30">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
};
