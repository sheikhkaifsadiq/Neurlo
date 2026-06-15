"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { LogOut, Settings, CreditCard, ChevronDown } from "lucide-react";

interface UserDropdownProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 text-left hover:bg-white/5 rounded-sm p-2 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 text-white font-display font-bold text-sm">
          {user.name?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-display font-semibold text-paper truncate">{user.name ?? "Account"}</p>
          <p className="text-xs text-paper/40 font-mono truncate">{user.email}</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-paper/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-ink/10 rounded-sm shadow-lg z-20 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-ink/5">
              <p className="text-xs font-mono text-muted truncate">{user.email}</p>
            </div>
            {[
              { href: "/settings", label: "Settings", icon: Settings },
              { href: "/billing", label: "Billing", icon: CreditCard },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink hover:bg-ink/5 transition-colors font-display font-medium"
              >
                <item.icon className="w-4 h-4 text-muted" />
                {item.label}
              </Link>
            ))}
            <div className="border-t border-ink/5">
              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-display font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
