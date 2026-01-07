import { PrismaClient } from "@prisma/client";
import { seedDemo } from "@/lib/seed";
import { promises as fs } from "node:fs";
import path from "node:path";

let ready: Promise<void> | null = null;

async function tableExists(prisma: PrismaClient, tableName: string) {
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName.replaceAll("'", "''")}'`,
  )) as Array<{ name: string }>;
  return rows.length > 0;
}

async function applySqlFile(prisma: PrismaClient, sql: string) {
  const cleaned = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = cleaned
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await prisma.$executeRawUnsafe(stmt);
  }
}

async function applyMigrations(prisma: PrismaClient) {
  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  let entries: string[] = [];
  try {
    entries = await fs.readdir(migrationsDir);
  } catch {
    return;
  }

  const dirs = entries.filter((e) => !e.startsWith(".")).sort();
  for (const dir of dirs) {
    const sqlPath = path.join(migrationsDir, dir, "migration.sql");
    try {
      const sql = await fs.readFile(sqlPath, "utf8");
      await applySqlFile(prisma, sql);
    } catch {
      // ignore missing migration.sql
    }
  }
}

export async function ensureDbReady(prisma: PrismaClient) {
  ready ??= (async () => {
    const hasUser = await tableExists(prisma, "User");
    if (!hasUser) {
      await applyMigrations(prisma);
    }

    // Seed if empty
    const count = await prisma.user.count();
    if (count === 0) {
      await seedDemo(prisma);
    }
  })();

  await ready;
}

