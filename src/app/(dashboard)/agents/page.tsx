"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Bot, GitBranch, Sparkles, CheckCircle2, XCircle, Clock, Loader2, Play, AlertTriangle, ArrowRight } from "lucide-react";

type Agent = { id: string; name: string; status: string; goal: string; _count?: { runs: number; workflows: number } };
type Draft = { id: string; kind: string; summary: string; status: string; createdAt: string };
type Notif = { id: string; type: string; title: string; message: string; createdAt: string; read: boolean };

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [insights, setInsights] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [a, d, n] = await Promise.all([
        fetch("/api/v1/agents").then((r) => r.json()),
        fetch("/api/v1/agents/drafts").then((r) => r.json()),
        fetch("/api/v1/notifications?limit=10").then((r) => r.json()),
      ]);
      setAgents(a.data?.agents ?? []);
      setDrafts(d.data?.drafts ?? []);
      setInsights((n.data?.items ?? []).filter((i: Notif) => i.type === "AI_INSIGHT"));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const respond = async (draftId: string, action: "approve" | "reject") => {
    const res = await fetch("/api/v1/agents/drafts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, draftId }),
    });
    if (res.ok) load();
  };

  const pending = drafts.filter((d) => d.status === "PENDING");
  const runningAgents = agents.filter((a) => a.status === "RUNNING");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="mono-label mb-1">Neurlo 1.6 Max</p>
          <h1 className="text-3xl font-bold text-text tracking-tight">Agentic Command Center</h1>
          <p className="text-sm text-muted mt-1 font-mono">Active agents, pending approvals, and proactive insights.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/workflows" className="btn-secondary">
            <GitBranch className="w-4 h-4 mr-2" /> Workflow Builder
          </Link>
          <Link href="/agents/new" className="btn-primary">
            <Bot className="w-4 h-4 mr-2" /> New Agent
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Bot} label="Agents" value={agents.length} sub={`${runningAgents.length} running`} />
        <KpiCard icon={Clock} label="Pending Drafts" value={pending.length} sub={pending.length ? "awaiting approval" : "all clear"} accent={pending.length > 0} />
        <KpiCard icon={Sparkles} label="AI Insights" value={insights.length} sub="latest cycle" />
        <KpiCard icon={Activity} label="Total Runs" value={agents.reduce((s, a) => s + (a._count?.runs ?? 0), 0)} sub="lifetime" />
      </div>

      {/* Pending drafts */}
      <section>
        <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" /> Draft & Approve
        </h2>
        {pending.length === 0 ? (
          <div className="card p-8 text-center border-dashed border-border/60">
            <CheckCircle2 className="w-8 h-8 text-success/60 mx-auto mb-3" />
            <p className="text-sm text-muted font-mono">No drafts awaiting your approval.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((d) => (
              <div key={d.id} className="card p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-[10px] px-2 py-0.5 rounded bg-surface-2 text-accent font-mono">{d.kind}</code>
                    <span className="text-[10px] text-muted font-mono">{new Date(d.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-text">{d.summary}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => respond(d.id, "reject")} className="btn-secondary text-xs h-8 px-3 text-danger">
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </button>
                  <button onClick={() => respond(d.id, "approve")} className="btn-primary text-xs h-8 px-3">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active agents */}
      <section>
        <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4 text-accent" /> Your Agents
        </h2>
        {loading ? (
          <div className="card p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted" /></div>
        ) : agents.length === 0 ? (
          <div className="card p-8 text-center border-dashed border-border/60">
            <Bot className="w-8 h-8 text-accent/40 mx-auto mb-3" />
            <h3 className="font-bold text-text mb-1">No agents yet</h3>
            <p className="text-sm text-muted font-mono mb-4">Create your first autonomous agent to start automating.</p>
            <Link href="/agents/new" className="btn-primary inline-flex">Create Agent</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((a) => (
              <div key={a.id} className="card p-5 hover:border-accent/40 transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${a.status === "RUNNING" ? "bg-success animate-pulse" : a.status === "ERROR" ? "bg-danger" : "bg-muted/40"}`} />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{a.status}</span>
                  </div>
                  <span className="text-[10px] text-muted font-mono">{a._count?.runs ?? 0} runs</span>
                </div>
                <h3 className="font-bold text-text mb-1 truncate">{a.name}</h3>
                <p className="text-xs text-muted line-clamp-3 mb-4">{a.goal}</p>
                <div className="flex gap-2">
                  <Link href={`/agents/${a.id}`} className="btn-secondary text-xs h-8 px-3 flex-1">
                    Open <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                  <button className="btn-primary text-xs h-8 px-3" title="Run">
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Insights */}
      <section>
        <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" /> Proactive Insights
        </h2>
        {insights.length === 0 ? (
          <div className="card p-8 text-center border-dashed border-border/60">
            <Sparkles className="w-8 h-8 text-accent/40 mx-auto mb-3" />
            <p className="text-sm text-muted font-mono">The Insight Engine runs hourly. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {insights.slice(0, 5).map((n) => (
              <div key={n.id} className="card p-4 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text text-sm">{n.title}</h3>
                  <p className="text-xs text-muted mt-0.5">{n.message}</p>
                </div>
                <span className="text-[10px] text-muted font-mono shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, accent }: any) {
  return (
    <div className={`card p-5 ${accent ? "border-warning/40 bg-warning/5" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${accent ? "text-warning" : "text-accent"}`} />
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{label}</span>
      </div>
      <div className="text-3xl font-bold text-text">{value}</div>
      <div className="text-[10px] text-muted font-mono mt-1">{sub}</div>
    </div>
  );
}
