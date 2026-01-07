import { PrismaClient } from "@prisma/client";

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export async function seedDemo(prisma: PrismaClient) {
  const year = new Date().getFullYear();

  const user = await prisma.user.upsert({
    where: { id: "demo-user" },
    update: { name: "Demo Social Worker" },
    create: { id: "demo-user", name: "Demo Social Worker" },
  });

  const yearPlan = await prisma.yearPlan.upsert({
    where: { userId_year: { userId: user.id, year } },
    update: {},
    create: { userId: user.id, year },
  });

  const indicatorsSeed = [
    {
      objectiveTitle: "Child Protection & Support",
      indicatorName: "Children receiving psychosocial support sessions",
      annualTarget: 120,
      unit: "sessions",
      baseline: 0,
      notes: "Count completed sessions in the reporting period.",
      q1Actual: 28,
      q1Comment: "Community outreach increased attendance.",
    },
    {
      objectiveTitle: "Case Management",
      indicatorName: "Statutory case follow-ups completed",
      annualTarget: 40,
      unit: "cases",
      baseline: 10,
      notes: "Follow-ups documented and filed.",
      q1Actual: 9,
      q1Comment: "Staff leave affected coverage in March.",
    },
  ] as const;

  for (const indicatorSeed of indicatorsSeed) {
    const indicator = await prisma.indicator.create({
      data: {
        yearPlanId: yearPlan.id,
        objectiveTitle: indicatorSeed.objectiveTitle,
        indicatorName: indicatorSeed.indicatorName,
        annualTarget: indicatorSeed.annualTarget,
        unit: indicatorSeed.unit,
        baseline: indicatorSeed.baseline,
        notes: indicatorSeed.notes,
      },
    });

    const quarterlyTarget = round2(indicatorSeed.annualTarget / 4);

    await prisma.quarterEntry.createMany({
      data: [
        { indicatorId: indicator.id, quarter: "Q1", quarterlyTarget, actualAchieved: indicatorSeed.q1Actual, comments: indicatorSeed.q1Comment },
        { indicatorId: indicator.id, quarter: "Q2", quarterlyTarget },
        { indicatorId: indicator.id, quarter: "Q3", quarterlyTarget },
        { indicatorId: indicator.id, quarter: "Q4", quarterlyTarget },
      ],
    });
  }
}

export async function resetDemo(prisma: PrismaClient) {
  await prisma.quarterEntry.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.yearPlan.deleteMany();
  await prisma.user.deleteMany();
  await seedDemo(prisma);
}
