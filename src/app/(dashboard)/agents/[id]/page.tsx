"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bot, Play, Loader2, Trash2, Pencil, Save, X,
  CheckCircle2, XCircle, Clock, AlertTriangle, Activity, Sparkles, ArrowRight, GitBranch,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Run = {
  id: string; status: string; startedAt: string; finishedAt: string | null;
  tokensUsed: number; error: string | null;
};
type Draft = { id: string; kind: string; summary: string; status: string; createdAt: string };
type StatGroup = { status: string; _count: { _all: number }; _sum: { tokensUsed: number | null } };
type Agent = {
  id: string; name: string; description: string | null; goal: string;
  status: string; createdAt: string; updatedAt: string;
  _count?: { runs: number; workflows: number };
  workflows: { id: string; name: string; published: boolean; updatedAt: string }[];
};

const STATUS_META: Record<string, { color: string; icon: any }> = {
  SUCCESS: { color: "text-success", icon: CheckCircle2 },
  RUNNING: { color: "text-accent", icon: Loader2 },
  PENDING: { color: "text-muted", icon: Clock },
  FAILED: { color: "text-danger", icon: XCircle },
  CANCELLED: { color: "text-muted", icon: XCircle },
};

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [stats, setStats] = useState<StatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", goal: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/agents/${id}`);
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: json.error?.message ?? "Failed to load", variant: "destructive" });
        return;
      }
      setAgent(json.data.agent);
      setRuns(json.data.recentRuns);
      setDrafts(json.data.drafts);
      setStats(json.data.stats ?? []);
      setForm({
        name: json.data.agent.name,
        description: json.data.agent.description ?? "",
        goal: json.data.agent.goal,
      });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const totalRuns = stats.reduce((s, g) => s + g._count._all, 0);
  const successCount = stats.find((s) => s.status === "SUCCESS")?._count._all ?? 0;
  const failedCount = stats.find((s) => s.status === "FAILED")?._count._all ?? 0;
  const tokensTotal = stats.reduce((s, g) => s + (g._sum.tokensUsed ?? 0), 0);
  const successRate = totalRuns ? Math.round((successCount / totalRuns) * 100) : 0;

  const runNow = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/v1/agents/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: id,
          plan: [
            { kind: "think", args: { prompt: agent?.goal ?? "Plan next action" } },
            { kind: "rag", args: { question: agent?.goal ?? "What context do I have?" } },
            { kind: "notify", args: { title: `Agent ${agent?.name} ran`, message: "Cycle complete." } },
          ],
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({ title: "Agent run started", description: `Status: ${json.data?.status}` });
        load();
      } else {
        toast({ title: "Run failed", description: json.error?.message, variant: "destructive" });
      }
    } finally { setRunning(false); }
  };

  const save = async () => {
    const res = await fetch(`/api/v1/agents/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (res.ok) {
      toast({ title: "Saved" });
      setEditing(false);
      load();
    } else {
      toast({ title: "Failed", description: json.error?.message, variant: "destructive" });
    }
  };

  const remove = async () => {
    if (!confirm(`Delete agent "${agent?.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/v1/agents/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Agent deleted" });
      router.push("/agents");
    } else {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  if (loading || !agent) {
    return (
      <div className="p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in space-y-8">
      <div>
        <Link href="/agents" className="text-xs text-muted font-mono inline-flex items-center gap-1 hover:text-text transition mb-3">
          <ArrowLeft className="w-3 h-3" /> All Agents
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${
                  agent.status === "RUNNING" ? "bg-success animate-pulse" :
                  agent.status === "ERROR" ? "bg-danger" : "bg-muted/40"
                }`} />
                <span className="mono-label">{agent.status}</span>
              </div>
              {editing ? (
                <input
                  className="text-2xl font-bold bg-transparent border-b border-border focus:outline-none focus:border-accent w-full"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              ) : (
                <h1 className="text-2xl font-bold text-text tracking-tight">{agent.name}</h1>
              )}
              <p className="text-xs text-muted font-mono mt-1">
                Updated {new Date(agent.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={() => { setEditing(false); load(); }} className="btn-secondary text-xs h-9 px-3">
                  <X className="w-3.5 h-3.5 mr-1" /> Cancel
                </button>
                <button onClick={save} className="btn-primary text-xs h-9 px-3">
                  <Save className="w-3.5 h-3.5 mr-1" /> Save
                </button>
              </>
            ) : (
              <>
                <button onClick={remove} className="btn-secondary text-xs h-9 px-3 text-danger">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditing(true)} className="btn-secondary text-xs h-9 px-3">
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                </button>
                <button onClick={runNow} disabled={running} className="btn-primary text-xs h-9 px-3">
                  {running ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                  Run Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi icon={Activity} label="Total Runs" value={totalRuns} sub="lifetime" />
        <Kpi icon={CheckCircle2} label="Success Rate" value={`${successRate}%`} sub={`${successCount} ok / ${failedCount} fail`} />
        <Kpi icon={Sparkles} label="Tokens Used" value={tokensTotal.toLocaleString()} sub="LLM consumption" />
        <Kpi icon={GitBranch} label="Workflows" value={agent._count?.workflows ?? 0} sub="attached" />
      </div>

      {/* Goal / Description */}
      <section className="card p-5">
        <h2 className="mono-label mb-3">Mission</h2>
        {editing ? (
          <div className="space-y-3">
            <input
              className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm"
              placeholder="Short description"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <textarea
              className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm font-mono min-h-[120px]"
              placeholder="Goal"
              value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}
            />
          </div>
        ) : (
          <>
            {agent.description && <p className="text-sm text-text mb-3">{agent.description}</p>}
            <pre className="text-sm text-muted font-mono whitespace-pre-wrap leading-relaxed">{agent.goal}</pre>
          </>
        )}
      </section>

      {/* Pending drafts for this agent */}
      {drafts.filter((d) => d.status === "PENDING").length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" /> Pending Approvals
          </h2>
          <div className="space-y-2">
            {drafts.filter((d) => d.status === "PENDING").map((d) => (
              <Link key={d.id} href="/agents" className="card p-3 flex items-center gap-3 hover:border-accent/40 transition">
                <code className="text-[10px] px-2 py-0.5 rounded bg-surface-2 text-accent font-mono">{d.kind}</code>
                <span className="text-sm text-text flex-1 truncate">{d.summary}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Run history */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" /> Recent Runs
          </h2>
          <span className="text-[10px] font-mono text-muted">latest {runs.length}</span>
        </div>
        {runs.length === 0 ? (
          <div className="card p-8 text-center border-dashed border-border/60">
            <Clock className="w-8 h-8 text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-muted font-mono">No runs yet. Hit “Run Now” to fire the first cycle.</p>
          </div>
        ) : (
          <div className="card divide-y divide-border/60">
            {runs.map((r) => <RunRow key={r.id} run={r} />)}
          </div>
        )}
      </section>

      {/* Workflows */}
      {agent.workflows.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-accent" /> Attached Workflows
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {agent.workflows.map((w) => (
              <Link key={w.id} href="/workflows" className="card p-4 hover:border-accent/40 transition">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-text text-sm truncate">{w.name}</h3>
                  <span className={`text-[10px] font-mono ${w.published ? "text-success" : "text-muted"}`}>
                    {w.published ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>
                <p className="text-[10px] text-muted font-mono">
                  Updated {new Date(w.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RunRow({ run }: { run: Run }) {
  const meta = STATUS_META[run.status] ?? STATUS_META.PENDING;
  const Icon = meta.icon;
  const dur = run.finishedAt
    ? `${Math.max(0, Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 100) / 10)}s`
    : "—";
  return (
    <Link href={`/agents/runs/${run.id}`} className="flex items-center gap-4 p-4 hover:bg-surface-2/40 transition">
      <Icon className={`w-4 h-4 ${meta.color} ${run.status === "RUNNING" ? "animate-spin" : ""}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{run.status}</span>
          <span className="text-xs text-text">{new Date(run.startedAt).toLocaleString()}</span>
        </div>
        {run.error && <p className="text-xs text-danger mt-1 truncate font-mono">{run.error}</p>}
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs text-text font-mono">{dur}</div>
        <div className="text-[10px] text-muted font-mono">{run.tokensUsed} tok</div>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0" />
    </Link>
  );
}

function Kpi({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-accent" />
        <span className="mono-label">{label}</span>
      </div>
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className="text-[10px] text-muted font-mono mt-1">{sub}</div>
    </div>
  );
}
