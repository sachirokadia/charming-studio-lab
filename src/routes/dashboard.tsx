import { createFileRoute, Link } from "@tanstack/react-router";
import { GameShell, MIcon } from "@/components/GameShell";
import { ProgressBar } from "@/components/ProgressBar";
import { useRequireAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const CATEGORY_EMOJI: Record<string, string> = {
  Food: "🍔", Coffee: "☕", Transport: "🚗", Shopping: "🛍️", Utilities: "⚡", Gaming: "🎮", Other: "💸",
};

function Dashboard() {
  const { user, loading } = useRequireAuth();

  const { data } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: profile }, { data: expenses }, { data: userQuests }, { data: quests }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("expenses").select("*").eq("user_id", user!.id).order("date", { ascending: false }).limit(8),
        supabase.from("user_quests").select("*").eq("user_id", user!.id),
        supabase.from("quests").select("*"),
      ]);
      return { profile, expenses: expenses ?? [], userQuests: userQuests ?? [], quests: quests ?? [] };
    },
  });

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center text-on-surface-variant">Loading your quest…</div>;

  const profile = data?.profile;
  const today = new Date().toDateString();
  const spentToday = (data?.expenses ?? []).filter(e => new Date(e.date).toDateString() === today).reduce((s, e) => s + Number(e.amount), 0);
  const budget = Number(profile?.daily_budget ?? 200);
  const remaining = budget - spentToday;

  const activeQuests = (data?.quests ?? []).slice(0, 2).map(q => {
    const uq = data?.userQuests.find(u => u.quest_id === q.id);
    return { ...q, progress: Number(uq?.progress ?? 0), completed: uq?.completed ?? false };
  });

  return (
    <GameShell>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Welcome back</p>
          <h1 className="font-display text-2xl font-bold">Hey, {profile?.name ?? "Hero"} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-tertiary/15 px-3 py-1.5 text-sm font-bold text-tertiary"><span className="streak-pulse">🔥</span> {profile?.streak ?? 0}</span>
          <span className="rounded-full bg-primary/20 px-3 py-1.5 text-sm font-bold text-primary">LVL {profile?.level ?? 1}</span>
        </div>
      </div>

      {/* Daily Energy */}
      <div className="glass-card mt-5 p-6 glow-indigo">
        <p className="text-xs uppercase tracking-widest text-on-surface-variant">Daily Energy</p>
        <p className={`font-display mt-1 text-4xl font-extrabold md:text-5xl ${remaining < 0 ? "text-error" : "text-secondary"}`}>
          ${remaining.toFixed(2)}
        </p>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Remaining today</p>
        <div className="mt-3"><ProgressBar value={Math.min(spentToday, budget)} max={budget} variant={remaining < 0 ? "warn" : "teal"} /></div>
        <div className="mt-4 rounded-2xl bg-surface-container-high/60 p-3">
          <p className="text-sm">🤖 <span className="font-bold text-primary">Fin says:</span> {remaining > 0 ? `You've got $${remaining.toFixed(0)} of mana left. Spend wisely, hero!` : `Boss Fight! You're over budget by $${Math.abs(remaining).toFixed(0)}.`}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link to="/add" className="btn-grad flex items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm">+ Add Expense</Link>
          <button className="flex items-center justify-center gap-1.5 rounded-full border border-outline-variant px-4 py-3 text-sm font-bold text-on-surface">
            <MIcon name="document_scanner" /> Scan Receipt
          </button>
        </div>
      </div>

      {/* Quest Log */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Quest Log</h2>
        <Link to="/quests" className="text-xs font-bold uppercase tracking-widest text-primary">View all →</Link>
      </div>
      <div className="mt-3 grid gap-3">
        {activeQuests.map(q => {
          const pct = Math.round((q.progress / Number(q.target_value)) * 100);
          return (
            <div key={q.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-bold">{q.icon} {q.name}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">{q.description}</p>
                </div>
                <span className="rounded-full bg-secondary/20 px-2.5 py-1 text-xs font-bold text-secondary">+{q.xp_reward} XP</span>
              </div>
              <div className="mt-4"><ProgressBar value={q.progress} max={Number(q.target_value)} /></div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">{q.progress} / {q.target_value}</span>
                <span className="font-bold text-secondary">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Deeds */}
      <h2 className="font-display mt-7 text-lg font-bold">Recent Deeds</h2>
      <div className="mt-3 grid gap-2">
        {(data?.expenses ?? []).length === 0 && (
          <div className="glass-card p-6 text-center text-sm text-on-surface-variant">No deeds yet. Log your first expense to earn XP! ⚡</div>
        )}
        {data?.expenses.map(e => (
          <div key={e.id} className="glass-card flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-xl">{CATEGORY_EMOJI[e.category] ?? "💸"}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{e.note || `${e.category} Deed`}</p>
              <p className="text-xs text-on-surface-variant">{e.category} · {new Date(e.date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-error">-${Number(e.amount).toFixed(2)}</p>
              <span className="inline-block rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold uppercase text-secondary">+{e.xp_awarded} XP</span>
            </div>
          </div>
        ))}
      </div>
    </GameShell>
  );
}
