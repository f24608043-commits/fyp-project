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
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Fetch user role to determine redirect destination
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("user_progress")
          .select("role")
          .eq("userId", user.id)
          .single();

        const role = profile?.role || "learner";
        
        // Role-based redirect
        const redirectPath = role === "tutor" ? "/tutor/dashboard" 
                          : role === "admin" ? "/admin/admin-home" 
                          : "/path";
        
        router.push(redirectPath);
        router.refresh();
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
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

        {/* Google Sign In */}
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full border-2 border-slate-200"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? <Loader className="h-5 w-5 animate-spin mr-2" /> : null}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

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

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-primary-600 hover:underline font-semibold"
            >
              Forgot password?
            </Link>
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
