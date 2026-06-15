"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, Clock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

const SCOPES = ["read:user", "write:user", "read:integrations", "write:integrations", "read:analytics", "admin:all"];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["read:user"]);
  const [expiry, setExpiry] = useState<"30d" | "90d" | "1y" | "never">("never");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/v1/api-keys")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setKeys(j.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function createKey() {
    if (!keyName) return;
    setCreating(true);
    const res = await fetch("/api/v1/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: keyName, scopes: selectedScopes, expiresIn: expiry }),
    });
    const json = await res.json();
    setCreating(false);
    if (res.ok) {
      setNewKey(json.data.key);
      setKeys((prev) => [{ ...json.data, key: undefined }, ...prev]);
      setShowCreate(false);
      setKeyName("");
      setSelectedScopes(["read:user"]);
      toast({ title: "Key generated", description: "Save it immediately." });
    } else {
      toast({ title: "Error", description: json.error?.message, variant: "destructive" });
    }
  }

  async function revokeKey(id: string, name: string) {
    const res = await fetch(`/api/v1/api-keys?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast({ title: "Key revoked", description: `"${name}" is no longer active.` });
    }
  }

  function copyKey() {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function formatRelative(date: string | null) {
    if (!date) return "Never";
    const d = new Date(date);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="mono-label mb-1">Developer settings</p>
          <h1 className="text-3xl font-bold text-text tracking-tight">API Keys</h1>
          <p className="text-sm text-muted mt-1 font-mono max-w-xl">
            Programmatic access to the Neurlo engine. Use these keys to integrate Neurlo into your own workflows.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Generate Key
        </button>
      </div>

      {/* New key reveal banner */}
      {newKey && (
        <div className="card border-accent/30 bg-accent/5 p-6 animate-glow-pulse relative overflow-hidden">
          <div className="orb orb-accent w-48 h-48 -top-10 -right-10 opacity-30" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-text">Save this key — you won't see it again</p>
                <p className="text-[11px] text-muted font-mono mt-0.5">Neurlo encrypts all keys. For your security, we cannot show this full key again.</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-bg border border-border rounded-lg px-4 py-3 font-mono text-sm group">
                <span className={revealed ? "text-accent" : "blur-sm select-none opacity-50"}>{newKey}</span>
              </div>
              <button onClick={() => setRevealed(!revealed)} className="btn-secondary px-4 h-11">
                {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={copyKey} className="btn-primary px-4 h-11 min-w-[50px]">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <button 
              onClick={() => setNewKey(null)}
              className="text-[11px] font-bold text-accent hover:underline w-fit"
            >
              I'VE SECURELY SAVED THIS KEY
            </button>
          </div>
        </div>
      )}

      {/* Create Modal overlay */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-6 shadow-2xl animate-fade-up">
            <h2 className="text-xl font-bold text-text mb-2">Generate API Key</h2>
            <p className="text-sm text-muted mb-6">Give your key a name and select permissions.</p>
            
            <div className="space-y-4">
              <div>
                <label className="section-title mb-2 block">Key Name</label>
                <input
                  autoFocus
                  placeholder="e.g. Production Backend"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="input-base"
                />
              </div>
              
              <div>
                <label className="section-title mb-2 block">Expiry</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["30d", "90d", "1y", "never"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setExpiry(opt)}
                      className={`px-3 py-2 text-xs font-semibold border rounded-lg transition-all ${
                        expiry === opt ? "bg-accent border-accent text-white" : "border-border text-muted hover:border-text"
                      }`}
                    >
                      {opt === "never" ? "No Expiry" : opt}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="section-title mb-2 block">Scopes</label>
                <div className="flex flex-wrap gap-2">
                  {SCOPES.map((scope) => (
                    <button
                      key={scope}
                      onClick={() => {
                        if (selectedScopes.includes(scope)) setSelectedScopes(selectedScopes.filter(s => s !== scope));
                        else setSelectedScopes([...selectedScopes, scope]);
                      }}
                      className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all ${
                        selectedScopes.includes(scope) ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan" : "border-border text-muted"
                      }`}
                    >
                      {scope}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              <button 
                onClick={createKey} 
                disabled={creating || !keyName}
                className="btn-primary flex-1"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="section-title">Active Keys ({keys.length})</p>
          <div className="flex items-center gap-2">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            <span className="mono-label">Live API Status</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 w-full" />)}
          </div>
        ) : keys.length === 0 ? (
          <div className="card p-12 text-center border-dashed">
            <Key className="w-10 h-10 text-muted/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text mb-2">No active API keys</h3>
            <p className="text-sm text-muted font-mono mb-6 max-w-xs mx-auto">Generate a key to start building with Neurlo programmatically.</p>
            <button onClick={() => setShowCreate(true)} className="btn-secondary">
              Create your first key
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div key={key.id} className="card card-glow p-5 flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0 group-hover:border-accent/30 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-muted group-hover:text-accent transition-colors" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-base font-bold text-text truncate">{key.name}</p>
                    <div className="flex gap-1">
                      {key.scopes.slice(0, 2).map(s => (
                        <span key={s} className="badge badge-accent text-[9px] uppercase tracking-tighter px-1.5 py-0">{s}</span>
                      ))}
                      {key.scopes.length > 2 && <span className="text-[9px] text-muted">+{key.scopes.length - 2} more</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-muted font-mono text-[11px]">
                      <Zap className="w-3 h-3" />
                      <span>{key.keyPrefix}••••••••••••</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted font-mono text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>Used {formatRelative(key.lastUsedAt)}</span>
                    </div>
                    {key.expiresAt && (
                      <div className="flex items-center gap-1.5 text-muted font-mono text-[11px]">
                        <AlertCircle className="w-3 h-3 text-warning" />
                        <span>Expires {new Date(key.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => revokeKey(key.id, key.name)}
                  className="btn-ghost text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all p-2"
                  title="Revoke Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security notice */}
      <div className="card p-6 bg-bg border-dashed border-border/60">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text">Pro Tip: Environment Variables</h4>
            <p className="text-xs text-muted font-mono mt-1 leading-relaxed">
              Never commit your API keys to version control. Always use environment variables 
              (e.g. <code className="text-accent-cyan">NEURLO_API_KEY</code>) to store keys securely in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
