import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, Field } from "./login";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords don't match");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name }, emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Character created! +50 XP ⚡");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout title="Forge Your Hero" subtitle="Start your gamified money journey.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Hero Name" value={name} onChange={setName} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} required />
        <button disabled={busy} className="btn-grad w-full rounded-full px-5 py-3 disabled:opacity-60">
          {busy ? "Forging…" : "Begin Quest →"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-on-surface-variant">
        Already a hero? <Link to="/login" className="font-bold text-primary">Resume quest</Link>
      </p>
    </AuthLayout>
  );
}
