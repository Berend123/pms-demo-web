import Card from "@/app/ui/Card";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/demo";
import type { Quarter } from "@/lib/quarters";
import { formatPct, safePct, safeVariancePct, statusFromAnnualProgressPct } from "@/lib/calc";
import ReportActions from "./ui/ReportActions";
import { ensureDbReady } from "@/lib/dbReady";

function getYearFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const raw = searchParams.year;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = value ? Number(value) : NaN;
  const year = Number.isFinite(parsed) ? parsed : new Date().getFullYear();
  return Math.max(2000, Math.min(2100, Math.trunc(year)));
}

function getQuarterActual(entries: { quarter: string; actualAchieved: number | null }[], quarter: Quarter) {
  return entries.find((e) => e.quarter === quarter)?.actualAchieved ?? null;
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const year = getYearFromSearchParams(searchParams);

  await ensureDbReady(prisma);

  const yearPlan = await prisma.yearPlan.findUnique({
    where: { userId_year: { userId: DEMO_USER_ID, year } },
    include: { indicators: { orderBy: { createdAt: "desc" }, include: { quarterEntries: true } } },
  });

  const indicators = yearPlan?.indicators ?? [];

  const rows = indicators.map((indicator) => {
    const qt = indicator.quarterEntries.find((q) => q.quarter === "Q1")?.quarterlyTarget ?? indicator.annualTarget / 4;
    const q1 = getQuarterActual(indicator.quarterEntries, "Q1");
    const q2 = getQuarterActual(indicator.quarterEntries, "Q2");
    const q3 = getQuarterActual(indicator.quarterEntries, "Q3");
    const q4 = getQuarterActual(indicator.quarterEntries, "Q4");
    const totalActual = (q1 ?? 0) + (q2 ?? 0) + (q3 ?? 0) + (q4 ?? 0);
    const annualProgressPct = safePct(totalActual, indicator.annualTarget);
    const annualVariancePct = safeVariancePct(totalActual, indicator.annualTarget);
    const status = statusFromAnnualProgressPct(annualProgressPct);
    return {
      objectiveTitle: indicator.objectiveTitle,
      indicatorName: indicator.indicatorName,
      unit: indicator.unit,
      annualTarget: indicator.annualTarget,
      quarterlyTarget: qt,
      q1,
      q2,
      q3,
      q4,
      totalActual,
      annualProgressPct,
      annualVariancePct,
      status,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Annual Report</h1>
          <p className="text-slate-700">Summary for {year}. Read-only results.</p>
        </div>
        <ReportActions year={year} rows={rows} />
      </div>

      {!yearPlan || rows.length === 0 ? (
        <Card title="No data yet">
          <p className="text-sm text-slate-700">Create your Annual Plan and enter at least one quarterly review.</p>
        </Card>
      ) : (
        <Card title="Summary">
          <div className="overflow-auto">
            <table className="w-full min-w-[1000px] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-slate-700">
                  <th className="py-2 pr-3">Indicator</th>
                  <th className="py-2 pr-3">Annual target</th>
                  <th className="py-2 pr-3">Quarterly target</th>
                  <th className="py-2 pr-3">Q1 actual</th>
                  <th className="py-2 pr-3">Q2 actual</th>
                  <th className="py-2 pr-3">Q3 actual</th>
                  <th className="py-2 pr-3">Q4 actual</th>
                  <th className="py-2 pr-3">Total actual</th>
                  <th className="py-2 pr-3">Progress</th>
                  <th className="py-2 pr-3">Variance</th>
                  <th className="py-2 pr-0">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.indicatorName} className="border-b last:border-b-0">
                    <td className="py-2 pr-3">
                      <div className="font-medium">{r.indicatorName}</div>
                      <div className="text-xs text-slate-600">{r.objectiveTitle}</div>
                    </td>
                    <td className="py-2 pr-3">
                      {r.annualTarget} {r.unit}
                    </td>
                    <td className="py-2 pr-3">
                      {Number.isFinite(r.quarterlyTarget) ? r.quarterlyTarget.toFixed(2) : "—"} {r.unit}
                    </td>
                    <td className="py-2 pr-3">{r.q1 ?? "—"}</td>
                    <td className="py-2 pr-3">{r.q2 ?? "—"}</td>
                    <td className="py-2 pr-3">{r.q3 ?? "—"}</td>
                    <td className="py-2 pr-3">{r.q4 ?? "—"}</td>
                    <td className="py-2 pr-3">{r.totalActual}</td>
                    <td className="py-2 pr-3">{formatPct(r.annualProgressPct)}</td>
                    <td className="py-2 pr-3">
                      <span className={r.annualVariancePct !== null && r.annualVariancePct < 0 ? "text-red-700" : ""}>
                        {formatPct(r.annualVariancePct)}
                      </span>
                    </td>
                    <td className="py-2 pr-0">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          r.status.tone === "good"
                            ? "bg-emerald-50 text-emerald-700"
                            : r.status.tone === "warn"
                              ? "bg-amber-50 text-amber-800"
                              : r.status.tone === "bad"
                                ? "bg-red-50 text-red-700"
                                : "bg-slate-100 text-slate-700",
                        ].join(" ")}
                      >
                        {r.status.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
