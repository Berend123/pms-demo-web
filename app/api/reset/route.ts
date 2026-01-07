import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetDemo } from "@/lib/seed";

export async function POST() {
  await resetDemo(prisma);
  return NextResponse.json({ ok: true });
}

