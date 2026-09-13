import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MascotHappy } from "@/components/mascot";

export default function MarketingPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 p-6 lg:flex-row">
      <div className="relative mb-8 h-[300px] w-[300px] lg:mb-0 lg:h-[500px] lg:w-[500px]">
        <div className="w-full h-full flex items-center justify-center">
          <MascotHappy className="w-full h-full" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-8 text-center lg:items-start lg:text-left">
        <h1 className="max-w-[600px] text-4xl lg:text-5xl font-heading font-extrabold text-primary-900 leading-tight">
          Learn, practice, and master skills with <span className="text-primary-600">LEGO</span> — Learn And Go.
        </h1>
        <p className="max-w-[500px] text-lg text-muted-foreground font-body">
          Interactive video levels, AI-generated quizzes, ungated library access, streaks with friends, and 1-on-1 live tutor sessions.
        </p>

        <div className="flex w-full max-w-[350px] flex-col items-center gap-y-4">
          <Button size="lg" className="w-full text-lg font-heading font-bold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl shadow-xl shadow-primary-200" asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>

          <Button size="lg" variant="default" className="w-full text-lg font-heading font-bold border-2 border-primary-200 text-primary-700 hover:bg-primary-50 rounded-2xl" asChild>
            <Link href="/sign-in">I already have an account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
