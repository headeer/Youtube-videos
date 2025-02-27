// scripts/db-push.js
import { exec } from "child_process";
import fs from "fs";
import path from "path";

// Ensure the prisma directory exists
const prismaDir = path.join(process.cwd(), "prisma");
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

// Run prisma db push
console.log("Pushing schema to database...");
exec("npx prisma db push", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log("Schema pushed successfully!");
});
