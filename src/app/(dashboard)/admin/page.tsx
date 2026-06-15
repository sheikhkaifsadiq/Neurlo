import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminStats } from "@/lib/admin";
import { Users, TrendingUp, DollarSign, Activity, Shield } from "lucide-react";
import { AdminUsersTable } from "@/components/admin/users-table";
import { AdminAuditLog } from "@/components/admin/audit-log";
import { KeepAliveStatus } from "@/components/admin/keep-alive-status";

export const metadata = { title: "Admin Panel" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
    redirect("/dashboard?error=forbidden");
  }

  const [stats, users, auditLogs] = await Promise.all([
    getAdminStats(),
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true, email: true, name: true, image: true,
        role: true, status: true, mfaEnabled: true, emailVerified: true,
        createdAt: true, lastLoginAt: true,
        subscription: { select: { status: true, plan: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, action: true, resource: true, createdAt: true, ipAddress: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const statCards = [
    { label: "Total Users", value: stats.users.total.toLocaleString(), sub: `+${stats.users.newLast7d} this week`, icon: Users, color: "bg-blue-500" },
    { label: "Active Subscriptions", value: stats.subscriptions.active.toLocaleString(), sub: `${stats.subscriptions.churnedLast30d} churned (30d)`, icon: TrendingUp, color: "bg-green-500" },
    { label: "MRR", value: `$${stats.revenue.mrr.toFixed(0)}`, sub: `ARR: $${stats.revenue.arr.toFixed(0)}`, icon: DollarSign, color: "bg-accent" },
    { label: "API Keys", value: stats.apiKeys.total.toLocaleString(), sub: "Active keys", icon: Activity, color: "bg-purple-500" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-serif text-3xl text-ink">Admin Panel</h1>
          <p className="text-muted text-xs font-mono">Full platform visibility and control.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`w-9 h-9 ${s.color} rounded-sm flex items-center justify-center mb-4`}>
              <s.icon className="w-4 h-4 text-white" />
            </div>
            <p className="font-serif text-3xl text-ink">{s.value}</p>
            <p className="text-xs font-display font-semibold uppercase tracking-wide text-ink/60 mt-0.5">{s.label}</p>
            <p className="text-xs text-muted font-mono mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-display font-bold text-ink text-sm uppercase tracking-widest mb-4">User Management</h2>
          <AdminUsersTable users={users as any} />
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="font-display font-bold text-ink text-sm uppercase tracking-widest mb-4">Server Health</h2>
            <KeepAliveStatus />
          </div>
          <div>
            <h2 className="font-display font-bold text-ink text-sm uppercase tracking-widest mb-4">Recent Activity</h2>
            <AdminAuditLog logs={auditLogs as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
