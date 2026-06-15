"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Activity, Loader2, CheckCircle2, XCircle, Clock,
  Brain, Database, FileEdit, Zap, Bell, AlertTriangle, ChevronDown, ChevronRight,
} from "lucide-react";

type Step = {
  kind: string;
  input: any;
  output?: any;
  error?: string;
  startedAt: string;
  finishedAt?: string;
};
type Draft = {
  id: string; kind: string; summary: string; status: string;
  createdAt: string; result?: any; error?: string | null;
};
type Run = {
  id: string; status: string; startedAt: string; finishedAt: string | null;
  tokensUsed: number; error: string | null;
  input: any; output: any; steps: Step[];
  agent: { id: string; name: string; goal: string } | null;
  workflow: { id: string; name: string } | null;
  drafts: Draft[];
};

const STEP_ICONS: Record<string, any> = {
  think: Brain, rag: Database, draft_action: FileEdit, execute: Zap, notify: Bell,
};

const STATUS_META: Record<string, { color: string; bg: string }> = {
  SUCCESS: { color: "text-success", bg: "bg-success/10" },
  RUNNING: { color: "text-accent", bg: "bg-accent/10" },
  FAILED: { color: "text-danger", bg: "bg-danger/10" },
  PENDING: { color: "text-muted", bg: "bg-muted/10" },
  CANCELLED: { color: "text-muted", bg: "bg-muted/10" },
};

export default function RunDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = use(params);
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/v1/agents/runs/${runId}`);
      const json = await res.json();
      if (res.ok) setRun(json.data.run);
      setLoading(false);
    })();
  }, [runId]);

  if (loading) {
    return <div className="p-12 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted" /></div>;
  }
  if (!run) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted font-mono text-sm">Run not found.</p>
        <Link href="/agents" className="text-accent text-sm mt-2 inline-block">← Back to agents</Link>
      </div>
    );
  }

  const meta = STATUS_META[run.status] ?? STATUS_META.PENDING;
  const dur = run.finishedAt
    ? `${Math.max(0, Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 100) / 10)}s`
    : "—";

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in space-y-6">
      <div>
        <Link
          href={run.agent ? `/agents/${run.agent.id}` : "/agents"}
          className="text-xs text-muted font-mono inline-flex items-center gap-1 hover:text-text transition mb-3"
        >
          <ArrowLeft className="w-3 h-3" /> {run.agent ? run.agent.name : "Agents"}
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="mono-label mb-1">Agent Run</p>
            <h1 className="text-2xl font-bold text-text tracking-tight">
              Run {run.id.slice(0, 8)}
            </h1>
            <p className="text-xs text-muted font-mono mt-1">
              Started {new Date(run.startedAt).toLocaleString()}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-md ${meta.bg} flex items-center gap-2`}>
            <span className={`text-xs font-mono uppercase tracking-wider font-bold ${meta.color}`}>{run.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Duration" value={dur} />
        <Kpi label="Steps" value={run.steps?.length ?? 0} />
        <Kpi label="Tokens" value={run.tokensUsed.toLocaleString()} />
        <Kpi label="Drafts" value={run.drafts.length} />
      </div>

      {run.error && (
        <div className="card p-4 border-danger/40 bg-danger/5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-danger mb-1">Run failed</h3>
            <pre className="text-xs text-danger/90 font-mono whitespace-pre-wrap break-words">{run.error}</pre>
          </div>
        </div>
      )}

      {/* Step timeline */}
      <section>
        <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" /> Execution Timeline
        </h2>
        {(!run.steps || run.steps.length === 0) ? (
          <div className="card p-8 text-center border-dashed border-border/60">
            <Clock className="w-8 h-8 text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-muted font-mono">No steps recorded.</p>
          </div>
        ) : (
          <div className="relative space-y-3">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border/60" />
            {run.steps.map((s, i) => <StepCard key={i} step={s} index={i} />)}
          </div>
        )}
      </section>

      {/* Drafts spawned by this run */}
      {run.drafts.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
            <FileEdit className="w-4 h-4 text-accent" /> Drafts Generated
          </h2>
          <div className="space-y-2">
            {run.drafts.map((d) => (
              <div key={d.id} className="card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-[10px] px-2 py-0.5 rounded bg-surface-2 text-accent font-mono">{d.kind}</code>
                  <span className={`text-[10px] font-mono ${
                    d.status === "EXECUTED" ? "text-success" :
                    d.status === "FAILED" ? "text-danger" :
                    d.status === "PENDING" ? "text-warning" : "text-muted"
                  }`}>{d.status}</span>
                  <span className="text-[10px] text-muted font-mono ml-auto">
                    {new Date(d.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-text">{d.summary}</p>
                {d.error && <p className="text-xs text-danger mt-1 font-mono">{d.error}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Raw payload */}
      <details className="card p-4">
        <summary className="cursor-pointer text-sm font-mono text-muted hover:text-text">Raw input / output</summary>
        <div className="mt-3 grid md:grid-cols-2 gap-3">
          <div>
            <p className="mono-label mb-1">Input</p>
            <pre className="text-[10px] font-mono bg-surface-2 p-3 rounded overflow-auto max-h-64">{JSON.stringify(run.input, null, 2)}</pre>
          </div>
          <div>
            <p className="mono-label mb-1">Output</p>
            <pre className="text-[10px] font-mono bg-surface-2 p-3 rounded overflow-auto max-h-64">{JSON.stringify(run.output, null, 2)}</pre>
          </div>
        </div>
      </details>
    </div>
  );
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const [open, setOpen] = useState(false);
  const Icon = STEP_ICONS[step.kind] ?? Activity;
  const failed = !!step.error;
  const dur = step.finishedAt
    ? `${Math.max(0, Math.round((new Date(step.finishedAt).getTime() - new Date(step.startedAt).getTime()) / 10) / 100)}s`
    : "…";
  return (
    <div className="relative pl-12">
      <div className={`absolute left-2 top-3 w-7 h-7 rounded-full flex items-center justify-center border-2 ${
        failed ? "bg-danger/10 border-danger/40" : "bg-accent/10 border-accent/40"
      }`}>
        <Icon className={`w-3.5 h-3.5 ${failed ? "text-danger" : "text-accent"}`} />
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="card p-4 w-full text-left hover:border-accent/40 transition"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="mono-label">step {String(index + 1).padStart(2, "0")}</span>
          <code className="text-[11px] font-mono text-accent">{step.kind}</code>
          {failed ? <XCircle className="w-3.5 h-3.5 text-danger" /> : <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
          <span className="text-[10px] text-muted font-mono ml-auto">{dur}</span>
          {open ? <ChevronDown className="w-3 h-3 text-muted" /> : <ChevronRight className="w-3 h-3 text-muted" />}
        </div>
        {step.error && <p className="text-xs text-danger font-mono mt-1 truncate">{step.error}</p>}
        {open && (
          <div className="mt-3 grid md:grid-cols-2 gap-3 cursor-default" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="mono-label mb-1">Input</p>
              <pre className="text-[10px] font-mono bg-surface-2 p-3 rounded overflow-auto max-h-48">{JSON.stringify(step.input, null, 2)}</pre>
            </div>
            <div>
              <p className="mono-label mb-1">Output</p>
              <pre className="text-[10px] font-mono bg-surface-2 p-3 rounded overflow-auto max-h-48">{JSON.stringify(step.output ?? step.error ?? null, null, 2)}</pre>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}

function Kpi({ label, value }: any) {
  return (
    <div className="card p-4">
      <div className="mono-label mb-1">{label}</div>
      <div className="text-xl font-bold text-text">{value}</div>
    </div>
  );
}
