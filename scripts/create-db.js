const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(process.cwd(), "prisma", "dev.db");

// Ensure the prisma directory exists
const prismaDir = path.join(process.cwd(), "prisma");
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

// Create an empty SQLite database file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  console.log(`Creating SQLite database file at ${dbPath}`);

  // Create an empty database file
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error creating database file:", err);
      process.exit(1);
    }

    console.log("SQLite database file created successfully!");

    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error("Error closing database connection:", err);
        process.exit(1);
      }

      console.log("Database connection closed.");
    });
  });
} else {
  console.log(`SQLite database file already exists at ${dbPath}`);
}
