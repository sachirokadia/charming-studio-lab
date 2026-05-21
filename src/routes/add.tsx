import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useRequireAuth } from "@/lib/auth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/add")({ component: AddExpense });

const CATEGORIES = [
  { key: "Food", emoji: "🍔" },
  { key: "Coffee", emoji: "☕" },
  { key: "Transport", emoji: "🚗" },
  { key: "Shopping", emoji: "🛍️" },
  { key: "Utilities", emoji: "⚡" },
  { key: "Gaming", emoji: "🎮" },
  { key: "Other", emoji: "💸" },
];

function AddExpense() {
  const { user, loading } = useRequireAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  if (loading || !user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    setBusy(true);
    const xp = 2 + (category === "Food" ? 3 : category === "Gaming" ? 1 : 2);

    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      amount: amt,
      category,
      note: note || null,
      date: new Date(date).toISOString(),
      xp_awarded: xp,
    });

    if (error) { setBusy(false); return toast.error(error.message); }

    // Update profile XP + streak + level
    const { data: profile } = await supabase.from("profiles").select("xp, level, streak, last_expense_date").eq("id", user.id).maybeSingle();
    if (profile) {
      const newXp = (profile.xp ?? 0) + xp;
      const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);
      const today = new Date().toISOString().slice(0, 10);
      const last = profile.last_expense_date;
      let streak = profile.streak ?? 0;
      if (last !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        streak = last === yesterday ? streak + 1 : 1;
      }
      await supabase.from("profiles").update({ xp: newXp, level: newLevel, streak, last_expense_date: today }).eq("id", user.id);
      if (newLevel > (profile.level ?? 1)) toast.success(`🎉 LEVEL UP! You're now LVL ${newLevel}`);
    }

    toast.success(`+${xp} XP ⚡`);
    setBusy(false);
    navigate({ to: "/dashboard" });
  };

  return (
    <GameShell title="Log a New Deed">
      <form onSubmit={submit} className="glass-card p-6">
        <p className="text-center text-xs uppercase tracking-widest text-on-surface-variant">Amount</p>
        <div className="mt-2 flex items-center justify-center gap-1">
          <span className="font-display text-3xl font-bold text-on-surface-variant">$</span>
          <input
            type="number" step="0.01" inputMode="decimal" autoFocus
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="font-display w-44 bg-transparent text-center text-5xl font-extrabold text-secondary outline-none"
          />
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Category</p>
        <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button type="button" key={c.key} onClick={() => setCategory(c.key)}
              className={`flex-shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${category === c.key ? "border-primary bg-primary/20 text-primary glow-indigo" : "border-outline-variant text-on-surface-variant"}`}>
              {c.emoji} {c.key}
            </button>
          ))}
        </div>

        <label className="mt-6 block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Note (optional)</span>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Burger Quest" className="sunken-input w-full px-4 py-3" />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Date</span>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="sunken-input w-full px-4 py-3" />
        </label>

        <button disabled={busy} className="btn-grad mt-6 w-full rounded-full px-5 py-3.5 disabled:opacity-60">
          {busy ? "Logging…" : "Log Deed →"}
        </button>
      </form>
    </GameShell>
  );
}
