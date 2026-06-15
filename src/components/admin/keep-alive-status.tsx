"use client";

import { useState, useEffect } from "react";
import { Activity, CheckCircle, XCircle, RefreshCw, Clock } from "lucide-react";

interface PingResult {
  ok: boolean;
  ts: string;
  latency_ms?: number;
  error?: string;
}

export function KeepAliveStatus() {
  const [lastPing, setLastPing] = useState<PingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPing, setNextPing] = useState<number>(600); // 10 min countdown

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setNextPing(prev => {
        if (prev <= 1) {
          triggerPing();
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-ping on mount
  useEffect(() => { triggerPing(); }, []);

  async function triggerPing() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cron/keep-alive", {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}` },
        cache: "no-store",
      });
      const data = await res.json();
      setLastPing(data);
    } catch {
      setLastPing({ ok: false, ts: new Date().toISOString(), error: "Network error" });
    } finally {
      setIsLoading(false);
    }
  }

  const mins = Math.floor(nextPing / 60);
  const secs = nextPing % 60;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          <h3 className="font-display font-bold text-sm text-ink">Keep-Alive Status</h3>
        </div>
        <button
          onClick={() => { triggerPing(); setNextPing(600); }}
          disabled={isLoading}
          className="p-1.5 rounded hover:bg-ink/5 text-muted hover:text-ink transition-colors"
          title="Ping now"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 p-3 rounded-sm bg-ink/3 border border-ink/8">
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-muted" />
            <span className="text-xs font-mono text-muted">Pinging server…</span>
          </>
        ) : lastPing?.ok ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            <div className="flex-1">
              <span className="text-xs font-mono text-ink">Server is warm</span>
              {lastPing.latency_ms !== undefined && (
                <span className="text-xs text-muted ml-2">· {lastPing.latency_ms}ms</span>
              )}
            </div>
          </>
        ) : lastPing ? (
          <>
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-xs font-mono text-red-600">{lastPing.error ?? "Ping failed"}</span>
          </>
        ) : (
          <span className="text-xs font-mono text-muted">No ping data yet</span>
        )}
      </div>

      {/* Next ping countdown */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted">
        <Clock className="w-3.5 h-3.5" />
        <span>Next auto-ping in <strong className="text-ink">{mins}:{secs.toString().padStart(2, "0")}</strong></span>
      </div>

      {lastPing?.ts && (
        <p className="text-xs text-muted font-mono">
          Last ping: {new Date(lastPing.ts).toLocaleTimeString()}
        </p>
      )}

      {/* Explanation */}
      <p className="text-xs text-muted font-mono leading-relaxed border-t border-ink/8 pt-3">
        Vercel cron pings this endpoint every 10 min to keep functions warm and prevent cold starts. Zero impact on user traffic.
      </p>
    </div>
  );
}
