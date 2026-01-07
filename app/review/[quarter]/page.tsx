import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/demo";
import Card from "@/app/ui/Card";
import { quarterFromRoute, type QuarterRoute } from "@/lib/quarters";
import QuarterEntryCard from "./ui/QuarterEntryCard";

function getYearFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const raw = searchParams.year;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = value ? Number(value) : NaN;
  const year = Number.isFinite(parsed) ? parsed : new Date().getFullYear();
  return Math.max(2000, Math.min(2100, Math.trunc(year)));
}

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: { quarter: QuarterRoute };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const year = getYearFromSearchParams(searchParams);
  const quarter = quarterFromRoute(params.quarter);
  if (!quarter) return notFound();

  const yearPlan = await prisma.yearPlan.findUnique({
    where: { userId_year: { userId: DEMO_USER_ID, year } },
    include: {
      indicators: {
        orderBy: { createdAt: "desc" },
        include: { quarterEntries: { where: { quarter } } },
      },
    },
  });

  const indicators = yearPlan?.indicators ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Quarterly Review: {params.quarter.toUpperCase()}
        </h1>
        <p className="text-slate-700">Enter actuals and comments for {year}. Progress and variance update as you type.</p>
      </div>

      {!yearPlan || indicators.length === 0 ? (
        <Card title="No indicators yet">
          <p className="text-sm text-slate-700">Create your Annual Plan first, then come back to enter quarterly results.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {indicators.map((indicator) => {
            const entry = indicator.quarterEntries[0] ?? null;
            return (
              <QuarterEntryCard
                key={indicator.id}
                quarter={quarter}
                indicator={{
                  id: indicator.id,
                  objectiveTitle: indicator.objectiveTitle,
                  indicatorName: indicator.indicatorName,
                  unit: indicator.unit,
                  quarterlyTarget: entry?.quarterlyTarget ?? 0,
                  actualAchieved: entry?.actualAchieved ?? null,
                  comments: entry?.comments ?? "",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
