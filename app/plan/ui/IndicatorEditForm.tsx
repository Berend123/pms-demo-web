"use client";

import { useFormState } from "react-dom";
import Button from "@/app/ui/Button";
import Field from "@/app/ui/Field";
import { updateIndicator } from "@/app/actions";

type Indicator = {
  id: string;
  objectiveTitle: string;
  indicatorName: string;
  annualTarget: number;
  unit: string;
  baseline: number | null;
  notes: string | null;
};

type ActionState =
  | { ok: true }
  | { ok: false; errors?: Record<string, string[] | undefined> };

const initialState: ActionState = { ok: false };

export default function IndicatorEditForm({ year, indicator }: { year: number; indicator: Indicator }) {
  const [state, formAction] = useFormState(updateIndicator, initialState);
  const errors = !state.ok ? state.errors : undefined;

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="id" value={indicator.id} />
      <input type="hidden" name="year" value={year} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Objective title" error={errors?.objectiveTitle?.[0] ?? null}>
          <input
            name="objectiveTitle"
            required
            defaultValue={indicator.objectiveTitle}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Unit" error={errors?.unit?.[0] ?? null}>
          <input
            name="unit"
            required
            defaultValue={indicator.unit}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <Field label="Indicator name" error={errors?.indicatorName?.[0] ?? null}>
        <input
          name="indicatorName"
          required
          defaultValue={indicator.indicatorName}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Annual target" error={errors?.annualTarget?.[0] ?? null}>
          <input
            name="annualTarget"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={indicator.annualTarget}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Baseline (optional)" error={errors?.baseline?.[0] ?? null}>
          <input
            name="baseline"
            type="number"
            min="0"
            step="0.01"
            defaultValue={indicator.baseline ?? ""}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <Field label="Notes (optional)">
        <textarea
          name="notes"
          rows={3}
          defaultValue={indicator.notes ?? ""}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </Field>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-700">{state.ok ? "Saved." : errors ? "Please fix the highlighted fields." : null}</div>
        <Button type="submit" variant="secondary">
          Save changes
        </Button>
      </div>
    </form>
  );
}

