"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Puzzle, CreditCard, Settings, KeyRound,
  Shield, LogOut, ChevronRight, Zap, Menu, X, Bell
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/integrations", label: "Integrations", icon: Puzzle },
  { href: "/api-keys", label: "API Keys", icon: KeyRound },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

export function AppShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const initials = (user?.name ?? user?.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 flex flex-col
          bg-surface border-r border-[rgb(var(--border))]
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[rgb(var(--border))]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center ai-orb-sm">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-base text-text tracking-tight">
              Neur<span className="text-gradient-cyan">lo</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-muted hover:text-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Status Bar */}
        <div className="mx-3 mt-3 px-3 py-2.5 rounded-lg bg-[rgb(var(--accent)/0.08)] border border-[rgb(var(--accent)/0.15)]">
          <div className="flex items-center gap-2">
            <span className="pulse-dot" style={{ width: 7, height: 7 }} />
            <span className="text-[11px] font-medium text-accent">AI Engine Active</span>
          </div>
          <p className="text-[10px] text-muted mt-0.5 font-mono">Monitoring 0 integrations</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          <p className="section-title px-3 py-2">Navigation</p>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="badge badge-cyan text-[10px] py-0 px-1.5">{item.badge}</span>
                )}
                {active && <ChevronRight className="w-3 h-3 opacity-50" />}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <p className="section-title px-3 py-2 mt-4">Admin</p>
              <Link href="/admin" className={`nav-item ${pathname.startsWith("/admin") ? "active" : ""}`}>
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-[rgb(var(--border))] p-3">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgb(255_255_255/0.04)] transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text truncate">{user?.name ?? "User"}</p>
              <p className="text-[10px] text-muted truncate font-mono">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="text-muted hover:text-danger transition-colors p-1"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-[rgb(var(--border))] flex items-center justify-between px-5 bg-surface/80 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted hover:text-text p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="text-xs font-mono">All systems operational</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost p-2 relative">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
