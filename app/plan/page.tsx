import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/demo";
import Card from "../ui/Card";
import AddIndicatorForm from "./ui/AddIndicatorForm";
import IndicatorEditForm from "./ui/IndicatorEditForm";
import { deleteIndicator } from "../actions";

function getYearFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const raw = searchParams.year;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = value ? Number(value) : NaN;
  const year = Number.isFinite(parsed) ? parsed : new Date().getFullYear();
  return Math.max(2000, Math.min(2100, Math.trunc(year)));
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const year = getYearFromSearchParams(searchParams);

  const yearPlan = await prisma.yearPlan.findUnique({
    where: { userId_year: { userId: DEMO_USER_ID, year } },
    include: { indicators: { orderBy: { createdAt: "desc" }, include: { quarterEntries: true } } },
  });

  const indicators = yearPlan?.indicators ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Annual Plan</h1>
        <p className="text-slate-700">Add indicators for {year}. Quarterly records (Q1–Q4) are created automatically.</p>
      </div>

      <Card title="Add indicator">
        <AddIndicatorForm year={year} />
      </Card>

      <Card title={`Indicators (${indicators.length})`}>
        {indicators.length === 0 ? (
          <p className="text-sm text-slate-700">No indicators yet. Add your first indicator above.</p>
        ) : (
          <div className="space-y-3">
            {indicators.map((indicator) => (
              <details key={indicator.id} className="rounded-lg border border-slate-200 p-3">
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold">{indicator.indicatorName}</div>
                      <div className="text-sm text-slate-700">
                        {indicator.objectiveTitle} • Annual target: {indicator.annualTarget} {indicator.unit}
                      </div>
                    </div>
                    <form action={deleteIndicator}>
                      <input type="hidden" name="id" value={indicator.id} />
                      <button
                        type="submit"
                        className="mt-2 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 sm:mt-0"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </summary>
                <div className="mt-4">
                  <IndicatorEditForm year={year} indicator={indicator} />
                </div>
              </details>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

