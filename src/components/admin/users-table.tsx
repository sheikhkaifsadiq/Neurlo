"use client";

import { useState } from "react";
import { Search, MoreHorizontal, Shield, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string; name: string | null; email: string; role: string;
  status: string; mfaEnabled: boolean; emailVerified: Date | null;
  createdAt: Date; lastLoginAt: Date | null;
  subscription?: { status: string; plan: { name: string; slug: string } } | null;
}

export function AdminUsersTable({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name?.toLowerCase() ?? "").includes(search.toLowerCase())
  );

  async function updateUser(userId: string, data: { role?: string; status?: string }) {
    const res = await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
      toast({ title: "User updated" });
    } else {
      toast({ title: "Error", description: json.error?.message, variant: "destructive" });
    }
    setOpenMenu(null);
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-ink/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 text-sm font-mono bg-ink/5 border border-ink/10 rounded-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink/5 bg-ink/2">
              <th className="text-left px-4 py-3 text-xs font-display font-semibold uppercase tracking-wide text-muted">User</th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold uppercase tracking-wide text-muted">Role</th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold uppercase tracking-wide text-muted">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold uppercase tracking-wide text-muted">Status</th>
              <th className="text-left px-4 py-3 text-xs font-display font-semibold uppercase tracking-wide text-muted">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-ink/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-display font-bold text-accent shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() ?? user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-display font-medium text-ink">{user.name ?? "—"}</p>
                      <p className="text-xs text-muted font-mono">{user.email}</p>
                    </div>
                    {user.mfaEnabled && (
                      <span title="MFA enabled">
                        <Shield className="w-3.5 h-3.5 text-green-500" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "badge-admin" : "bg-ink/5 text-muted"}`}>
                    {user.role.toLowerCase().replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-muted capitalize">
                  {user.subscription?.plan?.name ?? "Free"}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${user.status === "ACTIVE" ? "badge-active" : user.status === "SUSPENDED" ? "badge-past-due" : "bg-ink/5 text-muted"}`}>
                    {user.status.toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted">
                  {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-right relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                    className="p-1 rounded hover:bg-ink/5 text-muted"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {openMenu === user.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                      <div className="absolute right-4 top-full mt-1 w-40 bg-white border border-ink/10 rounded-sm shadow-lg z-20 overflow-hidden">
                        {user.role !== "ADMIN" && (
                          <button onClick={() => updateUser(user.id, { role: "ADMIN" })}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-display font-medium text-ink hover:bg-ink/5">
                            <Shield className="w-3.5 h-3.5" /> Make Admin
                          </button>
                        )}
                        {user.role === "ADMIN" && (
                          <button onClick={() => updateUser(user.id, { role: "USER" })}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-display font-medium text-ink hover:bg-ink/5">
                            <CheckCircle className="w-3.5 h-3.5" /> Revoke Admin
                          </button>
                        )}
                        {user.status === "ACTIVE" ? (
                          <button onClick={() => updateUser(user.id, { status: "SUSPENDED" })}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-display font-medium text-red-600 hover:bg-red-50">
                            <Ban className="w-3.5 h-3.5" /> Suspend
                          </button>
                        ) : (
                          <button onClick={() => updateUser(user.id, { status: "ACTIVE" })}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-display font-medium text-green-600 hover:bg-green-50">
                            <CheckCircle className="w-3.5 h-3.5" /> Reactivate
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
