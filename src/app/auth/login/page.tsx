"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { signInSchema, type SignInInput } from "@/lib/validations";

const ERROR_MESSAGES: Record<string, string> = {
  MFA_REQUIRED: "Enter your authenticator code below.",
  INVALID_MFA: "Invalid authenticator code. Try again.",
  ACCOUNT_SUSPENDED: "This account has been suspended. Contact support.",
  OAuthAccountNotLinked: "This email is already registered. Sign in with your password.",
  CredentialsSignin: "Invalid email or password.",
  default: "Something went wrong. Please try again.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const errorParam = searchParams.get("error");
  const verifiedParam = searchParams.get("verified");

  const [showPassword, setShowPassword] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam ? (ERROR_MESSAGES[errorParam] ?? ERROR_MESSAGES.default) : null
  );

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(data: SignInInput) {
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      totp: data.totp ?? "",
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "MFA_REQUIRED") {
        setMfaRequired(true);
        setError("Please enter your 6-digit authenticator code.");
      } else {
        setError(ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.default);
      }
      setIsLoading(false);
      return;
    }

    // Hard navigate to flush any stale session state
    window.location.href = callbackUrl;
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="min-h-screen bg-paper grid lg:grid-cols-2">
      {/* Left — Decorative */}
      <div className="hidden lg:flex flex-col justify-between bg-ink p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/15 blur-3xl" />

        <Link href="/" className="relative z-10 text-paper font-display font-bold text-2xl tracking-tight">
          Neur<span className="text-accent">lo</span>
        </Link>

        <div className="relative z-10">
          <blockquote className="font-serif italic text-2xl text-paper/90 leading-relaxed mb-6">
            "I stopped using three tools the week I got access. Neurlo just knows what I need."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-paper font-display font-bold">S</div>
            <div>
              <p className="font-display font-semibold text-paper text-sm">Sara Okonkwo</p>
              <p className="text-paper/40 text-xs font-mono">Founder, Fieldwork Studio</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-paper/30 text-xs font-mono">
          © {new Date().getFullYear()} Neurlo, Inc.
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block mb-8 font-display font-bold text-2xl text-ink">
            Neur<span className="text-accent">lo</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-serif text-3xl font-normal text-ink mb-2">Welcome back</h1>
            <p className="text-muted text-sm font-mono">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-accent underline underline-offset-2 hover:text-accent/80">
                Sign up free
              </Link>
            </p>
          </div>

          {/* Verified success banner */}
          {verifiedParam && !error && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-sm mb-6 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Email verified! Please sign in to continue.</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-sm mb-6 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="btn-google mb-6"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
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
            <span>or continue with email</span>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-display font-semibold tracking-wide uppercase text-ink/60 mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="input-base"
                disabled={mfaRequired}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-display font-semibold tracking-wide uppercase text-ink/60">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-muted hover:text-accent transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-base pr-10"
                  disabled={mfaRequired}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {/* MFA field — only shown when required */}
            {mfaRequired && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm">
                <label className="block text-xs font-display font-semibold tracking-wide uppercase text-blue-800 mb-1.5">
                  Authenticator Code
                </label>
                <input
                  {...register("totp")}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  autoFocus
                  className="input-base text-center text-xl tracking-widest"
                />
                <p className="text-xs text-blue-600 mt-2">Enter the 6-digit code from your authenticator app.</p>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? "Signing in..." : mfaRequired ? "Verify & Sign in" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-8 font-mono">
            By signing in, you agree to our{" "}
            <Link href="/legal/terms" className="text-accent underline-offset-2 hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-accent underline-offset-2 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
