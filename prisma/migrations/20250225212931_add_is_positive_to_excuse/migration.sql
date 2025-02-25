-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Excuse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isPositive" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Excuse" ("createdAt", "id", "text", "updatedAt") SELECT "createdAt", "id", "text", "updatedAt" FROM "Excuse";
DROP TABLE "Excuse";
ALTER TABLE "new_Excuse" RENAME TO "Excuse";
CREATE UNIQUE INDEX "Excuse_text_key" ON "Excuse"("text");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
