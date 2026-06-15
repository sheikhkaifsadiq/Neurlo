"use client";
import { useState } from "react";
import { CheckCircle, CreditCard, Loader2, ArrowRight } from "lucide-react";
import { PLANS } from "@/lib/stripe-plans";

interface BillingClientProps {
  currentPlanSlug: string;
  status: string;
  isActive: boolean;
}

export function BillingClient({ currentPlanSlug, status, isActive }: BillingClientProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planSlug: string) {
    setLoading(planSlug);
    try {
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug, interval }),
      });
      const json = await res.json();
      if (json.data?.url) {
        window.location.href = json.data.url;
      } else {
        alert(json.error?.message || "Checkout failed. Please ensure your account email is correct.");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/v1/billing/portal", { method: "POST" });
      const json = await res.json();
      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-10">
      {/* Plans Section */}
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold text-text">Upgrade Neural Capacity</h2>
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border">
            <button 
              onClick={() => setInterval("monthly")}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                interval === "monthly" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-text"
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setInterval("yearly")}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                interval === "yearly" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-text"
              }`}
            >
              Yearly <span className="ml-1 text-accent-green opacity-80">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([slug, plan]) => {
            const isCurrent = currentPlanSlug === slug;
            const isLoading = loading === slug;
            const price = interval === "yearly" ? plan.priceYearly : plan.priceMonthly;
            
            return (
              <div 
                key={slug} 
                className={`card p-6 flex flex-col gap-6 transition-all group ${
                  isCurrent ? "border-accent ring-1 ring-accent/50 bg-accent/5 shadow-2xl shadow-accent/10" : "hover:border-border-bright"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="section-title text-accent uppercase tracking-widest">{plan.name}</p>
                    {isCurrent && <span className="badge badge-accent text-[9px]">ACTIVE</span>}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-text">
                      {price === 0 ? "Custom" : `$${price}`}
                    </span>
                    {price > 0 && <span className="text-xs text-muted font-mono">/mo</span>}
                  </div>
                  {interval === "yearly" && price > 0 && (
                    <p className="text-[10px] text-accent-green font-mono font-bold tracking-tight">Billed annually (${price * 12}/yr)</p>
                  )}
                </div>

                <div className="divider opacity-50" />

                <ul className="space-y-3.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-[11px] font-medium text-text/80 flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-2.5 h-2.5 text-accent-green" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button 
                    onClick={handlePortal}
                    disabled={loading === "portal"}
                    className="btn-secondary w-full h-12 flex items-center justify-center gap-2"
                  >
                    {loading === "portal" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Manage Subscription
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpgrade(slug)}
                    disabled={!!loading}
                    className="btn-primary w-full h-12 flex items-center justify-center gap-2 shadow-lg shadow-accent/15 group-hover:scale-[1.02] transition-transform"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Switch to " + plan.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
