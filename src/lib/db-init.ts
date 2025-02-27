import { PrismaClient, VideoStatus, TaskPhase } from "@prisma/client";
import fs from "fs";
import path from "path";

// Check if the database file exists
const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const dbExists = fs.existsSync(dbPath);

// Initialize the database if it doesn't exist
export async function initializeDatabase() {
  if (!dbExists) {
    console.log("Database file not found. Creating a new database...");

    const prisma = new PrismaClient();

    try {
      // Create a sample video to initialize the database
      await prisma.videoIdea.create({
        data: {
          title: "Welcome to YouTube Video Planner",
          description: "This is a sample video to help you get started.",
          plannedDate: new Date(),
          status: VideoStatus.PLANNING,
          isUploaded: false,
          tasks: {
            create: [
              { title: "Research Topic", phase: TaskPhase.PLANNING, order: 0 },
              { title: "Create Outline", phase: TaskPhase.PLANNING, order: 1 },
              { title: "Write Script", phase: TaskPhase.PLANNING, order: 2 },
              { title: "Record Video", phase: TaskPhase.RECORDING, order: 3 },
              { title: "Edit Video", phase: TaskPhase.EDITING, order: 4 },
              {
                title: "Create Thumbnail",
                phase: TaskPhase.THUMBNAIL,
                order: 5,
              },
              {
                title: "Add Description & Tags",
                phase: TaskPhase.METADATA,
                order: 6,
              },
              {
                title: "Schedule Upload",
                phase: TaskPhase.DISTRIBUTION,
                order: 7,
              },
            ],
          },
        },
      });

      console.log("Database initialized successfully!");
    } catch (error) {
      console.error("Failed to initialize database:", error);
    } finally {
      await prisma.$disconnect();
    }
  }
}
