"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User, Shield, Bell, Trash2, Loader2, Key, Globe,
  Mail, Building, Briefcase, Camera, Save, AlertTriangle,
  ShieldCheck, ShieldOff, Copy, CheckCircle2,
} from "lucide-react";
import { updateProfileSchema, changePasswordSchema, type UpdateProfileInput } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type Tab = "profile" | "security" | "mfa" | "notifications" | "danger";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isLoading, setIsLoading] = useState(false);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Password", icon: Key },
    { id: "mfa", label: "Two-Factor Auth", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ];

  const initials = (session?.user?.name ?? session?.user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <p className="mono-label mb-1">System Preferences</p>
        <h1 className="text-3xl font-bold text-text tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted mt-1 font-mono">Manage your profile, identity, and system alerts.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === tab.id
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="lg:col-span-3 space-y-6">
          {activeTab === "profile" && (
            <ProfileTab
              session={session}
              initials={initials}
              isLoading={isLoading}
              onSave={async (data: UpdateProfileInput) => {
                setIsLoading(true);
                try {
                  const res = await fetch("/api/v1/users", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) {
                    await update({ name: data.name });
                    toast({ title: "Profile updated", description: "Changes synced." });
                  } else {
                    const json = await res.json();
                    toast({ title: "Update failed", description: json.error?.message, variant: "destructive" });
                  }
                } finally { setIsLoading(false); }
              }}
            />
          )}

          {activeTab === "security" && (
            <PasswordTab
              isLoading={isLoading}
              onSave={async (data: any) => {
                setIsLoading(true);
                try {
                  const res = await fetch("/api/v1/users/password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  const json = await res.json();
                  if (res.ok) {
                    toast({ title: "Password updated" });
                  } else {
                    toast({ title: "Error", description: json.error?.message, variant: "destructive" });
                  }
                } finally { setIsLoading(false); }
              }}
            />
          )}

          {activeTab === "mfa" && <MFATab session={session} onUpdate={update} />}

          {activeTab === "notifications" && (
            <div className="card p-8 text-center border-dashed border-border/60">
              <Bell className="w-10 h-10 text-accent/40 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text mb-2">Notification Center</h3>
              <p className="text-sm text-muted font-mono mb-6 max-w-sm mx-auto">
                System events, AI insights, and security alerts are managed in the inbox.
              </p>
              <Link href="/notifications" className="btn-primary inline-flex">Open Inbox</Link>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="card border-danger/20 bg-danger/5 p-8 text-center relative overflow-hidden">
              <AlertTriangle className="w-10 h-10 text-danger/60 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-danger mb-2">Critical Actions</h3>
              <p className="text-sm text-muted font-mono mb-8 max-w-md mx-auto">
                Deleting your account will purge all integration history, learned models, and API keys. Irreversible.
              </p>
              <button className="btn-danger px-8 py-3 font-bold">Delete Account Forever</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ProfileTab({ session, onSave, isLoading, initials }: any) {
  const { toast } = useToast();
  const { update } = useSession();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", company: "", jobTitle: "", timezone: "UTC" },
  });
  const [loaded, setLoaded] = useState(false);
  const [photo, setPhoto] = useState<string | null>(session?.user?.image ?? null);
  const [uploading, setUploading] = useState(false);
  const fileInputId = "avatar-upload-input";

  // Hydrate form with persisted profile values
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/v1/users");
        const json = await res.json();
        if (mounted && res.ok && json?.data) {
          reset({
            name: json.data.name ?? "",
            company: json.data.company ?? "",
            jobTitle: json.data.jobTitle ?? "",
            timezone: json.data.timezone ?? "UTC",
          });
          if (json.data.image) setPhoto(json.data.image);
        }
      } finally { if (mounted) setLoaded(true); }
    })();
    return () => { mounted = false; };
  }, [reset]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please pick an image.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 2 MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/v1/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const json = await res.json();
      if (res.ok) {
        setPhoto(dataUrl);
        await update({ image: dataUrl });
        toast({ title: "Photo updated" });
      } else {
        toast({ title: "Upload failed", description: json.error?.message, variant: "destructive" });
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 flex items-center gap-6 flex-wrap">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-accent/20 overflow-hidden shrink-0">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-text mb-1">Avatar & Identity</h2>
          <p className="text-xs text-muted font-mono mb-4 italic">PNG/JPG up to 2&nbsp;MB.</p>
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <label
            htmlFor={fileInputId}
            className={`btn-secondary text-xs h-9 px-4 inline-flex items-center cursor-pointer ${uploading ? "opacity-60 pointer-events-none" : ""}`}
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 mr-2" />
            )}
            {uploading ? "Uploading…" : "Change Photo"}
          </label>
        </div>
      </div>

      <div className="card p-8">
        <h2 className="text-lg font-bold text-text mb-6">Profile Details</h2>
        {!loaded ? (
          <div className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted" /></div>
        ) : (
          <form onSubmit={handleSubmit(onSave)} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="section-title">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
                  <input {...register("name")} className="input-base pl-10" />
                </div>
                {errors.name && <p className="text-[10px] text-danger font-mono">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="section-title">Email Address</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input value={session?.user?.email ?? ""} disabled className="input-base pl-10 cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="section-title">Company / Org</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input {...register("company")} placeholder="Neurlo Inc." className="input-base pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="section-title">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input {...register("jobTitle")} placeholder="Product Manager" className="input-base pl-10" />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="section-title">System Timezone</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <select {...register("timezone")} className="input-base pl-10 appearance-none">
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                    <option value="GMT">GMT (Greenwich Mean Time)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={isLoading} className="btn-primary px-8 h-12 shadow-xl shadow-accent/30">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Sync Changes</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PasswordTab({ onSave, isLoading }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });
  return (
    <div className="card p-8">
      <h2 className="text-lg font-bold text-text mb-2">Update Credentials</h2>
      <p className="text-sm text-muted font-mono mb-8">Rotating your password regularly helps maintain system integrity.</p>
      <form onSubmit={handleSubmit(onSave)} className="space-y-5 max-w-md">
        <div className="space-y-2">
          <label className="section-title">Current Password</label>
          <input type="password" {...register("currentPassword")} className="input-base" />
          {errors.currentPassword && <p className="text-[10px] text-danger font-mono">{errors.currentPassword.message as string}</p>}
        </div>
        <div className="space-y-2">
          <label className="section-title">New Password</label>
          <input type="password" {...register("newPassword")} className="input-base" />
          {errors.newPassword && <p className="text-[10px] text-danger font-mono">{errors.newPassword.message as string}</p>}
        </div>
        <div className="space-y-2">
          <label className="section-title">Confirm New Password</label>
          <input type="password" {...register("confirmPassword")} className="input-base" />
          {errors.confirmPassword && <p className="text-[10px] text-danger font-mono">{errors.confirmPassword.message as string}</p>}
        </div>
        <div className="pt-4">
          <button disabled={isLoading} className="btn-primary w-full h-12">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

function MFATab({ session, onUpdate }: any) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState<boolean>(!!session?.user?.mfaEnabled);
  const [phase, setPhase] = useState<"idle" | "setup" | "verifying" | "backup">("idle");
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataURL: string } | null>(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setEnabled(!!session?.user?.mfaEnabled); }, [session?.user?.mfaEnabled]);

  const startSetup = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/v1/mfa");
      const json = await res.json();
      if (!res.ok) { toast({ title: "Setup failed", description: json.error?.message, variant: "destructive" }); return; }
      setSetupData(json.data);
      setPhase("setup");
    } finally { setBusy(false); }
  };

  const confirmEnable = async () => {
    if (code.length !== 6) { toast({ title: "Enter the 6-digit code", variant: "destructive" }); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/v1/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, secret: setupData?.secret }),
      });
      const json = await res.json();
      if (!res.ok) { toast({ title: "Verification failed", description: json.error?.message, variant: "destructive" }); return; }
      setBackupCodes(json.data?.backupCodes ?? []);
      setPhase("backup");
      setEnabled(true);
      await onUpdate?.({ mfaEnabled: true });
    } finally { setBusy(false); }
  };

  const disable = async () => {
    const c = prompt("Enter your current 6-digit MFA code to disable:");
    if (!c) return;
    setBusy(true);
    try {
      const res = await fetch("/api/v1/mfa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const json = await res.json();
      if (!res.ok) { toast({ title: "Disable failed", description: json.error?.message, variant: "destructive" }); return; }
      toast({ title: "MFA disabled" });
      setEnabled(false);
      setPhase("idle");
      setSetupData(null);
      await onUpdate?.({ mfaEnabled: false });
    } finally { setBusy(false); }
  };

  const copyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast({ title: "Backup codes copied" });
  };

  if (enabled && phase !== "backup") {
    return (
      <div className="card p-8 text-center">
        <ShieldCheck className="w-10 h-10 text-success mx-auto mb-4" />
        <h3 className="text-lg font-bold text-text mb-2">Two-Factor Auth Enabled</h3>
        <p className="text-sm text-muted font-mono mb-6 max-w-sm mx-auto">
          Your account is protected by TOTP. You'll be prompted for a code at sign-in.
        </p>
        <button disabled={busy} onClick={disable} className="btn-secondary text-danger">
          <ShieldOff className="w-4 h-4 mr-2" /> Disable MFA
        </button>
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <div className="card p-8 text-center">
        <Shield className="w-10 h-10 text-accent/60 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-text mb-2">Two-Factor Authentication</h3>
        <p className="text-sm text-muted font-mono mb-6 max-w-sm mx-auto">
          Add a TOTP authenticator (Google Authenticator, 1Password, Authy) to require a 6-digit code at every sign-in.
        </p>
        <button disabled={busy} onClick={startSetup} className="btn-primary">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enable MFA"}
        </button>
      </div>
    );
  }

  if (phase === "setup" && setupData) {
    return (
      <div className="card p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-text mb-1">Scan the QR code</h3>
          <p className="text-sm text-muted font-mono">Open your authenticator app and scan, then enter the 6-digit code below.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <img src={setupData.qrCodeDataURL} alt="MFA QR" className="w-48 h-48 rounded-xl border border-border bg-white p-2" />
          <div className="flex-1 space-y-3 w-full">
            <div>
              <label className="section-title">Manual entry secret</label>
              <code className="block mt-1 p-3 bg-surface-2 rounded-lg text-xs font-mono break-all">{setupData.secret}</code>
            </div>
            <div>
              <label className="section-title">Verification code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="input-base mt-1 text-center text-xl tracking-[0.4em] font-mono"
                inputMode="numeric"
                maxLength={6}
              />
            </div>
            <button disabled={busy} onClick={confirmEnable} className="btn-primary w-full">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Enable"}
            </button>
            <button onClick={() => { setPhase("idle"); setSetupData(null); setCode(""); }} className="btn-secondary w-full">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "backup") {
    return (
      <div className="card p-8 space-y-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-success" />
          <div>
            <h3 className="text-lg font-bold text-text">MFA Enabled — Save Your Backup Codes</h3>
            <p className="text-xs text-muted font-mono">Each code works once. Store them somewhere safe — you won't see them again.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 bg-surface-2 p-4 rounded-lg">
          {backupCodes.map((c) => (
            <code key={c} className="font-mono text-sm text-text tracking-wider">{c}</code>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={copyCodes} className="btn-secondary flex-1">
            <Copy className="w-4 h-4 mr-2" /> Copy All
          </button>
          <button onClick={() => { setPhase("idle"); setBackupCodes([]); setSetupData(null); setCode(""); }} className="btn-primary flex-1">
            Done
          </button>
        </div>
      </div>
    );
  }

  return null;
}
