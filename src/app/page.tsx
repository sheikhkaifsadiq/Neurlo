import Link from "next/link";
import { ArrowRight, Brain, Zap, Shield, CheckCircle, Activity, Key, Puzzle, Code, Terminal, Sparkles, ChevronRight, Globe, Lock, Cpu, Database, Layers } from "lucide-react";
import { HeroCtaButtons } from "@/components/landing/cta-buttons";

export const metadata = {
  title: "Neurlo — AI that thinks before you ask",
  description: "The next-generation AI operating system for your professional workflow.",
};

const FEATURES = [
  { 
    icon: Brain, 
    title: "Predictive Context", 
    desc: "Surfaces relevant documents, threads, and data before you go looking. Perfect memory for your entire digital life.",
    color: "text-accent"
  },
  { 
    icon: Zap, 
    title: "Instant Actioning", 
    desc: "Drafts emails, Slack responses, and task updates based on real-time triggers. Approve, refine, or ignore with one tap.",
    color: "text-accent-cyan"
  },
  { 
    icon: Shield, 
    title: "Secure Learning", 
    desc: "End-to-end encrypted learning. Your data never trains shared models. Private, secure, and fully under your control.",
    color: "text-accent-green"
  },
];

const STATS = [
  { value: "47h", label: "Monthly Time Saved" },
  { value: "94%", label: "Draft Accuracy" },
  { value: "20k+", label: "Neural Connections" },
];

const PLANS = [
  { 
    name: "Starter", 
    price: "0", 
    desc: "Perfect for exploring the power of AI context.",
    features: ["5 Integrations", "Basic Context Engine", "7-day History", "Email Support"],
    cta: "Start for Free",
    popular: false
  },
  { 
    name: "Pro", 
    price: "29", 
    desc: "For professionals who need maximum leverage.",
    features: ["Unlimited Integrations", "Advanced Predictive Engine", "Infinite History", "Priority Support", "Custom Actions"],
    cta: "Upgrade to Pro",
    popular: true
  },
  { 
    name: "Enterprise", 
    price: "Custom", 
    desc: "Scale AI across your entire organization.",
    features: ["On-premise Deployment", "Custom Model Training", "Dedicated Success Manager", "SLA Guarantees", "Audit Logs"],
    cta: "Contact Sales",
    popular: false
  },
];

export default function HomePage() {
  return (
    <div className="bg-bg min-h-screen text-text selection:bg-accent/30 overflow-x-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 grid-dots opacity-20 pointer-events-none" />
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] orb orb-accent opacity-20 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] orb orb-accent-2 opacity-10 pointer-events-none" />

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center animate-glow-pulse group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="font-bold text-lg text-text tracking-tighter">
              Neur<span className="text-gradient-cyan">lo</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted hover:text-text transition-colors">Features</a>
            <a href="#pricing" className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted hover:text-text transition-colors">Pricing</a>
            <a href="#developers" className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted hover:text-text transition-colors">Developers</a>
            <a href="#security" className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted hover:text-text transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-xs font-bold text-muted hover:text-text transition-colors">LOGIN</Link>
            <Link href="/auth/signup" className="btn-primary h-9 px-5 text-xs shadow-lg shadow-accent/20">
              GET STARTED
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 sm:space-y-8 animate-fade-in min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent">
              <Sparkles className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Public Beta v1.4 now live</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05] break-words">
              AI that <span className="text-gradient">thinks</span><br />
              before you ask.
            </h1>
            
            <p className="text-base sm:text-lg text-muted font-mono leading-relaxed max-w-lg">
              The neural operating system for your professional stack. Neurlo predicts needs, drafts actions, and connects your tools into a single cognitive unit.
            </p>
            
            <HeroCtaButtons />
          </div>

          {/* AI INTERFACE MOCKUP */}
          <div className="relative animate-fade-up min-w-0">
            <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full translate-x-10 translate-y-10" />
            <div className="relative card border-border-bright bg-surface/80 backdrop-blur-2xl p-5 sm:p-8 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="pulse-dot" />
                  <span className="text-[10px] font-mono text-accent uppercase font-bold tracking-widest">Cognitive Stream</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="w-2 h-2 rounded-full bg-border" />
                  <div className="w-2 h-2 rounded-full bg-border" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2 opacity-50">
                  <div className="h-2 w-1/3 bg-border rounded-full" />
                  <div className="h-2 w-full bg-border rounded-full" />
                </div>
                
                <div className="card bg-surface-2/50 border-accent/20 p-5 space-y-4 animate-glow-pulse">
                  <p className="text-sm font-mono leading-relaxed">
                    <span className="text-accent">neurlo@brain:</span> drafting priority response to <span className="text-accent-cyan">@marcus_cto</span> regarding the Q3 infra scope. surfacing related docs...
                  </p>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-xs">📄</div>
                    <div className="h-8 w-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-xs">💬</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex gap-3 sm:gap-4 flex-wrap">
                    {STATS.map((s) => (
                      <div key={s.label}>
                        <p className="text-lg sm:text-xl font-bold text-text">{s.value}</p>
                        <p className="text-[9px] text-muted uppercase font-mono tracking-wider">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 border-y border-border relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <p className="section-title text-accent">Core Capabilities</p>
            <h2 className="text-3xl lg:text-5xl font-bold">Built for the high-agency pro.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-8 space-y-4 group hover:border-accent/30 transition-all hover:bg-surface-2/30">
                <div className={`w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed font-mono">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <p className="section-title text-accent-cyan">Flexible Pricing</p>
            <h2 className="text-3xl lg:text-5xl font-bold">Scale as you grow.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`card p-8 flex flex-col gap-6 relative transition-all ${plan.popular ? 'border-accent ring-1 ring-accent/50 bg-accent/5 shadow-2xl shadow-accent/10' : 'hover:border-border-bright'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-accent/20">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-xs text-muted font-mono leading-relaxed">{plan.desc}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-xs text-muted font-mono">/mo</span>}
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs font-medium text-text/80 flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`btn-${plan.popular ? 'primary' : 'secondary'} h-12 w-full text-xs font-bold`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEVELOPERS SECTION */}
      <section id="developers" className="py-24 border-y border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <p className="section-title text-accent-cyan uppercase tracking-widest font-bold">For Builders</p>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">API-first neural architecture.</h2>
            <p className="text-muted font-mono text-sm leading-relaxed max-w-lg">
              Integrate Neurlo into your own products. Access the predictive context engine, draft generators, and data synchers via our robust GraphQL and REST APIs.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Code, title: "SDKs & Libs", desc: "Native support for Node, Python, and Go." },
                { icon: Terminal, title: "CLI Tool", desc: "Manage context and deployments from the terminal." },
                { icon: Cpu, title: "Model Edge", desc: "Run inference close to your users for zero latency." },
                { icon: Layers, title: "Extensible", desc: "Build custom integrations for your unique tools." },
              ].map((item) => (
                <div key={item.title} className="space-y-2">
                  <item.icon className="w-5 h-5 text-accent-cyan" />
                  <h4 className="text-sm font-bold">{item.title}</h4>
                  <p className="text-[11px] text-muted font-mono">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card bg-bg border-border-bright p-1 font-mono text-[11px] shadow-2xl overflow-hidden group">
            <div className="bg-surface p-4 border-b border-border flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
              </div>
              <span className="text-muted group-hover:text-accent transition-colors">api_request.py</span>
            </div>
            <pre className="p-6 text-text/80 leading-relaxed overflow-x-auto">
              <code>{`import neurlo

client = neurlo.Client(api_key="nrl_...")

# Query the predictive engine
context = client.predict(
    user_id="usr_123",
    trigger="upcoming_meeting",
    depth="high"
)

print(f"Context localized: {context.insights[0]}")`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section id="security" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <p className="section-title text-accent-green">Enterprise Grade</p>
            <h2 className="text-3xl lg:text-5xl font-bold">Trust is our foundation.</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center mx-auto text-accent-green">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">End-to-End Encryption</h4>
              <p className="text-xs text-muted font-mono leading-relaxed">Your data is encrypted at rest and in transit using AES-256 and TLS 1.3 standards.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center mx-auto text-accent-green">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">SOC2 Type II Compliant</h4>
              <p className="text-xs text-muted font-mono leading-relaxed">Rigorous external audits ensure we maintain the highest security and availability standards.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center mx-auto text-accent-green">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">GDPR & CCPA Ready</h4>
              <p className="text-xs text-muted font-mono leading-relaxed">Full control over your data with automated deletion and portability tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-24 relative overflow-hidden bg-accent/5 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10 relative z-10">
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">Ready to activate your second brain?</h2>
          <p className="text-muted font-mono max-w-xl mx-auto">
            Join the elite teams scaling their cognition with Neurlo. Start your 14-day free trial today.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup" className="btn-primary h-14 px-10 text-sm">
              GET STARTED NOW
            </Link>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] orb orb-accent opacity-10 pointer-events-none" />
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-bold text-sm tracking-tight">NEURLO</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold text-muted uppercase tracking-widest">
            <a href="/legal/terms" className="hover:text-text">Terms</a>
            <a href="/legal/privacy" className="hover:text-text">Privacy</a>
            <a href="mailto:support@neurlo.tech" className="hover:text-text">Support</a>
          </div>
          <p className="text-[10px] text-muted font-mono">© 2026 NEURLO INC. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
