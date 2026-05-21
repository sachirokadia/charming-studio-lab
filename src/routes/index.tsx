import { createFileRoute, Link } from "@tanstack/react-router";
import { MIcon } from "@/components/GameShell";
import { ProgressBar } from "@/components/ProgressBar";

export const Route = createFileRoute("/")({ component: Landing });

const features = [
  { icon: "🧠", title: "Smart Insights", text: "AI-powered spending analysis spots your Boss Fights — those budget overage moments — before they hit.", pct: 78 },
  { icon: "🏆", title: "Achievement Badges", text: "200+ collectible badges. From Ramen Warrior to Wealth Wizard, prove your money mastery.", pct: 56 },
  { icon: "⚔️", title: "Social Challenges", text: "Co-op savings goals and seasonal raids with friends. Climb the leaderboard.", pct: 91 },
];

const reviews = [
  { rating: 5, quote: "I've saved $3k since I started. It actually feels like leveling up an RPG character.", name: "Maya R.", level: "LVL 42", tier: "Shadow Assassin Tier" },
  { rating: 5, quote: "Finally a budget app that doesn't feel like homework. The streak mechanic is addictive.", name: "Devon K.", level: "LVL 28", tier: "Mystic Wanderer" },
  { rating: 5, quote: "My friends and I do weekly raids. Saving money has become our group chat hobby.", name: "Priya S.", level: "LVL 51", tier: "Wealth Wizard" },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="hero-gradient absolute inset-0 -z-10" />
      {/* Nav */}
      <nav className="sticky top-0 z-30 mx-auto mt-3 max-w-6xl px-4">
        <div className="glass-card flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <MIcon name="account_balance_wallet" className="text-primary text-3xl" />
            <span className="font-display text-xl font-extrabold tracking-tight">FinGame</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-semibold text-on-surface-variant md:flex">
            <a href="#features" className="hover:text-primary">The Quest</a>
            <a href="#leaderboard" className="hover:text-primary">Leaderboard</a>
            <span className="flex items-center gap-1 rounded-full bg-tertiary/15 px-3 py-1 text-tertiary"><span className="streak-pulse">🔥</span> 12 day streak</span>
          </div>
          <Link to="/register" className="btn-grad rounded-full px-4 py-2 text-sm">Start Quest</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-24 text-center md:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-secondary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" /> New Season Live
        </span>
        <h1 className="font-display mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
          Master Your Money. <br/>
          <span className="bg-gradient-to-r from-primary-container to-secondary bg-clip-text text-transparent">Level Up Your Life.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-on-surface-variant md:text-lg">
          FinGame turns saving money into an RPG quest. Track expenses, complete missions, earn XP, and dominate your friends on the leaderboard.
        </p>
        <div className="mt-9 flex justify-center">
          <Link to="/register" className="btn-grad animate-pulse-glow inline-flex items-center gap-2 rounded-full px-8 py-4 text-base">
            Start Your Quest <span>→</span>
          </Link>
        </div>

        {/* Hero illustration */}
        <div className="float-anim mx-auto mt-14 max-w-md">
          <div className="glass-card relative p-6 glow-indigo">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant">Daily Energy</p>
                <p className="font-display text-3xl font-bold text-secondary">$142.50</p>
              </div>
              <div className="hex flex h-16 w-16 items-center justify-center bg-gradient-to-br from-primary-container to-secondary text-on-primary">
                <span className="font-display text-xl font-extrabold">14</span>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={68} />
              <p className="mt-2 text-left text-xs text-on-surface-variant">"You saved 5% more than last Tuesday! 🚀"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="font-display text-center text-3xl font-bold md:text-4xl">Choose Your Class. <span className="text-primary">Grind Your Goals.</span></h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map(f => (
            <div key={f.title} className="glass-card p-6 transition hover:-translate-y-1 hover:glow-indigo">
              <div className="text-4xl">{f.icon}</div>
              <h3 className="font-display mt-4 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-on-surface-variant">{f.text}</p>
              <div className="mt-5"><ProgressBar value={f.pct} /></div>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-secondary">{f.pct}% Mastery</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="leaderboard" className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="font-display text-center text-3xl font-bold md:text-4xl">Heroes of the <span className="text-secondary">Leaderboard</span></h2>
        <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
          {reviews.map(r => (
            <div key={r.name} className="glass-card w-[85%] flex-shrink-0 snap-center p-6 md:w-auto">
              <div className="flex items-center gap-1 text-tertiary">{"★".repeat(r.rating)}</div>
              <p className="mt-3 text-sm">"{r.quote}"</p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="font-bold">{r.name}</p>
                  <p className="text-xs text-on-surface-variant">{r.tier}</p>
                </div>
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">{r.level}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/30 py-10 text-center text-sm text-on-surface-variant">
        <p className="font-display text-lg font-bold text-on-surface">FinGame</p>
        <p className="mt-1">Money should feel like a game. Now it does.</p>
      </footer>
    </div>
  );
}
