-- DropIndex
DROP INDEX "Excuse_text_key";

-- DropIndex
DROP INDEX "ExcuseUse_excuseId_videoIdeaId_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VideoIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "script" TEXT,
    "metadata" TEXT,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "isUploaded" BOOLEAN NOT NULL DEFAULT false,
    "plannedDate" DATETIME NOT NULL,
    "finishDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_VideoIdea" ("createdAt", "description", "finishDate", "id", "isUploaded", "metadata", "plannedDate", "script", "status", "thumbnailUrl", "title", "updatedAt") SELECT "createdAt", "description", "finishDate", "id", "isUploaded", "metadata", "plannedDate", "script", "status", "thumbnailUrl", "title", "updatedAt" FROM "VideoIdea";
DROP TABLE "VideoIdea";
ALTER TABLE "new_VideoIdea" RENAME TO "VideoIdea";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
