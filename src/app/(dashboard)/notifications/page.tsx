"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Check, Trash2, Loader2, ExternalLink, AlertTriangle, Sparkles, CreditCard, Shield, Plug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Notification = {
  id: string;
  type: "SYSTEM" | "BILLING" | "SECURITY" | "INTEGRATION" | "AI_INSIGHT";
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

const ICONS = {
  SYSTEM: AlertTriangle,
  BILLING: CreditCard,
  SECURITY: Shield,
  INTEGRATION: Plug,
  AI_INSIGHT: Sparkles,
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/notifications${filter === "unread" ? "?unread=1" : ""}`);
      const json = await res.json();
      if (res.ok) setItems(json.data?.items ?? []);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    const res = await fetch("/api/v1/notifications", { method: "PATCH" });
    if (res.ok) { toast({ title: "All notifications marked as read" }); load(); }
  };

  const clearAll = async () => {
    if (!confirm("Clear all notifications? This cannot be undone.")) return;
    const res = await fetch("/api/v1/notifications", { method: "DELETE" });
    if (res.ok) { toast({ title: "Notifications cleared" }); load(); }
  };

  const toggleRead = async (n: Notification) => {
    const res = await fetch(`/api/v1/notifications/${n.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !n.read }),
    });
    if (res.ok) load();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/v1/notifications/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="mono-label mb-1">Inbox</p>
          <h1 className="text-3xl font-bold text-text tracking-tight">Notification Center</h1>
          <p className="text-sm text-muted mt-1 font-mono">System events, AI insights, and security alerts.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="btn-secondary text-xs h-9 px-4">
            <Check className="w-3.5 h-3.5 mr-2" /> Mark all read
          </button>
          <button onClick={clearAll} className="btn-secondary text-xs h-9 px-4 text-danger">
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Clear
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition ${
              filter === f ? "bg-accent text-white" : "bg-surface-2 text-muted hover:text-text"
            }`}
          >
            {f === "all" ? "All" : "Unread only"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted" /></div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-border/60">
          <Bell className="w-10 h-10 text-accent/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text mb-2">All caught up</h3>
          <p className="text-sm text-muted font-mono">No notifications to show right now.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <div
                key={n.id}
                className={`card p-4 flex items-start gap-4 transition ${!n.read ? "border-accent/40 bg-accent/5" : ""}`}
              >
                <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-text text-sm truncate">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                    <span className="ml-auto text-[10px] text-muted font-mono shrink-0">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{n.message}</p>
                  {n.link && (
                    <a href={n.link} className="inline-flex items-center gap-1 text-xs text-accent mt-2 hover:underline">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => toggleRead(n)} className="p-1.5 hover:bg-surface-2 rounded text-muted hover:text-text" title={n.read ? "Mark unread" : "Mark read"}>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(n.id)} className="p-1.5 hover:bg-surface-2 rounded text-muted hover:text-danger" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
