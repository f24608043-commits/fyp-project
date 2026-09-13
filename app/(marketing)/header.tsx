"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="h-24 w-full border-b-2 border-primary-100 bg-white/80 backdrop-blur-sm px-4">
      <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
        <Link href="/" prefetch className="flex items-center gap-x-3">
          <Image src="/mascot.svg" alt="Mascot" height={48} width={48} />
          <h1 className="text-3xl font-heading font-extrabold tracking-wide text-primary-600">
            LEGO
          </h1>
        </Link>

        <div className="flex items-center gap-x-3">
          <Button size="lg" variant="ghost" className="font-heading font-bold text-primary-700 hover:bg-primary-50 rounded-2xl" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button size="lg" className="font-heading font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-200" asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
