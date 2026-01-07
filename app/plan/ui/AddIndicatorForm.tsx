"use client";

import { useFormState } from "react-dom";
import Button from "@/app/ui/Button";
import Field from "@/app/ui/Field";
import { createIndicator } from "@/app/actions";

type ActionState =
  | { ok: true; id: string }
  | { ok: false; errors?: Record<string, string[] | undefined> };

const initialState: ActionState = { ok: false };

export default function AddIndicatorForm({ year }: { year: number }) {
  const [state, formAction] = useFormState(createIndicator, initialState);

  const errors = !state.ok ? state.errors : undefined;

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="year" value={year} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Objective title" error={errors?.objectiveTitle?.[0] ?? null}>
          <input
            name="objectiveTitle"
            required
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="e.g., Child protection"
          />
        </Field>
        <Field label="Unit" error={errors?.unit?.[0] ?? null}>
          <input
            name="unit"
            required
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="e.g., cases / visits / sessions"
          />
        </Field>
      </div>

      <Field label="Indicator name" error={errors?.indicatorName?.[0] ?? null}>
        <input
          name="indicatorName"
          required
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          placeholder="e.g., Statutory case follow-ups completed"
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
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="0"
          />
        </Field>
        <Field label="Baseline (optional)" error={errors?.baseline?.[0] ?? null}>
          <input
            name="baseline"
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            placeholder="0"
          />
        </Field>
      </div>

      <Field label="Notes (optional)">
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          placeholder="Anything the social worker should remember…"
        />
      </Field>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-700">
          {state.ok ? "Saved." : errors ? "Please fix the highlighted fields." : null}
        </div>
        <Button type="submit">Add indicator</Button>
      </div>
    </form>
  );
}

