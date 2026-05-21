import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MIcon } from "@/components/GameShell";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back, adventurer!");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout title="Resume Your Quest" subtitle="Welcome back. The grind continues.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        <button disabled={busy} className="btn-grad w-full rounded-full px-5 py-3 disabled:opacity-60">
          {busy ? "Logging in…" : "Continue Quest →"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-on-surface-variant">
        New here? <Link to="/register" className="font-bold text-primary">Create your character</Link>
      </p>
    </AuthLayout>
  );
}

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-10">
      <div className="hero-gradient absolute inset-0 -z-10" />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <MIcon name="account_balance_wallet" className="text-primary text-3xl" />
          <span className="font-display text-2xl font-extrabold">FinGame</span>
        </Link>
        <div className="glass-card p-8 glow-indigo">
          <h1 className="font-display text-center text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-center text-sm text-on-surface-variant">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, type = "text", value, onChange, required }: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
      <input type={type} value={value} required={required} onChange={e => onChange(e.target.value)}
        className="sunken-input w-full px-4 py-3 text-base" />
    </label>
  );
}
