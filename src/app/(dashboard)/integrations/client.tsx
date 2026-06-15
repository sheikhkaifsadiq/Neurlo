"use client";
import { useState } from "react";
import { ExternalLink, Loader2, Trash2, CheckCircle2, Puzzle, Search } from "lucide-react";

interface Integration {
  provider: string; name: string; logoUrl: string | null;
  description: string; category: string; popular: boolean;
  authType: "oauth" | "apikey" | "webhook";
}
interface ConnectedInt { provider: string; name: string; lastSyncAt: Date | null; createdAt: Date; }

function ProviderLogo({ logoUrl, name, size = 28 }: { logoUrl: string | null; name: string; size?: number }) {
  if (!logoUrl) {
    return (
      <span className="text-[11px] font-bold text-muted uppercase">
        {name.slice(0, 2)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={`${name} logo`}
      width={size}
      height={size}
      loading="lazy"
      className="object-contain"
      style={{ width: size, height: size }}
    />
  );
}

export function IntegrationsClient({
  integrations, connected, connectedProviders
}: { integrations: Integration[]; connected: ConnectedInt[]; connectedProviders: string[] }) {
  const [connectedSet, setConnectedSet] = useState(new Set(connectedProviders));
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const categories = ["All", ...Array.from(new Set(integrations.map(i => i.category)))];
  const filtered = integrations
    .filter(i => filter === "All" || i.category === filter)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  async function connectIntegration(provider: string, name: string, authType: string) {
    setLoading(provider);
    try {
      if (authType === "oauth") {
        // Real OAuth: redirect to provider's OAuth page via our backend
        const res = await fetch("/api/v1/integrations/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, name }),
        });
        const json = await res.json();
        if (res.ok) {
          if (json.data?.authUrl) {
            // OAuth providers: redirect to authorization URL
            window.location.href = json.data.authUrl;
            return;
          }
          setConnectedSet(s => new Set([...s, provider]));
          showToast(`${name} connected successfully`);
        } else {
          showToast(json.error?.message ?? "Connection failed", "error");
        }
      } else {
        // API key / webhook integrations
        const res = await fetch("/api/v1/integrations/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider, name }),
        });
        const json = await res.json();
        if (res.ok) {
          setConnectedSet(s => new Set([...s, provider]));
          showToast(`${name} connected`);
        } else {
          showToast(json.error?.message ?? "Connection failed", "error");
        }
      }
    } finally {
      setLoading(null);
    }
  }

  async function disconnectIntegration(provider: string, name: string) {
    setLoading(provider);
    try {
      const res = await fetch("/api/v1/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      if (res.ok) {
        setConnectedSet(s => { const n = new Set(s); n.delete(provider); return n; });
        showToast(`${name} disconnected`);
      } else {
        showToast("Failed to disconnect", "error");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 animate-fade-in px-5 py-3 rounded-xl font-medium text-sm shadow-2xl border ${
          toast.type === "success"
            ? "bg-accent-green/10 border-accent-green/30 text-accent-green"
            : "bg-danger/10 border-danger/30 text-danger"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="mono-label mb-1">Connect your stack</p>
          <h1 className="text-3xl font-bold text-text tracking-tight">Integrations</h1>
          <p className="text-sm text-muted mt-1 font-mono">
            <span className="text-accent-green font-semibold">{connectedSet.size}</span> of {integrations.length} connected
          </p>
        </div>
        <div className="badge badge-accent px-3 py-1.5 text-xs">
          <span className="pulse-dot mr-1" style={{ width: 6, height: 6 }} />
          More integrations added weekly
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search integrations..."
            className="input-base pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === cat
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-muted border border-[rgb(var(--border))] hover:border-[rgb(var(--border-bright))] hover:text-text"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Connected summary */}
      {connectedSet.size > 0 && (
        <div>
          <p className="section-title mb-3">Connected</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {connected.filter(c => connectedSet.has(c.provider)).map(int => {
              const meta = integrations.find(i => i.provider === int.provider);
              return (
                <div key={int.provider} className="card p-4 flex items-center gap-3 border-accent-green/20 bg-accent-green/5">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                    <ProviderLogo logoUrl={meta?.logoUrl ?? null} name={int.name} size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{int.name}</p>
                    <p className="mono-label">
                      {int.lastSyncAt ? `Synced ${formatRelative(int.lastSyncAt)}` : "Connecting…"}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-accent-green shrink-0 animate-pulse" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid */}
      <div>
        <p className="section-title mb-4">
          {filter === "All" ? "All Integrations" : filter}
          <span className="ml-2 text-muted">({filtered.length})</span>
        </p>
        {filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <Puzzle className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No integrations match your search</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(int => {
              const isConnected = connectedSet.has(int.provider);
              const isLoading = loading === int.provider;
              return (
                <div
                  key={int.provider}
                  className={`card card-glow p-5 relative flex flex-col gap-4 transition-all ${
                    isConnected ? "border-accent-green/25 bg-accent-green/5" : ""
                  }`}
                >
                  {int.popular && !isConnected && (
                    <span className="absolute top-3 right-3 badge badge-cyan text-[10px]">Popular</span>
                  )}
                  {isConnected && (
                    <span className="absolute top-3 right-3 badge badge-green text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-surface-2 border border-[rgb(var(--border))] flex items-center justify-center shrink-0">
                      <ProviderLogo logoUrl={int.logoUrl} name={int.name} size={26} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{int.name}</p>
                      <span className="badge badge-accent text-[10px] px-2 py-0">{int.category}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted font-mono leading-relaxed flex-1">{int.description}</p>

                  <div className="flex items-center gap-2">
                    <span className={`badge text-[10px] ${
                      int.authType === "oauth" ? "badge-accent" :
                      int.authType === "apikey" ? "badge-cyan" : "badge-warning"
                    }`}>
                      {int.authType === "oauth" ? "OAuth" : int.authType === "apikey" ? "API Key" : "Webhook"}
                    </span>
                  </div>

                  {isConnected ? (
                    <button
                      onClick={() => disconnectIntegration(int.provider, int.name)}
                      disabled={isLoading}
                      className="btn-danger w-full text-xs py-2"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => connectIntegration(int.provider, int.name, int.authType)}
                      disabled={isLoading}
                      className="btn-primary w-full text-xs py-2"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                      {int.authType === "oauth" ? "Connect with OAuth" : "Connect"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatRelative(date: Date | string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
