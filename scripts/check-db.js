// scripts/check-db.js
import { PrismaClient } from "@prisma/client";

async function main() {
  console.log("Checking database connection...");

  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

  try {
    // Try to connect to the database
    await prisma.$connect();
    console.log("✅ Successfully connected to the database");

    // Try a simple query
    const count = await prisma.videoIdea.count();
    console.log(`✅ Database query successful. Found ${count} video ideas.`);

    // Check database version
    const result = await prisma.$queryRaw`SELECT version();`;
    console.log(`✅ Database version: ${result[0].version}`);

    console.log("Database connection check completed successfully.");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
