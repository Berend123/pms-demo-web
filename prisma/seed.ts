import { prisma } from "../lib/prisma";
import { resetDemo } from "../lib/seed";

async function main() {
  await resetDemo(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

