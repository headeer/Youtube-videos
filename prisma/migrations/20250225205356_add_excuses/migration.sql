-- CreateTable
CREATE TABLE "VideoIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "script" TEXT,
    "metadata" JSONB,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "isUploaded" BOOLEAN NOT NULL DEFAULT false,
    "plannedDate" DATETIME NOT NULL,
    "finishDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "phase" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "videoIdeaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_videoIdeaId_fkey" FOREIGN KEY ("videoIdeaId") REFERENCES "VideoIdea" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "trendScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Excuse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ExcuseUse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "excuseId" TEXT NOT NULL,
    "videoIdeaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExcuseUse_excuseId_fkey" FOREIGN KEY ("excuseId") REFERENCES "Excuse" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExcuseUse_videoIdeaId_fkey" FOREIGN KEY ("videoIdeaId") REFERENCES "VideoIdea" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TopicToVideoIdea" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TopicToVideoIdea_A_fkey" FOREIGN KEY ("A") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TopicToVideoIdea_B_fkey" FOREIGN KEY ("B") REFERENCES "VideoIdea" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Excuse_text_key" ON "Excuse"("text");

-- CreateIndex
CREATE UNIQUE INDEX "ExcuseUse_excuseId_videoIdeaId_key" ON "ExcuseUse"("excuseId", "videoIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "_TopicToVideoIdea_AB_unique" ON "_TopicToVideoIdea"("A", "B");

-- CreateIndex
CREATE INDEX "_TopicToVideoIdea_B_index" ON "_TopicToVideoIdea"("B");
