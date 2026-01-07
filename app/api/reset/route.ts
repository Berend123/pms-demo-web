import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetDemo } from "@/lib/seed";
import { ensureDbReady } from "@/lib/dbReady";

export async function POST() {
  await ensureDbReady(prisma);
  await resetDemo(prisma);
  return NextResponse.json({ ok: true });
}
