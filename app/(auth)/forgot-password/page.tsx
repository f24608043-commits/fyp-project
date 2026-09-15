"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl border-2 border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-700">
              Check Your Email
            </h2>
            <p className="text-sm text-neutral-500">
              We sent a password reset link to {email}. Click the link to reset your password.
            </p>
          </div>
          <Button
            onClick={() => router.push("/sign-in")}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
        <div className="space-y-2">
          <Link
            href="/sign-in"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sign In
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-700">
            Reset Password
          </h2>
          <p className="text-sm text-neutral-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-600 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            variant="secondary"
            className="w-full"
          >
            {loading ? <Loader className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
          </Button>
        </form>

        <div className="text-center text-sm text-neutral-500">
          Remember your password?{" "}
          <Link href="/sign-in" className="font-bold text-green-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
