import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "pretty",
  }).$extends({
    result: {
      task: {
        updatedAt: {
          needs: { updatedAt: true },
          compute(task) {
            return task.updatedAt ? new Date(task.updatedAt) : null;
          },
        },
        createdAt: {
          needs: { createdAt: true },
          compute(task) {
            return task.createdAt ? new Date(task.createdAt) : null;
          },
        },
      },
      videoIdea: {
        updatedAt: {
          needs: { updatedAt: true },
          compute(video) {
            return video.updatedAt ? new Date(video.updatedAt) : null;
          },
        },
        createdAt: {
          needs: { createdAt: true },
          compute(video) {
            return video.createdAt ? new Date(video.createdAt) : null;
          },
        },
        plannedDate: {
          needs: { plannedDate: true },
          compute(video) {
            return video.plannedDate ? new Date(video.plannedDate) : null;
          },
        },
        finishDate: {
          needs: { finishDate: true },
          compute(video) {
            return video.finishDate ? new Date(video.finishDate) : null;
          },
        },
      },
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
