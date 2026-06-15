import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, Activity, Clock, TrendingUp, Plus, ArrowRight, Puzzle, Key, Brain } from "lucide-react";
import { PLANS, type PlanSlug } from "@/lib/stripe-plans";
import { getProviderLogoUrl } from "@/lib/integration-logos";

export const metadata = { title: "Dashboard | Neurlo" };

const FREE_LIMITS = { seats: 1, integrations: 2, historyDays: 1, apiCallsPerMonth: 100 };

async function getDashboardData(userId: string) {
  const [user, subscription, integrations, apiKeys, recentActivity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    }),
    prisma.integration.findMany({
      where: { userId, isActive: true },
      select: { provider: true, name: true, lastSyncAt: true },
      orderBy: { createdAt: "desc" },
    }).then(ints => ints.map(i => ({ ...i, provider: i.provider.toLowerCase() }))),
    prisma.apiKey.count({ where: { userId, isActive: true } }),
    prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { action: true, resource: true, createdAt: true },
    }),
  ]);
  return { user, subscription, integrations, apiKeys, recentActivity };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatRelative(date: Date | string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatAction(action: string) {
  const map: Record<string, string> = {
    AUTH_SIGN_IN: "Signed in",
    AUTH_SIGN_OUT: "Signed out",
    AUTH_REGISTER: "Account created",
    AUTH_PASSWORD_RESET: "Password reset",
    INTEGRATION_CONNECTED: "Integration connected",
    INTEGRATION_DISCONNECTED: "Integration disconnected",
    API_KEY_CREATED: "API key created",
    API_KEY_REVOKED: "API key revoked",
  };
  return map[action] ?? action.toLowerCase().replace(/_/g, " ");
}

const ACTION_COLORS: Record<string, string> = {
  AUTH_SIGN_IN: "bg-accent-green/20 text-accent-green",
  AUTH_SIGN_OUT: "bg-muted/20 text-muted",
  AUTH_REGISTER: "bg-accent/20 text-accent",
  INTEGRATION_CONNECTED: "bg-accent-cyan/20 text-accent-cyan",
  INTEGRATION_DISCONNECTED: "bg-danger/20 text-danger",
  API_KEY_CREATED: "bg-accent-2/20 text-accent-2",
  API_KEY_REVOKED: "bg-warning/20 text-warning",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const { user, subscription, integrations, apiKeys, recentActivity } =
    await getDashboardData(session.user.id);

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const plan = subscription?.plan?.name ?? "Free";
  const planSlug = (subscription?.plan?.slug ?? "free") as PlanSlug | "free";
  const planLimits = PLANS[planSlug as PlanSlug]?.limits ?? FREE_LIMITS;
  const isTrialing = subscription?.status === "TRIALING";
  const trialDaysLeft = isTrialing && subscription?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  const fmtLimit = (n: number) => (n < 0 ? "∞" : n.toLocaleString());

  const stats = [
    {
      label: "Integrations",
      value: `${integrations.length}/${fmtLimit(planLimits.integrations)}`,
      icon: Puzzle,
      color: "text-accent-cyan",
      bg: "bg-accent-cyan/10",
      border: "border-accent-cyan/20",
      link: "/integrations",
      sub: planLimits.integrations < 0
        ? `${integrations.length} active`
        : `${Math.max(0, planLimits.integrations - integrations.length)} slots left`,
    },
    {
      label: "API Keys",
      value: apiKeys,
      icon: Key,
      color: "text-accent-2",
      bg: "bg-accent-2/10",
      border: "border-accent-2/20",
      link: "/api-keys",
      sub: apiKeys === 0 ? "No active keys" : `${apiKeys} key${apiKeys > 1 ? "s" : ""} active`,
    },
    {
      label: "History",
      value: planLimits.historyDays < 0 ? "∞" : `${planLimits.historyDays}d`,
      icon: Activity,
      color: "text-accent-green",
      bg: "bg-accent-green/10",
      border: "border-accent-green/20",
      link: "/billing",
      sub: planLimits.historyDays < 0 ? "Unlimited retention" : "Activity retention",
    },
    {
      label: "Plan",
      value: plan,
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/20",
      link: "/billing",
      sub: isTrialing ? `${trialDaysLeft} days trial left` : `${fmtLimit(planLimits.apiCallsPerMonth)} calls/mo`,
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 animate-fade-in">
        <div>
          <p className="mono-label mb-1">{getGreeting()}</p>
          <h1 className="text-3xl font-bold text-text tracking-tight">
            {firstName}<span className="text-gradient">.</span>
          </h1>
          <p className="text-sm text-muted mt-1 font-mono">
            {integrations.length === 0
              ? "Connect your first integration to activate the AI engine."
              : `Neurlo is watching ${integrations.length} integration${integrations.length > 1 ? "s" : ""}.`
            }
          </p>
        </div>
        {isTrialing && trialDaysLeft !== null && (
          <div className="shrink-0 px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-center animate-glow-pulse">
            <p className="text-xs font-bold text-accent">{trialDaysLeft} days left in trial</p>
            <Link href="/billing" className="text-[11px] text-muted hover:text-accent transition-colors">
              Upgrade now →
            </Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`stat-card border ${stat.border} animate-fade-up delay-${(i + 1) * 100}`}
            style={{ animationFillMode: "both" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              {stat.link && (
                <Link href={stat.link} className="text-muted hover:text-text transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            <p className={`text-3xl font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">{stat.label}</p>
            <p className="mono-label mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Engine panel */}
        <div className="lg:col-span-2 space-y-5 animate-fade-up delay-300" style={{ animationFillMode: "both" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-text text-sm">AI Engine Status</h2>
            <div className="flex items-center gap-2">
              <span className="pulse-dot" style={{ width: 7, height: 7 }} />
              <span className="mono-label">Live</span>
            </div>
          </div>

          {integrations.length === 0 ? (
            /* Empty state — onboarding card */
            <div className="card card-glow p-8 text-center relative overflow-hidden">
              <div className="orb orb-accent w-64 h-64 -top-16 -left-16 opacity-40" />
              <div className="orb orb-accent-2 w-48 h-48 -bottom-10 -right-10 opacity-30" />
              <div className="relative z-10">
                <div className="ai-orb mx-auto mb-5 animate-float">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">Connect your first integration</h3>
                <p className="text-sm text-muted font-mono mb-6 max-w-sm mx-auto">
                  Neurlo needs to observe your tools to start generating AI predictions and action drafts.
                </p>
                <Link href="/integrations" className="btn-primary inline-flex">
                  <Plus className="w-4 h-4" />
                  Add Integration
                </Link>
              </div>
            </div>
          ) : (
            /* Active integrations */
            <div className="space-y-3">
              {integrations.map((int, i) => (
                <div
                  key={int.provider}
                  className="card card-glow p-4 flex items-center gap-4"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-2 border border-[rgb(var(--border))] flex items-center justify-center shrink-0 overflow-hidden">
                    {getProviderLogoUrl(int.provider) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getProviderLogoUrl(int.provider)!} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted uppercase">{int.name.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text">{int.name}</p>
                    <p className="mono-label mt-0.5">
                      {int.lastSyncAt ? `Synced ${formatRelative(int.lastSyncAt)}` : "Pending sync"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-green" />
                    <span className="text-[11px] text-accent-green font-semibold">Active</span>
                  </div>
                </div>
              ))}
              <Link
                href="/integrations"
                className="card p-4 flex items-center gap-3 border-dashed hover:border-accent/30 transition-colors text-muted hover:text-text"
              >
                <div className="w-10 h-10 rounded-lg border border-dashed border-[rgb(var(--border))] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Add another integration</span>
              </Link>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="animate-fade-up delay-400" style={{ animationFillMode: "both" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-text text-sm">Activity Log</h2>
            <span className="badge badge-accent">{recentActivity.length} events</span>
          </div>
          <div className="card divide-y divide-[rgb(var(--border))]">
            {recentActivity.length === 0 ? (
              <div className="p-5 text-center">
                <Zap className="w-6 h-6 text-muted mx-auto mb-2" />
                <p className="mono-label">No activity yet</p>
              </div>
            ) : (
              recentActivity.map((log, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <div className={`badge text-[10px] mt-0.5 shrink-0 ${ACTION_COLORS[log.action] ?? "bg-muted/10 text-muted"}`}>
                    ●
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text">{formatAction(log.action)}</p>
                    <p className="mono-label mt-0.5">{formatRelative(log.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

