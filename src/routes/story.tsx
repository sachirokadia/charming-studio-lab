import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { ProgressBar } from "@/components/ProgressBar";
import { useRequireAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

export const Route = createFileRoute("/story")({ component: StoryPage });

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StoryPage() {
  const { user, loading } = useRequireAuth();
  const { data } = useQuery({
    queryKey: ["story", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 7);
      const { data: expenses } = await supabase.from("expenses").select("*").eq("user_id", user!.id).gte("date", since.toISOString());
      return expenses ?? [];
    },
  });

  if (loading || !user) return null;
  const expenses = data ?? [];

  // Weekly buckets
  const buckets = DAYS.map((d, i) => ({ day: d, value: 0, idx: i }));
  let total = 0;
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    const dt = new Date(e.date);
    const idx = dt.getDay();
    const amt = Number(e.amount);
    buckets[idx].value += amt;
    total += amt;
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + amt;
  });
  const peak = buckets.reduce((a, b) => b.value > a.value ? b : a, buckets[0]);
  const topCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <GameShell title="Your Week in Numbers">
      <div className="glass-card p-6">
        <span className="rounded-full bg-tertiary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-tertiary">Legendary Questing</span>
        <p className="mt-4 text-xs uppercase tracking-widest text-on-surface-variant">Total Mana Spent</p>
        <p className="font-display text-5xl font-extrabold">${total.toFixed(2)}</p>
        <p className="mt-1 text-sm text-secondary">+12% vs Last Week</p>
      </div>

      <div className="glass-card mt-5 p-6">
        <h2 className="font-display mb-3 text-lg font-bold">Spending Intensity</h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets}>
              <defs>
                <linearGradient id="g-good" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8083ff" /><stop offset="100%" stopColor="#4edea3" /></linearGradient>
                <linearGradient id="g-bad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffb95f" /><stop offset="100%" stopColor="#ffb4ab" /></linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(192,193,255,0.08)" }} contentStyle={{ background: "#171f33", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {buckets.map((b, i) => <Cell key={i} fill={b.idx === peak.idx && peak.value > 0 ? "url(#g-bad)" : "url(#g-good)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card mt-5 p-6">
        <h2 className="font-display mb-4 text-lg font-bold">Top Power-Ups</h2>
        {topCategories.length === 0 && <p className="text-sm text-on-surface-variant">No deeds this week.</p>}
        <div className="grid gap-3">
          {topCategories.map(([cat, val]) => {
            const pct = Math.round((val / Math.max(total, 1)) * 100);
            return (
              <div key={cat}>
                <div className="mb-1 flex justify-between text-sm font-semibold"><span>{cat}</span><span className="text-secondary">{pct}%</span></div>
                <ProgressBar value={pct} variant="indigo" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card mt-5 p-6 glow-teal">
        <p className="text-xs uppercase tracking-widest text-secondary">🏆 Achievement Unlocked</p>
        <p className="font-display mt-1 text-lg font-bold">Budget Boss</p>
        <p className="text-sm text-on-surface-variant">Under limit for 7 consecutive days!</p>
        <p className="mt-2 text-sm font-bold text-secondary">+500 XP GAINED</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button className="btn-grad rounded-full px-4 py-3 text-sm">Flex Your Stats</button>
        <button className="rounded-full border border-outline-variant px-4 py-3 text-sm font-bold">Download Story</button>
      </div>
    </GameShell>
  );
}
