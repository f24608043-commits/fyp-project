"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl border-2 border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-700">
              Password Reset Successful
            </h2>
            <p className="text-sm text-neutral-500">
              Your password has been reset. Redirecting to sign in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-700">
            Set New Password
          </h2>
          <p className="text-sm text-neutral-500">
            Enter your new password below.
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
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-600 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            variant="secondary"
            className="w-full"
          >
            {loading ? <Loader className="h-5 w-5 animate-spin" /> : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
