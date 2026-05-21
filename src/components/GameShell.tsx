import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/dashboard", icon: "grid_view", label: "Hub" },
  { to: "/quests", icon: "military_tech", label: "Quests" },
  { to: "/add", icon: "add", label: "Add", primary: true },
  { to: "/story", icon: "auto_stories", label: "Story" },
  { to: "/stats", icon: "leaderboard", label: "Stats" },
] as const;

function MIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: "'wght' 500" }}>{name}</span>;
}

export function GameShell({ children, title }: { children: ReactNode; title?: string }) {
  const path = useRouterState({ select: s => s.location.pathname });
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-screen pb-28 md:pb-8 md:pl-64">
      {/* desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col gap-2 border-r border-outline-variant/40 bg-surface-container-low/60 p-5 backdrop-blur">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
          <MIcon name="account_balance_wallet" className="text-primary text-3xl" />
          <span className="font-display text-2xl font-bold tracking-tight">FinGame</span>
        </Link>
        {navItems.filter(i => !i.primary).map(i => {
          const active = path === i.to;
          return (
            <Link key={i.to} to={i.to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-primary/15 text-primary" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
              <MIcon name={i.icon} />{i.label}
            </Link>
          );
        })}
        <Link to="/add" className="btn-grad mt-2 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm">
          <MIcon name="add" /> Log Deed
        </Link>
        <button onClick={logout} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high">
          <MIcon name="logout" /> Sign out
        </button>
      </aside>

      {/* page */}
      <div className="mx-auto max-w-3xl px-5 pt-6 md:pt-10">
        {title && <h1 className="font-display text-2xl md:text-3xl font-bold mb-5">{title}</h1>}
        {children}
      </div>

      {/* mobile bottom nav */}
      <nav className="fixed bottom-3 left-3 right-3 z-40 md:hidden">
        <div className="glass-card flex items-center justify-around px-2 py-2">
          {navItems.map(item => {
            if (item.primary) {
              return (
                <Link key={item.to} to={item.to} className="btn-grad -mt-8 flex h-14 w-14 items-center justify-center rounded-full shadow-lg glow-teal">
                  <MIcon name={item.icon} className="text-2xl" />
                </Link>
              );
            }
            const active = path === item.to;
            return (
              <Link key={item.to} to={item.to} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${active ? "text-primary" : "text-on-surface-variant"}`}>
                <MIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export { MIcon };
