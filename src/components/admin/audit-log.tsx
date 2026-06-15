// src/components/admin/audit-log.tsx
import { formatDistanceToNow } from "@/lib/date-utils";

interface AuditEntry {
  id: string; action: string; resource: string;
  createdAt: Date; ipAddress?: string | null;
  user?: { name?: string | null; email?: string | null } | null;
}

export function AdminAuditLog({ logs }: { logs: AuditEntry[] }) {
  return (
    <div className="card divide-y divide-ink/5">
      {logs.length === 0 ? (
        <p className="px-4 py-5 text-xs text-muted font-mono">No activity yet.</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-display font-semibold text-ink leading-tight">
                {formatAction(log.action)}
              </p>
              <span className="text-xs text-muted font-mono whitespace-nowrap shrink-0">
                {formatDistanceToNow(log.createdAt)}
              </span>
            </div>
            {log.user?.email && (
              <p className="text-xs text-muted font-mono mt-0.5 truncate">{log.user.email}</p>
            )}
            {log.ipAddress && (
              <p className="text-xs text-muted/60 font-mono">{log.ipAddress}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function formatAction(action: string) {
  return action.toLowerCase().replace(/_/g, " ").replace(/^./, c => c.toUpperCase());
}
