"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Bot, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function NewAgentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/v1/agents", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, goal }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({ title: "Agent created", description: name });
        router.push(`/agents`);
      } else {
        toast({ title: "Failed", description: json.error?.message, variant: "destructive" });
      }
    } finally { setBusy(false); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto animate-fade-in">
      <Link href="/agents" className="text-xs text-muted hover:text-text font-mono inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="w-3 h-3" /> Back to agents
      </Link>
      <div className="mb-6">
        <p className="mono-label mb-1">New Agent</p>
        <h1 className="text-2xl font-bold text-text tracking-tight">Define your agent's goal</h1>
        <p className="text-sm text-muted mt-1 font-mono">The agent will execute toward this goal using your connected data.</p>
      </div>
      <form onSubmit={submit} className="card p-6 space-y-5">
        <div className="space-y-2">
          <label className="section-title">Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Inbox Triage Agent" className="input-base" />
        </div>
        <div className="space-y-2">
          <label className="section-title">Description (optional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this agent do?" className="input-base" />
        </div>
        <div className="space-y-2">
          <label className="section-title">Goal</label>
          <textarea required value={goal} onChange={(e) => setGoal(e.target.value)} rows={5}
            placeholder="Every morning, scan my inbox for high-priority threads and draft 2-line replies for me to approve."
            className="input-base resize-none" />
        </div>
        <div className="pt-2 flex justify-end">
          <button disabled={busy} className="btn-primary px-6 h-11">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Bot className="w-4 h-4 mr-2" /> Create Agent</>}
          </button>
        </div>
      </form>
    </div>
  );
}
