"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Attempting sign in with:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Sign in result:", { data, error });

    if (error) {
      console.error("Sign in error:", error);
      setError(error.message);
      setLoading(false);
    } else {
      console.log("Sign in successful, redirecting to /path");
      // Wait a moment for auth state to be set
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push("/path");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-700">Welcome Back</h2>
          <p className="text-sm text-neutral-500">Sign in to continue your learning journey</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-600 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} size="lg" variant="secondary" className="w-full">
            {loading ? <Loader className="h-5 w-5 animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-bold text-green-600 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
