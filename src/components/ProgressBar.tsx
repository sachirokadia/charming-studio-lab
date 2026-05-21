export function ProgressBar({ value, max = 100, variant = "teal" }: { value: number; max?: number; variant?: "teal" | "indigo" | "warn" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill =
    variant === "indigo" ? "linear-gradient(90deg, #8083ff, #c0c1ff)"
    : variant === "warn" ? "linear-gradient(90deg, #ffb95f, #ffb4ab)"
    : "linear-gradient(90deg, #00a572, #4edea3)";
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container-high">
      <div className="progress-sparkle h-full rounded-full" style={{ width: `${pct}%`, background: fill }} />
    </div>
  );
}
