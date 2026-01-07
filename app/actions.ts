"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID, DEMO_USER_NAME } from "@/lib/demo";

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

async function getOrCreateYearPlan(year: number) {
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: { name: DEMO_USER_NAME },
    create: { id: DEMO_USER_ID, name: DEMO_USER_NAME },
  });

  return prisma.yearPlan.upsert({
    where: { userId_year: { userId: DEMO_USER_ID, year } },
    update: {},
    create: { userId: DEMO_USER_ID, year },
  });
}

const indicatorSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  objectiveTitle: z.string().trim().min(1, "Objective is required"),
  indicatorName: z.string().trim().min(1, "Indicator name is required"),
  annualTarget: z.coerce.number().min(0, "Annual target must be 0 or more"),
  unit: z.string().trim().min(1, "Unit is required"),
  baseline: z
    .union([z.coerce.number().min(0), z.literal(""), z.literal(null), z.undefined()])
    .transform((v) => (typeof v === "number" ? v : null)),
  notes: z.string().trim().optional().transform((v) => (v ? v : null)),
});

export async function createIndicator(prevState: unknown, formData?: FormData) {
  const fd = prevState instanceof FormData ? prevState : formData;
  if (!fd) return { ok: false as const };

  const parsed = indicatorSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) {
    return { ok: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const { year, objectiveTitle, indicatorName, annualTarget, unit, baseline, notes } = parsed.data;
  const yearPlan = await getOrCreateYearPlan(year);
  const quarterlyTarget = round2(annualTarget / 4);

  const indicator = await prisma.indicator.create({
    data: {
      yearPlanId: yearPlan.id,
      objectiveTitle,
      indicatorName,
      annualTarget,
      unit,
      baseline: baseline ?? undefined,
      notes: notes ?? undefined,
      quarterEntries: {
        create: [
          { quarter: "Q1", quarterlyTarget },
          { quarter: "Q2", quarterlyTarget },
          { quarter: "Q3", quarterlyTarget },
          { quarter: "Q4", quarterlyTarget },
        ],
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/plan");
  revalidatePath("/report");
  return { ok: true as const, id: indicator.id };
}

const updateIndicatorSchema = indicatorSchema.extend({
  id: z.string().min(1),
});

export async function updateIndicator(prevState: unknown, formData?: FormData) {
  const fd = prevState instanceof FormData ? prevState : formData;
  if (!fd) return { ok: false as const };

  const parsed = updateIndicatorSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) {
    return { ok: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const { id, year, objectiveTitle, indicatorName, annualTarget, unit, baseline, notes } = parsed.data;
  await getOrCreateYearPlan(year);

  const updated = await prisma.indicator.update({
    where: { id },
    data: { objectiveTitle, indicatorName, annualTarget, unit, baseline: baseline ?? undefined, notes: notes ?? undefined },
  });

  const quarterlyTarget = round2(updated.annualTarget / 4);
  await prisma.quarterEntry.updateMany({ where: { indicatorId: id }, data: { quarterlyTarget } });

  revalidatePath("/");
  revalidatePath("/plan");
  revalidatePath("/report");
  return { ok: true as const };
}

const deleteSchema = z.object({
  id: z.string().min(1),
});

export async function deleteIndicator(formData: FormData) {
  const parsed = deleteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;

  await prisma.indicator.delete({ where: { id: parsed.data.id } });
  revalidatePath("/");
  revalidatePath("/plan");
  revalidatePath("/report");
}

const quarterEntrySchema = z.object({
  indicatorId: z.string().min(1),
  quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
  actualAchieved: z
    .union([z.coerce.number().min(0, "Actual must be 0 or more"), z.literal(""), z.literal(null), z.undefined()])
    .transform((v) => (typeof v === "number" ? v : null)),
  comments: z.string().trim().optional().transform((v) => (v ? v : null)),
});

export async function updateQuarterEntry(formData: FormData) {
  const parsed = quarterEntrySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;

  const { indicatorId, quarter, actualAchieved, comments } = parsed.data;

  await prisma.quarterEntry.upsert({
    where: { indicatorId_quarter: { indicatorId, quarter } },
    update: { actualAchieved: actualAchieved ?? undefined, comments: comments ?? undefined },
    create: { indicatorId, quarter, quarterlyTarget: 0, actualAchieved: actualAchieved ?? undefined, comments: comments ?? undefined },
  });

  revalidatePath("/");
  revalidatePath("/report");
  revalidatePath("/review/q1");
  revalidatePath("/review/q2");
  revalidatePath("/review/q3");
  revalidatePath("/review/q4");
}
