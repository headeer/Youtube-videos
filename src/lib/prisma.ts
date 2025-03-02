import { PrismaClient } from "@prisma/client";

// Use global type declaration
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["query", "error", "warn"],
    errorFormat: "pretty",
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection pooling configuration
    connection: {
      pool: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 60000,
      },
    },
    // Add retry configuration
    __internal: {
      engine: {
        retry: {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 5000,
          retryIf: (error: any) => {
            // Retry on connection errors and deadlocks
            return (
              error.code === "P1001" ||
              error.code === "P1002" ||
              error.code === "40P01" ||
              error.message?.includes("Connection reset by peer") ||
              error.message?.includes("SSL connection")
            );
          },
        },
      },
    },
  });
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Ensure the connection is established with retries
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("Database connection established successfully");
      return;
    } catch (e) {
      console.error(
        `Failed to connect to the database (attempt ${i + 1}/${retries}):`,
        e
      );
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error(
    `Failed to connect to the database after ${retries} attempts`
  );
};

// Connect with retry mechanism
connectWithRetry().catch((e) => {
  console.error("Final connection attempt failed:", e);
  process.exit(1);
});

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
