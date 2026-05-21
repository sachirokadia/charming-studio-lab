import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useRequireAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/stats")({ component: StatsPage });

function StatsPage() {
  const { user, loading } = useRequireAuth();
  const { data } = useQuery({
    queryKey: ["stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const since = new Date(); since.setMonth(since.getMonth() - 1);
      const [{ data: profile }, { data: leaderboard }, { data: badges }, { data: expenses }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("profiles").select("id, name, level, xp, streak").order("xp", { ascending: false }).limit(20),
        supabase.from("user_badges").select("id").eq("user_id", user!.id),
        supabase.from("expenses").select("amount, date").eq("user_id", user!.id).gte("date", since.toISOString()),
      ]);
      return { profile, leaderboard: leaderboard ?? [], badgeCount: badges?.length ?? 0, expenses: expenses ?? [] };
    },
  });

  if (loading || !user) return null;
  const p = data?.profile;

  // bucket by day
  const days: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days[d.toISOString().slice(5, 10)] = 0; }
  data?.expenses.forEach(e => { const k = new Date(e.date).toISOString().slice(5, 10); if (k in days) days[k] += Number(e.amount); });
  const chart = Object.entries(days).map(([day, value]) => ({ day, value }));

  return (
    <GameShell title="Stats & Leaderboard">
      <div className="glass-card grid grid-cols-2 gap-3 p-6 md:grid-cols-4">
        <Stat label="Level" value={p?.level ?? 1} color="text-primary" />
        <Stat label="Total XP" value={p?.xp ?? 0} color="text-secondary" />
        <Stat label="Streak" value={`${p?.streak ?? 0} 🔥`} color="text-tertiary" />
        <Stat label="Badges" value={data?.badgeCount ?? 0} color="text-primary" />
      </div>

      <div className="glass-card mt-5 p-6">
        <h2 className="font-display mb-4 text-lg font-bold">Monthly Spending</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4edea3" stopOpacity={0.7} /><stop offset="100%" stopColor="#4edea3" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#c7c4d7", fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
              <Tooltip contentStyle={{ background: "#171f33", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#4edea3" strokeWidth={2} fill="url(#area)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="font-display mt-6 mb-3 text-lg font-bold">Global Leaderboard</h2>
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_60px_80px_60px] gap-2 border-b border-outline-variant/30 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <span>#</span><span>Player</span><span>Lvl</span><span>XP</span><span>🔥</span>
        </div>
        {data?.leaderboard.map((row, i) => {
          const isMe = row.id === user.id;
          return (
            <div key={row.id} className={`grid grid-cols-[40px_1fr_60px_80px_60px] items-center gap-2 px-5 py-2.5 text-sm ${isMe ? "bg-primary/15 font-bold" : i % 2 ? "bg-surface-container-low/30" : ""}`}>
              <span className={`font-display ${i < 3 ? "text-tertiary" : "text-on-surface-variant"}`}>{i + 1}</span>
              <span className="truncate">{isMe ? "YOU" : row.name}</span>
              <span>{row.level}</span>
              <span className="text-secondary">{row.xp}</span>
              <span className="text-tertiary">{row.streak}</span>
            </div>
          );
        })}
      </div>
    </GameShell>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className={`font-display text-2xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}
