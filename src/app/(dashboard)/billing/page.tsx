import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CheckCircle, ShieldCheck, ArrowRight, Clock, Zap, Download, Puzzle, KeyRound, Users, History } from "lucide-react";
import Link from "next/link";
import { BillingClient } from "./client";
import { PLANS, type PlanSlug } from "@/lib/stripe-plans";

export const metadata = { title: "Billing | Neurlo" };

const FREE_LIMITS = { seats: 1, integrations: 2, historyDays: 1, apiCallsPerMonth: 100 };

function fmtLimit(v: number) {
  if (v < 0) return "Unlimited";
  return v.toLocaleString();
}

function UsageBar({ icon: Icon, label, used, limit, unit = "" }: any) {
  const unlimited = limit < 0;
  const pct = unlimited ? 8 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const danger = !unlimited && pct >= 90;
  const warn = !unlimited && pct >= 70 && pct < 90;
  const barColor = danger ? "bg-danger" : warn ? "bg-warning" : "bg-accent";
  const remaining = unlimited ? "∞" : Math.max(0, limit - used);
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-text">
          <Icon className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-[10px] font-mono text-muted">{pct}%</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-text">
          {used.toLocaleString()}
          <span className="text-sm font-mono text-muted"> / {fmtLimit(limit)}{unit && ` ${unit}`}</span>
        </p>
        <p className="text-[10px] font-mono text-muted mt-0.5">
          {unlimited ? "Unlimited capacity" : `${remaining.toLocaleString()} ${unit || "remaining"}`}
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${unlimited ? 8 : pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function BillingPage(props: { searchParams: Promise<{ success?: string; canceled?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const userId = session.user.id;

  const [subscription, integrationsCount, apiKeyCount, monthlyApiCalls] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: true,
        invoices: { orderBy: { createdAt: "desc" }, take: 12 },
      },
    }),
    prisma.integration.count({ where: { userId, isActive: true } }),
    prisma.apiKey.count({ where: { userId, isActive: true } }),
    prisma.auditLog.count({
      where: {
        userId,
        action: { in: ["API_CALL", "AI_CHAT", "AI_RAG", "INTEGRATION_SYNC"] },
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }).catch(() => 0),
  ]);

  const currentPlanSlug = subscription?.plan?.slug ?? "free";
  const status = subscription?.status ?? "FREE";
  const isActive = ["ACTIVE", "TRIALING"].includes(status);

  const planLimits =
    PLANS[currentPlanSlug as PlanSlug]?.limits ?? FREE_LIMITS;
  const planFeatures = PLANS[currentPlanSlug as PlanSlug]?.features ?? [
    "Up to 2 integrations",
    "Basic context engine",
    "1-day activity history",
    "Community support",
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="mono-label mb-1">Financial overview</p>
          <h1 className="text-3xl font-bold text-text tracking-tight">Billing & Plans</h1>
          <p className="text-sm text-muted mt-1 font-mono">Manage your AI compute resources and subscription cycle.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border">
          <ShieldCheck className="w-4 h-4 text-accent-green" />
          <span className="text-xs font-bold text-text">Secured by Stripe</span>
        </div>
      </div>

      {/* Status Banners */}
      {searchParams.success && (
        <div className="flex items-center gap-3 p-4 bg-accent-green/10 border border-accent-green/30 rounded-xl text-accent-green animate-glow-pulse">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">Subscription activated! Your Neurlo engine is now fully unlocked.</p>
        </div>
      )}
      {searchParams.canceled && (
        <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl text-warning text-xs font-mono">
          Transaction interrupted. Your current access level remains unchanged.
        </div>
      )}

      {/* Current Access Card */}
      <div className="card p-6 sm:p-8 relative overflow-hidden group border-accent/20">
        <div className="orb orb-accent w-64 h-64 -top-20 -left-20 opacity-20 group-hover:opacity-30 transition-opacity" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 min-w-0">
            <div>
              <p className="section-title mb-2 uppercase tracking-widest font-bold">Current Access Level</p>
              <div className="flex items-center gap-4 flex-wrap">
                <h2 className="text-3xl sm:text-4xl font-bold text-text capitalize">{subscription?.plan?.name ?? "Free Tier"}</h2>
                <span className={`badge px-3 py-1 text-[10px] font-bold ${
                  status === "ACTIVE" ? "badge-green" : 
                  status === "TRIALING" ? "badge-accent" : 
                  status === "PAST_DUE" ? "badge-danger" : "badge-accent"
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-muted font-mono mt-2">
                Billing cycle: {subscription?.billingInterval?.toLowerCase() ?? "n/a"}
              </p>
            </div>
            
            <div className="flex flex-col gap-1.5">
              {subscription?.stripeCurrentPeriodEnd && (
                <div className="flex items-center gap-2 text-xs text-muted font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{subscription.cancelAtPeriodEnd ? "Access expires on" : "Auto-renews on"}{" "}</span>
                  <span className="text-text font-bold">
                    {new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}
              {status === "TRIALING" && subscription?.trialEndsAt && (
                <div className="flex items-center gap-2 text-xs text-accent font-mono font-bold">
                  <Zap className="w-3.5 h-3.5 animate-pulse" />
                  <span>Trial phase ends {new Date(subscription.trialEndsAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Included features */}
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-2">
              {planFeatures.map((f) => (
                <li key={f} className="text-[11px] text-text/80 flex items-start gap-2 font-mono">
                  <CheckCircle className="w-3.5 h-3.5 text-accent-green shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="space-y-4">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-text">Resource Usage</h2>
            <p className="text-xs text-muted font-mono mt-1">Live usage on your {subscription?.plan?.name ?? "Free"} plan this cycle.</p>
          </div>
          <Link href="/integrations" className="text-xs font-bold text-accent hover:underline">
            Manage integrations →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UsageBar icon={Puzzle} label="Integrations" used={integrationsCount} limit={planLimits.integrations} unit="connected" />
          <UsageBar icon={KeyRound} label="API Calls (mo)" used={monthlyApiCalls} limit={planLimits.apiCallsPerMonth} unit="calls" />
          <UsageBar icon={Users} label="Seats" used={1} limit={planLimits.seats} unit="seats" />
          <UsageBar icon={History} label="History" used={planLimits.historyDays < 0 ? 1 : Math.min(planLimits.historyDays, planLimits.historyDays)} limit={planLimits.historyDays} unit="days" />
        </div>
      </div>

      {/* Main Billing Component (Interactive) */}
      <BillingClient 
        currentPlanSlug={currentPlanSlug}
        status={status}
        isActive={isActive}
      />

      {/* Invoices */}
      {subscription?.invoices && subscription.invoices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text">Billing History</h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-2 border-b border-border text-left">
                    <th className="px-6 py-4 section-title font-bold">Date</th>
                    <th className="px-6 py-4 section-title font-bold">Amount</th>
                    <th className="px-6 py-4 section-title font-bold">Status</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subscription.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-text">
                        {new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-text">
                        ${inv.amount.toFixed(2)} <span className="text-[10px] font-normal text-muted">{inv.currency.toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge px-2 py-0.5 text-[9px] font-bold ${inv.status === "PAID" ? "badge-green" : "badge-danger"}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {inv.pdfUrl && (
                          <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer"
                            className="btn-ghost h-8 px-3 text-[10px] font-bold gap-2">
                            <Download className="w-3 h-3" /> INVOICE
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
