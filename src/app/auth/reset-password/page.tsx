// src/app/auth/reset-password/page.tsx
"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const valid = Object.values(rules).every(Boolean) && password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setIsLoading(true); setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, confirmPassword: confirm }),
    });
    const json = await res.json();
    setIsLoading(false);
    if (res.ok) { setSuccess(true); setTimeout(() => router.push("/auth/login"), 3000); }
    else setError(json.error?.message ?? "Reset failed.");
  }

  if (!token) return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <h1 className="font-serif text-2xl mb-3">Invalid link</h1>
        <p className="text-muted text-sm font-mono mb-6">This reset link is invalid or missing.</p>
        <Link href="/auth/forgot-password" className="btn-primary inline-flex">Request new link</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-serif text-3xl mb-3">Password reset!</h1>
            <p className="text-muted text-sm font-mono">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl text-ink mb-2">Set new password</h1>
            <p className="text-muted text-sm font-mono mb-8">Choose a strong password for your Neurlo account.</p>
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-display font-semibold uppercase tracking-wide text-ink/60 mb-1.5">New Password</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="input-base pr-10" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" tabIndex={-1}>
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {[["length","8+ characters"],["upper","Uppercase letter"],["number","Number"],["special","Special character"]].map(([k,label]) => (
                      <p key={k} className={`text-xs ${rules[k as keyof typeof rules] ? "text-green-600" : "text-muted"}`}>
                        {rules[k as keyof typeof rules] ? "✓" : "○"} {label}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-display font-semibold uppercase tracking-wide text-ink/60 mb-1.5">Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="input-base" />
                {confirm && password !== confirm && <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>}
              </div>
              <button type="submit" disabled={!valid || isLoading} className="btn-primary w-full">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Reset Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
