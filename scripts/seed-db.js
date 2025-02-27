// scripts/seed-db.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with initial data...");

  try {
    // Check if there are any videos
    const videoCount = await prisma.videoIdea.count();

    if (videoCount === 0) {
      console.log("No videos found. Creating sample video...");

      // Create a sample video
      const video = await prisma.videoIdea.create({
        data: {
          title: "Welcome to YouTube Video Planner",
          description: "This is a sample video to help you get started.",
          plannedDate: new Date(),
          status: "PLANNING",
          isUploaded: false,
          tasks: {
            create: [
              { title: "Research Topic", phase: "PLANNING", order: 0 },
              { title: "Create Outline", phase: "PLANNING", order: 1 },
              { title: "Write Script", phase: "PLANNING", order: 2 },
              { title: "Record Video", phase: "RECORDING", order: 3 },
              { title: "Edit Video", phase: "EDITING", order: 4 },
              { title: "Create Thumbnail", phase: "THUMBNAIL", order: 5 },
              { title: "Add Description & Tags", phase: "METADATA", order: 6 },
              { title: "Schedule Upload", phase: "DISTRIBUTION", order: 7 },
            ],
          },
        },
      });

      console.log("Sample video created:", video.id);
    } else {
      console.log(`Found ${videoCount} videos. Skipping seed.`);
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
