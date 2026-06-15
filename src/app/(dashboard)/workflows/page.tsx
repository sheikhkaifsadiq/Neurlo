"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState,
  type Connection, type Edge, type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus, Save, Play, Loader2, Trash2, Brain, Search, AlertTriangle, Send, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type StepKind = "think" | "rag" | "draft_action" | "execute" | "notify";

const STEP_META: Record<StepKind, { label: string; icon: any; color: string }> = {
  think:        { label: "Think",        icon: Brain,         color: "bg-blue-500/20 border-blue-500/40 text-blue-300" },
  rag:          { label: "RAG Lookup",   icon: Search,        color: "bg-purple-500/20 border-purple-500/40 text-purple-300" },
  draft_action: { label: "Draft Action", icon: AlertTriangle, color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300" },
  execute:      { label: "Execute",      icon: Send,          color: "bg-green-500/20 border-green-500/40 text-green-300" },
  notify:       { label: "Notify",       icon: Bell,          color: "bg-pink-500/20 border-pink-500/40 text-pink-300" },
};

export default function WorkflowsPage() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => { reload(); }, []);

  const reload = async () => {
    const res = await fetch("/api/v1/workflows");
    const j = await res.json();
    setWorkflows(j.data?.workflows ?? []);
  };

  const openWorkflow = async (id: string) => {
    const res = await fetch(`/api/v1/workflows/${id}`);
    const wf = (await res.json()).data;
    if (!wf) return;
    setActiveId(id);
    setNodes(wf.graph?.nodes ?? []);
    setEdges(wf.graph?.edges ?? []);
  };

  const create = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/v1/workflows", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const j = await res.json();
    if (res.ok) {
      setNewName("");
      await reload();
      openWorkflow(j.data.id);
    }
  };

  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge(c, eds)), [setEdges]);

  const addNode = (kind: StepKind) => {
    const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const meta = STEP_META[kind];
    setNodes((nds: any) => [
      ...nds,
      {
        id, type: "default",
        data: { label: meta.label, kind, args: {} },
        position: { x: 80 + nds.length * 40, y: 80 + nds.length * 60 },
        className: `px-3 py-2 rounded-lg border ${meta.color} text-xs font-mono`,
      } as Node,
    ]);
  };

  const save = async () => {
    if (!activeId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/workflows/${activeId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph: { nodes, edges } }),
      });
      if (res.ok) toast({ title: "Workflow saved" });
    } finally { setBusy(false); }
  };

  const run = async () => {
    if (!activeId) return;
    // Topological order: walk from nodes with no incoming edge
    const incoming = new Map<string, number>();
    nodes.forEach((n) => incoming.set(n.id, 0));
    edges.forEach((e) => incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1));
    const order: any[] = [];
    const visited = new Set<string>();
    const queue: string[] = Array.from(incoming.entries()).filter(([_, c]) => c === 0).map(([id]) => id);
    while (queue.length) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const node = nodes.find((n) => n.id === id);
      if (node) order.push({ kind: (node.data as any).kind, args: (node.data as any).args ?? {} });
      edges.filter((e) => e.source === id).forEach((e) => {
        incoming.set(e.target, (incoming.get(e.target) ?? 1) - 1);
        if ((incoming.get(e.target) ?? 0) <= 0) queue.push(e.target);
      });
    }

    setBusy(true);
    try {
      const res = await fetch("/api/v1/agents/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId: activeId, plan: order }),
      });
      const j = await res.json();
      if (res.ok) toast({ title: `Run ${j.data.status}`, description: `${order.length} steps executed` });
      else toast({ title: "Run failed", description: j.error?.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!activeId || !confirm("Delete this workflow?")) return;
    await fetch(`/api/v1/workflows/${activeId}`, { method: "DELETE" });
    setActiveId(null); setNodes([]); setEdges([]);
    reload();
  };

  return (
    <div className="h-[calc(100vh-0px)] flex animate-fade-in">
      {/* Sidebar: workflow list + node palette */}
      <aside className="w-72 border-r border-border bg-surface p-4 flex flex-col gap-4 overflow-y-auto">
        <div>
          <p className="mono-label mb-2">Workflows</p>
          <div className="flex gap-1 mb-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New workflow"
              className="input-base h-8 text-xs" />
            <button onClick={create} className="btn-primary h-8 px-2">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {workflows.map((w) => (
              <button key={w.id} onClick={() => openWorkflow(w.id)}
                className={`w-full text-left text-xs px-3 py-2 rounded font-mono truncate transition ${
                  activeId === w.id ? "bg-accent text-white" : "text-muted hover:bg-surface-2 hover:text-text"
                }`}>
                {w.name}
              </button>
            ))}
            {workflows.length === 0 && <p className="text-[10px] text-muted font-mono italic">No workflows yet</p>}
          </div>
        </div>

        {activeId && (
          <div>
            <p className="mono-label mb-2">Add Step</p>
            <div className="space-y-1">
              {(Object.keys(STEP_META) as StepKind[]).map((k) => {
                const m = STEP_META[k];
                return (
                  <button key={k} onClick={() => addNode(k)}
                    className="w-full text-left text-xs px-3 py-2 rounded font-mono text-muted hover:bg-surface-2 hover:text-text flex items-center gap-2">
                    <m.icon className="w-3.5 h-3.5" /> {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* Canvas */}
      <main className="flex-1 flex flex-col">
        <header className="border-b border-border p-3 flex items-center justify-between gap-2">
          <p className="text-xs font-mono text-muted">
            {activeId ? workflows.find((w) => w.id === activeId)?.name ?? "Workflow" : "Select or create a workflow"}
          </p>
          {activeId && (
            <div className="flex gap-2">
              <button onClick={remove} className="btn-secondary text-xs h-8 px-3 text-danger">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={save} disabled={busy} className="btn-secondary text-xs h-8 px-3">
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1" /> Save</>}
              </button>
              <button onClick={run} disabled={busy} className="btn-primary text-xs h-8 px-3">
                <Play className="w-3.5 h-3.5 mr-1" /> Run
              </button>
            </div>
          )}
        </header>
        <div className="flex-1">
          {activeId ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap pannable zoomable />
            </ReactFlow>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <p className="text-muted font-mono text-sm mb-2">No workflow open</p>
                <p className="text-xs text-muted/60 font-mono">Create or select one from the sidebar to start designing.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
