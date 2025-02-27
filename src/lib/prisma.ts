import { PrismaClient } from "@prisma/client";
import { initializeDatabase } from "./db-init";

// Use global type declaration
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Initialize the database if needed
if (process.env.NODE_ENV !== "production") {
  initializeDatabase()
    .then(() => {
      console.log("Database initialization check completed");
    })
    .catch((e) => {
      console.error("Database initialization failed:", e);
    });
}

// Ensure the connection is established
prisma
  .$connect()
  .then(() => {
    console.log("Database connection established successfully");
  })
  .catch((e) => {
    console.error("Failed to connect to the database:", e);
  });

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
