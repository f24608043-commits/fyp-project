import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <div className="mx-auto flex w-full max-w-[988px] flex-1 flex-col items-center justify-center gap-6 p-4 lg:flex-row">
      <div className="relative mb-8 h-[240px] w-[240px] lg:mb-0 lg:h-[424px] lg:w-[424px]">
        <Image src="/hero.svg" alt="Hero" fill priority />
      </div>

      <div className="flex flex-col items-center gap-y-8 text-center lg:items-start lg:text-left">
        <h1 className="max-w-[480px] text-2xl font-extrabold text-neutral-700 lg:text-4xl">
          Learn, practice, and master skills with LEGO — Learn And Go.
        </h1>
        <p className="max-w-[440px] text-neutral-500 font-medium">
          Interactive video levels, AI-generated quizzes, ungated library access, streaks with friends, and 1-on-1 live tutor sessions.
        </p>

        <div className="flex w-full max-w-[330px] flex-col items-center gap-y-3">
          <Button size="lg" variant="secondary" className="w-full" asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>

          <Button size="lg" variant="primaryOutline" className="w-full" asChild>
            <Link href="/sign-in">I already have an account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
