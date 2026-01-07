export function safePct(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;
  if (denominator === 0) return null;
  return (numerator / denominator) * 100;
}

export function safeVariancePct(actual: number, target: number): number | null {
  if (!Number.isFinite(actual) || !Number.isFinite(target)) return null;
  if (target === 0) return null;
  return ((actual - target) / target) * 100;
}

export function formatPct(value: number | null) {
  if (value === null) return "—";
  return `${value.toFixed(1)}%`;
}

export function statusFromAnnualProgressPct(progressPct: number | null) {
  if (progressPct === null) return { label: "—", tone: "neutral" as const };
  if (progressPct >= 90) return { label: "On track", tone: "good" as const };
  if (progressPct >= 70) return { label: "At risk", tone: "warn" as const };
  return { label: "Behind", tone: "bad" as const };
}

