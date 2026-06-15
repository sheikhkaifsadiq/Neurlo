"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("No verification token found."); return; }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(async res => {
      const json = await res.json();
      if (res.ok) { setStatus("success"); setMessage(json.data?.message ?? "Email verified!"); }
      else { setStatus("error"); setMessage(json.error?.message ?? "Verification failed."); }
    }).catch(() => { setStatus("error"); setMessage("Network error. Please try again."); });
  }, [token]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
            <h1 className="font-serif text-2xl mb-2">Verifying your email…</h1>
            <p className="text-muted text-sm font-mono">Just a moment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-serif text-3xl mb-3">Email verified!</h1>
            <p className="text-muted text-sm font-mono mb-8">{message}</p>
            <Link href="/auth/login" className="btn-primary inline-flex">Sign in to Neurlo</Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="font-serif text-3xl mb-3">Verification failed</h1>
            <p className="text-muted text-sm font-mono mb-8">{message}</p>
            <Link href="/auth/signup" className="btn-primary inline-flex">Create a new account</Link>
          </>
        )}
      </div>
    </div>
  );
}
