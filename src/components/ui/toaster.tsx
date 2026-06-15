// src/components/ui/toaster.tsx
"use client";

import { useEffect, useState } from "react";
import { subscribeToToasts, type Toast } from "@/hooks/use-toast";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribeToToasts((toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 4000);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 min-w-72 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-sm shadow-lg border animate-fade-up",
            toast.variant === "destructive"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-white border-ink/10 text-ink"
          )}
        >
          {toast.variant === "destructive"
            ? <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            : <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
          }
          <div className="flex-1">
            <p className="font-display font-semibold text-sm">{toast.title}</p>
            {toast.description && <p className="text-xs font-mono mt-0.5 opacity-70">{toast.description}</p>}
          </div>
          <button onClick={() => setToasts(p => p.filter(t => t.id !== toast.id))} className="text-muted hover:text-ink">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
