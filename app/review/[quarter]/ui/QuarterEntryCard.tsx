"use client";

import Card from "@/app/ui/Card";
import Field from "@/app/ui/Field";
import Button from "@/app/ui/Button";
import { useMemo, useState } from "react";
import { updateQuarterEntry } from "@/app/actions";
import { formatPct, safePct, safeVariancePct } from "@/lib/calc";
import type { Quarter } from "@/lib/quarters";

export default function QuarterEntryCard({
  quarter,
  indicator,
}: {
  quarter: Quarter;
  indicator: {
    id: string;
    objectiveTitle: string;
    indicatorName: string;
    unit: string;
    quarterlyTarget: number;
    actualAchieved: number | null;
    comments: string;
  };
}) {
  const [actual, setActual] = useState<string>(indicator.actualAchieved === null ? "" : String(indicator.actualAchieved));
  const [comments, setComments] = useState<string>(indicator.comments ?? "");

  const actualNum = useMemo(() => {
    if (actual.trim() === "") return null;
    const n = Number(actual);
    if (!Number.isFinite(n)) return null;
    if (n < 0) return null;
    return n;
  }, [actual]);

  const progressPct = useMemo(() => {
    if (actualNum === null) return null;
    return safePct(actualNum, indicator.quarterlyTarget);
  }, [actualNum, indicator.quarterlyTarget]);

  const variancePct = useMemo(() => {
    if (actualNum === null) return null;
    return safeVariancePct(actualNum, indicator.quarterlyTarget);
  }, [actualNum, indicator.quarterlyTarget]);

  return (
    <Card
      title={indicator.indicatorName}
      actions={<div className="text-sm text-slate-700">{indicator.objectiveTitle}</div>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-700">Quarterly target</span>
            <span className="font-semibold">
              {indicator.quarterlyTarget} {indicator.unit}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-700">Quarterly progress</span>
            <span className="font-semibold">{formatPct(progressPct)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-700">Quarterly variance</span>
            <span className={`font-semibold ${variancePct !== null && variancePct < 0 ? "text-red-700" : ""}`}>
              {formatPct(variancePct)}
            </span>
          </div>
          {indicator.quarterlyTarget === 0 ? (
            <div className="rounded-md bg-slate-50 p-2 text-sm text-slate-700">
              Target is 0, so progress/variance shows “—”.
            </div>
          ) : null}
        </div>

        <form action={updateQuarterEntry} className="grid gap-3">
          <input type="hidden" name="indicatorId" value={indicator.id} />
          <input type="hidden" name="quarter" value={quarter} />

          <Field label="Actual achieved (this quarter)">
            <input
              name="actualAchieved"
              type="number"
              min="0"
              step="0.01"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="0"
            />
          </Field>

          <Field label="Comments (optional)">
            <textarea
              name="comments"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Short note about what helped or blocked progress…"
            />
          </Field>

          <div className="flex justify-end">
            <Button type="submit" variant="secondary">
              Save {String(quarter)}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
