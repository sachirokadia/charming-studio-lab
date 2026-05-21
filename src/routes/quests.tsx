import { createFileRoute } from "@tanstack/react-router";
import { GameShell, MIcon } from "@/components/GameShell";
import { ProgressBar } from "@/components/ProgressBar";
import { useRequireAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/quests")({ component: QuestsPage });

const TABS = ["Journey", "Quests", "Badges", "Friends"] as const;

function QuestsPage() {
  const { user, loading } = useRequireAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Quests");

  const { data } = useQuery({
    queryKey: ["quests-page", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: profile }, { data: quests }, { data: uQuests }, { data: badges }, { data: uBadges }, { data: leaderboard }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("quests").select("*"),
        supabase.from("user_quests").select("*").eq("user_id", user!.id),
        supabase.from("badges").select("*"),
        supabase.from("user_badges").select("badge_id").eq("user_id", user!.id),
        supabase.from("profiles").select("id, name, xp, level").order("xp", { ascending: false }).limit(10),
      ]);
      return { profile, quests: quests ?? [], uQuests: uQuests ?? [], badges: badges ?? [], earnedBadges: new Set((uBadges ?? []).map(b => b.badge_id)), leaderboard: leaderboard ?? [] };
    },
  });

  if (loading || !user) return null;

  const level = data?.profile?.level ?? 1;
  const milestones = [10, 14, 15, 20, 25];

  return (
    <GameShell title="Your Quests">
      <div className="glass-card mb-5 flex p-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${tab === t ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Journey" && (
        <div className="glass-card p-6">
          <h2 className="font-display mb-5 text-lg font-bold">Level Map</h2>
          <div className="flex flex-col gap-3">
            {milestones.map((m, i) => {
              const done = level > m;
              const current = level === m || (i === 0 && level < m);
              const here = level >= m && (milestones[i + 1] ?? Infinity) > level;
              return (
                <div key={m} className="flex items-center gap-3">
                  <div className={`hex flex h-14 w-14 items-center justify-center font-display text-base font-extrabold ${done ? "bg-gradient-to-br from-secondary to-secondary-container text-on-secondary" : here ? "bg-gradient-to-br from-primary-container to-primary text-on-primary glow-indigo" : "bg-surface-container-high text-on-surface-variant"}`}>
                    {done ? "✓" : m}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">Level {m}</p>
                    <p className="text-xs text-on-surface-variant">{done ? "Completed" : here ? "YOU ARE HERE" : current ? "In Progress" : m >= 20 ? "🔒 Mystery Reward" : "🔒 Locked"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "Quests" && (
        <div className="grid gap-3">
          {data?.quests.map(q => {
            const uq = data.uQuests.find(u => u.quest_id === q.id);
            const progress = Number(uq?.progress ?? 0);
            const pct = Math.round((progress / Number(q.target_value)) * 100);
            return (
              <div key={q.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-bold">{q.icon} {q.name}</p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">{q.description}</p>
                  </div>
                  <span className="rounded-full bg-secondary/20 px-2.5 py-1 text-xs font-bold text-secondary">+{q.xp_reward} XP</span>
                </div>
                <div className="mt-4"><ProgressBar value={progress} max={Number(q.target_value)} /></div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">{progress} / {q.target_value}</span>
                  <span className="font-bold text-secondary">{pct >= 80 ? "Almost there!" : pct >= 40 ? "Keep grinding!" : "Just starting"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "Badges" && (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
          {data?.badges.map(b => {
            const earned = data.earnedBadges.has(b.id);
            return (
              <div key={b.id} className="glass-card flex flex-col items-center p-4 text-center">
                <div className={`hex flex h-16 w-16 items-center justify-center text-2xl ${earned ? "bg-gradient-to-br from-tertiary-container to-tertiary text-on-tertiary glow-teal" : "bg-surface-container-high text-on-surface-variant opacity-50 grayscale"}`}>
                  {b.icon.length <= 3 ? b.icon : <MIcon name={b.icon} className="text-2xl" />}
                </div>
                <p className="mt-2 text-xs font-bold">{b.name}</p>
                <p className="text-[10px] text-on-surface-variant">{earned ? "EARNED" : "🔒 Locked"}</p>
              </div>
            );
          })}
        </div>
      )}

      {tab === "Friends" && (
        <div className="glass-card overflow-hidden">
          {data?.leaderboard.map((p, i) => {
            const isMe = p.id === user.id;
            return (
              <div key={p.id} className={`flex items-center gap-3 px-5 py-3 ${isMe ? "bg-primary/15" : i % 2 ? "bg-surface-container-low/30" : ""}`}>
                <span className={`font-display w-7 text-lg font-bold ${i < 3 ? "text-tertiary" : "text-on-surface-variant"}`}>{i + 1}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-bold text-on-primary">{p.name?.[0]?.toUpperCase() ?? "?"}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{isMe ? "YOU" : p.name}</p>
                  <p className="text-xs text-on-surface-variant">LVL {p.level}</p>
                </div>
                <span className="font-display font-bold text-secondary">{p.xp} XP</span>
              </div>
            );
          })}
        </div>
      )}
    </GameShell>
  );
}
