"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { signUpSchema, type SignUpInput } from "@/lib/validations";

const RESEND_COOLDOWN_SECONDS = 20;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpInfo, setOtpInfo] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!otpStep || cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [otpStep, cooldown]);

  // Redirect to login a moment after success
  useEffect(() => {
    if (!verified) return;
    const t = setTimeout(() => router.push("/auth/login?verified=1"), 2000);
    return () => clearTimeout(t);
  }, [verified, router]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { acceptTerms: false },
  });

  const password = watch("password", "");

  const passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

  async function onSubmit(data: SignUpInput) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password, acceptTerms: data.acceptTerms }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "Registration failed");
        return;
      }

      // Move to OTP verification step — do NOT auto sign-in
      setOtpEmail(data.email);
      setOtpStep(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpError(null);
    setOtpInfo(null);

    if (!/^\d{6}$/.test(otpCode)) {
      setOtpError("Enter the 6-digit code from your email.");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, code: otpCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOtpError(json.error?.message ?? "Invalid code.");
        return;
      }
      setVerified(true);
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResendOtp() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setOtpError(null);
    setOtpInfo(null);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOtpError(json.error?.message ?? "Could not resend code.");
        return;
      }
      setOtpInfo("A new code has been sent. Check your inbox.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl mb-3">Email verified</h1>
          <p className="text-muted text-sm mb-8">Redirecting you to sign in…</p>
          <Link href="/auth/login" className="btn-primary inline-flex">Go to sign in</Link>
        </div>
      </div>
    );
  }

  if (otpStep) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="block mb-8 font-display font-bold text-2xl text-ink text-center">
            Neur<span className="text-accent">lo</span>
          </Link>

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <h1 className="font-serif text-3xl text-ink mb-2">Verify your email</h1>
            <p className="text-muted text-sm font-mono">
              We sent a 6-digit code to <span className="text-ink">{otpEmail}</span>
            </p>
          </div>

          {otpError && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-sm mb-4 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{otpError}</span>
            </div>
          )}

          {otpInfo && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-sm mb-4 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{otpInfo}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="input-base text-center text-2xl tracking-[0.5em] font-mono"
            />

            <button type="submit" disabled={verifying || otpCode.length !== 6} className="btn-primary w-full">
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {verifying ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-muted font-mono">
            Didn't get it?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || resending}
              className="text-accent underline-offset-2 hover:underline disabled:no-underline disabled:text-muted disabled:cursor-not-allowed"
            >
              {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
            <p className="mt-2 text-ink/40">Max 3 codes per 24 hours.</p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-paper grid lg:grid-cols-2">
      {/* Left — Decorative */}
      <div className="hidden lg:flex flex-col justify-between bg-ink p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent2/15 blur-3xl" />
        <Link href="/" className="relative z-10 text-paper font-display font-bold text-2xl tracking-tight">
          Neur<span className="text-accent">lo</span>
        </Link>
        <div className="relative z-10 space-y-6">
          {[
            { icon: "🧠", title: "Predictive AI", desc: "Surfaces what you need before you ask" },
            { icon: "⚡", title: "Instant Drafts", desc: "Emails, tasks, replies — auto-generated" },
            { icon: "🔒", title: "Privacy-First", desc: "Zero data retention. On-device learning." },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="font-display font-bold text-paper text-sm">{f.title}</p>
                <p className="text-paper/40 text-xs font-mono">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="relative z-10 text-paper/30 text-xs font-mono">14-day free trial · No credit card required</p>
      </div>

      {/* Right — Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden block mb-8 font-display font-bold text-2xl text-ink">
            Neur<span className="text-accent">lo</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-normal text-ink mb-2">Create your account</h1>
            <p className="text-muted text-sm font-mono">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-accent underline underline-offset-2 hover:text-accent/80">Sign in</Link>
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-sm mb-6 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google */}
          <button
            onClick={() => { setIsGoogleLoading(true); signIn("google", { callbackUrl: "/dashboard?welcome=true" }); }}
            disabled={isGoogleLoading || isLoading}
            className="btn-google mb-6"
          >
            {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="auth-divider mb-6">
            <span>or sign up with email</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-display font-semibold tracking-wide uppercase text-ink/60 mb-1.5">Full Name</label>
              <input {...register("name")} type="text" autoComplete="name" placeholder="Ada Lovelace" className="input-base" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-display font-semibold tracking-wide uppercase text-ink/60 mb-1.5">Email</label>
              <input {...register("email")} type="email" autoComplete="email" placeholder="you@example.com" className="input-base" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-display font-semibold tracking-wide uppercase text-ink/60 mb-1.5">Password</label>
              <div className="relative">
                <input {...register("password")} type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" className="input-base pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strengthScore ? strengthScore < 3 ? "bg-yellow-400" : "bg-green-500" : "bg-ink/10"}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {[
                      { key: "length", label: "8+ characters" },
                      { key: "uppercase", label: "Uppercase letter" },
                      { key: "number", label: "Number" },
                      { key: "special", label: "Special character" },
                    ].map(({ key, label }) => (
                      <div key={key} className={`text-xs flex items-center gap-1 ${passwordStrength[key as keyof typeof passwordStrength] ? "text-green-600" : "text-muted"}`}>
                        <span>{passwordStrength[key as keyof typeof passwordStrength] ? "✓" : "○"}</span>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input {...register("acceptTerms")} type="checkbox" id="terms" className="mt-0.5 accent-accent" />
              <label htmlFor="terms" className="text-xs text-muted font-mono leading-relaxed">
                I agree to Neurlo's{" "}
                <Link href="/legal/terms" className="text-accent underline-offset-2 hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-accent underline-offset-2 hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.acceptTerms && <p className="text-xs text-red-500 -mt-2">{errors.acceptTerms.message}</p>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? "Creating account..." : "Create account — it's free"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
