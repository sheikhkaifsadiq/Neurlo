"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Zap, CreditCard, Settings, Key,
  Shield, Users, BarChart3, ChevronRight, Bell, Bot, GitBranch
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/integrations", label: "Integrations", icon: Zap },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

const adminItems = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
];

interface SidebarNavProps {
  role?: string;
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="px-3 space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-display font-medium transition-colors",
              active
                ? "bg-white/10 text-paper"
                : "text-paper/50 hover:bg-white/5 hover:text-paper/80"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
            {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
          </Link>
        );
      })}

      {(role === "ADMIN" || role === "SUPER_ADMIN") && (
        <>
          <div className="pt-4 pb-2 px-3">
            <p className="text-xs font-display font-semibold uppercase tracking-widest text-paper/25">Admin</p>
          </div>
          {adminItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-display font-medium transition-colors",
                  active
                    ? "bg-accent/20 text-accent"
                    : "text-paper/50 hover:bg-white/5 hover:text-paper/80"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}
