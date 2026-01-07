import Link from "next/link";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID, DEMO_USER_NAME } from "@/lib/demo";
import { quarterEndDate, quarterOrder } from "@/lib/quarters";
import type { Quarter } from "@/lib/quarters";

function getYearFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const raw = searchParams.year;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = value ? Number(value) : NaN;
  const year = Number.isFinite(parsed) ? parsed : new Date().getFullYear();
  return Math.max(2000, Math.min(2100, Math.trunc(year)));
}

function nextIncompleteQuarter(completed: Quarter | null) {
  if (!completed) return "q1";
  if (completed === "Q1") return "q2";
  if (completed === "Q2") return "q3";
  if (completed === "Q3") return "q4";
  return "q4";
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const year = getYearFromSearchParams(searchParams);
  const now = new Date();

  const yearPlan = await prisma.yearPlan.findUnique({
    where: { userId_year: { userId: DEMO_USER_ID, year } },
    include: { indicators: { include: { quarterEntries: true } } },
  });

  const indicators = yearPlan?.indicators ?? [];
  const indicatorsCount = indicators.length;
  const planStarted = indicatorsCount > 0;

  const quarterCompletion = new Map<Quarter, boolean>();
  for (const q of quarterOrder) {
    const allEntries = indicators.flatMap((i) => i.quarterEntries.filter((e) => e.quarter === q));
    quarterCompletion.set(q, allEntries.length > 0 && allEntries.every((e) => e.actualAchieved !== null));
  }

  let latestCompleted: Quarter | null = null;
  for (const q of quarterOrder) {
    if (quarterCompletion.get(q)) latestCompleted = q;
  }

  const overdue = year === now.getFullYear()
    ? quarterOrder.some((q) => now > quarterEndDate(year, q) && !quarterCompletion.get(q))
    : false;

  const reviewQuarter = nextIncompleteQuarter(latestCompleted);
  const yearQs = `?year=${year}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-slate-700">Hello, {DEMO_USER_NAME}.</p>
        </div>
        <form className="flex items-center gap-2" action="/" method="get">
          <label className="text-sm font-medium text-slate-700">Year</label>
          <select
            name="year"
            defaultValue={String(year)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
          <Button type="submit" variant="secondary">
            Go
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Status">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Annual plan started?</span>
              <span className="font-semibold">{planStarted ? "Yes" : "Not yet"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Latest quarter completed</span>
              <span className="font-semibold">{latestCompleted ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Number of indicators</span>
              <span className="font-semibold">{indicatorsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Overdue quarter</span>
              <span className={`font-semibold ${overdue ? "text-red-700" : ""}`}>{overdue ? "Yes" : "No"}</span>
            </div>
          </div>
        </Card>

        <Card title="Actions">
          <div className="flex flex-col gap-3">
            <Link href={`/plan${yearQs}`}>
              <Button className="w-full">Create / Edit Annual Plan</Button>
            </Link>
            <Link href={`/review/${reviewQuarter}${yearQs}`}>
              <Button className="w-full" variant="secondary">
                Enter Quarterly Review
              </Button>
            </Link>
            <Link href={`/report${yearQs}`}>
              <Button className="w-full" variant="secondary">
                View Annual Report
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {!yearPlan ? (
        <Card title="Tip">
          <p className="text-sm text-slate-700">
            Start by creating your Annual Plan. The system will automatically prepare Q1–Q4 review records for each indicator.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
