// src/app/auth/forgot-password/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setIsLoading(false);
    if (res.ok) { setSent(true); } else {
      const json = await res.json();
      setError(json.error?.message ?? "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-muted hover:text-ink text-sm font-mono mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-serif text-3xl mb-3">Check your inbox</h1>
            <p className="text-muted text-sm font-mono">If an account exists for <strong className="text-ink">{email}</strong>, a reset link has been sent. It expires in 1 hour.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-12 h-12 bg-ink rounded-sm flex items-center justify-center mb-6">
                <Mail className="w-5 h-5 text-paper" />
              </div>
              <h1 className="font-serif text-3xl text-ink mb-2">Forgot your password?</h1>
              <p className="text-muted text-sm font-mono">Enter your email and we'll send a reset link if an account exists.</p>
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-display font-semibold uppercase tracking-wide text-ink/60 mb-1.5">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="input-base" />
              </div>
              <button type="submit" disabled={isLoading || !email} className="btn-primary w-full">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
